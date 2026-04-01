import React, { useState } from 'react'
import { Play, Film, Info } from 'lucide-react'

// 🎬 Updated trailer data with high-quality movie trailers (like TMDb style)
const dummyTrailers = [
  {
    id: 1,
    title: "Dune: Part Two",
    videoUrl: "https://www.youtube.com/watch?v=Way9Dexny3w",
    image: "https://image.tmdb.org/t/p/w780/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
    year: "2024",
    duration: "2:46",
    quality: "4K"
  },
  {
    id: 2,
    title: "Oppenheimer",
    videoUrl: "https://www.youtube.com/watch?v=bK6ldnjE3Y0",
    image: "https://image.tmdb.org/t/p/w780/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    year: "2023",
    duration: "3:00",
    quality: "4K"
  },
  {
    id: 3,
    title: "John Wick: Chapter 4",
    videoUrl: "https://www.youtube.com/watch?v=qEVUtrk8_B4",
    image: "https://image.tmdb.org/t/p/w780/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
    year: "2023",
    duration: "2:30",
    quality: "4K"
  },
  {
    id: 4,
    title: "Spider-Man: Across the Spider-Verse",
    videoUrl: "https://www.youtube.com/watch?v=cqGjhVJWtEg",
    image: "https://image.tmdb.org/t/p/w780/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    year: "2023",
    duration: "2:23",
    quality: "4K"
  },
  {
    id: 5,
    title: "The Batman",
    videoUrl: "https://www.youtube.com/watch?v=mqqft2x_Aa4",
    image: "https://image.tmdb.org/t/p/w780/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    year: "2022",
    duration: "2:55",
    quality: "4K"
  }
]

const TrailerSection = () => {
  const [currentTrailer, setCurrentTrailer] = useState(dummyTrailers[0])

  // Function to convert YouTube URL to embed URL
  const getEmbedUrl = (url) => {
    if (url.includes("watch?v=")) {
      return url.replace("watch?v=", "embed/")
    } else if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]
      return `https://www.youtube.com/embed/${videoId}`
    }
    return url
  }

  return (
    <div className="relative px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 py-16 sm:py-24 bg-[#020202] overflow-hidden">

      {/* 🌌 Animated Background Glow */}
      <div className="absolute w-[400px] h-[400px] bg-primary/20 blur-[120px] rounded-full top-[-100px] left-[-100px] animate-pulse" />
      <div className="absolute w-[300px] h-[300px] bg-primary/10 blur-[100px] rounded-full bottom-[-80px] right-[-80px] animate-pulse" />

      {/* 🎬 Header */}
      <div className="flex flex-col items-center mb-12 sm:mb-16 text-center">
        <div className="flex items-center gap-2 text-primary text-xs tracking-[0.4em] uppercase font-bold">
          <Film className="w-4 h-4" />
          Behind the Scenes
        </div>

        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black italic text-white mt-3">
          Official <span className="text-primary">Trailers</span>
        </h2>

        <div className="w-20 sm:w-28 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent mt-4" />
      </div>

      {/* 🎥 Main Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">

        {/* 🎬 Video Player */}
        <div className="lg:col-span-8 group">
          <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black">

            {/* Glow on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-700 bg-primary/10 blur-2xl" />

            <iframe
              className="w-full h-[220px] sm:h-[300px] md:h-[400px] lg:h-[450px] relative z-10"
              src={getEmbedUrl(currentTrailer?.videoUrl)}
              title={currentTrailer?.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>

          {/* 🎬 Info */}
          <div className="mt-5 flex justify-between items-center px-2">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {currentTrailer?.title || "Now Playing"}
              </h3>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-xs text-gray-400">
                  {currentTrailer?.year}
                </p>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Info className="w-3 h-3 text-primary" />
                  {currentTrailer?.quality} Ultra HD • {currentTrailer?.duration}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 🎞️ Sidebar */}
        <div className="lg:col-span-4">

          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">
            Up Next • {dummyTrailers.length} Trailers
          </p>

          <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto max-h-[450px] pr-2 scrollbar-hide">

            {dummyTrailers.map((trailer) => (
              <div
                key={trailer.id}
                onClick={() => setCurrentTrailer(trailer)}
                className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all duration-300 border 
                ${
                  currentTrailer.id === trailer.id
                    ? "bg-primary/20 border-primary scale-[1.02]"
                    : "hover:bg-white/5 border-transparent"
                }`}
              >
                {/* Thumbnail */}
                <div className="relative w-28 h-16 sm:w-32 sm:h-20 rounded-lg overflow-hidden flex-shrink-0">

                  <img
                    src={trailer.image}
                    alt={trailer.title}
                    className={`w-full h-full object-cover transition duration-500
                    ${
                      currentTrailer.id === trailer.id
                        ? "scale-110"
                        : "group-hover:scale-105 opacity-70 hover:opacity-100"
                    }`}
                  />

                  {/* Play overlay */}
                  {currentTrailer.id === trailer.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <Play className="text-white w-5 h-5" />
                    </div>
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold truncate
                  ${
                    currentTrailer.id === trailer.id
                      ? "text-primary"
                      : "text-gray-400"
                  }`}>
                    {trailer.title}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {trailer.year} • {trailer.duration}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

export default TrailerSection