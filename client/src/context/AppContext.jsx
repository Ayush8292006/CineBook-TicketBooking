import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from 'react-hot-toast';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [shows, setShows] = useState([]);
  const [favoriteMovies, setFavoriteMovies] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useUser();
  const { getToken } = useAuth();

  // ✅ Changed to match your .env file
  const backendUrl = import.meta.env.VITE_BASE_URL || "http://localhost:3000";
  const image_base_url = import.meta.env.VITE_IMAGE_BASE_URL || "https://image.tmdb.org/t/p/w500/";

  const fetchShows = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/show/all`);
      if (data?.success) setShows(data.shows || []);
    } catch (error) {
      console.error("Error fetching shows:", error.message);
    }
  };

  const fetchIsAdmin = async () => {
    if (!user) {
      setIsAdmin(false);
      setIsCheckingAdmin(false);
      return;
    }

    try {
      setIsCheckingAdmin(true);
      const { data } = await axios.get(`${backendUrl}/api/admin/public-is-admin`, {
        params: { userId: user.id }
      });
      
      const adminStatus = data?.isAdmin === true;
      setIsAdmin(adminStatus);

      if (!adminStatus && location.pathname.startsWith('/admin')) {
        navigate('/', { replace: true });
        toast.error("You are not an admin.");
      }
    } catch (error) {
      console.error("Admin check failed:", error);
      setIsAdmin(false);
    } finally {
      setIsCheckingAdmin(false);
    }
  };

const fetchFavoriteMovies = async () => {
  if (!user) return;
  
  try {
    const token = await getToken();
    console.log("Fetching favorites with token:", token ? "YES" : "NO");
    
    const { data } = await axios.get(`${backendUrl}/api/user/favorites`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    console.log("Favorites API response:", data);
    
    if (data?.success) {
      setFavoriteMovies(data.movies || []);
      console.log("Favorites count:", data.movies?.length);
    } else {
      setFavoriteMovies([]);
    }
  } catch (error) {
    console.error("Favorites error:", error.response?.data || error.message);
    setFavoriteMovies([]);
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
      setIsAdmin(false);
      setIsCheckingAdmin(false);
      setFavoriteMovies([]);
    }
  }, [user]);

  const value = {
    isAdmin,
    isCheckingAdmin,
    shows,
    favoriteMovies,
    user,
    navigate,
    backendUrl,
    image_base_url,
    getToken,
    axios,
    fetchFavoriteMovies, 
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);