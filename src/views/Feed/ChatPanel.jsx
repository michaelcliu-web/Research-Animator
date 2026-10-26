import { useEffect, useRef } from "react";
import { CloseIcon, QuestionIcon, SendIcon } from "../../components/common/Icons";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const ChatMessage = ({ message }) => {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser ? "bg-indigo-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"
        }`}
      >
        {message.text}
        {message.streaming && (
          <span className="inline-block w-1.5 h-4 bg-indigo-400 rounded-full ml-1 animate-pulse align-middle" />
        )}
      </div>
    </div>
  );
};

/**
 * "Ask about this paper" chat beside a feed video. Chat state (from
 * usePaperChat) and the draft live in the parent so they survive closing the panel.
 */
const ChatPanel = ({ videoTitle, chat, draft, onDraftChange, onClose }) => {
  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [chat.messages]);

  const send = () => {
    if (chat.askQuestion(draft)) onDraftChange("");
  };

  return (
    <div
      className="flex flex-col bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden flex-shrink-0"
      style={{ width: "340px", height: "min(580px, 70vh)" }}
      // Keep scroll and key presses from reaching the feed behind the panel.
      onWheel={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-800">Ask about this paper</h4>
          <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[240px]">{videoTitle}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <CloseIcon className="w-4 h-4" />
        </button>
      </div>

      <div ref={messagesRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3" onWheel={(e) => e.stopPropagation()}>
        {chat.messages.length === 0 && (
          <div className="text-center py-8">
            <QuestionIcon className="w-10 h-10 text-gray-200 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-sm text-gray-400">Ask anything about this paper</p>
            <p className="text-xs text-gray-300 mt-1">e.g. "What method did they use?" or "Explain the results"</p>
          </div>
        )}
        {chat.messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}
      </div>

      <div className="px-3 py-3 border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();
                send();
              }
            }}
            placeholder="Ask a question..."
            disabled={chat.answering}
            className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 disabled:opacity-50 disabled:bg-gray-50"
          />
          <button
            onClick={send}
            disabled={chat.answering || !draft.trim()}
            className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {chat.answering ? <LoadingSpinner className="h-4 w-4" /> : <SendIcon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
