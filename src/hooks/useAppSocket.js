import { useCallback, useEffect, useRef, useState } from "react";
import * as Sentry from "@sentry/react";
import { WS_URL } from "../config/api";

const INITIAL_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 15000;

/**
 * Opens the app's single WebSocket once the user is signed in, authenticating
 * with their Clerk token. If the connection drops it reconnects with
 * exponential backoff (1s, 2s, 4s, ... capped at 15s).
 *
 * Returns `socket` (null while disconnected) and `hasToken`, which is false
 * until the first Clerk token has been fetched.
 */
const useAppSocket = ({ isSignedIn, getToken }) => {
  const [hasToken, setHasToken] = useState(false);
  const [socket, setSocket] = useState(null);

  const reconnectTimer = useRef(null);
  const retryDelay = useRef(INITIAL_RETRY_DELAY_MS);
  const unmounted = useRef(false);

  const connect = useCallback(async () => {
    const scheduleReconnect = () => {
      reconnectTimer.current = setTimeout(() => {
        retryDelay.current = Math.min(retryDelay.current * 2, MAX_RETRY_DELAY_MS);
        connect();
      }, retryDelay.current);
    };

    if (unmounted.current) return;
    try {
      const token = await getToken();
      if (!token || unmounted.current) return;

      const ws = new WebSocket(WS_URL + "ws/app/?token=" + token);

      ws.onopen = () => {
        console.log("WebSocket connected");
        retryDelay.current = INITIAL_RETRY_DELAY_MS;
      };

      ws.onclose = (event) => {
        console.log("WebSocket disconnected", event.code);
        if (!unmounted.current) {
          setSocket(null);
          scheduleReconnect();
        }
      };

      ws.onerror = () => ws.close();

      setSocket(ws);
    } catch (error) {
      Sentry.captureException(error);
      if (!unmounted.current) scheduleReconnect();
    }
  }, [getToken]);

  useEffect(() => {
    unmounted.current = false;
    return () => {
      unmounted.current = true;
      clearTimeout(reconnectTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!isSignedIn) return;
    getToken()
      .then((token) => {
        if (token) setHasToken(true);
      })
      .catch((error) => Sentry.captureException(error));
  }, [isSignedIn, getToken]);

  useEffect(() => {
    if (hasToken && WS_URL) connect();
    return () => clearTimeout(reconnectTimer.current);
  }, [hasToken, connect]);

  return { socket, hasToken };
};

export default useAppSocket;
