import { v } from "convex/values";
import { Presence } from "@convex-dev/presence";
import { components } from "./_generated/api";
import { mutation, query } from "./_generated/server";

// Presence lives in the @convex-dev/presence component's sandboxed tables.
// Steady-state heartbeats write nothing to game docs, so they never invalidate
// game queries. See docs/context/builder-protocol.md ("Convex-specific law"):
// never fold presence timestamps back into rooms/players docs.
export const presence = new Presence(components.presence);

// Server-side clamp on the client-supplied heartbeat interval. The component
// schedules its offline flip at ~2.5x the interval, so a hostile client
// passing e.g. 1e15 (or NaN) could pin a session "online" essentially forever
// and defeat both cleanup crons. The real client sends 30s.
const MIN_HEARTBEAT_INTERVAL_MS = 5000;
const MAX_HEARTBEAT_INTERVAL_MS = 60000;

function clampInterval(interval: number): number {
  if (!Number.isFinite(interval)) return MAX_HEARTBEAT_INTERVAL_MS;
  return Math.min(
    Math.max(interval, MIN_HEARTBEAT_INTERVAL_MS),
    MAX_HEARTBEAT_INTERVAL_MS
  );
}

export const heartbeat = mutation({
  args: {
    roomId: v.string(), // room code
    userId: v.string(), // playerId
    sessionId: v.string(),
    interval: v.number(),
  },
  handler: async (ctx, { roomId, userId, sessionId, interval }) => {
    // Auth check: the player must actually belong to the room before we
    // register presence for it. Rooms are keyed by code, users by playerId.
    const player = await ctx.db
      .query("players")
      .withIndex("by_player", (q) =>
        q.eq("playerId", userId).eq("roomCode", roomId)
      )
      .unique();

    if (!player) {
      // Not a member of this room: an unjoined lobby visitor (usePresence has
      // no skip support, so it heartbeats before the join lands), a kicked
      // player's stale tab, or a deleted room. Empty tokens are treated as
      // "no session" by the client hook (list is skipped, no disconnect
      // beacon), and nothing is written to the presence component — so a
      // kicked player can never re-register themselves.
      return { roomToken: "", sessionToken: "" };
    }

    return await presence.heartbeat(
      ctx,
      roomId,
      userId,
      sessionId,
      clampInterval(interval)
    );
  },
});

export const list = query({
  args: { roomToken: v.string() },
  handler: async (ctx, { roomToken }) => {
    // No per-user reads here, so every client in the room shares one cached
    // execution (the roomToken is the same for everyone in the room).
    return await presence.list(ctx, roomToken);
  },
});

export const disconnect = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    // Can't check auth here because it's called over http from sendBeacon on
    // tab close. The sessionToken is unguessable and scoped to one session.
    return await presence.disconnect(ctx, sessionToken);
  },
});
