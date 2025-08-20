import { Store } from "@tanstack/store";
import type { TwitchUser } from "@/lib/twitch-schemas";

export interface AuthState {
	isAuthenticated: boolean;
	user: TwitchUser | null;
	accessToken: string | null;
	userState: string | null;
	isLoading: boolean;
	error: string | null;
}

const AUTH_STORAGE_KEY = "rigged-auth-state";

/**
 * Persistible auth data (excludes transient states like loading/error)
 */
interface PersistedAuthState {
	isAuthenticated: boolean;
	user: TwitchUser | null;
	accessToken: string | null;
	userState: string | null;
}

/**
 * Load auth state from localStorage
 */
const loadPersistedAuthState = (): Partial<AuthState> => {
	try {
		const stored = localStorage.getItem(AUTH_STORAGE_KEY);
		if (!stored) return {};

		const parsed: PersistedAuthState = JSON.parse(stored);

		// Validate that we have the essential data
		if (parsed.isAuthenticated && (!parsed.accessToken || !parsed.user)) {
			console.warn("Invalid persisted auth state, clearing...");
			localStorage.removeItem(AUTH_STORAGE_KEY);
			return {};
		}

		return {
			isAuthenticated: parsed.isAuthenticated,
			user: parsed.user,
			accessToken: parsed.accessToken,
			userState: parsed.userState,
		};
	} catch (error) {
		console.warn("Failed to load persisted auth state:", error);
		localStorage.removeItem(AUTH_STORAGE_KEY);
		return {};
	}
};

/**
 * Save auth state to localStorage
 */
const saveAuthState = (state: AuthState): void => {
	try {
		const persistedData: PersistedAuthState = {
			isAuthenticated: state.isAuthenticated,
			user: state.user,
			accessToken: state.accessToken,
			userState: state.userState,
		};

		if (state.isAuthenticated && state.accessToken && state.user) {
			localStorage.setItem(
				AUTH_STORAGE_KEY,
				JSON.stringify(persistedData),
			);
		} else {
			// Clear localStorage if not authenticated
			localStorage.removeItem(AUTH_STORAGE_KEY);
		}
	} catch (error) {
		console.warn("Failed to save auth state:", error);
	}
};

// Initialize store with persisted state
const initialState: AuthState = {
	isAuthenticated: false,
	user: null,
	accessToken: null,
	userState: null,
	isLoading: false,
	error: null,
	...loadPersistedAuthState(), // Hydrate from localStorage
};

export const authStore = new Store<AuthState>(initialState);

// Subscribe to state changes to persist auth data
authStore.subscribe(() => {
	const state = authStore.state;
	saveAuthState(state);
});

export const setAuthLoading = (isLoading: boolean) => {
	authStore.setState((state) => ({
		...state,
		isLoading,
		error: null,
	}));
};

export const setAuthError = (error: string) => {
	authStore.setState((state) => ({
		...state,
		isLoading: false,
		error,
	}));
};

export const setAuthSuccess = (
	user: TwitchUser,
	accessToken: string,
	userState: string,
) => {
	authStore.setState(() => ({
		isAuthenticated: true,
		user,
		accessToken,
		userState,
		isLoading: false,
		error: null,
	}));
};

export const clearAuth = () => {
	// Clear localStorage explicitly
	try {
		localStorage.removeItem(AUTH_STORAGE_KEY);
	} catch (error) {
		console.warn("Failed to clear auth from localStorage:", error);
	}

	authStore.setState(() => ({
		isAuthenticated: false,
		user: null,
		accessToken: null,
		userState: null,
		isLoading: false,
		error: null,
	}));
};

/**
 * Get current auth context (for debugging and external use)
 */
export const getAuthContext = () => {
	const state = authStore.state;
	console.log("🔍 Current auth state:", state);
	return {
		isAuthenticated: state.isAuthenticated,
		user: state.user,
		accessToken: state.accessToken,
		hasValidSession: !!(
			state.isAuthenticated &&
			state.accessToken &&
			state.user
		),
	};
};
