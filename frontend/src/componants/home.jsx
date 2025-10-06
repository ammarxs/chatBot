import React, { useState } from "react";

const Home = () => {
  const [messages, setMessages] = useState([
    { from: "bot", text: "👋 Hi Ammar! I'm your ChatBot. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input };
    setMessages([...messages, userMessage]);

    // Dummy bot reply (you’ll connect this to backend later)
    setTimeout(() => {
      const botReply = { from: "bot", text: `You said: "${input}" 🤖` };
      setMessages((prev) => [...prev, botReply]);
    }, 600);

    setInput("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white px-4">
      {/* Header */}
      <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 drop-shadow-lg">
        💬 Ammar’s ChatBot
      </h1>

      {/* Chat Box */}
      <div className="w-full max-w-2xl bg-gray-800 bg-opacity-60 backdrop-blur-md rounded-2xl shadow-lg flex flex-col h-[70vh] p-4 overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
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
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                    : "bg-gray-700 text-gray-100"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input Box */}
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
            className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold transition-all duration-300"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home;
