import { useEffect } from "react";
import { useAuth } from "@/features/authentication/context/AuthContext";
import { Navigate } from "react-router";

export default function LoginPage() {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (isAuthenticated || loading) return;

    // Use the Salesforce Instance URL from environment (defaulting to the scratch org site URL)
    const sfdcInstance = (import.meta.env.VITE_SFDC_INSTANCE as string) || 'https://momentum-fun-8796-dev-ed.scratch.my.site.com';
    
    // Construct the community site login page URL
    const siteBaseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? `${sfdcInstance}/TestingAppvforcesite`
      : window.location.origin + ((globalThis as any).SFDC_ENV?.basePath || '').replace(/\/+$/, '');

    // Point startURL back to our React application's home path
    const startUrl = window.location.origin + '/home';
    const redirectUrl = `${siteBaseUrl}/CommunitiesLogin?startURL=${encodeURIComponent(startUrl)}`;
    
    console.log("Redirecting to Salesforce site login page:", redirectUrl);
    window.location.replace(redirectUrl);
  }, [isAuthenticated, loading]);

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Redirecting to Login</h1>
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <p className="text-gray-500 text-sm">Please wait while we transfer you to the secure Salesforce login page.</p>
      </div>
    </div>
  );
}
