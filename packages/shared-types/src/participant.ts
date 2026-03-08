export type ParticipantRole = "host" | "participant";

export type ParticipantPlatform = "ios" | "web";

export type AvatarType = "preset" | "custom";

export interface AvatarConfig {
  type: AvatarType;
  /** Preset avatar identifier or custom image URL */
  value: string;
}

export interface Participant {
  _id: string;
  roomId: string;
  nickname: string;
  role: ParticipantRole;
  platform: ParticipantPlatform;
  avatar: AvatarConfig;
  /** Preferred language (e.g. "en", "ja") */
  preferredLanguage: string;
  online: boolean;
  lastSeenAt: number;
  joinedAt: number;
}
