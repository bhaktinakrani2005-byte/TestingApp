import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { AuthProvider } from '@/features/authentication/context/AuthContext';
import LoginPage from './Login';
import { logoutContact } from '@/store/slice/ContactSlice';
import { MemoryRouter } from 'react-router';

describe('LoginPage integration tests', () => {
    let mockLocation: { href: any; };

    beforeEach(() => {
        store.dispatch(logoutContact());
        vi.restoreAllMocks();

        mockLocation = { href: '' };
        Object.defineProperty(window, 'location', {
            value: mockLocation,
            configurable: true,
            writable: true
        });
    });

    it('renders the email input form initially', () => {
        render(
            <Provider store={store}>
                <AuthProvider>
                    <MemoryRouter>
                        <LoginPage />
                    </MemoryRouter>
                </AuthProvider>
            </Provider>
        );

        // Verify "Welcome Back" is displayed
        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
        
        // Verify email input exists
        const emailInput = screen.getByPlaceholderText('Enter your email');
        expect(emailInput).toBeInTheDocument();

        // Verify Send OTP button exists
        const sendButton = screen.getByRole('button', { name: 'Send OTP' });
        expect(sendButton).toBeInTheDocument();
    });

    it('submits the email form and transitions to OTP input form', async () => {
        const mockSendResponse = { identifier: 'MOCK-123456', startUrl: '/home' };
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: true,
            headers: { get: () => 'application/json' },
            json: () => Promise.resolve(mockSendResponse)
        } as any);

        render(
            <Provider store={store}>
                <AuthProvider>
                    <MemoryRouter>
                        <LoginPage />
                    </MemoryRouter>
                </AuthProvider>
            </Provider>
        );

        // Enter email and click submit
        const emailInput = screen.getByPlaceholderText('Enter your email');
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

        const sendButton = screen.getByRole('button', { name: 'Send OTP' });
        fireEvent.click(sendButton);

        // Wait for it to transition to step 'code'
        await waitFor(() => {
            expect(screen.getByPlaceholderText('Enter OTP')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Verify OTP' })).toBeInTheDocument();
        });
    });

    it('displays error if email submission fails', async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 400,
            headers: { get: () => 'application/json' },
            json: () => Promise.resolve({ error: 'User not found' })
        } as any);

        render(
            <Provider store={store}>
                <AuthProvider>
                    <MemoryRouter>
                        <LoginPage />
                    </MemoryRouter>
                </AuthProvider>
            </Provider>
        );

        const emailInput = screen.getByPlaceholderText('Enter your email');
        fireEvent.change(emailInput, { target: { value: 'invalid@example.com' } });

        const sendButton = screen.getByRole('button', { name: 'Send OTP' });
        fireEvent.click(sendButton);

        await waitFor(() => {
            expect(screen.getByText('User not found')).toBeInTheDocument();
        });
    });

    it('submits OTP code and performs window redirect on verification success', async () => {
        const mockSendResponse = { identifier: 'MOCK-123456', startUrl: '/home' };
        const mockVerifyResponse = {
            success: true,
            redirectUrl: '/home',
            user: {
                id: '003000000000000',
                name: 'Test User',
                email: 'test@example.com'
            }
        };

        // Mock both fetch requests (send and verify)
        globalThis.fetch = vi.fn()
            .mockResolvedValueOnce({
                ok: true,
                headers: { get: () => 'application/json' },
                json: () => Promise.resolve(mockSendResponse)
            } as any)
            .mockResolvedValueOnce({
                ok: true,
                headers: { get: () => 'application/json' },
                json: () => Promise.resolve(mockVerifyResponse)
            } as any);

        render(
            <Provider store={store}>
                <AuthProvider>
                    <MemoryRouter>
                        <LoginPage />
                    </MemoryRouter>
                </AuthProvider>
            </Provider>
        );

        // Step 1: Send OTP
        const emailInput = screen.getByPlaceholderText('Enter your email');
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.click(screen.getByRole('button', { name: 'Send OTP' }));

        // Wait for step transition
        const otpInput = await screen.findByPlaceholderText('Enter OTP');

        // Step 2: Verify OTP
        fireEvent.change(otpInput, { target: { value: '123456' } });
        fireEvent.click(screen.getByRole('button', { name: 'Verify OTP' }));

        // Check if redirection occurred
        await waitFor(() => {
            expect(mockLocation.href).toBe('/home');
        });
    });

    it('displays error if OTP verification fails', async () => {
        const mockSendResponse = { identifier: 'MOCK-123456', startUrl: '/home' };
        
        globalThis.fetch = vi.fn()
            .mockResolvedValueOnce({
                ok: true,
                headers: { get: () => 'application/json' },
                json: () => Promise.resolve(mockSendResponse)
            } as any)
            .mockResolvedValueOnce({
                ok: false,
                status: 401,
                headers: { get: () => 'application/json' },
                json: () => Promise.resolve({ error: 'Invalid or expired OTP' })
            } as any);

        render(
            <Provider store={store}>
                <AuthProvider>
                    <MemoryRouter>
                        <LoginPage />
                    </MemoryRouter>
                </AuthProvider>
            </Provider>
        );

        // Step 1: Send OTP
        const emailInput = screen.getByPlaceholderText('Enter your email');
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.click(screen.getByRole('button', { name: 'Send OTP' }));

        // Wait for step transition
        const otpInput = await screen.findByPlaceholderText('Enter OTP');

        // Step 2: Verify OTP
        fireEvent.change(otpInput, { target: { value: 'wrong' } });
        fireEvent.click(screen.getByRole('button', { name: 'Verify OTP' }));

        // Expect error message
        await waitFor(() => {
            expect(screen.getByText('Invalid or expired OTP')).toBeInTheDocument();
        });
    });
});
