import React, { useEffect, useState, useRef, useCallback } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import Spinner from "./components/Spinner";
import Login from "./components/Login";
import Content from "./components/Content";
import Left from "./components/Left";
import Cookies from "universal-cookie";
import * as Sentry from "@sentry/react";

const cookies = new Cookies();

const Home = () => {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { user } = useUser();

  const [gotToken, setGotToken] = useState(false);
  const [socket, setSocket] = useState(null);
  const [selectedMode, setSelectedMode] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const reconnectTimer = useRef(null);
  const retryDelay = useRef(1000);
  const unmounted = useRef(false);

  const connectSocket = useCallback(async () => {
    if (unmounted.current) return;
    try {
      const token = await getToken();
      if (!token || unmounted.current) return;
      cookies.set("token", token, { path: "/" });

      const ws = new WebSocket(
        process.env.REACT_APP_WS_URL + "ws/app/?token=" + token
      );

      ws.onopen = () => {
        console.log("WebSocket connected");
        retryDelay.current = 1000;
      };

      ws.onclose = (e) => {
        console.log("WebSocket disconnected", e.code);
        if (!unmounted.current) {
          setSocket(null);
          reconnectTimer.current = setTimeout(() => {
            retryDelay.current = Math.min(retryDelay.current * 2, 15000);
            connectSocket();
          }, retryDelay.current);
        }
      };

      ws.onerror = () => ws.close();

      setSocket(ws);
    } catch (error) {
      Sentry.captureException(error);
      if (!unmounted.current) {
        reconnectTimer.current = setTimeout(() => {
          retryDelay.current = Math.min(retryDelay.current * 2, 15000);
          connectSocket();
        }, retryDelay.current);
      }
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
    if (isSignedIn) {
      getToken()
        .then((token) => {
          if (token) {
            cookies.set("token", token, { path: "/" });
            setGotToken(true);
          }
        })
        .catch((error) => Sentry.captureException(error));
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (gotToken && process.env.REACT_APP_WS_URL) {
      connectSocket();
    }
    return () => {
      clearTimeout(reconnectTimer.current);
    };
  }, [gotToken, connectSocket]);

  if (!isSignedIn) {
    return <Login />;
  }

  if (!isLoaded || !gotToken) {
    return <Spinner />;
  }

  return (
    <div className="flex h-screen">
      <Left
        selectedMode={selectedMode}
        setSelectedMode={setSelectedMode}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />
      <div className="flex-1 overflow-y-auto">
        <Content socket={socket} selectedMode={selectedMode} getToken={getToken} />
      </div>
    </div>
  );
};

export default Home;
