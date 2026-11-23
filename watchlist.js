import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

const MovieSchema = new mongoose.Schema({
  tmdbId: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  posterPath: String,
  releaseDate: String,
  overview: { type: String, default: '' },
  userRating: { type: Number, min: 1, max: 5, default: null },
  isWatched: { type: Boolean, default: false },
  savedAt: { type: Date, default: Date.now }
});

const Movie = mongoose.models.Movie || mongoose.model('Movie', MovieSchema, 'Watchlist');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGODB_URI);
    }

    if (req.method === 'GET') {
      const movies = await Movie.find({});
      return res.status(200).json(movies);
    }

    if (req.method === 'POST') {
      const { tmdbId } = req.body;

      const existingMovie = await Movie.findOne({ tmdbId });
      if (existingMovie) {
        return res.status(200).json({
          success: true,
          message: 'Movie already in watchlist',
          movie: existingMovie,
          duplicate: true
        });
      }

      const newMovie = new Movie(req.body);
      const savedMovie = await newMovie.save();
      return res.status(201).json({ success: true, movie: savedMovie, duplicate: false });
    }

    if (req.method === 'PATCH') {
      const { id, tmdbId, userRating } = req.body;

      if (!id && !tmdbId) {
        return res.status(400).json({ error: 'Movie id or tmdbId is required to update rating' });
      }

      let parsedRating = null;
      if (userRating !== null && userRating !== undefined && userRating !== '') {
        const num = Number(userRating);
        if (!Number.isInteger(num) || num < 1 || num > 5) {
          return res.status(400).json({ error: 'userRating must be an integer between 1 and 5, or null to clear' });
        }
        parsedRating = num;
      }

      const filter = id ? { _id: id } : { tmdbId: Number(tmdbId) };
      const updatedMovie = await Movie.findOneAndUpdate(
        filter,
        { $set: { userRating: parsedRating } },
        { new: true }
      );

      if (!updatedMovie) {
        return res.status(404).json({ error: 'Watchlist movie not found' });
      }

      return res.status(200).json({ success: true, movie: updatedMovie });
    }

    if (req.method === 'DELETE') {
      const { id, tmdbId } = req.query;
      if (!id && !tmdbId) {
        return res.status(400).json({ error: 'Movie id or tmdbId is required for deletion' });
      }

      const deletedMovie = id
        ? await Movie.findByIdAndDelete(id)
        : await Movie.findOneAndDelete({ tmdbId: Number(tmdbId) });

      if (!deletedMovie) {
        return res.status(404).json({ error: 'Watchlist movie not found' });
      }

      return res.status(200).json({ success: true, message: 'Movie deleted successfully' });
    }

    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}