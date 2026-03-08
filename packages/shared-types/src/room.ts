export type RoomStatus = "waiting" | "active" | "closed";

export interface RoomSettings {
  /** Source language for the room (e.g. "ja") */
  sourceLanguage: string;
  /** Target language for translation (e.g. "en") */
  targetLanguage: string;
  /** Whether romaji generation is enabled */
  romajiEnabled: boolean;
  /** Whether suggestion generation is enabled */
  suggestionsEnabled: boolean;
  /** Maximum number of participants allowed */
  maxParticipants: number;
}

export interface Room {
  _id: string;
  /** Short code participants use to join */
  joinCode: string;
  status: RoomStatus;
  settings: RoomSettings;
  /** ID of the host participant */
  hostId: string;
  createdAt: number;
  closedAt?: number;
}
