import { describe, it, expect, beforeEach, vi } from 'vitest';
import { store } from '../index';
import { logoutContact } from './ContactSlice';

describe('ContactSlice reducers', () => {
    beforeEach(() => {
        store.dispatch(logoutContact());
        vi.restoreAllMocks();
    });

    it('successfully dispatches logoutContact and resets state', () => {
        store.dispatch(logoutContact());
        const state = store.getState().contact;
        expect(state.currentUser).toBeNull();
    });
});

