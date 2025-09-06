import { useEffect, useState } from "react";
import type { GitHubRelease } from "@/types/github-api";

export function useGitHubVersion(owner: string, repo: string) {
	// Need to remove this crap useState
	const [version, setVersion] = useState("?");
	const [description, setDescription] = useState("");
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchVersion = async () => {
			try {
				const response = await fetch(
					`https://api.github.com/repos/${owner}/${repo}/releases/latest`,
				);
				if (response.ok) {
					const data: GitHubRelease = await response.json();
					setVersion(data.tag_name);
					setDescription(data.body);
				}
			} catch (_error) {
				console.log("GitHub API not available, using fallback version");
			} finally {
				setIsLoading(false);
			}
		};

		fetchVersion();
	}, [owner, repo]);

	return { version, description, isLoading };
}
