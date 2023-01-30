const mongoose = require('mongoose');

const { Schema } = mongoose;

const messageSchema = new Schema(
	{
		// _id: String,
		id: String,
		text: String,
		created_at: { type: Number, index: true },
		attachments: Array,
		favorited_by: Array,
		avatar_url: String,
		group_id: String,
		name: String,
		sender_id: String,
		sender_type: String,
		source_guid: String,
		system: Boolean,
		user_id: { type: String, index: true },
		platform: String,
	},
	{ strict: false }
);

const randomMessageSchema = new Schema({});

randomMessageSchema.add(messageSchema).add({ date: Number });

messageSchema.index({ text: 'text' });

module.exports = mongoose.model('Message', messageSchema);
module.exports = mongoose.model('RandomMessage', randomMessageSchema);
