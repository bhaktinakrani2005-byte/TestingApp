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

        // Clear document body to avoid leftover scripts/elements between tests
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

        // Mock $Lightning on window
        (window as any).$Lightning = {
            use: vi.fn((_appName, callback, _endpoint) => {
                callback();
            }),
            createComponent: vi.fn((_componentName, _attributes, containerId, callback) => {
                const container = document.getElementById(containerId);
                if (container) {
                    const appEl = document.createElement('lightning-out-application');
                    const compEl = document.createElement('c-passwordless-login-form');
                    appEl.appendChild(compEl);
                    container.appendChild(appEl);
                }
                if (callback) callback();
            })
        };
    });

    it('renders the login page frame and loads the Salesforce script', () => {
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
        expect(screen.getByText('Please sign in using your email OTP')).toBeInTheDocument();

        // Verify the Salesforce script is appended
        const script = document.querySelector('script[src*="lightning.out.js"]');
        expect(script).toBeInTheDocument();
    });

    it('creates lightning elements and hides loading spinner on script load', async () => {
        render(
            <Provider store={store}>
                <AuthProvider>
                    <MemoryRouter>
                        <LoginPage />
                    </MemoryRouter>
                </AuthProvider>
            </Provider>
        );

        // Verify loading spinner is visible initially
        expect(screen.getByText('Initializing secure login client...')).toBeInTheDocument();

        // Find the script and trigger load event
        const script = document.querySelector('script[src*="lightning.out.js"]');
        expect(script).toBeInTheDocument();

        fireEvent.load(script!);

        // Verify loading spinner is removed
        await waitFor(() => {
            expect(screen.queryByText('Initializing secure login client...')).not.toBeInTheDocument();
        });

        // Verify the component is created inside the container
        const cardContainer = document.getElementById('login-form-container');
        expect(cardContainer).toBeInTheDocument();
        expect(cardContainer?.querySelector('lightning-out-application')).toBeInTheDocument();
        expect(cardContainer?.querySelector('c-passwordless-login-form')).toBeInTheDocument();
    });

    it('performs window redirect when loginsuccess event is dispatched', async () => {
        render(
            <Provider store={store}>
                <AuthProvider>
                    <MemoryRouter>
                        <LoginPage />
                    </MemoryRouter>
                </AuthProvider>
            </Provider>
        );

        const script = document.querySelector('script[src*="lightning.out.js"]');
        expect(script).toBeInTheDocument();

        fireEvent.load(script!);

        // Verify container is mounted
        await waitFor(() => {
            expect(document.querySelector('c-passwordless-login-form')).toBeInTheDocument();
        });

        // Dispatch LWC custom loginsuccess event on document
        const loginSuccessEvent = new CustomEvent('loginsuccess', {
            detail: {
                result: {
                    success: true,
                    redirectUrl: '/home'
                }
            }
        });

        document.dispatchEvent(loginSuccessEvent);

        // Check if window location was updated
        expect(mockLocation.href).toContain('/home');
    });

    it('displays error if loginsuccess event reports failure', async () => {
        render(
            <Provider store={store}>
                <AuthProvider>
                    <MemoryRouter>
                        <LoginPage />
                    </MemoryRouter>
                </AuthProvider>
            </Provider>
        );

        const script = document.querySelector('script[src*="lightning.out.js"]');
        expect(script).toBeInTheDocument();

        fireEvent.load(script!);

        await waitFor(() => {
            expect(document.querySelector('c-passwordless-login-form')).toBeInTheDocument();
        });

        // Dispatch LWC custom loginsuccess event indicating failure
        const loginFailEvent = new CustomEvent('loginsuccess', {
            detail: {
                result: {
                    success: false
                }
            }
        });

        document.dispatchEvent(loginFailEvent);

        // Check if error message is displayed
        await waitFor(() => {
            expect(screen.getByText('Login verification failed. Please try again.')).toBeInTheDocument();
        });
    });
});
