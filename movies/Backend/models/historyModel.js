const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const historySchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  movie_api_id: { type: String, required: true }, // ID from external API
  watched_at: { type: Date, default: Date.now },
  rating_given: { type: Number, min: 1, max: 5 } // Optional user rating
});

module.exports = mongoose.model('History', historySchema);