import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSession, _resetSessionStoreForTests } from './useSession';

const STORAGE_KEY = 'auxWarsSession';

describe('useSession shared store', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    _resetSessionStoreForTests();
  });

  it('shares one session across hook instances', () => {
    const a = renderHook(() => useSession());
    const b = renderHook(() => useSession());

    act(() => {
      a.result.current.createSession({ gameCode: 'ABC123', playerName: 'QA-Host' });
    });

    expect(b.result.current.session).not.toBeNull();
    expect(b.result.current.session.gameCode).toBe('ABC123');
    expect(b.result.current.session.playerId).toBe(a.result.current.session.playerId);
  });

  it('clearSession clears every instance and localStorage', () => {
    const a = renderHook(() => useSession());
    const b = renderHook(() => useSession());

    act(() => {
      a.result.current.createSession({ gameCode: 'ABC123' });
    });
    act(() => {
      b.result.current.clearSession();
    });

    expect(a.result.current.session).toBeNull();
    expect(b.result.current.session).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('kick race regression: updateSession from another instance cannot resurrect a cleared session', () => {
    // The old per-instance-state design failed this: Lobby cleared the
    // session, then GameRouteGuard's updateSession({ lastPhase }) wrote its
    // stale copy back to localStorage.
    const lobby = renderHook(() => useSession());
    const guard = renderHook(() => useSession());

    act(() => {
      lobby.result.current.createSession({ gameCode: 'ABC123', playerName: 'QA-Guest' });
    });
    act(() => {
      lobby.result.current.clearSession();
    });
    act(() => {
      guard.result.current.updateSession({ lastPhase: 'lobby' });
    });

    expect(guard.result.current.session).toBeNull();
    expect(lobby.result.current.session).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('persists to localStorage without the tab-specific connectionId', () => {
    const a = renderHook(() => useSession());

    act(() => {
      a.result.current.createSession({ gameCode: 'ABC123' });
    });

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(stored.gameCode).toBe('ABC123');
    expect(stored.connectionId).toBeUndefined();
    expect(a.result.current.session.connectionId).toBeTruthy();
  });

  it('loads an existing session from localStorage on first read', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ playerId: 'p1', gameCode: 'XYZ789', playerName: 'QA-Back', lastPhase: 'lobby', timestamp: Date.now() })
    );
    _resetSessionStoreForTests();

    const a = renderHook(() => useSession());
    expect(a.result.current.session.gameCode).toBe('XYZ789');
    expect(a.result.current.session.connectionId).toBeTruthy();
  });
});
