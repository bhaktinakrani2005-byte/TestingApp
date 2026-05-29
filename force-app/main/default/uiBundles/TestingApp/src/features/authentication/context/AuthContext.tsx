import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { logoutContact } from "@/store/slice/ContactSlice";
import { API_ROUTES } from "../authenticationConfig";
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
		(startURL?: string) => {

			dispatch(logoutContact());

			localStorage.removeItem("persist:root");

			const finalLogoutUrl = startURL
				? `${API_ROUTES.LOGOUT}?startURL=${encodeURIComponent(startURL)}`
				: API_ROUTES.LOGOUT;

			window.location.replace('/');

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
