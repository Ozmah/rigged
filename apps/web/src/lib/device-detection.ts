export interface DeviceInfo {
	isMobile: boolean;
	isTouch: boolean;
	isSmallScreen: boolean;
	screenWidth: number;
	orientation: "portrait" | "landscape";
	hasHover: boolean;
	timestamp: number;
}

let cachedDevice: DeviceInfo | null = null;
let lastCheck = 0;
const CACHE_DURATION = 500;

const _detectDeviceRaw = (): DeviceInfo => {
	// Media Queries
	const touchQuery = window.matchMedia("(hover: none) and (pointer: coarse)");
	const hoverQuery = window.matchMedia("(hover: hover)");
	const sizeQuery = window.matchMedia("(max-width: 768px)");
	const orientationQuery = window.matchMedia("(orientation: portrait)");

	// Tactile events
	const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

	const screenWidth = window.innerWidth;
	const isSmallScreen = sizeQuery.matches;
	const isTouchDevice = touchQuery.matches;
	const isMobile = isTouchDevice || isSmallScreen;

	return {
		isMobile,
		isTouch: hasTouch,
		isSmallScreen,
		screenWidth,
		orientation: orientationQuery.matches ? "portrait" : "landscape",
		hasHover: hoverQuery.matches,
		timestamp: Date.now(),
	};
};

// General purpose function to get all device data
// Includes CACHE_DURATION cache
export const detectDevice = (): DeviceInfo => {
	const now = Date.now();

	if (cachedDevice && now - lastCheck < CACHE_DURATION) {
		return cachedDevice;
	}

	cachedDevice = _detectDeviceRaw();
	lastCheck = now;

	return cachedDevice;
};

export const detectDeviceForce = (): DeviceInfo => {
	cachedDevice = _detectDeviceRaw();
	lastCheck = Date.now();
	return cachedDevice;
};

export const clearDeviceCache = (): void => {
	cachedDevice = null;
	lastCheck = 0;
};

// Still debating if this will be of use
export const getDeviceClasses = (device?: DeviceInfo) => {
	const deviceInfo = device || detectDevice();

	return {
		buttonSize: deviceInfo.isMobile
			? "h-12 px-6 text-lg"
			: "h-10 px-4 text-base",
		buttonSizeLarge: deviceInfo.isMobile
			? "h-14 px-8 text-xl"
			: "h-12 px-6 text-lg",

		spacing: deviceInfo.isMobile ? "p-4 gap-4" : "p-6 gap-6",
		spacingTight: deviceInfo.isMobile ? "p-2 gap-2" : "p-4 gap-4",

		grid: deviceInfo.isMobile
			? "grid-cols-1"
			: "grid-cols-2 lg:grid-cols-3",
		gridAuto: deviceInfo.isMobile ? "grid-cols-1" : "grid-cols-auto",

		hover: deviceInfo.hasHover
			? "hover:bg-gray-100 hover:scale-105"
			: "active:bg-gray-100 active: scale - 95",
		hoverSubtle: deviceInfo.hasHover
			? "hover:bg-gray-50"
			: "active:bg-gray-50",

		textSize: deviceInfo.isMobile ? "text-base" : "text-sm",
		textSizeLarge: deviceInfo.isMobile ? "text-lg" : "text-base",

		layout: deviceInfo.isMobile ? "flex flex-col" : "flex flex-row",
		modal: deviceInfo.isMobile ? "w-full h-full" : "w-auto h-auto max-w-md",
	};
};

export const isMobileDevice = (): boolean => detectDevice().isMobile;
export const isTouchDevice = (): boolean => detectDevice().isTouch;
export const isSmallScreen = (): boolean => detectDevice().isSmallScreen;
export const hasHoverCapability = (): boolean => detectDevice().hasHover;
export const getScreenWidth = (): number => detectDevice().screenWidth;
export const getOrientation = (): "portrait" | "landscape" =>
	detectDevice().orientation;

export const setupDeviceListeners = (
	callback?: (device: DeviceInfo) => void,
) => {
	const handleChange = () => {
		const newDevice = detectDeviceForce();
		callback?.(newDevice);
	};

	const queries = [
		window.matchMedia("(hover: none) and (pointer: coarse)"),
		window.matchMedia("(hover: hover)"),
		window.matchMedia("(max-width: 768px)"),
		window.matchMedia("(orientation: portrait)"),
	];

	queries.forEach((query) => {
		query.addEventListener("change", handleChange);
	});

	window.addEventListener("resize", handleChange);
	window.addEventListener("orientationchange", handleChange);

	return () => {
		queries.forEach((query) => {
			query.removeEventListener("change", handleChange);
		});
		window.removeEventListener("resize", handleChange);
		window.removeEventListener("orientationchange", handleChange);
	};
};

export const getDeviceDebugInfo = () => {
	const device = detectDevice();
	const cacheAge = cachedDevice ? Date.now() - lastCheck : 0;

	return {
		device,
		cacheAge,
		isCached: cacheAge < CACHE_DURATION,
		cacheDuration: CACHE_DURATION,
		userAgent: navigator.userAgent,
		viewport: {
			width: window.innerWidth,
			height: window.innerHeight,
			ratio: window.devicePixelRatio,
		},
	};
};
