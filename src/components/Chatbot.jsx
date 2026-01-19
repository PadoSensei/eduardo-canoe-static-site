import React, { useEffect, useRef, useState } from "react";
import "deep-chat";
import { MessageCircle, X } from "lucide-react";
import { API_CONFIG } from "../config";

const Chatbot = () => {
  const chatElementRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const chatElement = chatElementRef.current;
    if (chatElement) {
      chatElement.connect = {
        handler: async (body, signals) => {
          try {
            const userMessage = body.messages[body.messages.length - 1].text;

            const response = await fetch(
              `${API_CONFIG.VOLT_AGENT_URL}/agents/${API_CONFIG.AGENT_ID}/text`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  input: userMessage,
                  options: {
                    maxTokens: 1000,
                  },
                }),
              }
            );

            if (!response.ok) {
              const errorText = await response.text();
              signals.onResponse({
                error: `Connection failed (${response.status}): ${errorText}`,
              });
              return;
            }

            const result = await response.json();
            let responseText = result.text || result.data?.text || result.response || result.message ||
                             (typeof result === "string" ? result : "I couldn't process the response.");

            signals.onResponse({
              text: responseText,
            });
          } catch (error) {
            signals.onResponse({
              error: `Failed to connect to AI assistant.`,
            });
          }
        },
      };
    }
  }, [isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#FF6B6B] hover:bg-[#FF5252] text-white p-4 rounded-full shadow-2xl transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center"
        aria-label="Toggle Chat"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      {/* Chat Window */}
      <div
        className={`absolute bottom-20 right-0 transition-all duration-300 transform ${
          isOpen
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-[350px] sm:w-[400px] h-[500px] border border-gray-100">
          <div className="bg-[#FF6B6B] p-4 text-white font-bold flex justify-between items-center">
            <span>Pipa Canoe Assistant</span>
          </div>
          <deep-chat
            ref={chatElementRef}
            style={{
              width: "100%",
              height: "calc(100% - 56px)",
              border: "none",
            }}
            messageStyles={{
              default: {
                shared: {
                  bubble: {
                    maxWidth: "80%",
                  },
                },
              },
            }}
          ></deep-chat>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
