import { useEffect, useState } from 'react';
import { useQuery } from 'convex/react';
import { useNavigate } from 'react-router-dom';
import usePresence from '@convex-dev/presence/react';
import { api } from '../../../convex/_generated/api';

// Presence heartbeat interval. Steady-state heartbeats write nothing to game
// docs (they live in the @convex-dev/presence component), so this can be slow.
// Disconnect detection is ~2.5x this interval, instant on clean tab close.
const PRESENCE_INTERVAL_MS = 30000;

// Grace period before honoring a null connection lookup. On a fresh join the
// player doc doesn't exist until the joinGame mutation lands, so the reactive
// query briefly returns null; mirror the old heartbeat's initial 1s delay
// instead of bouncing the player home mid-join.
const NOT_FOUND_GRACE_MS = 2000;

/**
 * Presence + connection watcher (replaces the old 5s heartbeat mutation).
 *
 * - Registers this tab with the @convex-dev/presence component at a 30s
 *   interval, keyed by room code + playerId. Feeds the cleanup cron only;
 *   never touches rooms/players docs, so game queries stay quiet.
 * - Watches this tab's connection status via a reactive query:
 *   'TAKEN_OVER' means another tab/device took over (fires onTakenOver and
 *   stands presence down so this tab can't pin the player online),
 *   null means the player is gone from the room (clear session, go home).
 *
 * @param {string} code - Game room code
 * @param {string} playerId - Player ID
 * @param {string} connectionId - Connection ID for this tab
 * @param {Function} onTakenOver - Callback when connection is taken over
 * @param {Function} clearSession - Function to clear session on disconnect
 */
export function useHeartbeat(code, playerId, connectionId, onTakenOver, clearSession) {
  const navigate = useNavigate();

  // Latched off when another tab takes over this connection. While latched we
  // pass an empty roomId to usePresence: its roomId-change effect disconnects
  // the old session immediately, and every later heartbeat (interval ticks AND
  // visibilitychange resumes — both close over the '' roomId) fails the
  // server-side membership check and returns empty tokens, so this tab can
  // never re-register itself and pin the player online against the crons.
  const [takenOver, setTakenOver] = useState(false);

  // usePresence has no skip support, so before the session exists (or after a
  // takeover) we pass empty ids; the server-side heartbeat returns empty
  // tokens for a player it can't validate and the hook treats them as "no
  // session" (list query skipped, no disconnect beacon).
  usePresence(
    api.presence,
    takenOver ? '' : (code || ''),
    playerId || '',
    PRESENCE_INTERVAL_MS
  );

  // 'ACTIVE' | 'TAKEN_OVER' | null (player gone) | undefined (loading/skipped).
  // The raw connectionId never leaves the server: it's the only credential for
  // kick/settings/lock mutations, so the query takes ours and compares there.
  const status = useQuery(
    api.game.rooms.getPlayerConnection,
    code && playerId && connectionId ? { code, playerId, connectionId } : 'skip'
  );

  useEffect(() => {
    if (!code || !playerId || !connectionId) return;
    if (status === undefined) return; // query loading (or skipped)

    if (status === null) {
      // Player no longer exists in room (kicked, or room deleted). Give a
      // fresh join a moment to land before redirecting; the timer is
      // cancelled as soon as the query returns a row.
      const timeout = setTimeout(() => {
        console.log('[Presence] Player not found - redirecting to home');
        if (clearSession) {
          clearSession();
        }
        navigate('/', { replace: true });
      }, NOT_FOUND_GRACE_MS);
      return () => clearTimeout(timeout);
    }

    if (status === 'TAKEN_OVER') {
      // This tab's connection has been replaced by another tab/device.
      console.log('[Presence] Connection taken over');
      setTakenOver(true);
      if (onTakenOver) {
        onTakenOver();
      }
      return;
    }

    // status === 'ACTIVE': this tab owns the connection. Un-latch in case the
    // user rejoined from this same tab after a takeover, so presence resumes.
    setTakenOver(false);
  }, [status, code, playerId, connectionId, onTakenOver, clearSession, navigate]);
}
