import { useEffect, useRef } from "react";

/**
 * Calls `onMessage` with every JSON message the server sends on `socket`.
 * The latest `onMessage` is always used, so callers don't need useCallback.
 */
const useSocketMessage = (socket, onMessage) => {
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  });

  useEffect(() => {
    if (!socket) return;

    const handleRawMessage = (event) => {
      let message;
      try {
        message = JSON.parse(event.data);
      } catch {
        return; // ignore anything that isn't JSON
      }
      onMessageRef.current(message);
    };

    socket.addEventListener("message", handleRawMessage);
    return () => socket.removeEventListener("message", handleRawMessage);
  }, [socket]);
};

export default useSocketMessage;
