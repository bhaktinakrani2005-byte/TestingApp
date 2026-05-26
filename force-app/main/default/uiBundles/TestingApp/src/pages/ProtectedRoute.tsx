import { Navigate } from "react-router";
import { useAuth } from "@/features/authentication/context/AuthContext";
import LoadingTodos from "@/components/todo/LoadingTodos";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({
    children,
}: ProtectedRouteProps) {

    const { isAuthenticated, loading } = useAuth();

    // OPTIONAL LOADING STATE
    if (loading) {
        return <LoadingTodos />
    }

    // NOT LOGGED IN
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // AUTHORIZED
    return children;
}