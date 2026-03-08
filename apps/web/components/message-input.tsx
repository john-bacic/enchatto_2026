"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ReplyPreview } from "@/components/reply-preview";
import { ImageUploadButton } from "@/components/image-upload-button";
import { DrawingModal } from "@/components/drawing-modal";

interface ReplyTo {
  _id: string;
  text?: string;
  senderId: string;
}

interface MessageInputProps {
  onSend: (text: string) => void;
  onSendImage?: (file: File) => void;
  onSendDrawing?: (dataUrl: string) => void;
  replyTo: ReplyTo | null;
  onCancelReply: () => void;
  onTypingChange?: (action: "typing" | "drawing" | null) => void;
}

export function MessageInput({
  onSend,
  onSendImage,
  onSendDrawing,
  replyTo,
  onCancelReply,
  onTypingChange,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const [showDrawing, setShowDrawing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    onTypingChange?.(null);
  }, [onTypingChange]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const handleTextChange = (value: string) => {
    setText(value);
    if (value.trim()) {
      onTypingChange?.("typing");
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        onTypingChange?.(null);
        typingTimeoutRef.current = null;
      }, 2000);
    } else {
      clearTyping();
    }
  };

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    clearTyping();
    onSend(trimmed);
    setText("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleImageUpload = (file: File) => {
    onSendImage?.(file);
  };

  const handleDrawingSave = (dataUrl: string) => {
    setShowDrawing(false);
    onTypingChange?.(null);
    onSendDrawing?.(dataUrl);
  };

  return (
    <>
      <div
        style={{
          borderTop: "1px solid var(--border)",
          background: "var(--surface)",
          padding: "0.5rem 1rem 0.75rem",
        }}
      >
        {/* Reply indicator */}
        {replyTo && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "0.5rem",
            }}
          >
            <ReplyPreview originalText={replyTo.text ?? ""} senderName="" />
            <button
              onClick={onCancelReply}
              style={{
                background: "none",
                fontSize: "0.8rem",
                color: "var(--muted)",
                padding: "0.2rem",
              }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Input row */}
        <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
          {/* Media buttons */}
          <ImageUploadButton onUpload={handleImageUpload} />
          <button
            onClick={() => { setShowDrawing(true); onTypingChange?.("drawing"); }}
            title="Draw"
            style={{
              background: "none",
              fontSize: "1.2rem",
              padding: "0.3rem",
              color: "var(--muted)",
              display: "flex",
              alignItems: "center",
            }}
          >
            ✏️
          </button>

          {/* Text input */}
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            style={{
              flex: 1,
              padding: "0.6rem 0.75rem",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              outline: "none",
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            style={{
              padding: "0.6rem 1.25rem",
              borderRadius: "8px",
              background: text.trim() ? "var(--primary)" : "var(--border)",
              color: text.trim() ? "#fff" : "var(--muted)",
              fontWeight: 600,
              fontSize: "0.9rem",
              transition: "all 0.15s ease",
            }}
          >
            Send
          </button>
        </div>
      </div>

      {/* Drawing modal */}
      <DrawingModal
        isOpen={showDrawing}
        onSave={handleDrawingSave}
        onClose={() => { setShowDrawing(false); onTypingChange?.(null); }}
      />
    </>
  );
}
