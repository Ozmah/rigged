import { raffleStateActions } from "@/stores/chat";
import type { RaffleUiAction } from "@/types/raffle-ui-factory";

/**
 * Central handler that connects UI actions to state actions
 * This is the bridge between user interactions and business logic
 */
export const handleRaffleAction = (action: RaffleUiAction): void => {
	// This will essencially become the middleware for all user actions
	// This might be the place for the logger that will go into devtools
	// We can catch all actions related to the app UI

	switch (action.type) {
		// Raffle Core Actions
		case "UPDATE_KEYWORD":
			raffleStateActions.updateKeyword(action.payload.keyword);
			break;

		case "START_RAFFLE":
			raffleStateActions.startRaffle();
			break;

		case "STOP_RAFFLE":
			raffleStateActions.stopRaffle();
			break;

		case "RIG_RAFFLE":
			raffleStateActions.rigRaffle();
			break;

		case "EXECUTE_RAFFLE":
			raffleStateActions.executeRaffle();
			break;

		case "CLEAR_PARTICIPANTS":
			raffleStateActions.clearParticipants();
			break;

		// Configuration Actions
		case "TOGGLE_ADVANCED":
			raffleStateActions.toggleAdvanced(action.payload.enabled);
			break;

		case "TOGGLE_IGNORE_MODS":
			raffleStateActions.toggleIgnoreMods(action.payload.enabled);
			break;

		case "TOGGLE_IGNORE_SUBS":
			raffleStateActions.toggleIgnoreSubs(action.payload.enabled);
			break;

		case "TOGGLE_IGNORE_VIPS":
			raffleStateActions.toggleIgnoreVips(action.payload.enabled);
			break;

		case "TOGGLE_CASE_SENSITIVE":
			raffleStateActions.toggleCaseSensitive(action.payload.enabled);
			break;

		case "TOGGLE_REMOVE_WINNERS":
			raffleStateActions.toggleRemoveWinners(action.payload.enabled);
			break;

		case "TOGGLE_SUBS_EXTRA_TICKETS":
			raffleStateActions.toggleSubsExtraTickets(action.payload.enabled);
			break;

		case "TOGGLE_VIPS_EXTRA_TICKETS":
			raffleStateActions.toggleVipsExtraTickets(action.payload.enabled);
			break;

		case "TOGGLE_RAFFLE_UPDATES":
			raffleStateActions.toggleRaffleUpdates(action.payload.enabled);
			break;

		case "UPDATE_SUBS_EXTRA_VALUE":
			raffleStateActions.updateSubsExtraValue(action.payload.value);
			break;

		case "UPDATE_VIPS_EXTRA_VALUE":
			raffleStateActions.updateVipsExtraValue(action.payload.value);
			break;

		// Dev Tools Actions
		case "START_TEST_MESSAGES":
			raffleStateActions.startTestMessages();
			break;

		case "STOP_TEST_MESSAGES":
			raffleStateActions.stopTestMessages();
			break;

		case "CLEAR_CHAT_MESSAGES":
			raffleStateActions.clearChatMessages();
			break;

		// UI State Actions
		case "OPEN_CANCEL_DIALOG":
			raffleStateActions.openCancelDialog();
			break;

		case "CLOSE_CANCEL_DIALOG":
			raffleStateActions.closeCancelDialog();
			break;

		case "CONFIRM_CANCEL_RAFFLE":
			raffleStateActions.confirmCancelRaffle();
			break;

		case "HIDE_RAFFLE_CONTROLS":
			raffleStateActions.hideRaffleControls();
			break;

		case "SHOW_RAFFLE_CONTROLS":
			raffleStateActions.showRaffleControls();
			break;

		// Keyboard Actions
		case "KEYWORD_ENTER_PRESSED":
			raffleStateActions.keywordEnterPressed();
			break;

		default: {
			const _exhaustiveCheck: never = action;
			// This is still a work in progress, still learning typescript so trying new stuff
			throw new Error(
				`Unhandled action: ${JSON.stringify(_exhaustiveCheck)}`,
			);
		}
	}
};
