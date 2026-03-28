import { Fragment, useState, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { useUser, useAuth } from "@clerk/clerk-react";
import PricingCard from "../Settings/PricingCard";
import { toast } from "react-hot-toast";
import Request from "../Request";
import axios from "axios";
import Cookies from "universal-cookie";

const cookies = new Cookies();

const CTASubscribeModal = ({ open, setShowCTASubscribed, subscriptionData, setSubscriptionData }) => {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoResult, setPromoResult] = useState(null);
  const { getToken } = useAuth();
  const isMounted = useRef(true);

  const refreshToken = async () => {
    const token = await getToken();
    if (token) cookies.set("token", token, { path: "/" });
  };

  const handleRedeemPromo = async () => {
    if (promoLoading || !promoCode.trim()) return;
    setPromoLoading(true);
    setPromoResult(null);
    try {
      await refreshToken();
      const response = await axios({
        method: "POST",
        url: process.env.REACT_APP_API_URL + "stripe/redeem-promo/",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + cookies.get("token"),
        },
        data: { code: promoCode.trim() },
      });
      if (response.data?.success) {
        setPromoResult({ success: true, message: response.data.message });
        toast.success(response.data.message);
        setPromoCode("");
        if (setSubscriptionData) {
          const subRes = await axios({
            method: "GET",
            url: process.env.REACT_APP_API_URL + "users/subscription/",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + cookies.get("token"),
            },
          });
          setSubscriptionData(subRes.data || {});
        }
        setTimeout(() => setShowCTASubscribed(false), 1500);
      }
    } catch (err) {
      const errData = err.response?.data;
      setPromoResult({
        success: false,
        message: errData?.error || "Failed to redeem promo code.",
      });
      toast.error(errData?.error || "Failed to redeem promo code.");
    } finally {
      if (isMounted.current) setPromoLoading(false);
    }
  };

  const handleSubscription = async (planType) => {
    setLoading(true);
    const subscriptionType =
      billingCycle === "yearly" ? "pro_yearly" : "pro_monthly";

    try {
      const response = await new Request("stripe/create-checkout-session/", {
        method: "POST",
        data: {
          subscription_type: subscriptionType,
          success_url: `${window.location.origin}?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}`,
        },
      });

      if (response.data && response.data.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error(
        err.response?.data?.error || "Failed to create checkout session",
      );
      setLoading(false);
    }
  };

  const { user } = useUser();

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setShowCTASubscribed}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute top-0 right-0 pt-4 pr-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#255748] focus:ring-offset-2"
                    onClick={() => setShowCTASubscribed(false)}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div>
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Unlock Full Access
                    </h3>
                    <p className="text-gray-600">
                      Get everything you need to land your dream role or
                      program.
                    </p>
                  </div>

                  {/* Billing toggle */}
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

<div className="mb-6">
                  <PricingCard
                    planName="Member"
                    handleSubscription={handleSubscription}
                    fullWidth={true}
                    isHighlighted={true}
                    isLoading={loading}
                    billingCycle={billingCycle}
                    buttonText={
                      billingCycle === "yearly"
                        ? "Become a Member — $199/year"
                        : "Become a Member — $30/month"
                    }
                  />
                  </div>

                  <div className="border-t border-gray-200 pt-5 pb-2">
                    <p className="text-sm font-medium text-gray-700 mb-3">Have a promo code?</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value.toUpperCase());
                          setPromoResult(null);
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleRedeemPromo()}
                        placeholder="e.g. GB-A7K2M9"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#00356b] focus:border-transparent"
                      />
                      <button
                        onClick={handleRedeemPromo}
                        disabled={promoLoading || !promoCode.trim()}
                        className="px-4 py-2 bg-[#00356b] text-white text-sm font-medium rounded-lg hover:bg-[#002548] transition-colors disabled:opacity-50 whitespace-nowrap"
                      >
                        {promoLoading ? "..." : "Redeem"}
                      </button>
                    </div>
                    {promoResult && (
                      <div className={`mt-2 flex items-center gap-1.5 text-sm ${promoResult.success ? 'text-green-600' : 'text-red-600'}`}>
                        {promoResult.success ? (
                          <CheckCircleIcon className="h-4 w-4 flex-shrink-0" />
                        ) : (
                          <XCircleIcon className="h-4 w-4 flex-shrink-0" />
                        )}
                        <span>{promoResult.message}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default CTASubscribeModal;
