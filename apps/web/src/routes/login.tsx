import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { Rocket } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useGitHubVersion } from "@/hooks/useGitHubVersion";
import { authStore, setAuthError } from "@/stores/auth";

export const Route = createFileRoute("/login")({
	component: LoginComponent,
});

function LoginComponent() {
	const context = useRouteContext({ from: "/login" });
	const { version, description } = useGitHubVersion("Ozmah", "rigged");

	const handleTwitchLogin = async () => {
		try {
			await context.twitchAPI.initiateTwitchLogin();
		} catch (error) {
			console.error("Login error:", error);
			setAuthError(
				error instanceof Error
					? error.message
					: "Failed to initiate login",
			);
		}
	};

	if (authStore.state.isLoading) {
		return (
			<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
				<div className="text-center">
					<h2 className="mb-2 font-bold text-2xl">Conectando...</h2>
					<p className="text-muted-foreground">
						Redirigiendo a Twitch...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm">
				<div className="flex flex-col gap-6">
					<Alert>
						<Rocket className="h-4 w-4" />
						<AlertTitle>Versión {version}</AlertTitle>
						<AlertDescription>{description}</AlertDescription>
					</Alert>
					<Card>
						<CardHeader className="text-center">
							<CardTitle className="font-bold text-3xl text-primary">
								🎲 Rigged
							</CardTitle>
							<CardDescription className="text-base">
								Sorteos en stream, rápidos y fáciles!
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex flex-col gap-6">
								<div className="space-y-2">
									<h3 className="text-center font-medium">
										¿Qué puedes hacer?
									</h3>
									<ul className="space-y-1 text-start text-muted-foreground text-sm">
										<li>
											• Sorteos en tiempo real con el chat
										</li>
										<li>• Los ganadores que quieras</li>
										<li>
											• Lista de participantes/ganadores
										</li>
										<li>
											• Todas las opciones que se me
											ocurrieron
										</li>
										<li>
											• ¿Sugerencias?{" "}
											<a
												className="text-accent-foreground underline"
												href="https://x.com/OzmahG"
												target="blank"
											>
												Contáctame
											</a>
										</li>
									</ul>
								</div>

								<Button
									onClick={handleTwitchLogin}
									className="w-full bg-purple-600 py-3 font-medium text-white hover:bg-purple-700"
									// disabled={authState.isLoading}
								>
									<svg
										className="mr-2 h-5 w-5"
										viewBox="0 0 24 24"
										fill="currentColor"
									>
										<title>Twitch logo</title>
										<path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
									</svg>
									Conectar con Twitch
								</Button>

								{/* {authState.error && (
									<div className="rounded-md border border-destructive/20 bg-destructive/10 p-3">
										<p className="text-destructive text-sm">
											{authState.error}
										</p>
									</div>
								)} */}
							</div>

							<div className="mt-6 text-center text-muted-foreground text-xs">
								<p>Al conectar autorizas a Rigged a:</p>
								<p>• Leer tu chat para sorteos</p>
								<p>• Obtener tu información básica</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
