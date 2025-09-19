import { useEffect, useState } from "react";
import {
	type DeviceInfo,
	detectDevice,
	setupDeviceListeners,
} from "@/lib/device-detection";

export function useDeviceDetection() {
	const [device, setDevice] = useState<DeviceInfo>(() => detectDevice());

	useEffect(() => {
		const cleanup = setupDeviceListeners((newDevice) => {
			setDevice(newDevice);
		});

		return cleanup;
	}, []);

	return device;
}
