// GitHub API Release Response Types

export interface GitHubUser {
	login: string;
	id: number;
	node_id: string;
	avatar_url: string;
	gravatar_id: string;
	url: string;
	html_url: string;
	followers_url: string;
	following_url: string;
	gists_url: string;
	starred_url: string;
	subscriptions_url: string;
	organizations_url: string;
	repos_url: string;
	events_url: string;
	received_events_url: string;
	type: "User" | "Organization";
	user_view_type: "public" | "private";
	site_admin: boolean;
}

export interface GitHubReleaseAsset {
	url: string;
	id: number;
	node_id: string;
	name: string;
	label: string | null;
	uploader: GitHubUser;
	content_type: string;
	state: "uploaded" | "open";
	size: number;
	download_count: number;
	created_at: string;
	updated_at: string;
	browser_download_url: string;
}

export interface GitHubRelease {
	url: string;
	assets_url: string;
	upload_url: string;
	html_url: string;
	id: number;
	author: GitHubUser;
	node_id: string;
	tag_name: string;
	target_commitish: string;
	name: string;
	draft: boolean;
	immutable: boolean;
	prerelease: boolean;
	created_at: string;
	updated_at: string;
	published_at: string;
	assets: GitHubReleaseAsset[];
	tarball_url: string;
	zipball_url: string;
	body: string;
}

export interface GitHubReleaseBasic {
	tag_name: string;
	name: string;
	body: string;
	html_url: string;
	published_at: string;
	prerelease: boolean;
	draft: boolean;
}

export function isGitHubRelease(obj: any): obj is GitHubRelease {
	return (
		obj &&
		typeof obj.id === "number" &&
		typeof obj.tag_name === "string" &&
		typeof obj.name === "string" &&
		typeof obj.html_url === "string" &&
		Array.isArray(obj.assets) &&
		obj.author &&
		typeof obj.author.login === "string"
	);
}

export function extractVersionFromTag(tagName: string): string {
	// Remove 'v' prefix if present
	return tagName.startsWith("v") ? tagName.slice(1) : tagName;
}

export function formatReleaseDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString("es-ES", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

export function isRecentRelease(dateString: string): boolean {
	const releaseDate = new Date(dateString);
	const now = new Date();
	const diffInDays =
		(now.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24);
	return diffInDays <= 7;
}
