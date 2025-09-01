import { useState, useEffect } from "react";

export function useGitHubVersion(owner: string, repo: string) {
	const [version, setVersion] = useState("v0.5.0.1"); // fallback
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchVersion = async () => {
			try {
				const response = await fetch(
					`https://api.github.com/repos/${owner}/${repo}/releases/latest`,
				);
				if (response.ok) {
					const data = await response.json();
					setVersion(data.tag_name);
				}
			} catch (error) {
				console.log("GitHub API not available, using fallback version");
			} finally {
				setIsLoading(false);
			}
		};

		fetchVersion();
	}, [owner, repo]);

	return { version, isLoading };
}
