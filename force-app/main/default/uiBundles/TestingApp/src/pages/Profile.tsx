import { useState } from "react";
import { Link } from "react-router";
import { useRedux } from "@/hook/useRedux";
import { useAuth } from "@/features/authentication/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { 
  User, 
  Mail, 
  Shield,  
  Copy, 
  Check, 
  ArrowLeft, 
  LogOut 
} from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { selector } = useRedux();
  const { logout } = useAuth();
  const currentUser = selector((state) => state.contact.currentUser);
  
  const [copiedId, setCopiedId] = useState(false);
  const [copiedUsername, setCopiedUsername] = useState(false);

  if (!currentUser) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center bg-gray-50/50">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="size-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <User className="size-6 animate-bounce" />
          </div>
          <p className="text-gray-500 font-medium">Loading profile details...</p>
        </div>
      </div>
    );
  }

  const handleCopy = (text: string, type: "id" | "username") => {
    navigator.clipboard.writeText(text);
    toast.success(`${type === "id" ? "User ID" : "Username"} copied to clipboard!`);
    
    if (type === "id") {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedUsername(true);
      setTimeout(() => setCopiedUsername(false), 2000);
    }
  };

  const getInitials = () => {
    const first = currentUser.firstName?.charAt(0) || "";
    const last = currentUser.lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "U";
  };

  return (
    <div className="min-h-[90vh] bg-gradient-to-br from-indigo-50/40 via-white to-blue-50/40 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Back Button */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" asChild className="gap-2 text-gray-600 hover:text-gray-900">
            <Link to="/home">
              <ArrowLeft className="size-4" />
              Back to Dashboard
            </Link>
          </Button>
          {/* <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 px-3 py-1 text-xs font-semibold">
            <BadgeCheck className="size-3.5 fill-emerald-100" />
            Verified Session
          </Badge> */}
        </div>

        {/* Profile Card Header */}
        <Card className="border-0 shadow-xl overflow-hidden bg-white/70 backdrop-blur-md">
          <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 relative" />
          <CardContent className="pt-0 relative px-6 sm:px-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:-mt-12 gap-4 mb-6 text-center sm:text-left">
              <Avatar className="!size-24 border-4 border-white shadow-lg ring-1 ring-black/5">
                <AvatarFallback className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-3xl font-bold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
                  {currentUser.name}
                </h1>
                <p className="text-sm font-medium text-gray-500">
                  Salesforce Community User
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => logout()}
                className="mt-4 sm:mt-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 gap-2 font-medium"
              >
                <LogOut className="size-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Details Panel */}
          <Card className="md:col-span-2 border border-gray-200/60 shadow-lg bg-white/70 backdrop-blur-md">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <User className="size-5 text-indigo-600" />
                Account Details
              </CardTitle>
              <CardDescription>
                Your personal details returned by Salesforce authorization.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    First Name
                  </label>
                  <p className="text-base font-semibold text-gray-800 mt-1">
                    {currentUser.firstName || "—"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Last Name
                  </label>
                  <p className="text-base font-semibold text-gray-800 mt-1">
                    {currentUser.lastName || "—"}
                  </p>
                </div>
              </div>

              <Separator className="bg-gray-100" />

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="size-4 text-gray-400 shrink-0" />
                  <span className="text-base font-medium text-gray-800">
                    {currentUser.email}
                  </span>
                </div>
              </div>

              <Separator className="bg-gray-100" />

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Salesforce Username
                </label>
                <div className="flex items-center justify-between mt-1 p-2 bg-gray-50 border border-gray-150 rounded-lg group">
                  <span className="text-sm font-mono text-gray-700 truncate mr-2">
                    {currentUser.username}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-gray-400 hover:text-gray-600 shrink-0"
                    onClick={() => handleCopy(currentUser.username, "username")}
                  >
                    {copiedUsername ? (
                      <Check className="size-4 text-emerald-600 animate-scaleUp" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Sidebar / Metadata Panel */}
          <div className="space-y-6">
            
            {/* Identity Card */}
            <Card className="border border-gray-200/60 shadow-lg bg-white/70 backdrop-blur-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="size-4 text-indigo-600" />
                  System Reference
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Salesforce User ID
                  </label>
                  <div className="flex items-center justify-between mt-1 p-2 bg-gray-50 border border-gray-150 rounded-lg group">
                    <span className="text-xs font-mono text-gray-600 truncate mr-2">
                      {currentUser.id}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-gray-400 hover:text-gray-600 shrink-0"
                      onClick={() => handleCopy(currentUser.id, "id")}
                    >
                      {copiedId ? (
                        <Check className="size-3.5 text-emerald-600 animate-scaleUp" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>



          </div>

        </div>

      </div>
    </div>
  );
}
