export type MessageKind = "text" | "image" | "drawing" | "system";

export type MessageStatus = "pending" | "processed" | "failed";

export interface ProcessingState {
  /** Translated text */
  translatedText?: string;
  /** Romaji transliteration */
  romaji?: string;
  /** Short suggested replies */
  suggestions?: string[];
  /** Error message if processing failed */
  error?: string;
}

export interface Message {
  _id: string;
  roomId: string;
  senderId: string;
  kind: MessageKind;
  status: MessageStatus;
  /** Original text content (for text messages) */
  text?: string;
  /** URL for image or drawing content */
  mediaUrl?: string;
  /** Processing results from host device */
  processing?: ProcessingState;
  /** ID of the message being replied to */
  replyToId?: string;
  createdAt: number;
  processedAt?: number;
}
