import { useEffect } from 'react';
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
 * - Watches the player's active connectionId via a reactive query:
 *   a mismatch means another tab/device took over (fires onTakenOver),
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

  // usePresence has no skip support, so before the session exists we pass
  // empty ids; the server-side heartbeat returns empty tokens for a player it
  // can't validate and the hook treats them as "no session".
  usePresence(api.presence, code || '', playerId || '', PRESENCE_INTERVAL_MS);

  const connection = useQuery(
    api.game.rooms.getPlayerConnection,
    code && playerId ? { code, playerId } : 'skip'
  );

  useEffect(() => {
    if (!code || !playerId || !connectionId) return;
    if (connection === undefined) return; // query loading (or skipped)

    if (connection === null) {
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

    if (connection.connectionId && connection.connectionId !== connectionId) {
      // This tab's connection has been replaced by another tab/device
      console.log('[Presence] Connection taken over');
      if (onTakenOver) {
        onTakenOver();
      }
    }
  }, [connection, code, playerId, connectionId, onTakenOver, clearSession, navigate]);
}
