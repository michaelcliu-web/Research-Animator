import { useEffect, useState, useRef } from "react";
import Request from "../Request";
import axios from "axios";
import Cookies from "universal-cookie";
import { useUser, useAuth, useClerk } from "@clerk/clerk-react";
import PricingCard from "./PricingCard";
import toast from "react-hot-toast";
import { TailSpin } from "react-loading-icons";
import {
  Zap,
  TrendingUp,
  CreditCard,
  ChevronDown,
  Sparkles,
  BarChart3,
  FileText,
  MessageSquare,
  Calendar,
  XCircle,
} from "lucide-react";
// Using window.location for navigation instead of React Router
import {
  UserCircleIcon,
  CreditCardIcon,
  SparklesIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  DocumentTextIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const Settings = ({ subscriptionData, setSubscriptionData, isMobile }) => {
  const { user } = useUser();
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { redirectToSignIn } = useClerk();
  const [activeTab, setActiveTab] = useState("subscription");
  const [billingCycle, setBillingCycle] = useState(
    subscriptionData?.plan?.includes("yearly") ? "yearly" : "monthly"
  );
  const [loading, setLoading] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  const [subscriptionError, setSubscriptionError] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const isMounted = useRef(true);
  const cookies = new Cookies();

  const refreshToken = async () => {
    const token = await getToken();
    if (token) {
      cookies.set("token", token, { path: "/" });
    }
  };

  // Add a listener for storage events to detect subscription updates
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'subscription_updated') {
        fetchSubscriptionData();
        localStorage.removeItem('subscription_updated');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check on mount in case we're returning from checkout
    if (localStorage.getItem('subscription_updated')) {
      fetchSubscriptionData();
      localStorage.removeItem('subscription_updated');
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (isSignedIn && user) {
      fetchSubscriptionData();
    }
  }, [isSignedIn, user]);

  useEffect(() => {
    if (subscriptionData?.plan) {
      setBillingCycle(subscriptionData.plan.includes("yearly") ? "yearly" : "monthly");
    }
  }, [subscriptionData?.plan]);

  // Handle authentication loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <TailSpin className="h-12 w-12 text-purple-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Handle not authenticated
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Please log in to view settings
          </h2>
          <button
            onClick={() => redirectToSignIn()}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  const picture = user?.imageUrl;
  const name = user?.fullName;
  const email = user?.primaryEmailAddress?.emailAddress;

  const fetchSubscriptionData = async () => {
    try {
      setSubscriptionLoading(true);
      setSubscriptionError(false);
      
      await refreshToken();
      const subRequest = new Request("users/subscription/");
      const res = await subRequest;
      
      console.log("Subscription response:", res.data);

      if (isMounted.current) {
        setSubscriptionData(res.data || {});
      }
    } catch (err) {
      console.error("Failed to fetch subscription data:", err);
      console.error("Error response:", err.response);
      
      if (isMounted.current) {
        setSubscriptionError(true);
        setSubscriptionData({}); // Set empty object on error
      }
    } finally {
      if (isMounted.current) {
        setSubscriptionLoading(false);
      }
    }
  };

  const handleSubscription = async (planType) => {
    if (loading || subscriptionLoading) return;

    if (planType === "Free") {
      toast.info("You're currently on the free plan");
      return;
    }

    setLoading(true);

    const subscriptionType = billingCycle === "yearly" ? "pro_yearly" : "pro_monthly";

    try {
      await refreshToken();
      const response = await new Request("stripe/create-checkout-session/", {
        method: "POST",
        data: {
          subscription_type: subscriptionType,
          success_url: `${window.location.origin}?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}`,
        },
      });

      if (response.data && response.data.error) {
        toast.error(response.data.error);
        return;
      }

      if (response.data && response.data.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error(
        err.response?.data?.error || "Failed to create checkout session"
      );
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const handleManageBilling = async () => {
    try {
      await refreshToken();
      const response = await new Request("stripe/create-portal-session/", {
        method: "POST",
        data: {},
      });
      if (response.data && response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      toast.error("Failed to open billing portal");
    }
  };

  const handleCancelSubscription = async () => {
    setShowCancelModal(false);
    setLoading(true);
    try {
      await refreshToken();
      const response = await axios({
        method: "POST",
        url: process.env.REACT_APP_API_URL + "stripe/cancel-subscription/",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + cookies.get("token"),
        },
        data: {},
      });

      if (response.data && response.data.success) {
        toast.success(
          response.data.message ||
            "Subscription will be cancelled at the end of your billing period."
        );
        fetchSubscriptionData();
      } else {
        throw new Error(
          response.data?.error || "Failed to cancel subscription"
        );
      }
    } catch (err) {
      console.error("Cancel subscription error:", err);
      const msg =
        err.response?.data?.error ||
        err.message ||
        "Failed to cancel subscription. Please try again.";
      console.error("Cancel error detail:", err.response?.status, err.response?.data);
      toast.error(msg);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const handleReactivateSubscription = async () => {
    setLoading(true);
    try {
      await refreshToken();
      const response = await axios({
        method: "POST",
        url: process.env.REACT_APP_API_URL + "stripe/reactivate-subscription/",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + cookies.get("token"),
        },
        data: {},
      });

      if (response.data && response.data.success) {
        toast.success(response.data.message || "Subscription reactivated!");
        fetchSubscriptionData();
      } else {
        throw new Error(response.data?.error || "Failed to reactivate");
      }
    } catch (err) {
      console.error("Reactivate error:", err);
      toast.error(
        err.response?.data?.error ||
          err.message ||
          "Failed to reactivate subscription."
      );
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      await refreshToken();
      const response = await new Request("stripe/create-portal-session/", {
        method: "POST",
        data: {
          return_url: `${window.location.origin}/`,
        },
      });

      // Redirect to Stripe Customer Portal
      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error("No portal URL received");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to open billing portal");
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };


  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (err) {
      return "N/A";
    }
  };

  const getPlanDisplayName = (plan) => {
    const planMap = {
      plus_monthly: "Member Monthly",
      plus_yearly: "Member Yearly",
      pro_monthly: "Member Monthly",
      pro_yearly: "Member Yearly",
      free: "Free",
    };
    return planMap[plan] || plan;
  };

  // Check if user has a specific plan (including cancelled subscriptions)
  const isCurrentPlan = (planName) => {
    // Check if user has a subscription (active or cancelling)
    if (!subscriptionData || !subscriptionData.plan) return false;

    // If subscription is cancelled (not active and not cancelling), don't mark as current
    if (
      subscriptionData.status !== "active" &&
      !subscriptionData.cancel_at_period_end
    )
      return false;

    const planMap = {
      Plus: ["plus_monthly", "plus_yearly"].includes(subscriptionData.plan),
      Pro: ["pro_monthly", "pro_yearly"].includes(subscriptionData.plan),
      Member: ["pro_monthly", "pro_yearly", "plus_monthly", "plus_yearly"].includes(subscriptionData.plan),
      Free: false,
    };

    return planMap[planName] || false;
  };

  // Check if plan is disabled
  const isPlanDisabled = (planName) => {
    // If subscription is cancelling, only allow reactivation of the same plan
    if (subscriptionData?.cancel_at_period_end) {
      // Get the current plan type (Plus or Pro)
      return planName !== "Member";
    }

    // Free plan is always disabled for clicking
    if (planName === "Free") {
      return true;
    }

    return false;
  };

  // Get button text for pricing cards
  const getButtonText = (planName) => {
    // If subscription data is still loading
    if (subscriptionLoading) {
      return "Loading...";
    }

    // If there was an error loading subscription data
    if (subscriptionError) {
      return `Get ${planName}`;
    }

    // If subscription is cancelling
    if (subscriptionData?.cancel_at_period_end) {
      if (planName === "Member") {
        return "Reactivate";
      }
      return "Not available";
    }

    if (isCurrentPlan(planName)) {
      return "Current member";
    }
    if (isPlanDisabled(planName)) {
      return "Change in 'Manage Billing'";
    }
    return "Become a Member";
  };

  // Check if subscription is still valid (for expired subscriptions)
  const isSubscriptionValid = () => {
    if (!subscriptionData?.current_period_end) return false;

    try {
      const endDate = new Date(subscriptionData.current_period_end);
      const now = new Date();
      return endDate > now;
    } catch (err) {
      return false;
    }
  };

  const tabs = [
    { id: "subscription", name: "Subscription", icon: CreditCardIcon },
    { id: "usage", name: "Profile", icon: ChartBarIcon },
  ];

  return (
    <div
      className={`flex flex-col overflow-y-auto h-screen bg-gradient-to-br from-[#fafcff] to-[#f0f4fb]`}
    >
      <div className="w-full">
        {/* Header and Tabs - White background section */}
        <div className="bg-white border-b border-gray-200">
          <div className={`${isMobile ? 'px-4' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}`}>
            {/* Header */}
            <div className={`${isMobile ? 'py-4' : 'py-8'} flex items-center justify-center`}>
              <h1 className={`${isMobile ? 'text-[1.75rem] mt-2' : 'text-[2.5rem]'} font-extrabold text-gray-900 tracking-tight font-poppins text-center`}>
                Settings
              </h1>
            </div>

            {/* Tabs */}
            <nav className={`flex ${isMobile ? 'space-x-4' : 'space-x-8'}`}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                    flex items-center gap-2 ${isMobile ? 'py-2' : 'py-3'} px-1 border-b-2 font-medium ${isMobile ? 'text-xs' : 'text-sm'} transition-colors -mb-px
                    ${
                      activeTab === tab.id
                        ? "border-[#00356b] text-[#00356b]"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                  `}
                  >
                    <Icon className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content area */}
        <div className={`${isMobile ? 'px-4 py-4 pb-16' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
          {/* Subscription Tab */}
          {activeTab === "subscription" && (
            <div>
              {/* Error state */}
              {subscriptionError && (
                <div className={`${isMobile ? 'mb-4' : 'mb-6'} p-4 bg-red-50 border border-red-200 rounded-lg`}>
                  <p className={`text-red-800 ${isMobile ? 'text-sm' : ''}`}>
                    Failed to load subscription data. Please refresh the page or
                    try again later.
                  </p>
                </div>
              )}

              {/* Subscription */}
              <div className={`${isMobile ? '' : 'max-w-lg mx-auto'}`}>
                <div className={`text-center ${isMobile ? 'mb-4' : 'mb-8'}`}>
                  <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900`}>
                    {subscriptionData?.status === "active" || subscriptionData?.has_lifetime_access
                      ? "Your Membership"
                      : "Become a Member"}
                  </h2>
                  <p className={`mt-2 text-gray-600 ${isMobile ? 'text-sm' : ''}`}>
                    {subscriptionData?.status === "active" || subscriptionData?.has_lifetime_access
                      ? "You have full access to all features"
                      : "Unlock all features with a membership"}
                  </p>
                </div>

                {!(subscriptionData?.status === "active" || subscriptionData?.has_lifetime_access) && (
                  <div className="flex justify-center mb-6">
                    <div className="bg-gray-100 rounded-lg p-1 flex gap-1">
                      <button
                        onClick={() => setBillingCycle("monthly")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          billingCycle === "monthly"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Monthly
                      </button>
                      <button
                        onClick={() => setBillingCycle("yearly")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          billingCycle === "yearly"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Yearly
                        
                      </button>
                    </div>
                  </div>
                )}

                {subscriptionData?.has_lifetime_access ? (
                  <div className="bg-white border-2 border-[#255748] rounded-2xl p-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Lifetime Access</h3>
                    <p className="text-gray-500">You have permanent access to all features.</p>
                  </div>
                ) : (
                  <PricingCard
                    planName="Member"
                    handleSubscription={handleSubscription}
                    handleReactivate={handleReactivateSubscription}
                    fullWidth={true}
                    isHighlighted={true}
                    isCurrentPlan={isCurrentPlan("Member")}
                    isCancelling={!!subscriptionData?.cancel_at_period_end}
                    isDisabled={isPlanDisabled("Member")}
                    isLoading={loading}
                    billingCycle={billingCycle}
                    buttonText={getButtonText("Member")}
                  />
                )}

              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === "usage" && (
            <div className={`${isMobile ? '' : 'max-w-lg mx-auto'}`}>
              {/* Subscription Info Card */}
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className={`${isMobile ? 'p-5' : 'p-8'}`}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900`}>
                        {subscriptionData?.status === "active" || subscriptionData?.has_lifetime_access
                          ? "Active Member"
                          : "No Active Plan"}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {subscriptionData?.status === "active"
                          ? subscriptionData?.cancel_at_period_end
                            ? "Cancelling at end of period"
                            : "Active"
                          : subscriptionData?.has_lifetime_access
                          ? "Lifetime Access"
                          : "Subscribe to unlock all features"}
                      </p>
                    </div>
                   
                  </div>

                  {(subscriptionData?.status === "active" || subscriptionData?.has_lifetime_access) && (
                    <div className="flex items-center gap-6 mb-6">
                      {subscriptionData?.current_period_end && (
                        <div>
                          <p className="text-xs text-gray-500">
                            {subscriptionData?.cancel_at_period_end ? "Access ends" : "Renews on"}
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(subscriptionData.current_period_end)}
                          </p>
                        </div>
                      )}
                      {subscriptionData?.current_period_start && (
                        <div>
                          <p className="text-xs text-gray-500">Member since</p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(subscriptionData.current_period_start)}
                          </p>
                        </div>
                      )}
                      {!subscriptionData?.has_lifetime_access && (
                        <div>
                          <p className="text-xs text-gray-500">Plan</p>
                          <p className="text-sm font-medium text-gray-900">
                            {subscriptionData?.plan?.includes("yearly") ? "$199/year" : "$30/month"}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className={`flex gap-3 ${isMobile ? 'flex-col' : ''}`}>
                    {subscriptionData?.status === "active" || subscriptionData?.has_lifetime_access ? (
                      <>
                        <button
                          onClick={handleManageBilling}
                          className="px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Manage Billing
                        </button>
                        {!subscriptionData?.has_lifetime_access && !subscriptionData?.cancel_at_period_end && (
                          <button
                            onClick={handleManageBilling}
                            className="px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Change Plan
                          </button>
                        )}
                        {subscriptionData?.cancel_at_period_end ? (
                          <button
                            onClick={handleReactivateSubscription}
                            disabled={loading}
                            className="px-4 py-2.5 bg-[#255748] text-white text-sm font-medium rounded-lg hover:bg-[#1e4a3d] transition-colors disabled:opacity-50"
                          >
                            {loading ? "Reactivating..." : "Reactivate Plan"}
                          </button>
                        ) : !subscriptionData?.has_lifetime_access && (
                          <button
                            onClick={() => setShowCancelModal(true)}
                            disabled={loading}
                            className="px-4 py-2.5 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            Cancel Plan
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={() => setActiveTab("subscription")}
                        className="px-6 py-2.5 bg-[#255748] text-white text-sm font-medium rounded-lg hover:bg-[#1e4a3d] transition-colors"
                      >
                        Become a Member
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Info */}
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mt-4">
                <div className={`${isMobile ? 'p-5' : 'p-8'}`}>
                  <h3 className="text-sm font-medium text-gray-500 mb-4">Account</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="text-sm font-medium text-gray-900">{name}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">Email</p>
                      <p className={`text-sm font-medium text-gray-900 ${isMobile ? 'break-all text-right ml-4' : ''}`}>{email}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`text-center ${isMobile ? 'py-4 mt-2 pb-8' : 'py-8 mt-6'}`}>
                <p className="text-sm text-gray-400">
                  Need help? Email support@example.com
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCancelModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Cancel your subscription?
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                You'll keep access until the end of your current billing period
                {subscriptionData?.current_period_end &&
                  ` (${formatDate(subscriptionData.current_period_end)})`}
                . After that, you'll lose access to all premium features.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Keep Plan
                </button>
                <button
                  onClick={handleCancelSubscription}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Cancelling..." : "Yes, Cancel"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;