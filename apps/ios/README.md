# Enchatto — iOS Host App

## Responsibilities

The iOS app is the **host** device. It:

1. Creates conversation rooms
2. Displays a QR code for participants to join
3. Shows the real-time conversation timeline
4. Processes pending messages on-device:
   - Japanese ↔ English translation
   - Romaji transliteration
   - Suggested reply generation
5. Submits processed results back to the backend
6. Allows the host to send text, images, and drawings
7. Manages the room (kick participants, close room)

## Architecture

- **Models/** — Data models mirroring shared types
- **Services/API/** — Backend communication protocol + implementations
- **Services/Processing/** — On-device AI processing (Phase 9+)
- **ViewModels/** — Observable state for views
- **Views/** — SwiftUI screens and components
