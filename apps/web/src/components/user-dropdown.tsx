import { redirect, useNavigate, useRouter } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { LogOut, Settings, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import { authStore, clearAuth } from "@/stores/auth";
import { routeTree } from "@/routeTree.gen";

export function UserDropdown() {
	const router = useRouter();
	const navigate = useNavigate();
	// const { user, isAuthenticated } = useStore(authStore, (state) => ({
	// 	user: state.user,
	// 	isAuthenticated: state.isAuthenticated,
	// }));

	const handleLogout = () => {
		// clearAuth();
		navigate({
			to: "/login",
		});
	};

	// if (!isAuthenticated || !user) {
	// 	return null;
	// }

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="relative h-12 w-12 rounded-full">
					<Avatar className="h-12 w-12 avatar-spring-hover">
						{/* <AvatarImage src={user.profile_image_url} alt={user.display_name} /> */}
						<AvatarFallback>
							<User className="h-5 w-5" />
						</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56" align="end" forceMount>
				<DropdownMenuLabel className="font-normal">
					<div className="flex flex-col space-y-1">
						<p className="font-medium text-sm leading-none">
							{/* {user.display_name} */}Test
						</p>
						<p className="text-muted-foreground text-xs leading-none">
							{/* @{user.login} */}Test
						</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem>
					<Settings className="mr-2 h-4 w-4" />
					<span>Ajustes</span>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={handleLogout} variant="destructive">
					<LogOut className="mr-2 h-4 w-4" />
					<span>Logout</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
