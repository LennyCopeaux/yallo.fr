-- Rename elevenlabs_voice_id → voice_id (provider-agnostic now that we use VAPI)
ALTER TABLE "restaurants" RENAME COLUMN "elevenlabs_voice_id" TO "voice_id";
