const PaywallOverlay = ({
  children,
  subscriptionData,
  setSelectedMode,
  sidebarWidth = 256,
  isMobile = false,
}) => {
  const hasAccess =
    subscriptionData?.has_lifetime_access ||
    subscriptionData?.status === "active" ||
    ["plus_monthly", "plus_yearly", "pro_monthly", "pro_yearly"].includes(
      subscriptionData?.plan
    );

  if (hasAccess) return children;

  if (isMobile) {
    return (
      <div className="relative h-full overflow-hidden">
        <div
          className="h-full"
          style={{
            filter: "blur(6px)",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          {children}
        </div>

        <div className="fixed inset-0 z-20 flex items-center justify-center bg-white/30">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-sm w-full mx-6 text-center">
            <div className="w-12 h-12 bg-[#255748]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <img src="/lock.svg" alt="" className="w-5 h-5 opacity-70" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Members Only
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Become a member to access all premium features.
            </p>
            <button
              onClick={() => setSelectedMode("settings")}
              className="w-full py-3 bg-[#255748] text-white text-sm font-semibold rounded-xl hover:bg-[#1e4a3d] transition-colors"
            >
              Become a Member
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {children}

      <div
        className="absolute inset-0 z-10 flex items-center justify-center"
        style={{
          left: `${sidebarWidth}px`,
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          backgroundColor: "rgba(255,255,255,0.4)",
          userSelect: "none",
        }}
      >
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-sm w-full mx-4 text-center">
          <div className="w-12 h-12 bg-[#255748]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <img src="/lock.svg" alt="" className="w-5 h-5 opacity-70" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Members Only
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Become a member to access all premium features.
          </p>
          <button
            onClick={() => setSelectedMode("settings")}
            className="w-full py-3 bg-[#255748] text-white text-sm font-semibold rounded-xl hover:bg-[#1e4a3d] transition-colors"
          >
            Become a Member
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaywallOverlay;
