import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import schema from "./schema";
import { api, internal } from "./_generated/api";
import presenceComponent from "@convex-dev/presence/test";
import { PLAYER_TIMEOUT_MS, STALE_ROOM_CUTOFF_MS } from "./game/scheduler";

// This file lives at the convex/ root (not convex/game/) so the glob keys all
// share one "./" prefix — convex-test derives the module root from them.
const modules = import.meta.glob([
  "./**/*.ts",
  "./**/*.js",
  "!./**/*.test.ts",
  "!./**/*.d.ts",
]);

const HOUR = 60 * 60 * 1000;

function setup() {
  const t = convexTest(schema, modules);
  presenceComponent.register(t, "presence");
  return t;
}

async function insertRoom(t: ReturnType<typeof setup>, code: string, lastActivityAt: number) {
  await t.run(async (ctx) => {
    await ctx.db.insert("rooms", {
      code,
      phase: "lobby",
      currentRound: 1,
      settings: {
        numberOfRounds: 3,
        roundLength: 60,
        snippetDuration: 30,
        selectedPrompts: ["a", "b", "c", "d", "e"],
      },
      createdAt: lastActivityAt,
      lastActivityAt,
    });
  });
}

async function insertPlayer(
  t: ReturnType<typeof setup>,
  code: string,
  playerId: string,
  connectedAt: number,
  isHost = false
) {
  await t.run(async (ctx) => {
    await ctx.db.insert("players", {
      roomCode: code,
      playerId,
      connectionId: `conn-${playerId}`,
      name: `QA-${playerId}`,
      isHost,
      isReady: false,
      connectedAt,
      isActive: true,
    });
  });
}

async function getRoom(t: ReturnType<typeof setup>, code: string) {
  return await t.run(async (ctx) =>
    ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", code))
      .unique()
  );
}

async function getPlayers(t: ReturnType<typeof setup>, code: string) {
  return await t.run(async (ctx) =>
    ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomCode", code))
      .collect()
  );
}

test("connected-but-idle room is NOT swept by cleanupStaleRooms", async () => {
  const t = setup();
  const idleSince = Date.now() - STALE_ROOM_CUTOFF_MS - HOUR; // well past cutoff
  await insertRoom(t, "QAIDLE", idleSince);
  await insertPlayer(t, "QAIDLE", "p1", idleSince, true);

  // Player is connected (presence heartbeat) but has taken no game action.
  await t.mutation(api.presence.heartbeat, {
    roomId: "QAIDLE",
    userId: "p1",
    sessionId: "session-1",
    interval: 30000,
  });

  await t.mutation(internal.game.scheduler.cleanupStaleRooms, {});

  expect(await getRoom(t, "QAIDLE")).not.toBeNull();
  expect(await getPlayers(t, "QAIDLE")).toHaveLength(1);
});

test("idle room with nobody online IS swept by cleanupStaleRooms", async () => {
  const t = setup();
  const idleSince = Date.now() - STALE_ROOM_CUTOFF_MS - HOUR;
  await insertRoom(t, "QADEAD", idleSince);
  await insertPlayer(t, "QADEAD", "p1", idleSince, true);
  // No presence heartbeat: nobody is online.

  await t.mutation(internal.game.scheduler.cleanupStaleRooms, {});

  expect(await getRoom(t, "QADEAD")).toBeNull();
  expect(await getPlayers(t, "QADEAD")).toHaveLength(0);
});

test("room with recent activity is not swept even with nobody online", async () => {
  const t = setup();
  await insertRoom(t, "QAFRSH", Date.now() - HOUR); // active an hour ago
  await insertPlayer(t, "QAFRSH", "p1", Date.now() - HOUR, true);

  await t.mutation(internal.game.scheduler.cleanupStaleRooms, {});

  expect(await getRoom(t, "QAFRSH")).not.toBeNull();
});

test("cleanupInactivePlayers keeps online players, removes long-gone ones", async () => {
  const t = setup();
  const longAgo = Date.now() - PLAYER_TIMEOUT_MS - 5 * 60 * 1000;
  await insertRoom(t, "QAMIXD", Date.now() - HOUR);
  await insertPlayer(t, "QAMIXD", "host", longAgo, true);
  await insertPlayer(t, "QAMIXD", "ghost", longAgo, false); // never heartbeats

  // Host is online via presence; ghost joined long ago and never registered.
  await t.mutation(api.presence.heartbeat, {
    roomId: "QAMIXD",
    userId: "host",
    sessionId: "session-host",
    interval: 30000,
  });

  await t.mutation(internal.game.scheduler.cleanupInactivePlayers, {});

  const players = await getPlayers(t, "QAMIXD");
  expect(players.map((p) => p.playerId)).toEqual(["host"]);
  // Room survives: it still has a connected player.
  expect(await getRoom(t, "QAMIXD")).not.toBeNull();
});

test("cleanupInactivePlayers gives recently-joined players grace", async () => {
  const t = setup();
  await insertRoom(t, "QANEWJ", Date.now());
  // Joined 1 minute ago, presence heartbeat hasn't landed yet.
  await insertPlayer(t, "QANEWJ", "newbie", Date.now() - 60 * 1000, true);

  await t.mutation(internal.game.scheduler.cleanupInactivePlayers, {});

  expect(await getPlayers(t, "QANEWJ")).toHaveLength(1);
});
