import {
	createFileRoute,
	useNavigate,
	useRouteContext,
	useRouter,
} from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { useEffect, useState } from "react";
import {
	authStore,
	setAuthError,
	setAuthLoading,
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
				navigate({
					to: "/raffle",
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
				<h2 className="mb-2 font-bold text-2xl">Authenticating...</h2>
				<p className="text-muted-foreground">
					Please wait while we log you in.
				</p>
			</div>
		</div>
	);
}
