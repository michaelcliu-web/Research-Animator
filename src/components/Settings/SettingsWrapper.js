import { useState, useEffect } from "react";
import { useUser, useAuth, useClerk } from "@clerk/clerk-react";
import Settings from ".";
import Request from "../Request"; // Adjust path if needed

const SettingsWrapper = () => {
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const { redirectToSignIn } = useClerk();
  const [subscription, setSubscription] = useState(null);
  const [subscribed, setSubscribed] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn) {
      redirectToSignIn();
      return;
    }

    fetchUserData();
  }, [isSignedIn]);

  const fetchUserData = async () => {
    try {
      // Fetch subscription data
      const subRequest = new Request("users/subscription/");
      const subResponse = await subRequest;
      setSubscription(subResponse.data);
      setSubscribed(subResponse.data?.is_active || false);

      // Set user info from Clerk
      setUserInfo({
        email: user?.primaryEmailAddress?.emailAddress,
        name: user?.fullName,
        picture: user?.imageUrl,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isSignedIn || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Settings
      subscription={subscription}
      setSubscribed={setSubscribed}
      userInfo={userInfo}
      setUserInfo={setUserInfo}
    />
  );
};

export default SettingsWrapper;