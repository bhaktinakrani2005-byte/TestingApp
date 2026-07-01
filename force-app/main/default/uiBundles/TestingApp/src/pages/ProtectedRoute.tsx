import { useAuth } from "@/features/authentication/context/AuthContext";
import { Navigate } from "react-router";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({
    children,
}: ProtectedRouteProps) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // NOT LOGGED IN
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // AUTHORIZED
    return children;
}