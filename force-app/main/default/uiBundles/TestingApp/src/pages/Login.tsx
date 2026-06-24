import { useEffect, useState } from "react";
import { useAuth } from "@/features/authentication/context/AuthContext";
import { Navigate } from "react-router";
import { getDynamicBasePath, getDynamicInstanceUrl } from "@/lib/utils";

export default function LoginPage() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const instanceUrl = getDynamicInstanceUrl();
    const sitePrefix = getDynamicBasePath();
    const scriptSrc = `${instanceUrl}${sitePrefix}/lightning/lightning.out.js`;

    // Function to initialize the application elements
    const initLightningOut = () => {
      try {
        const cardContainer = document.getElementById("login-form-container");
        if (!cardContainer) return;

        // Clear container content first
        cardContainer.innerHTML = "";

        const lightningEndPoint = `${instanceUrl}${sitePrefix}`;

        (window as any).$Lightning.use(
          "c:TestingAppLoginApp",
          () => {
            (window as any).$Lightning.createComponent(
              "c:passwordlessLoginForm",
              {},
              "login-form-container",
              () => {
                console.log("Passwordless login form component created successfully");
                setLoading(false);
              }
            );
          },
          lightningEndPoint
        );
      } catch (err: any) {
        console.error("Lightning Out init error:", err);
        setError("Failed to initialize login form component: " + err.message);
        setLoading(false);
      }
    };

    // Load the Lightning Out library dynamically
    const existingScript = document.querySelector(`script[src="${scriptSrc}"]`) as HTMLScriptElement;
    if (existingScript) {
      if ((window as any).__lightningOutScriptLoaded) {
        initLightningOut();
      } else {
        const handleLoad = () => {
          (window as any).__lightningOutScriptLoaded = true;
          initLightningOut();
        };
        existingScript.addEventListener("load", handleLoad);
        // We cast to any to avoid TypeScript complaints on onerror in older type libs
        existingScript.addEventListener("error", () => {
          setError("Failed to load Salesforce Lightning Out library.");
          setLoading(false);
        });
      }
    } else {
      const script = document.createElement("script");
      script.src = scriptSrc;
      script.async = true;
      script.onload = () => {
        (window as any).__lightningOutScriptLoaded = true;
        initLightningOut();
      };
      script.onerror = () => {
        setError(
          "Failed to load Salesforce Lightning Out library. Please verify your network connection and Salesforce instance settings."
        );
        setLoading(false);
      };
      document.body.appendChild(script);
    }

    // listen for the LWC's "loginsuccess" custom event
    function handleLoginSuccess(e: Event) {
      e.preventDefault(); // Stop LWC from performing relative redirect
      const customEvent = e as CustomEvent<{ result: { success: boolean; redirectUrl?: string } }>;
      console.log("Login success event:", customEvent.detail);
      const { result } = customEvent.detail;

      if (result?.success && result.redirectUrl) {
        const fullRedirectUrl = result.redirectUrl.startsWith("http")
          ? result.redirectUrl
          : `${instanceUrl}${result.redirectUrl}`;
        window.location.href = fullRedirectUrl;
      } else {
        setError("Login verification failed. Please try again.");
      }
    }

    document.addEventListener("loginsuccess", handleLoginSuccess as EventListener);

    return () => {
      document.removeEventListener("loginsuccess", handleLoginSuccess as EventListener);
      
      const cardContainer = document.getElementById("login-form-container");
      if (cardContainer) {
        cardContainer.innerHTML = "";
      }
    };
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Community Login
            </h1>
            <p className="text-slate-500 mt-2 text-sm">
              Please sign in using your email OTP
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-600 border border-rose-100 text-sm p-4 rounded-xl mb-6 flex items-start space-x-2 animate-pulse">
              <svg
                className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <svg className="animate-spin h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="text-sm font-semibold text-slate-500 animate-pulse">
                Initializing secure login client...
              </p>
            </div>
          )}

          <div id="login-form-container" />
        </div>
      </div>
    </div>
  );
}