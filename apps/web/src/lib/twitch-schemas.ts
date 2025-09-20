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
	offline_image_url: z.union([z.url(), z.literal("")]),
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

// Schema for /eventsub/subscriptions
export const EventSubSubscriptionSchema = z.object({
	id: z.string(),
	status: z.string(),
	type: z.string(),
	version: z.string(),
	condition: z.record(z.string(), z.string()),
	transport: z.object({
		method: z.string(),
		session_id: z.string().optional(),
		connected_at: z.string().optional(),
		disconnected_at: z.string().optional(),
	}),
	created_at: z.string(),
	cost: z.number(),
});

export const EventSubSubscriptionsResponseSchema = z.object({
	data: z.array(EventSubSubscriptionSchema),
	total: z.number(),
	total_cost: z.number(),
	max_total_cost: z.number(),
});

export type EventSubSubscription = z.infer<typeof EventSubSubscriptionSchema>;
export type EventSubSubscriptionsResponse = z.infer<
	typeof EventSubSubscriptionsResponseSchema
>;

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

// Schema for /moderation/channels
export const TwitchChannelSchema = z.object({
	broadcaster_id: z.string(),
	broadcaster_login: z.string(),
	broadcaster_name: z.string(),
});

export const TwitchModeratedChannelsResponseSchema = z.object({
	data: z.array(TwitchChannelSchema),
	pagination: z.object({
		cursor: z.string().optional(),
	}),
});

export type TwitchChannel = z.infer<typeof TwitchChannelSchema>;
export type ModeratedChannelsResponse = z.infer<
	typeof TwitchModeratedChannelsResponseSchema
>;

export const SendChatMessageSchema = z.object({
	message_id: z.string(),
	is_sent: z.boolean(),
	drop_reason: z.optional(z.object({
		code: z.string(),
		message: z.string(),
	})),
})

export const SendChatMessageResponseSchema = z.object({
	data: z.array(SendChatMessageSchema),
});

export type SendChatMessage = z.infer<typeof SendChatMessageSchema>;
export type SendChatMessageResponse = z.infer<typeof SendChatMessageResponseSchema>;