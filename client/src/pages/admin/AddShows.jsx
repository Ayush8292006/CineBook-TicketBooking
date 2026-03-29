import React, { useEffect, useState } from 'react';
import Loading from '../../components/Loading';
import Title from '../../components/admin/Title';
import { dummyShowsData } from '../../assets/assets';
import { CheckIcon, StarIcon, CalendarIcon, ClockIcon, TicketIcon, PlusIcon, XIcon, FilmIcon } from 'lucide-react';
import { kConverter } from '../../lib/kConverter';
import { useAppContext } from '../../context/AppContext';

const AddShows = () => {

  const {axios,getToken, user, image_base_url} = useAppContext()
  const currency = import.meta.env.VITE_CURRENCY;

  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [dateTimeSelection, setDateTimeSelection] = useState({});
  const [dateTimeInput, setDateTimeInput] = useState("");
  const [showPrice, setShowPrice] = useState("");
  const [hoveredMovie, setHoveredMovie] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchNowPlayingMovies = async () => {
    try{
        const {data} = await axios.get('/api//show/now-playing',{
          headers: { Authorization: `Bearer ${await getToken()}`}
        })
        if(data.success){
            setNowPlayingMovies(data.movies)
          }
    }catch(error){
        console.error('Error fetching movies:', error)
    }
  };

  const handleDateTimeAdd = () => {
    if (!dateTimeInput) return;

    const [date, time] = dateTimeInput.split("T");
    if (!date || !time) return;

    setDateTimeSelection((prev) => {
      const times = prev[date] || [];

      if (!times.includes(time)) {
        return {
          ...prev,
          [date]: [...times, time].sort(),
        };
      }
      return prev;
    });
    setDateTimeInput("");
  };

  const handleRemoveTime = (date, time) => {
    setDateTimeSelection((prev) => {
      const filteredTimes = prev[date].filter((t) => t !== time);
      if (filteredTimes.length === 0) {
        const { [date]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [date]: filteredTimes,
      };
    });
  };

  const handleAddShow = async () => {
    if (!selectedMovie) {
      alert("Please select a movie");
      return;
    }
    if (!showPrice || showPrice <= 0) {
      alert("Please enter a valid show price");
      return;
    }
    if (Object.keys(dateTimeSelection).length === 0) {
      alert("Please add at least one date and time");
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log({
      movieId: selectedMovie,
      price: showPrice,
      schedule: dateTimeSelection
    });
    setIsSubmitting(false);
    alert("Show added successfully!");
    
    setSelectedMovie(null);
    setShowPrice("");
    setDateTimeSelection({});
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      date: date.getDate(),
    };
  };

  useEffect(() => {
    if(user){
    fetchNowPlayingMovies();
    }
  
  }, [user]);

  const totalShows = Object.values(dateTimeSelection).flat().length;

  return nowPlayingMovies.length > 0 ? (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header Section */}
        <div className="mb-12">
          <Title text1="Add" text2="Shows" />
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
            <FilmIcon className="w-4 h-4 text-primary" />
            <span>Create new movie shows and manage schedules</span>
          </div>
        </div>

        {/* Movies Grid Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Now Playing
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Select a movie to configure shows
              </p>
            </div>
            <div className="hidden sm:block text-xs text-gray-500">
              {nowPlayingMovies.length} movies available
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {nowPlayingMovies.map((movie) => (
              <div
                key={movie.id}
                className={`group relative transform transition-all duration-300 ${
                  selectedMovie === movie.id 
                    ? 'scale-105' 
                    : 'hover:scale-105 hover:z-10'
                }`}
                onClick={() => setSelectedMovie(movie.id)}
                onMouseEnter={() => setHoveredMovie(movie.id)}
                onMouseLeave={() => setHoveredMovie(null)}
              >
                <div className={`relative rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${
                  selectedMovie === movie.id 
                    ? 'ring-2 ring-primary' 
                    : 'group-hover:shadow-2xl'
                }`}>
                  <img 
                    src={image_base_url+movie.poster_path} 
                    alt={movie.title} 
                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs flex items-center gap-1 border border-primary/30 shadow-lg">
                    <StarIcon className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-white font-semibold">{movie.vote_average.toFixed(1)}</span>
                    <span className="text-gray-300 text-[10px]">({kConverter(movie.vote_count)})</span>
                  </div>
                  
                  {selectedMovie === movie.id && (
                    <div className="absolute top-3 right-3 bg-primary rounded-full p-1.5 shadow-lg animate-bounce-in">
                      <CheckIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
                    </div>
                  )}
                  
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
                    <p className="font-semibold text-white text-sm truncate">{movie.title}</p>
                    <p className="text-gray-300 text-xs">{movie.release_date}</p>
                  </div>
                </div>
                
                {hoveredMovie === movie.id && selectedMovie !== movie.id && (
                  <div className="absolute -bottom-8 left-0 right-0 text-center animate-slide-up">
                    <span className="bg-primary text-white text-xs px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
                      Click to select
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Configuration Panel */}
        {selectedMovie && (
          <div className="animate-fade-in-up">
            <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 to-transparent px-6 py-4 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <TicketIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Show Configuration
                    </h3>
                    <p className="text-sm text-gray-400">
                      Configure pricing and schedule for selected movie
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {/* Price and Date in One Row */}
                <div className="flex flex-col lg:flex-row gap-4 items-end">
                  {/* Price Input */}
                  <div className="flex-1 space-y-2">
                    <label className="block text-sm font-semibold text-gray-300">
                      Ticket Price
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                        {currency}
                      </div>
                      <input
                        min={0}
                        type="number"
                        value={showPrice}
                        onChange={(e) => setShowPrice(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-2.5 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 bg-gray-800 text-white"
                      />
                    </div>
                  </div>

                  {/* DateTime Input */}
                  <div className="flex-[2] space-y-2">
                    <label className="block text-sm font-semibold text-gray-300">
                      Add Schedule
                    </label>
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                        <input
                          type="datetime-local"
                          value={dateTimeInput}
                          onChange={(e) => setDateTimeInput(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 bg-gray-800 text-white text-sm"
                        />
                      </div>
                      <button
                        onClick={handleDateTimeAdd}
                        disabled={!dateTimeInput}
                        className="bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary/80 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <PlusIcon className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Selected Schedules - Compact Box Layout */}
                {Object.keys(dateTimeSelection).length > 0 && (
                  <div className="mt-6 animate-fade-in">
                    <div className="flex items-center gap-2 mb-3">
                      <ClockIcon className="w-4 h-4 text-primary" />
                      <h4 className="font-semibold text-white text-sm">
                        Selected Schedules
                      </h4>
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                        {totalShows} show{totalShows !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    <div className="bg-gray-800/30 rounded-xl p-3 border border-gray-700">
                      <div className="flex flex-wrap gap-3">
                        {Object.entries(dateTimeSelection)
                          .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
                          .map(([date, times]) => {
                            const formatted = formatDate(date);
                            return times.map((time) => (
                              <div
                                key={`${date}-${time}`}
                                className="group relative bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 hover:border-primary/50 transition-all duration-200 min-w-[140px]"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <CalendarIcon className="w-3 h-3 text-primary" />
                                    <span className="text-xs font-medium text-gray-300">
                                      {formatted.day}, {formatted.month} {formatted.date}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => handleRemoveTime(date, time)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                  >
                                    <XIcon className="w-3 h-3 text-gray-500 hover:text-red-400 transition-colors" />
                                  </button>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <ClockIcon className="w-3 h-3 text-primary" />
                                  <span className="text-xs text-gray-400">
                                    {time}
                                  </span>
                                </div>
                              </div>
                            ));
                          })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="mt-8 pt-4 border-t border-gray-800">
                  <button
                    onClick={handleAddShow}
                    disabled={isSubmitting || !showPrice || totalShows === 0}
                    className="w-full bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/80 transition-all duration-300 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Adding Show...
                      </>
                    ) : (
                      <>
                        <TicketIcon className="w-5 h-5" />
                        Add Show to Cinema
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.3s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.2s ease-out;
        }
      `}</style>
    </div>
  ) : (
    <Loading />
  );
};

export default AddShows;