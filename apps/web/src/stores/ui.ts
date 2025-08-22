import { Store } from "@tanstack/store";

// Need to evaluate if this store is justified

export interface uiState {
    isMicroMenuOpen: boolean;
    microMenuSelected: "raffle" | "settings" | "dev";
    isBellOpen: boolean;
    haveNotifications: boolean;
    error: string | null;
}

const UI_STORAGE_KEY = "rigged-ui-state";

/**
 * Persistible auth data (excludes transient states like loading/error)
 */
interface PersistedUiState {
    isMicroMenuOpen: boolean;
    microMenuSelected: "raffle" | "settings" | "dev";
}

/**
 * Load auth state from localStorage
 */
const loadPersistedUiState = (): Partial<PersistedUiState> => {
    try {
        const stored = localStorage.getItem(UI_STORAGE_KEY);
        if (!stored) return {};

        const parsed: PersistedUiState = JSON.parse(stored);

        return {
            isMicroMenuOpen: parsed.isMicroMenuOpen,
            microMenuSelected: parsed.microMenuSelected,
        };
    } catch (error) {
        console.warn("Failed to load persisted ui state:", error);
        localStorage.removeItem(UI_STORAGE_KEY);
        return {};
    }
};

/**
 * Save auth state to localStorage
 */
const saveUiState = (state: uiState): void => {
    try {
        const persistedData: PersistedUiState = {
            isMicroMenuOpen: state.isMicroMenuOpen,
            microMenuSelected: state.microMenuSelected,
        };

        localStorage.setItem(
            UI_STORAGE_KEY,
            JSON.stringify(persistedData),
        );

    } catch (error) {
        console.warn("Failed to save ui state:", error);
    }
};

// Initialize store with persisted state
const initialState: uiState = {
    isMicroMenuOpen: false,
    microMenuSelected: "raffle",
    isBellOpen: false,
    haveNotifications: false,
    error: null,
    ...loadPersistedUiState(), // Hydrate from localStorage
};

export const uiStore = new Store<uiState>(initialState);

// Subscribe to state changes to persist auth data
uiStore.subscribe(() => {
    const state = uiStore.state;
    saveUiState(state);
});

export const setUiError = (error: string) => {
    uiStore.setState((state) => ({
        ...state,
        error,
    }));
};