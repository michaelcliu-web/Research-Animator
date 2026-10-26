export const isSocketOpen = (socket) => Boolean(socket) && socket.readyState === WebSocket.OPEN;

/** Sends a JSON message to the backend. Callers check isSocketOpen first. */
export const sendSocketMessage = (socket, message) => socket.send(JSON.stringify(message));
