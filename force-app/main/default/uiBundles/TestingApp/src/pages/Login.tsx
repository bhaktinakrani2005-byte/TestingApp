// Passwordless Login Page
import { useState } from "react";
import { useAuth } from "@/features/authentication/context/AuthContext";
// import { Eye, EyeOff } from "lucide-react";
import { sendLoginCodeThunk, verifyLoginCodeThunk } from "@/store/slice/ContactSlice";
import { useRedux } from "@/hook/useRedux";
import { Navigate, useNavigate } from "react-router";
import { store } from "@/store";

/**
 * Passwordless login using email OTP.
 * Step 1: User enters email and receives OTP.
 * Step 2: User enters OTP to verify and login.
 */
export default function LoginPage() {
    const navigate = useNavigate();
    const { dispatch } = useRedux();
    const { isAuthenticated } = useAuth();

    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    // const [showPassword, setShowPassword] = useState(false); // kept for possible future use
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<'email' | 'code'>('email');

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { identifier } = await dispatch(
                sendLoginCodeThunk({ email, startUrl: '/home' })
            ).unwrap();
            console.log('identifier get', identifier);
            setStep('code');
        } catch (err: any) {
            setError(err.message || 'Failed to send login code');
        } finally {
            setLoading(false);
        }
    };

    const handleCodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            // Retrieve identifier from redux state (currentUser not used). We'll get from state slice via selector if needed.
            // For simplicity, assume identifier was stored in ContactSlice state as loginIdentifier.
            // const state = (await import("@/store")).default.getState(); // dynamic import to avoid circular deps
            // const identifier = state.contact.loginIdentifier;
            const identifier = store.getState().contact.loginIdentifier ?? '';
            if (!identifier) {
                throw new Error("Login identifier not found");
            }
            const result = await dispatch(
                verifyLoginCodeThunk({ email, identifier, code, startUrl: '/home' })
            ).unwrap();
            if (result.success && result.redirectUrl) {
                const finalUrl = result.redirectUrl;
                if (finalUrl.startsWith('http://') || finalUrl.startsWith('https://')) {
                    window.location.href = finalUrl;
                } else {
                    navigate(finalUrl);
                }
            } else {
                throw new Error('Verification failed');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to verify code');
        } finally {
            setLoading(false);
        }
    };

    if (isAuthenticated) {
        return <Navigate to="/home" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
                    <p className="text-gray-500 mt-2">Login to your account</p>
                </div>
                {step === 'email' ? (
                    <form onSubmit={handleEmailSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-100 text-red-700 text-sm p-3 rounded-lg">{error}</div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
                        >
                            {loading ? 'Sending code...' : 'Send OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleCodeSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-100 text-red-700 text-sm p-3 rounded-lg">{error}</div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                OTP Code
                            </label>
                            <input
                                type="text"
                                placeholder="Enter OTP"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
                        >
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}