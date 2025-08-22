import { BellIcon, DiceThreeIcon } from "@phosphor-icons/react";
import { UserDropdown } from "./user-dropdown";

interface HeaderProps {
	className?: string;
}

export function Header({ className = "" }: HeaderProps) {
	return (
		<div className={`col-span-20 border-b bg-background ${className}`}>
			<div className="flex h-full items-center justify-between px-4">
				{/* Logo section */}
				<div className="flex items-center gap-2">
					{/* Mobile: Solo icono */}
					<div className="md:hidden">
						<DiceThreeIcon className="h-6 w-6" />
					</div>

					{/* Desktop: Logo + texto */}
					<div className="hidden items-center gap-2 md:flex">
						<DiceThreeIcon className="h-6 w-6" />
						<span className="font-bold text-lg">Rigged</span>
					</div>
				</div>

				{/* Actions section */}
				<div className="flex items-center gap-3">
					{/* Notifications - solo desktop */}
					<button className="hidden rounded-md p-2 hover:bg-accent md:block">
						<BellIcon className="h-5 w-5" />
					</button>

					{/* User dropdown */}
					<UserDropdown />
				</div>
			</div>
		</div>
	);
}
