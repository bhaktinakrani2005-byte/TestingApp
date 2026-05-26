import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { useAuth } from "@/features/authentication/context/AuthContext";
import { useRedux } from "@/hook/useRedux";
import { fetchUser } from "@/store/slice/ContactSlice";

export default function LoginPage() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState<string | null>(null);

    const { dispatch } = useRedux();

    const { isAuthenticated } = useAuth();

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault();

        setLoading(true);

        setError(null);

        try {
            const userData = await dispatch(fetchUser()).unwrap();

            console.log("Authenticated User:", userData);

            if (email !== userData.email) {

                setError("Email does not match authenticated user");

                return;
            }

            /**
             * REDIRECT AFTER SUCCESS
             */
            navigate("/home");

        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Login failed";

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    if (isAuthenticated) {
        return <Navigate to="/home" replace />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">

            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

                <div className="text-center mb-6">

                    <h1 className="text-3xl font-bold text-gray-800">
                        Welcome Back
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Login to your account
                    </p>

                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    {/* ERROR */}
                    {error && (
                        <div className="bg-red-100 text-red-700 text-sm p-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* EMAIL */}
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

                    {/* PASSWORD */}
                    <div>

                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>

                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />

                    </div>

                    {/* FORGOT PASSWORD */}
                    <div className="flex justify-end">

                        <button
                            type="button"
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Forgot Password?
                        </button>

                    </div>

                    {/* LOGIN BUTTON */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                {/* SIGNUP */}
                <p className="text-center text-sm text-gray-500 mt-6">

                    Don&apos;t have an account?{" "}

                    <span className="text-blue-600 font-medium cursor-pointer hover:underline">
                        Sign Up
                    </span>

                </p>

            </div>
        </div>
    );
}