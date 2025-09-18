import {
	createFileRoute,
	useNavigate,
	useRouteContext,
} from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { useEffect } from "react";
import {
	authStore,
	setAuthError,
	setAuthLoading,
	setAuthModedChannels,
	setAuthSuccess,
} from "@/stores/auth";

export const Route = createFileRoute("/callback")({
	component: AuthCallbackComponent,
});

function AuthCallbackComponent() {
	const navigate = useNavigate();
	const context = useRouteContext({ from: "/callback" });
	const authError = useStore(authStore, (state) => state.error);

	useEffect(() => {
		const processCallback = async () => {
			setAuthLoading(true);

			try {
				const result = await context.twitchAPI.handleAuthCallback();

				setAuthSuccess(result.user, result.accessToken, result.state);

				const modedChannels = await context.twitchAPI.getModedChannels(
					result.user.id,
				);

				setAuthModedChannels(modedChannels.data);

				navigate({
					to: "/",
				});
			} catch (error) {
				console.error("Auth callback error:", error);
				setAuthError(
					error instanceof Error
						? error.message
						: "Authentication failed",
				);

				navigate({ to: "/login" });
			}
		};

		processCallback();
	});

	if (authError) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="text-center">
					<h2 className="mb-2 font-bold text-2xl text-destructive">
						Authentication Error
					</h2>
					<p className="mb-4 text-muted-foreground">{authError}</p>
					<p className="text-muted-foreground text-sm">
						Redirecting to login...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<div className="text-center">
				<h2 className="mb-2 font-bold text-2xl">Autenticando...</h2>
				<p className="text-muted-foreground">Aguantame las carnitas</p>
			</div>
		</div>
	);
}
