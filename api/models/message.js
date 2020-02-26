const mongoose = require('mongoose');

const { Schema } = mongoose;

const messageSchema = new Schema(
	{
		_id: String,
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
		user_id: String,
		platform: String,
	},
	{ strict: false }
);

messageSchema.index({ text: 'text' });

module.exports = mongoose.model('Message', messageSchema);
