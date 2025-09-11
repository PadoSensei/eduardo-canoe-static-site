// chatbot.js
document.addEventListener("DOMContentLoaded", () => {
  const chatElement = document.getElementById("deep-chat");

  if (!chatElement) {
    console.error("Deep Chat element not found!");
    return;
  }

  // Set up the custom handler for Volt Agent connection
  chatElement.connect = {
    handler: async (body, signals) => {
      try {
        // Extract the user's message from Deep Chat format
        const userMessage = body.messages[body.messages.length - 1].text;

        console.log("Sending message to Volt Agent:", userMessage);

        // Send to Volt Agent
        const response = await fetch(
          "http://localhost:3141/agents/volt-canoe-eduardo/text",
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
          console.error("Volt Agent error:", response.status, errorText);
          signals.onResponse({
            error: `Connection failed (${response.status}): ${errorText}`,
          });
          return;
        }

        // Parse the response from Volt Agent
        const result = await response.json();
        console.log("Full Volt Agent response:", result);

        // Transform Volt Agent response to Deep Chat format
        let responseText = "";

        // Handle different possible response structures from Volt Agent
        if (result.text) {
          // Direct text response
          responseText = result.text;
        } else if (result.data && result.data.text) {
          // Nested in data object
          responseText = result.data.text;
        } else if (result.response) {
          // Response field
          responseText = result.response;
        } else if (result.message) {
          // Message field
          responseText = result.message;
        } else if (typeof result === "string") {
          // Direct string response
          responseText = result;
        } else {
          // Fallback - stringify the whole response
          console.warn("Unexpected response format:", result);
          responseText =
            "I received your message but couldn't format the response properly. Please try again.";
        }

        console.log("Extracted response text:", responseText);

        // Send the properly formatted response back to Deep Chat
        signals.onResponse({
          text: responseText,
        });
      } catch (error) {
        console.error("Handler error:", error);
        signals.onResponse({
          error: `Failed to connect: ${error.message}. Make sure Volt Agent is running on localhost:3141`,
        });
      }
    },
  };

  console.log("Deep Chat handler configured successfully");
});
