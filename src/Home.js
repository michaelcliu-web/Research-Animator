import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import useAppSocket from "./hooks/useAppSocket";
import Spinner from "./components/Spinner";
import Login from "./components/Login";
import Content from "./components/Content";
import Left from "./components/Left";

/** Signed-out users see Login; signed-in users get the sidebar and the selected view. */
const Home = () => {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { socket, hasToken } = useAppSocket({ isSignedIn, getToken });

  const [selectedMode, setSelectedMode] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!isSignedIn) {
    return <Login />;
  }

  if (!isLoaded || !hasToken) {
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
