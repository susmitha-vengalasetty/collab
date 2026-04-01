import { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const AskAi = ({ open, setOpen }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("quick");
  const [loading, setLoading] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const bottomRef = useRef(null);
  const typingInterval = useRef(null);
  const token = localStorage.getItem("token");

  /* ================= LOAD HISTORY ================= */

  useEffect(() => {
    if (!open) return;

    axios
      .get("http://localhost:5000/api/chat/history", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setMessages(res.data.messages || []);
      })
      .catch((err) => console.error(err));
  }, [open]);

  /* ================= AUTO SCROLL ================= */

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= SEND MESSAGE ================= */

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/chat",
        { message: input, mode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      typeWriter(res.data.reply);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= STOP TYPING ================= */

  const stopTyping = () => {
    if (typingInterval.current) {
      clearInterval(typingInterval.current);
      setIsTyping(false);
    }
  };

  /* ================= TYPING EFFECT ================= */

  const typeWriter = (text) => {
    let index = 0;
    let current = "";

    setIsTyping(true);

    typingInterval.current = setInterval(() => {
      current += text[index];
      index++;

      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];

        if (!last || last.sender !== "ai") {
          updated.push({ sender: "ai", text: current });
        } else {
          last.text = current;
        }

        return [...updated];
      });

      if (index >= text.length) {
        clearInterval(typingInterval.current);
        setIsTyping(false);
      }
    }, 15);
  };

  /* ================= CLEAR ================= */

  const clearChat = async () => {
    await axios.delete("http://localhost:5000/api/chat/clear", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setMessages([]);
  };

  /* ================= UI ================= */

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-700 hover:bg-blue-800 text-white px-5 py-3 rounded-full shadow-xl z-50"
        >
          Ask AI
        </button>
      )}

      {open && (
        <div
          className={`fixed ${
            fullscreen
              ? "inset-0"
              : "bottom-6 right-6 w-[95%] sm:w-[400px] h-[600px]"
          } bg-white shadow-2xl rounded-xl flex flex-col z-50 border border-blue-200`}
        >
          {/* Header */}
          <div className="bg-blue-700 text-white p-4 flex justify-between items-center rounded-t-xl">
            <div>
              <h2 className="font-semibold text-lg">
                IntelliShine AI Assistant
              </h2>
              <p className="text-xs opacity-80">
                Default: Short 5–6 line answer
              </p>
            </div>

            <div className="flex gap-3 text-lg">
              <button onClick={() => setFullscreen(!fullscreen)}>
                {fullscreen ? "🗗" : "🗖"}
              </button>
              <button onClick={() => setOpen(false)}>✕</button>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="p-3 border-b">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full border border-blue-300 p-2 rounded focus:outline-blue-600"
            >
              <option value="quick">Short Answer</option>
              <option value="detailed">Detailed Explanation</option>
              <option value="deep">Deep Analysis</option>
            </select>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-blue-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={msg.sender === "user" ? "text-right" : "text-left"}
              >
                <div
                  className={
                    msg.sender === "user"
                      ? "inline-block bg-blue-700 text-white px-4 py-2 rounded-lg max-w-[80%]"
                      : "inline-block bg-white border border-blue-200 px-4 py-2 rounded-lg max-w-[80%] shadow-sm"
                  }
                >
                  {msg.sender === "ai" ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: (props) => (
                          <table className="border w-full my-2 text-sm" {...props} />
                        ),
                        th: (props) => (
                          <th className="border px-2 py-1 bg-blue-100" {...props} />
                        ),
                        td: (props) => (
                          <td className="border px-2 py-1" {...props} />
                        ),
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <p className="text-sm text-blue-600">Generating response...</p>
            )}

            {isTyping && (
              <button
                onClick={stopTyping}
                className="text-red-600 text-sm underline"
              >
                Stop Generating
              </button>
            )}

            <div ref={bottomRef}></div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full border border-blue-300 p-3 rounded mb-3 focus:outline-blue-600"
              placeholder="Ask your academic question..."
              rows="3"
            />

            <div className="flex justify-between">
              <button
                onClick={clearChat}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Clear
              </button>

              <button
                onClick={sendMessage}
                className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AskAi;