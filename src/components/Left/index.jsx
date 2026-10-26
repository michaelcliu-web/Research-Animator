import { useState } from "react";
import NavTray from "./NavTray";
import ModeSelector from "./ModeSelector";

const Left = ({
  selectedMode,
  setSelectedMode,
  sidebarCollapsed,
  setSidebarCollapsed,
}) => {
  const [showMobileNav, setShowMobileNav] = useState(false);

  const SidebarContent = ({ onClose = () => {}, isCollapsed = false }) => (
    <div
      className={`${
        isCollapsed ? "w-16" : "w-64"
      } h-screen flex flex-col border-r border-gray-300 transition-all duration-300 overflow-hidden bg-white`}
    >
      <div className="md:hidden flex justify-between items-center p-4 border-b border-gray-200">
        <span className="font-semibold text-lg">Menu</span>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <ModeSelector
        selectedMode={selectedMode}
        setSelectedMode={setSelectedMode}
        sidebarCollapsed={isCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      <div className="flex-grow" />

      {!isCollapsed && (
        <NavTray selectedMode={selectedMode} setSelectedMode={setSelectedMode} />
      )}
    </div>
  );

  return (
    <>
      <button
        onClick={() => setShowMobileNav(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-3 rounded-lg bg-transparent border border-gray-300 hover:bg-gray-100"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="hidden md:flex relative">
        <div className={`${sidebarCollapsed ? "w-16" : "w-64"} h-screen transition-all duration-300`}>
          <SidebarContent isCollapsed={sidebarCollapsed} />
        </div>
      </div>

      {showMobileNav && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileNav(false)} />
          <div className="relative w-64 max-w-sm h-full bg-white">
            <SidebarContent onClose={() => setShowMobileNav(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default Left;
