import { useState, useContext, createContext, useEffect } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [shows, setShows] = useState([]);
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  const { user } = useUser();
  const { getToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // ADMIN
  const fetchIsAdmin = async () => {
    if (!user) {
      setIsAdmin(false);
      setIsCheckingAdmin(false);
      return;
    }
    
    try {
     const token = await getToken();
     console.log("TOKEN:", token);
      
      if (!token) {
        console.error("No token found");
        setIsAdmin(false);
        setIsCheckingAdmin(false);
        return;
      }

      const { data } = await axios.get('/api/admin/is-admin', {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      setIsAdmin(data.isAdmin);
      setIsCheckingAdmin(false);
      
      if (!data.isAdmin && location.pathname.startsWith('/admin')) {
        navigate('/');
        toast.error("Un-Authorized");
      }
    } catch (error) {
      console.error("Admin check error:", error);
      setIsAdmin(false);
      setIsCheckingAdmin(false);
      
      if (location.pathname.startsWith('/admin')) {
        navigate('/');
        toast.error("Authentication failed");
      }
    }
  };

  // SHOWS
  const fetchShows = async () => {
    try {
      const { data } = await axios.get('/api/show/all');
      if (data.success) {
        setShows(data.shows || []);
      }
    } catch (error) {
      console.error("Error fetching shows:", error);
      setShows([]);
    }
  };

  // FAVORITES
  const fetchFavoriteMovies = async () => {
    if (!user) return;
    
    try {
      const token = await getToken();
      console.log("TOKEN:", token);

      
      if (!token) {
        console.error("No token found for favorites");
        return;
      }

      const { data } = await axios.get('/api/user/favorites', {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (data.success) {
        setFavoriteMovies(data.movies || []);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
      setFavoriteMovies([]);
    }
  };

  const toggleFavorite = async (movieId) => {
    try {
      if (!user) return toast.error("Please login");

      const token = await getToken();
      console.log("TOKEN:", token);
      
      if (!token) {
        toast.error("Authentication failed");
        return;
      }

      const alreadyFavorite = favoriteMovies.some(m => m._id === movieId);

      setFavoriteMovies(prev => {
        if (alreadyFavorite) {
          return prev.filter(m => m._id !== movieId);
        } else {
          const movie = shows.find(m => m._id === movieId);
          return movie ? [...prev, movie] : prev;
        }
      });

      const { data } = await axios.post(
        "/api/user/update-favorite",
        { movieId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(alreadyFavorite ? "Removed from favorites" : "Added to favorites");
      } else {
        toast.error(data.message);
        fetchFavoriteMovies();
      }

    } catch (error) {
      console.error(error);
      toast.error("Something went wrong"); 
      fetchFavoriteMovies();
    }
  };

  useEffect(() => {
    fetchShows();
  }, []);

  useEffect(() => {
    if (user) {
      fetchIsAdmin();
      fetchFavoriteMovies();
    } else {
      setFavoriteMovies([]);
      setIsAdmin(false);
      setIsCheckingAdmin(false);
    }
  }, [user]);

  const value = {
    axios,
    user,
    getToken,
    navigate,
    isAdmin,
    isCheckingAdmin,
    shows,
    favoriteMovies,
    fetchFavoriteMovies,
    toggleFavorite
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);