import { Store } from "@tanstack/react-store";

// 🐛 Debug Error Interface
interface DebugError {
	timestamp: string;
	type: string;
	message: string;
	recovered: boolean;
	context?: Record<string, unknown>;
}

// 📊 Performance Metric Interface
interface PerformanceMetric {
	name: string;
	value: number;
	unit: string;
	timestamp: string;
}

// 🌐 API Call Interface
interface ApiCall {
	id: string;
	url: string;
	method: string;
	duration: number;
	status: number;
	timestamp: string;
	error?: string;
}

// 🎯 Action History Interface
interface ActionHistoryEntry {
	id: string;
	timestamp: string;
	action: string;
	payload: unknown;
	source: "raffle" | "auth" | "chat" | "ui";
}

// 🧠 Debug State Interface
interface DebugState {
	// 🔌 EventSub Debug Data
	eventSub: {
		sessionId: string | null;
		subscriptionId: string | null;
		isConnected: boolean;
		isConnecting: boolean;
		retryCount: number;
		maxRetries: number;
		nextRetryIn: number | null;
		errorHistory: DebugError[];
		latencyHistory: number[];
		keepalivesMissed: number;
		reconnectUrl: string | null;
		lastMessageTimestamp: string | null;
	};

	// 📊 Performance Metrics
	performance: {
		renderTimes: PerformanceMetric[];
		memoryUsage: number;
		stateUpdatesPerSecond: number;
		lastGC: string | null;
	};

	// 🌐 Network Debug
	network: {
		apiCalls: ApiCall[];
		twitchApiRateLimit: {
			remaining: number;
			resetTime: string | null;
		};
		totalRequests: number;
		failedRequests: number;
	};

	// 📈 Action History (last 100 actions)
	actionHistory: ActionHistoryEntry[];

	// 🎛️ Debug Settings
	settings: {
		maxErrorHistory: number;
		maxActionHistory: number;
		maxApiCallHistory: number;
		enablePerformanceTracking: boolean;
		enableNetworkTracking: boolean;
	};
}

// 🏪 Debug Store
export const debugStore = new Store<DebugState>({
	eventSub: {
		sessionId: null,
		subscriptionId: null,
		isConnected: false,
		isConnecting: false,
		retryCount: 0,
		maxRetries: 5,
		nextRetryIn: null,
		errorHistory: [],
		latencyHistory: [],
		keepalivesMissed: 0,
		reconnectUrl: null,
		lastMessageTimestamp: null,
	},
	performance: {
		renderTimes: [],
		memoryUsage: 0,
		stateUpdatesPerSecond: 0,
		lastGC: null,
	},
	network: {
		apiCalls: [],
		twitchApiRateLimit: {
			remaining: 0,
			resetTime: null,
		},
		totalRequests: 0,
		failedRequests: 0,
	},
	actionHistory: [],
	settings: {
		maxErrorHistory: 50,
		maxActionHistory: 100,
		maxApiCallHistory: 50,
		enablePerformanceTracking: true,
		enableNetworkTracking: true,
	},
});

// 🔌 EventSub Actions
export const setEventSubState = (data: Partial<DebugState["eventSub"]>) => {
	debugStore.setState((state) => ({
		...state,
		eventSub: { ...state.eventSub, ...data },
	}));
};

export const addEventSubError = (error: Omit<DebugError, "timestamp">) => {
	debugStore.setState((state) => ({
		...state,
		eventSub: {
			...state.eventSub,
			errorHistory: [
				{
					...error,
					timestamp: new Date().toISOString(),
				},
				...state.eventSub.errorHistory.slice(
					0,
					state.settings.maxErrorHistory - 1,
				),
			],
		},
	}));
};

export const addLatencyMeasurement = (latency: number) => {
	debugStore.setState((state) => ({
		...state,
		eventSub: {
			...state.eventSub,
			latencyHistory: [
				latency,
				...state.eventSub.latencyHistory.slice(0, 99), // Keep last 100
			],
		},
	}));
};

// 🌐 Network Actions
export const addApiCall = (apiCall: Omit<ApiCall, "id" | "timestamp">) => {
	const id = `api_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

	debugStore.setState((state) => ({
		...state,
		network: {
			...state.network,
			apiCalls: [
				{
					...apiCall,
					id,
					timestamp: new Date().toISOString(),
				},
				...state.network.apiCalls.slice(
					0,
					state.settings.maxApiCallHistory - 1,
				),
			],
			totalRequests: state.network.totalRequests + 1,
			failedRequests:
				apiCall.status >= 400
					? state.network.failedRequests + 1
					: state.network.failedRequests,
		},
	}));
};

export const updateTwitchRateLimit = (remaining: number, resetTime: string) => {
	debugStore.setState((state) => ({
		...state,
		network: {
			...state.network,
			twitchApiRateLimit: {
				remaining,
				resetTime,
			},
		},
	}));
};

// 📈 Action History
export const addActionToHistory = (
	action: Omit<ActionHistoryEntry, "id" | "timestamp">,
) => {
	const id = `action_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

	debugStore.setState((state) => ({
		...state,
		actionHistory: [
			{
				...action,
				id,
				timestamp: new Date().toISOString(),
			},
			...state.actionHistory.slice(
				0,
				state.settings.maxActionHistory - 1,
			),
		],
	}));
};

// 📊 Performance Actions
export const addPerformanceMetric = (
	metric: Omit<PerformanceMetric, "timestamp">,
) => {
	debugStore.setState((state) => ({
		...state,
		performance: {
			...state.performance,
			renderTimes: [
				{
					...metric,
					timestamp: new Date().toISOString(),
				},
				...state.performance.renderTimes.slice(0, 99), // Keep last 100
			],
		},
	}));
};

// 📊 Memory Usage Tracking (Chrome/Chromium only)
interface PerformanceMemory {
	usedJSHeapSize: number;
	totalJSHeapSize: number;
	jsHeapSizeLimit: number;
}

interface PerformanceWithMemory extends Performance {
	memory?: PerformanceMemory;
}

export const updateMemoryUsage = () => {
	const perf = performance as PerformanceWithMemory;
	const memoryInfo = perf.memory;

	if (memoryInfo) {
		debugStore.setState((state) => ({
			...state,
			performance: {
				...state.performance,
				memoryUsage: memoryInfo.usedJSHeapSize,
			},
		}));
	}
};

// 🧹 Cleanup Actions
export const clearDebugHistory = (
	section?: keyof Pick<DebugState, "actionHistory">,
) => {
	debugStore.setState((state) => {
		if (section === "actionHistory") {
			return { ...state, actionHistory: [] };
		}

		// Clear all histories
		return {
			...state,
			eventSub: {
				...state.eventSub,
				errorHistory: [],
				latencyHistory: [],
			},
			network: {
				...state.network,
				apiCalls: [],
			},
			actionHistory: [],
			performance: {
				...state.performance,
				renderTimes: [],
			},
		};
	});
};

// 🎛️ Settings Actions
export const updateDebugSettings = (
	settings: Partial<DebugState["settings"]>,
) => {
	debugStore.setState((state) => ({
		...state,
		settings: { ...state.settings, ...settings },
	}));
};
