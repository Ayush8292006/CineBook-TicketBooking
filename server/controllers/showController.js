import axios from "axios";
import Show from "../models/Show.js";
import Movie from "../models/Movie.js";

export const getNowPlayingMovies = async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://api.themoviedb.org/3/movie/now_playing",
      {
        headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
      }
    );

    res.status(200).json({ success: true, movies: data.results });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch movies" });
  }
};

export const addShow = async (req, res) => {
  try {
    const { movieId, showsInput, showPrice } = req.body;

    if (!movieId || !showsInput || !showPrice) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    let movie = await Movie.findById(movieId);

    if (!movie) {
      const [movieDetailsResponse, movieCreditResponse] = await Promise.all([
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
          headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
        }),
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
          headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
        }),
      ]);

      const movieApiData = movieDetailsResponse.data;
      const movieCreditsData = movieCreditResponse.data;

      const movieDetails = {
        _id: movieId,
        title: movieApiData.title,
        overview: movieApiData.overview,
        poster_path: movieApiData.poster_path,
        backdrop_path: movieApiData.backdrop_path,
        genres: movieApiData.genres,
        casts: movieCreditsData.cast,
        release_date: movieApiData.release_date,
        original_language: movieApiData.original_language,
        tagline: movieApiData.tagline || "",
        vote_average: movieApiData.vote_average,
        runtime: movieApiData.runtime,
      };

      movie = await Movie.create(movieDetails);
    }

    const showsToCreate = [];
    showsInput.forEach(show => {
      const showDate = show.date;
      show.time.forEach((time) => {
        
        const dateTimeString = `${showDate}T${time}`;

          showsToCreate.push({
            movie: movieId,
            showDateTime: new Date(dateTimeString),
            showPrice,
            occupiedSeats: {},
          });
        
      });
    });

    if (showsToCreate.length > 0) {
      await Show.insertMany(showsToCreate);
    }

    res.status(201).json({ success: true, message: "Shows added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getShows = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const shows = await Show.find({
      showDateTime: { $gte: startOfToday },
    });

    if (shows.length === 0) {
      return res.json({ 
        success: true, 
        shows: [], 
        message: "No active shows found" 
      });
    }

    const movieIds = [...new Set(shows.map(s => s.movie))];
    const movies = await Movie.find({ _id: { $in: movieIds } });

    return res.json({
      success: true,
      count: movies.length,
      shows: movies,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getShow = async (req, res) => {
  try {
    const { movieId } = req.params;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const shows = await Show.find({
      movie: String(movieId),
      showDateTime: { $gte: startOfToday },
    }).sort({ showDateTime: 1 });

    const movie = await Movie.findById(String(movieId));
    
    const dateTime = {};
    shows.forEach((show) => {
      const date = show.showDateTime.toISOString().split("T")[0];
      if (!dateTime[date]) dateTime[date] = [];
      dateTime[date].push({
        time: show.showDateTime,
        showId: show._id,
        price: show.showPrice
      });
    });

    return res.json({ success: true, movie, shows: dateTime });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMovieTrailer = async (req, res) => {
  try {
    const { movieId } = req.params;
    
    const { data } = await axios.get(
      `https://api.themoviedb.org/3/movie/${movieId}/videos`,
      {
        headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
      }
    );
    
    const trailer = data.results.find(
      video => video.type === "Trailer" && video.site === "YouTube"
    );
    
    const fallbackVideo = data.results.find(
      video => video.site === "YouTube"
    );
    
    const video = trailer || fallbackVideo;
    
    if (video) {
      res.json({
        success: true,
        trailerKey: video.key,
        embedUrl: `https://www.youtube-nocookie.com/embed/${video.key}?autoplay=1&rel=0&modestbranding=1`,
        name: video.name
      });
    } else {
      res.json({ success: false, message: "No trailer available" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};