import { useAuth } from "@/features/authentication/context/AuthContext";
import { Navigate } from "react-router";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({
    children,
}: ProtectedRouteProps) {

    const { isAuthenticated } = useAuth();

    // NOT LOGGED IN
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // AUTHORIZED
    return children;
}