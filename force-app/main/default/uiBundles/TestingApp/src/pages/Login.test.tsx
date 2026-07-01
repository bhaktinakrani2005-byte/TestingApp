import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { AuthProvider } from '@/features/authentication/context/AuthContext';
import LoginPage from './Login';
import { logoutContact } from '@/store/slice/ContactSlice';
import { MemoryRouter } from 'react-router';

vi.mock('@/api/graphqlClient', () => ({
    executeGraphQL: vi.fn().mockResolvedValue({
        uiapi: {
            query: {
                User: {
                    edges: []
                }
            }
        }
    }),
    flattenGraphQLRecord: (data: any) => data,
    fetchSingle: vi.fn()
}));

describe('LoginPage integration tests', () => {
    let mockLocation: any;

    beforeEach(() => {
        store.dispatch(logoutContact());
        vi.restoreAllMocks();

        // Clear document body
        document.body.innerHTML = '';
        const root = document.createElement('div');
        root.id = 'root';
        document.body.appendChild(root);

        // Delete any global window variables to ensure fresh state
        delete (window as any).__lightningOutContainer;
        delete (window as any).__lightningOutScriptLoaded;

        mockLocation = {
            href: '',
            pathname: '/login',
            origin: 'https://momentum-fun-8796-dev-ed.scratch.my.site.com',
            hostname: 'localhost'
        };
        Object.defineProperty(window, 'location', {
            value: mockLocation,
            configurable: true,
            writable: true
        });

        global.fetch = vi.fn();
    });

    it('renders the login page with credentials fields', () => {
        render(
            <Provider store={store}>
                <AuthProvider>
                    <MemoryRouter>
                        <LoginPage />
                    </MemoryRouter>
                </AuthProvider>
            </Provider>
        );

        // Verify title frame is present
        expect(screen.getByText('Community Login')).toBeInTheDocument();
        expect(screen.getByText('Please sign in using your Salesforce credentials')).toBeInTheDocument();

        // Verify fields are present
        expect(screen.getByLabelText(/Username or Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    });

    it('submits credentials and redirects on success', async () => {
        const fakeResponse = {
            success: true,
            redirectUrl: '/home',
            user: {
                id: '005xxx',
                name: 'Test User',
                email: 'test@example.com',
                username: 'test@example.com',
                firstName: 'Test',
                lastName: 'User'
            }
        };

        (global.fetch as any).mockResolvedValue({
            ok: true,
            headers: {
                get: (name: string) => name.toLowerCase() === 'content-type' ? 'application/json' : null
            },
            json: () => Promise.resolve(fakeResponse)
        });

        render(
            <Provider store={store}>
                <AuthProvider>
                    <MemoryRouter>
                        <LoginPage />
                    </MemoryRouter>
                </AuthProvider>
            </Provider>
        );

        const usernameInput = screen.getByLabelText(/Username or Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const submitButton = screen.getByRole('button', { name: /Sign In/i });

        fireEvent.change(usernameInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        fireEvent.click(submitButton);

        // Verify it enters loading state
        expect(screen.getByText('Signing in...')).toBeInTheDocument();

        await waitFor(() => {
            expect(mockLocation.href).toContain('/home');
        });
    });

    it('shows error message on failure', async () => {
        const errorResponse = {
            success: false,
            error: 'Invalid username or password'
        };

        (global.fetch as any).mockResolvedValue({
            ok: false,
            status: 401,
            headers: {
                get: (name: string) => name.toLowerCase() === 'content-type' ? 'application/json' : null
            },
            json: () => Promise.resolve(errorResponse)
        });

        render(
            <Provider store={store}>
                <AuthProvider>
                    <MemoryRouter>
                        <LoginPage />
                    </MemoryRouter>
                </AuthProvider>
            </Provider>
        );

        const usernameInput = screen.getByLabelText(/Username or Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const submitButton = screen.getByRole('button', { name: /Sign In/i });

        fireEvent.change(usernameInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Invalid username or password')).toBeInTheDocument();
        });
    });
});

