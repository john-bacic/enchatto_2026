#!/bin/zsh
# Asks for the ElevenLabs API key (hidden as you type) and saves it to apps/web/.env.local.
env_file="${0:A:h}/../.env.local"
printf 'Paste your ElevenLabs API key, then press Return: '
read -rs key
echo
key="${key//[[:space:]]/}"
if [[ -z "$key" ]]; then echo "No key entered; nothing changed."; exit 1; fi
grep -v '^ELEVENLABS_API_KEY=' "$env_file" > "$env_file.tmp" 2>/dev/null
echo "ELEVENLABS_API_KEY=$key" >> "$env_file.tmp"
mv "$env_file.tmp" "$env_file"
echo "Saved to apps/web/.env.local (${#key} characters). You can close this tab."
