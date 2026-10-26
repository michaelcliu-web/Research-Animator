import { useEffect, useState } from "react";
import { isSocketOpen, sendSocketMessage } from "../utils/socket";
import useSocketMessage from "./useSocketMessage";

/** Fetches the signed-in user's finished videos over the WebSocket. */
const useVideoLibrary = (socket) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useSocketMessage(socket, (message) => {
    if (message.websocket_type !== "list_videos") return;
    setVideos(message.videos || []);
    setLoading(false);
  });

  useEffect(() => {
    if (!socket) return;

    const requestVideos = () => sendSocketMessage(socket, { websocket_type: "list_videos" });

    if (isSocketOpen(socket)) {
      requestVideos();
      return;
    }
    socket.addEventListener("open", requestVideos);
    return () => socket.removeEventListener("open", requestVideos);
  }, [socket]);

  return { videos, loading };
};

export default useVideoLibrary;
