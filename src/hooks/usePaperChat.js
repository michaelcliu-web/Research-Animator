import { useState } from "react";
import { isSocketOpen, sendSocketMessage } from "../utils/socket";
import useSocketMessage from "./useSocketMessage";

/**
 * Q&A chat about one video's paper. The backend streams each answer back in
 * chunks, which are appended to the last assistant message until "done".
 */
const usePaperChat = (socket, videoId) => {
  const [messages, setMessages] = useState([]);
  const [answering, setAnswering] = useState(false);

  useSocketMessage(socket, (message) => {
    if (message.websocket_type !== "ask_answer" || message.video_id !== videoId) return;

    if (message.error) {
      setMessages((prev) => [...prev, { role: "assistant", text: "Sorry, something went wrong: " + message.error }]);
      setAnswering(false);
    } else if (message.status === "streaming" && message.chunk) {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === "assistant" && last.streaming) {
          return [...prev.slice(0, -1), { ...last, text: last.text + message.chunk }];
        }
        return [...prev, { role: "assistant", text: message.chunk, streaming: true }];
      });
    } else if (message.status === "done") {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === "assistant") {
          return [...prev.slice(0, -1), { ...last, streaming: false }];
        }
        return prev;
      });
      setAnswering(false);
    }
  });

  /** Sends a question; returns false if it couldn't be sent. */
  const askQuestion = (questionText) => {
    const question = questionText.trim();
    if (!question || answering || !isSocketOpen(socket)) return false;

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setAnswering(true);
    sendSocketMessage(socket, { websocket_type: "ask_question", video_id: videoId, question });
    return true;
  };

  return { messages, answering, askQuestion };
};

export default usePaperChat;
