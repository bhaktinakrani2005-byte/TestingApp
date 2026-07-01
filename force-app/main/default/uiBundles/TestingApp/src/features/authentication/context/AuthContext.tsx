import { createContext, useContext, useCallback, useEffect, type ReactNode } from "react";
import { logoutContact, checkSessionThunk } from "@/store/slice/ContactSlice";
// import { API_ROUTES } from "../authenticationConfig";
import { useRedux } from "@/hook/useRedux";

interface User {
	readonly id: string;
	readonly name: string;
	readonly email?: string;
}


interface AuthContextType {
	user: User | null;
	isAuthenticated: boolean;
	loading: boolean;
	error: string | null;
	logout: (startURL?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
	children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const { dispatch, selector } = useRedux();

	const user = selector(
		(state) => state.contact.currentUser
	);

	useEffect(() => {
		dispatch(checkSessionThunk());
	}, [dispatch]);

	console.log('currentUser', user);
	console.log('isAuthenticated', user !== null);

	const loading = selector(
		(state) => state.contact.loading
	);

	const error = selector(
		(state) => state.contact.error
	);


	// const logout = useCallback((startURL?: string) => {
	// 	// Navigate to logout URL (server-side endpoint)
	// 	// Use replace to prevent back button from returning to authenticated session
	// 	const finalLogoutUrl = startURL
	// 		? `${API_ROUTES.LOGOUT}?startURL=${encodeURIComponent(startURL)}`
	// 		: API_ROUTES.LOGOUT;
	// 	window.location.replace(finalLogoutUrl);
	// }, []);

	const logout = useCallback(
		() => {

			dispatch(logoutContact());

			localStorage.removeItem("persist:root");

			if (typeof window !== 'undefined' && typeof window.caches !== 'undefined') {
				try {
					window.caches.delete('@salesforce/sdk-data_v1');
				} catch (e) {
					console.error('Failed to clear CSRF cache on logout:', e);
				}
			}

			// [Dev Note] Properly terminate the Salesforce session by navigating to the logout URL.
			// This ensures session cookies are cleared on the server side.
			window.location.replace('/secur/logout.jsp?retUrl=/');

		},
		[dispatch]
	);

	const value: AuthContextType = {
		user,
		isAuthenticated: user !== null,
		loading,
		error,
		logout,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access the authentication context.
 * @returns {AuthContextType} Authentication state (user, isAuthenticated, loading, error, checkAuth)
 * @throws {Error} If used outside of an AuthProvider
 */
export function useAuth(): AuthContextType {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}

/**
 * Returns the current authenticated user.
 * @returns {User} The authenticated user object
 * @throws {Error} If not used within AuthProvider or user is not authenticated
 */
export function useUser(): User {
	const context = useAuth();
	if (!context.user) {
		throw new Error("Authenticated context not established");
	}
	return context.user;
}
