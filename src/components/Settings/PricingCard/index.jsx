import "./style.css"

const PricingCard = ({
  planName,
  handleSubscription,
  handleReactivate,
  fullWidth,
  isCurrentPlan,
  isCancelling,
  hideButton,
  isHighlighted,
  isDisabled,
  isLoading,
  buttonText,
  billingCycle = "monthly",
}) => {
  const features = [
    "150+ resumes from top tech companies",
    "100+ business school profiles and essays",
    "100+ law school profiles and essays",
    "50+ med school applications",
  ];

  return (
    <div className={`
      relative bg-white rounded-xl border flex flex-col max-w-[360px] mx-auto
      ${isHighlighted ? "border-[#255748] border-2" : "border-gray-200"}
    `}>
      <div className="px-8 pt-8 pb-6">
        <p className="text-[#255748] text-sm font-semibold mb-4">Full access</p>

        <h3 className="text-4xl font-bold text-gray-900 mb-3">
          Membership
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Access all databases, profiles, and AI tools.
        </p>

        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-5xl font-bold text-gray-900">
            {billingCycle === "yearly" ? "$199" : "$30"}
          </span>
          <span className="text-lg font-medium text-gray-500">
            {billingCycle === "yearly" ? "/ year" : "/ month"}
          </span>
        </div>
        <p className="text-sm text-gray-400 mb-8">
          {billingCycle === "yearly" ? "45% off monthly" : "\u00A0"}
        </p>

        {!hideButton && (
          <button
            onClick={() => isCancelling && handleReactivate ? handleReactivate() : handleSubscription(planName)}
            disabled={(!isCancelling && isCurrentPlan) || isDisabled || isLoading}
            className={`
              w-full py-3.5 rounded-xl text-sm font-semibold transition-all
              ${isLoading
                ? "bg-[#255748] text-white opacity-80 cursor-wait"
                : isCancelling
                ? "bg-[#255748] text-white hover:bg-[#1e4a3d]"
                : isCurrentPlan 
                ? "bg-[#255748]/10 text-[#255748] cursor-default border border-[#255748]" 
                : isDisabled
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-[#255748] text-white hover:bg-[#1e4a3d]"}
            `}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading...
              </span>
            ) : (
              buttonText || (isCurrentPlan ? "Current member" : "Become a Member")
            )}
          </button>
        )}
      </div>

      <div className="border-t border-gray-100 px-8 py-6 space-y-5">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-3">
            <img src="/check-mark.svg" alt="" className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm text-gray-700">{feature}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PricingCard;
