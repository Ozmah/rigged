// UI/Styles/UI Components
import {
	// BellIcon,
	DiceThreeIcon,
} from "@phosphor-icons/react";
// import { Button } from "@/components/ui/button";
import { UserDropdown } from "@/components/user-dropdown";

interface HeaderProps {
	className?: string;
}

export function Header({ className = "" }: HeaderProps) {
	return (
		<div
			className={`col-span-full row-span-1 border-b bg-background ${className}`}
		>
			<div className="flex h-full items-center justify-between px-4">
				{/* Logo section */}
				<div className="flex items-center gap-2">
					{/* Mobile: Solo icono */}
					<div className="md:hidden">
						<DiceThreeIcon className="h-10 w-10" />
					</div>

					{/* Desktop: Logo + texto */}
					<div className="hidden items-center gap-2 md:flex">
						<DiceThreeIcon className="h-10 w-10" />
						<span className="font-bold text-lg">Rigged</span>
					</div>
				</div>

				{/* Actions section */}
				<div className="flex items-center gap-3">
					{/* Notifications - solo desktop */}
					{/* <Button
						variant="secondary"
						size="icon"
						className="rounded-full p-2 hover:bg-sidebar-accent-foreground"
					>
						<BellIcon className="h-5 w-5" />
					</Button> */}

					{/* User dropdown */}
					<UserDropdown />
				</div>
			</div>
		</div>
	);
}
