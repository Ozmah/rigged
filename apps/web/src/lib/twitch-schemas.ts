import { z } from "zod";

// Schema for /oauth2/validate
export const TokenValidationSchema = z.object({
	client_id: z.string(),
	login: z.string(),
	scopes: z.array(z.string()),
	user_id: z.string(),
	expires_in: z.number().positive(),
});

export type TokenValidation = z.infer<typeof TokenValidationSchema>;

// Schema for /helix/users
export const TwitchUserSchema = z.object({
	id: z.string(),
	login: z.string(),
	display_name: z.string(),
	type: z.enum(["", "admin", "global_mod", "staff"]).default(""),
	broadcaster_type: z.enum(["", "affiliate", "partner"]).default(""),
	description: z.string(),
	profile_image_url: z.url(),
	offline_image_url: z.url(),
	// DEPRECATED "Any data in this field is not valid and should not be used."
	// https://dev.twitch.tv/docs/api/reference/#get-users
	view_count: z.number().optional(),
	// Just user:read:email scope
	email: z.email().optional(),
	created_at: z.iso.datetime(),
});

export const TwitchUsersResponseSchema = z.object({
	data: z.array(TwitchUserSchema),
});

export type TwitchUser = z.infer<typeof TwitchUserSchema>;
export type TwitchUsersResponse = z.infer<typeof TwitchUsersResponseSchema>;

// Schema for /chat/chatters
export const ChatterSchema = z.object({
	user_id: z.string(),
	user_login: z.string(),
	user_name: z.string(),
});

export const ChattersResponseSchema = z.object({
	data: z.array(ChatterSchema),
	pagination: z.object({
		cursor: z.string().optional(),
	}),
	total: z.number(),
});

export type Chatter = z.infer<typeof ChatterSchema>;
export type ChattersResponse = z.infer<typeof ChattersResponseSchema>;
