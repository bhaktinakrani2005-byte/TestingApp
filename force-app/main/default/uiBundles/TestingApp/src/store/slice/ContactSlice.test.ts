import { describe, it, expect, beforeEach, vi } from 'vitest';
import { store } from '../index';
import { sendLoginCodeThunk, verifyLoginCodeThunk, logoutContact } from './ContactSlice';

describe('ContactSlice passwordless login thunks', () => {
    beforeEach(() => {
        store.dispatch(logoutContact());
        vi.restoreAllMocks();
    });

    it('successfully dispatches sendLoginCodeThunk and updates state', async () => {
        const mockResponse = { identifier: 'MOCK-123456', startUrl: '/home' };
        
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: true,
            headers: { get: () => 'application/json' },
            json: () => Promise.resolve(mockResponse)
        } as any);

        const result = await store.dispatch(sendLoginCodeThunk({ email: 'test@example.com', startUrl: '/home' }));

        expect(result.meta.requestStatus).toBe('fulfilled');
        expect(result.payload).toEqual({ identifier: 'MOCK-123456', startUrl: '/home' });

        const state = store.getState().contact;
        expect(state.loginIdentifier).toBe('MOCK-123456');
    });

    it('handles failure in sendLoginCodeThunk', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 400,
            headers: { get: () => 'application/json' },
            json: () => Promise.resolve({ error: 'User not found' })
        } as any);

        const result = await store.dispatch(sendLoginCodeThunk({ email: 'invalid@example.com' }));

        expect(result.meta.requestStatus).toBe('rejected');
        expect(result.payload).toBe('User not found');

        const state = store.getState().contact;
        expect(state.error).toBe('User not found');
    });

    it('successfully dispatches verifyLoginCodeThunk and updates currentUser state', async () => {
        const mockResponse = {
            success: true,
            redirectUrl: '/home',
            user: {
                id: '003000000000000',
                name: 'Test User',
                email: 'test@example.com',
                username: 'test@example.com',
                firstName: 'Test',
                lastName: 'User'
            }
        };

        // Populate initial identifier in state
        store.dispatch({
            type: 'contact/sendLoginCode/fulfilled',
            payload: { identifier: 'MOCK-123456' }
        });

        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: true,
            headers: { get: () => 'application/json' },
            json: () => Promise.resolve(mockResponse)
        } as any);

        const result = await store.dispatch(verifyLoginCodeThunk({
            email: 'test@example.com',
            identifier: 'MOCK-123456',
            code: '123456',
            startUrl: '/home'
        }));

        expect(result.meta.requestStatus).toBe('fulfilled');
        expect(result.payload).toEqual(mockResponse);

        const state = store.getState().contact;
        expect(state.currentUser).not.toBeNull();
        expect(state.currentUser?.name).toBe('Test User');
    });

    it('handles failure in verifyLoginCodeThunk', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 401,
            headers: { get: () => 'application/json' },
            json: () => Promise.resolve({ error: 'Invalid OTP' })
        } as any);

        const result = await store.dispatch(verifyLoginCodeThunk({
            email: 'test@example.com',
            identifier: 'MOCK-123456',
            code: 'wrong',
            startUrl: '/home'
        }));

        expect(result.meta.requestStatus).toBe('rejected');
        expect(result.payload).toBe('Invalid OTP');

        const state = store.getState().contact;
        expect(state.error).toBe('Invalid OTP');
    });
});
