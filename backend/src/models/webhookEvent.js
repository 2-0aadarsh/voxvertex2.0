// src/models/WebhookEvent.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const WebhookEventSchema = new Schema({
  providerEventId: { type: String, required: true, unique: true },
  providerType: { type: String, required: true },
  payload: { type: Object, required: true },
  processed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const WebhookEvent = mongoose.models.WebhookEvent || mongoose.model("WebhookEvent", WebhookEventSchema);
export default WebhookEvent;
