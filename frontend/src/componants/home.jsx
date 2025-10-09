import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const Home = () => {
  const [messages, setMessages] = useState([
    { from: "bot", text: "👋 Hi! I'm your PsychBot. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // ✅ Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // ✅ Send Message Function
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // ✅ API call
      const res = await axios.post("http://localhost:5000/api/chat", {
        message: input,
        userId: "123", // 👈 add userId like your Postman test
      });

      console.log("🧠 Backend Response:", res.data); // Debugging line

      // ✅ Read correct field from backend
      const botText =
        res.data?.reply ||
        res.data?.message ||
        res.data?.answer ||
        "Sorry, I didn’t get that.";

      const botReply = { from: "bot", text: botText };
      setMessages((prev) => [...prev, botReply]);
    } catch (error) {
      console.error("❌ Chat error:", error);
      const botReply = {
        from: "bot",
        text: "⚠️ Server error. Try again later.",
      };
      setMessages((prev) => [...prev, botReply]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white px-4">
      {/* 🧠 Header */}
      <div className="flex justify-between items-center w-full max-w-2xl mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-500">
          💬 PsychBot
        </h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-all"
        >
          Logout
        </button>
      </div>

      {/* 💭 Chat Box */}
      <div className="w-full max-w-2xl bg-gray-800 bg-opacity-60 backdrop-blur-md rounded-2xl shadow-lg flex flex-col h-[70vh] p-4 overflow-hidden">
        {/* Messages */}
        <div
          className="p-3 flex-1 overflow-y-auto space-y-3 mb-3 px-3 rounded-lg bg-gray-900
                scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-700"
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.from === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-xl text-sm ${
                  msg.from === "user"
                    ? "bg-gradient-to-r from-pink-600 to-orange-500 hover:from-pink-700 hover:to-orange-600 text-white"
                    : "bg-gray-700 text-gray-100"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing animation */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-700 text-gray-100 px-4 py-2 rounded-xl text-sm flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={sendMessage}
          className="flex items-center bg-gray-900 rounded-xl overflow-hidden"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 bg-transparent text-white outline-none"
          />
          <button
            type="submit"
            className="px-5 py-3 bg-gradient-to-r from-pink-600 to-orange-500 hover:from-pink-700 hover:to-orange-600 text-white font-semibold transition-all duration-300"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home;
