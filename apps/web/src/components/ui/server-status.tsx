import { cn } from "@/lib/utils";
import type { ConnectionStatus } from "@/stores/chat";

type StatusConfig = {
	[K in ConnectionStatus]: {
		color: string;
		ping?: boolean;
		text?: string;
		variant: string;
	}
}

interface ServerStatusProps {
	status: ConnectionStatus;
	customLabel?: string;
	label?: string;
	size?: "sm" | "md" | "lg";
	variant?: "default" | "subtle" | "alert";
	ping: boolean;
	className?: string;
}

const sizeConfig = {
	sm: "w-2 h-2",
	md: "w-3 h-3",
	lg: "w-4 h-4",
};

const variantConfig = {
	default: "",
	subtle: "ping-subtle",
	alert: "ping-alert",
};

export function ServerStatus({
	status,
	label,
	size = "md",
	variant = "default",
	ping = true,
	className
}: ServerStatusProps) {
	const statusConfig = {
		connected: {
			color: "bg-green-500",
			ping: ping,
			text: label,
			variant: variant,
		},
		connecting: {
			color: "bg-yellow-500",
			ping: ping,
			text: label,
			variant: variant,
		},
		reconnecting: {
			color: "bg-yellow-600",
			ping: ping,
			text: label,
			variant: variant,
		},
		disconnected: {
			color: "bg-red-500",
			ping: ping,
			text: label,
			variant: variant,
		},
		error: {
			color: "bg-red-600",
			ping: ping,
			text: label,
			variant: variant,
		},
	} satisfies StatusConfig;

	const config = statusConfig[status];
	const sizeClass = sizeConfig[size];

	return (
		<div
			className={cn(
				"relative inline-flex items-center gap-3 rounded-lg bg-transparent border-0",
				className,
			)}
			style={
				{
					"--ping-duration": status === "connecting" ? "0.8s" : "1s",
					"--ping-scale": status === "connecting" ? "1.5" : "2",
				} as React.CSSProperties
			}
		>
			<div className="relative">
				<div className={cn("rounded-full", config.color, sizeClass)} />
				{config.ping && (
					<div
						className={cn(
							"absolute inset-0 rounded-full opacity-60 animate-ping",
							config.color,
							sizeClass,
							config.variant,
						)}
					/>
				)}
			</div>
			<span className="text-sm font-medium text-card-foreground">
				{config.text}
			</span>
		</div>
	);
}

// Export both components as default for flexibility
export { ServerStatus as default };