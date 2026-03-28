import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import Spinner from "./components/Spinner";
import Login from "./components/Login";
import Content from "./components/Content";
import Cookies from "universal-cookie";
import * as Sentry from "@sentry/react";

const cookies = new Cookies();

const Home = () => {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { user } = useUser();

  const [gotToken, setGotToken] = useState(false);
  const [socket, setSocket] = useState(null);
  const [reconnectSocket, setReconnectSocket] = useState(false);

  useEffect(() => {
    if (gotToken) {
      const token = cookies.get("token");
      if (token && process.env.REACT_APP_WS_URL) {
        setSocket(
          new WebSocket(
            process.env.REACT_APP_WS_URL + "ws/app/" + "?token=" + token
          )
        );
        setReconnectSocket(!reconnectSocket);
      }
    }
  }, [gotToken]);

  useEffect(() => {
    if (socket === null) return;

    socket.onopen = () => console.log("WebSocket connected");
    socket.onclose = (e) => {
      console.log("WebSocket disconnected", e.code);
      setSocket(null);
    };
    socket.onerror = () => socket.close();

    return () => socket.close();
  }, [reconnectSocket]);

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

  if (!isSignedIn) {
    return <Login />;
  }

  if (!isLoaded || !gotToken) {
    return <Spinner />;
  }

  return <Content socket={socket} />;
};

export default Home;
