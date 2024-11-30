const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const watchLaterSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  movie_api_id: { type: String, required: true }, // ID from external API
  added_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WatchLater', watchLaterSchema);