import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const VoiceChat = () => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const isManuallyStoppedRef = useRef(false);
  const navigate = useNavigate();

  // ✅ Get logged-in user info
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id || user?.id; // userId will be dynamic

  // ✅ Create SpeechRecognition instance
  const createRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("❌ Your browser does not support Speech Recognition.");
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    return recognition;
  };

  // ✅ Start Listening
  const startListening = async () => {
    const synth = synthRef.current;
    if (synth.speaking) {
      synth.cancel();
      console.log("🔇 Stopped bot speech before restarting mic");
    }

    if (isListening) return;

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      console.error("❌ Mic permission denied:", err);
      alert("Please allow microphone access to use voice chat.");
      return;
    }

    const recognition = createRecognition();
    if (!recognition) return;
    recognitionRef.current = recognition;
    isManuallyStoppedRef.current = false;

    recognition.onstart = () => {
      console.log("🎤 Mic started");
      setIsListening(true);
    };

    recognition.onresult = async (event) => {
      const text = event.results[0][0].transcript;
      console.log("🗣 You said:", text);
      stopListening();
      await sendToBackend(text);
    };

    recognition.onerror = (event) => {
      console.warn("⚠️ Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log("🎧 Mic stopped");
      setIsListening(false);
      if (!isManuallyStoppedRef.current) {
        console.log("🤖 Auto-restarting mic...");
        startListening();
      }
    };

    recognition.start();
  };

  // ✅ Stop Listening
  const stopListening = () => {
    const recognition = recognitionRef.current;
    if (recognition) {
      isManuallyStoppedRef.current = true;
      recognition.onend = null;
      recognition.stop();
      console.log("🛑 Mic manually stopped");
    }

    const synth = synthRef.current;
    if (synth.speaking) {
      synth.cancel();
      console.log("🔇 Bot speech stopped");
    }

    setIsListening(false);
  };

  // ✅ End Chat
  const endChat = () => {
    stopListening();
    console.log("🧹 Chat stopped");
  };

  // ✅ Send message to backend
  const sendToBackend = async (input) => {
    try {
      const res = await axios.post("http://localhost:5000/api/chat", {
        message: input,
        userId, // ✅ dynamically logged-in user's ID
      });

      const reply =
        res.data.reply ||
        res.data.message ||
        "I'm sorry, I didn't understand that.";
      console.log("🤖 Bot:", reply);
      speakBotReply(reply);
    } catch (error) {
      console.error("❌ Backend error:", error);
      speakBotReply("Sorry, I couldn't reach the server.");
    }
  };

  // ✅ Speak Bot Reply
  const speakBotReply = (text) => {
    const synth = synthRef.current;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.pitch = 1;
    utter.rate = 1;

    utter.onstart = () => console.log("🗣 Bot speaking...");
    utter.onend = () => {
      console.log("✅ Bot finished speaking");
      if (!isManuallyStoppedRef.current) {
        console.log("🎤 Restarting mic after bot finishes...");
        startListening();
      }
    };

    synth.speak(utter);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white relative">
      {/* 🏠 Home Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm transition-all"
      >
        🏠 Home
      </button>

      <h2 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400">
        🎙️ AI Voice Chat
      </h2>

      <div className="flex gap-4">
        {!isListening ? (
          <button
            onClick={startListening}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 rounded-lg font-semibold transition-all text-white shadow-lg"
          >
            Start Voice Chat
          </button>
        ) : (
          <button
            onClick={stopListening}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-all text-white shadow-lg"
          >
            Stop Voice Chat
          </button>
        )}

        <button
          onClick={endChat}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-800 rounded-lg font-semibold transition-all text-white shadow-lg"
        >
          Clear Chat
        </button>
      </div>
    </div>
  );
};

export default VoiceChat;
