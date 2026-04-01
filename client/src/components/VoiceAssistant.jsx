// src/components/VoiceAssistant.jsx
// No installation required - uses native browser APIs

import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const VoiceAssistant = ({ isNavbar = false }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  const [greetingDone, setGreetingDone] = useState(false);
  const navigate = useNavigate();

  // Voice settings - Female voice preference
  const voiceSettings = {
    rate: 0.92,
    pitch: 1.15,
    volume: 1,
    voice: null
  };

  // Commands mapping
  const commands = {
    // Navigation commands
    'home': '/',
    'go to home': '/',
    'open home': '/',
    'take me home': '/',
    
    'movies': '/movies',
    'open movies': '/movies',
    'show movies': '/movies',
    'movie list': '/movies',
    'all movies': '/movies',
    
    'favorites': '/favorites',
    'favourites': '/favorites',
    'favourites': '/favorites',
    'my favorites': '/favorites',
    'show favorites': '/favorites',
    'favourite movies': '/favorites',
    'saved movies': '/favorites',
    
    'bookings': '/my-bookings',
    'my bookings': '/my-bookings',
    'show bookings': '/my-bookings',
    'booking page': '/my-bookings',
    'my tickets': '/my-bookings',
    'open booking': '/my-bookings',
    
    'about': '/about',
    'about us': '/about',
    'about page': '/about',
    
    'legal': '/legal',
    'privacy': '/legal',
    'privacy policy': '/legal',
    'terms': '/legal',
    'terms and conditions': '/legal',
    
    'profile': '/profile',
    'my profile': '/profile',
    
    // Scroll commands
    'scroll down': 'scrollDown',
    'move down': 'scrollDown',
    'page down': 'scrollDown',
    'go down': 'scrollDown',
    'down': 'scrollDown',
    
    'scroll up': 'scrollUp',
    'move up': 'scrollUp',
    'page up': 'scrollUp',
    'go up': 'scrollUp',
    'up': 'scrollUp',
    
    // Help
    'help': 'help',
    'what can i do': 'help',
    'commands': 'help',
    'how to use': 'help'
  };

  useEffect(() => {
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
      toast.error('Voice assistant is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    // Initialize speech synthesis with female voice
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        // Prefer female voices
        const femaleVoice = voices.find(v => 
          v.name.includes('Google UK English Female') || 
          v.name.includes('Samantha') ||
          v.name.includes('Victoria') ||
          v.name.includes('Susan') ||
          v.name.includes('Female') ||
          (v.lang === 'en-US' && v.name.includes('Google'))
        );
        voiceSettings.voice = femaleVoice || voices.find(v => v.lang === 'en-US') || voices[0];
      };
      
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'en-US';
    
    recognitionInstance.onresult = (event) => {
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        }
      }
      
      if (finalTranscript) {
        setTranscript(finalTranscript);
        processCommand(finalTranscript.toLowerCase());
        setTimeout(() => setTranscript(''), 2000);
      }
    };
    
    recognitionInstance.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      if (event.error === 'not-allowed') {
        toast.error('Microphone access denied. Please allow microphone access.');
      } else if (event.error !== 'no-speech') {
        toast.error('Could not understand. Please try again.');
      }
    };
    
    recognitionInstance.onend = () => {
      setIsListening(false);
    };
    
    setRecognition(recognitionInstance);
    
    return () => {
      if (recognitionInstance) {
        recognitionInstance.abort();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const processCommand = (command) => {
    console.log('Command received:', command);
    
    // Check for scroll commands first
    if (command.includes('scroll down') || command.includes('move down') || command.includes('page down') || command.includes('go down') || command === 'down') {
      executeCommand('scrollDown');
      return;
    }
    
    if (command.includes('scroll up') || command.includes('move up') || command.includes('page up') || command.includes('go up') || command === 'up') {
      executeCommand('scrollUp');
      return;
    }
    
    // Check for other commands
    for (const [cmd, action] of Object.entries(commands)) {
      if (command.includes(cmd)) {
        executeCommand(action);
        return;
      }
    }
    
    // No command found
    const helpMessage = "Sorry, I didn't understand. You can say: Home, Movies, Favorites, Bookings, About, Legal, Scroll down, Scroll up, or Help";
    speak(helpMessage);
    toast.error(helpMessage);
  };

  const executeCommand = (action) => {
    if (action === 'help') {
      showHelp();
    } else if (action === 'scrollDown') {
      window.scrollBy({ top: 500, behavior: 'smooth' });
      speak("Scrolling down");
      toast.success("Scrolling down");
    } else if (action === 'scrollUp') {
      window.scrollBy({ top: -500, behavior: 'smooth' });
      speak("Scrolling up");
      toast.success("Scrolling up");
    } else if (action.startsWith('/')) {
      const pageName = action === '/' ? 'home' : action.replace('/', '');
      speak(`Opening ${pageName} page`);
      navigate(action);
      toast.success(`Opening ${pageName} page`);
    }
  };

  const showHelp = () => {
    const helpText = "You can say: Home, Movies, Favorites, My Bookings, About, Legal, Scroll down, Scroll up, or Help";
    speak(helpText);
    toast.success(helpText);
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = voiceSettings.rate;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = voiceSettings.volume;
      if (voiceSettings.voice) utterance.voice = voiceSettings.voice;
      window.speechSynthesis.speak(utterance);
    }
  };

  const greetUser = () => {
    const hour = new Date().getHours();
    let greeting = "";
    
    if (hour < 12) greeting = "Good morning!";
    else if (hour < 17) greeting = "Good afternoon!";
    else greeting = "Good evening!";
    
    const welcomeMessage = `${greeting} I'm your voice assistant. Say help to see what I can do.`;
    speak(welcomeMessage);
    toast.success(welcomeMessage);
  };

  const toggleListening = () => {
    if (!recognition) {
      toast.error('Voice assistant not available');
      return;
    }
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
      speak("Voice assistant disabled");
    } else {
      try {
        recognition.start();
        setIsListening(true);
        setTranscript('');
        
        if (!greetingDone) {
          greetUser();
          setGreetingDone(true);
        } else {
          speak("Listening...");
          toast.success("Voice assistant active - Say a command");
        }
      } catch (error) {
        console.error('Error starting recognition:', error);
        toast.error('Failed to start voice assistant');
      }
    }
  };

  if (!isSupported) {
    return null;
  }

  // Navbar style version
  if (isNavbar) {
    return (
      <div className="relative">
        <button
          onClick={toggleListening}
          className={`relative p-2.5 rounded-full transition-all duration-300 ${
            isListening 
              ? 'bg-red-600 animate-pulse' 
              : 'bg-primary/20 hover:bg-primary/30 backdrop-blur-sm'
          }`}
        >
          {isListening ? (
            <MicOff className="w-5 h-5 text-white" />
          ) : (
            <Mic className="w-5 h-5 text-primary" />
          )}
          
          {isListening && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="absolute w-full h-full rounded-full bg-red-400 animate-ping opacity-75"></span>
            </span>
          )}
        </button>

        {transcript && (
          <div className="absolute top-full right-0 mt-2 max-w-xs bg-black/90 backdrop-blur-lg rounded-lg px-3 py-1.5 border border-primary/30 z-50">
            <p className="text-white text-xs">
              <span className="text-primary">You said:</span> {transcript}
            </p>
          </div>
        )}
      </div>
    );
  }

 

// Navbar style version - Enhanced styling
if (isNavbar) {
  return (
    <div className="relative">
      <button
        onClick={toggleListening}
        className={`relative p-2 rounded-full transition-all duration-300 ${
          isListening 
            ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50' 
            : 'bg-gradient-to-r from-primary/20 to-primary/10 hover:from-primary/30 hover:to-primary/20 backdrop-blur-sm border border-primary/30 hover:border-primary/50'
        }`}
      >
        {isListening ? (
          <MicOff className="w-4 h-4 text-white" />
        ) : (
          <Mic className="w-4 h-4 text-primary" />
        )}
        
        {isListening && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="absolute w-full h-full rounded-full bg-red-400 animate-ping opacity-75"></span>
          </span>
        )}
        
        {/* Tooltip */}
        <div className="absolute top-full right-0 mt-2 px-2 py-1 bg-black/90 backdrop-blur-lg text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-primary/30">
          {isListening ? 'Stop listening' : 'Voice Assistant'}
        </div>
      </button>

      {transcript && (
        <div className="absolute top-full right-0 mt-12 max-w-xs bg-black/95 backdrop-blur-lg rounded-lg px-3 py-2 border border-primary/40 shadow-xl z-50">
          <p className="text-white text-xs">
            <span className="text-primary font-semibold">You said:</span> {transcript}
          </p>
        </div>
      )}
    </div>
  );
}
};

export default VoiceAssistant;