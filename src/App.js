import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router";
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import Home from "./Home";
import ReactGA from "./analytics";
import "./App.css";

const App = () => {
  const location = useLocation();

  useEffect(() => {
    ReactGA.send({
      hitType: "pageview",
      page: location.pathname + location.search,
    });
  }, [location]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/sso-callback" element={<AuthenticateWithRedirectCallback />} />
    </Routes>
  );
};

export default App;
