import { toast } from "sonner";
import type { RiggedSettingsProps } from "@/components/raffle/rigged-settings";
import { authStore } from "@/stores/auth";
import { resetChatState, setChannelSwitching } from "@/stores/chat";
import { resetUIState } from "@/stores/ui";
import type { TwitchAPI } from "./twitch-api-client";

// This needs to be integrated somewhere, doesn't make sense to just keep this here

/**
 * Switches to a different Twitch channel
 * Resets all app state except auth and user preferences
 */
export const switchToChannel = async (
	broadcasterId: string,
	broadcasterName: string,
	props: RiggedSettingsProps,
	twitchAPI: TwitchAPI,
) => {
	console.log("🔄 Starting channel switch to:", {
		broadcasterId,
		broadcasterName,
	});

	try {
		setChannelSwitching(true);
		await props.eventSubHook.disconnect();
		const prevSubscriptionId = props.eventSubHook.subscriptionId;

		if (prevSubscriptionId) {
			console.log(
				"🗑️ Deleting previous subscription:",
				prevSubscriptionId,
			);
			try {
				await twitchAPI.deleteEventSubSubscription(prevSubscriptionId);
				console.log("✅ Previous subscription deleted successfully");
			} catch (deleteError) {
				console.warn(
					"⚠️ Failed to delete previous subscription:",
					deleteError,
				);
			}
		}

		console.log("📝 Resetting app state...");
		const useUserSettings = broadcasterId === authStore.state.user?.id;
		resetChatState(useUserSettings);
		resetUIState();

		console.log("🎯 Connecting to new channel...");
		await props.eventSubHook.connect(broadcasterId);

		toast.success("🎯 Canal cambiado", {
			description: `Conectado a ${broadcasterName}`,
			duration: 3000,
			closeButton: true,
		});

		console.log("✅ Channel switch completed successfully");
		setChannelSwitching(false);
	} catch (error) {
		resetChatState();
		setChannelSwitching(false);
		console.error("❌ Channel switch failed:", error);

		toast.error("❌ Error al cambiar canal", {
			description:
				error instanceof Error ? error.message : "Error desconocido",
			duration: 5000,
			closeButton: true,
		});

		throw error;
	}
};
