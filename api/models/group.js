const mongoose = require('mongoose');

const { Schema } = mongoose;

const groupSchema = new Schema({}, { strict: false });

module.exports = mongoose.model('Group', groupSchema);
