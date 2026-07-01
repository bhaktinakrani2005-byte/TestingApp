import { useState } from "react";
import { useAuth } from "@/features/authentication/context/AuthContext";
import { Navigate } from "react-router";
import { useRedux } from "@/hook/useRedux";
import { fetchUser } from "@/store/slice/ContactSlice";
import { getDynamicInstanceUrl, getDynamicBasePath } from "@/lib/utils";

export default function LoginPage() {
  const { isAuthenticated } = useAuth();
  const { dispatch } = useRedux();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const resultAction = await dispatch(
        fetchUser({
          username: username.trim(),
          password: password.trim(),
          startUrl: `${getDynamicBasePath()}/home`,
        })
      );
      if (fetchUser.fulfilled.match(resultAction)) {
        const payload = resultAction.payload;
        if (payload && payload.success && payload.redirectUrl) {
          const isLocalhost = typeof window !== 'undefined' && 
            (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
          
          let fullRedirectUrl = payload.redirectUrl;
          if (isLocalhost) {
            if (fullRedirectUrl.startsWith("http")) {
              try {
                const urlObj = new URL(fullRedirectUrl);
                let targetPath = urlObj.pathname + urlObj.search + urlObj.hash;
                const dynamicBasePath = getDynamicBasePath();
                if (dynamicBasePath && targetPath.startsWith(dynamicBasePath)) {
                  targetPath = targetPath.substring(dynamicBasePath.length);
                }
                if (targetPath.startsWith('/TestingApp')) {
                  targetPath = targetPath.substring('/TestingApp'.length);
                }
                fullRedirectUrl = `${window.location.origin}${targetPath.startsWith('/') ? targetPath : '/' + targetPath}`;
              } catch (e) {
                console.error('Failed to parse redirect URL:', e);
              }
            } else {
              let targetPath = payload.redirectUrl;
              const dynamicBasePath = getDynamicBasePath();
              if (dynamicBasePath && targetPath.startsWith(dynamicBasePath)) {
                targetPath = targetPath.substring(dynamicBasePath.length);
              }
              if (targetPath.startsWith('/TestingApp')) {
                targetPath = targetPath.substring('/TestingApp'.length);
              }
              fullRedirectUrl = `${window.location.origin}${targetPath.startsWith('/') ? targetPath : '/' + targetPath}`;
            }
          } else {
            if (!fullRedirectUrl.startsWith("http")) {
              const instanceUrl = getDynamicInstanceUrl();
              fullRedirectUrl = `${instanceUrl}${payload.redirectUrl}`;
            }
          }
          window.location.href = fullRedirectUrl;
        } else {
          setError("Invalid username or password.");
        }
      } else {
        setError((resultAction.payload as string) || "Login failed");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Community Login
            </h1>
            <p className="text-slate-500 mt-2 text-sm">
              Please sign in using your Salesforce credentials
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-600 border border-rose-100 text-sm p-4 rounded-xl mb-6 flex items-start space-x-2">
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-slate-600 mb-1"
              >
                Username or Email
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-slate-800 disabled:opacity-50"
                placeholder="username@example.com"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-600 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-slate-800 disabled:opacity-50"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center space-x-2"
            >
              {loading && (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              <span>{loading ? "Signing in..." : "Sign In"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}