import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Label } from "../ui/label";
import { AlertCircle, Lock, Mail, User, Network, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { useToast } from "../ui/use-toast";
import { z } from "zod";
import { Separator } from "../ui/separator";

interface AuthScreenProps {
  onAuthenticated?: () => void;
}

// Form validation schemas
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const AuthScreen = ({ onAuthenticated = () => {} }: AuthScreenProps) => {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);

  const validateForm = (schema: z.ZodType<any>, data: any) => {
    try {
      schema.parse(data);
      return { success: true, error: null };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error: error.errors[0].message };
      }
      return { success: false, error: "Validation failed" };
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form
    const validation = validateForm(loginSchema, { email, password });
    if (!validation.success) {
      setError(validation.error);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        setError(error.message);
        return;
      }

      toast({
        title: "Login successful",
        description: "Welcome back to Task Graph Manager!",
      });

      onAuthenticated();
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form
    const validation = validateForm(signupSchema, {
      email,
      password,
      confirmPassword,
    });
    if (!validation.success) {
      setError(validation.error);
      return;
    }

    setIsLoading(true);

    try {
      const { error, data } = await signUp(email, password);

      if (error) {
        setError(error.message);
        return;
      }

      toast({
        title: "Account created",
        description: data?.user?.email
          ? `We've sent a confirmation email to ${data.user.email}`
          : "Your account has been created successfully",
      });

      // If email confirmation is required
      if (data?.user?.identities?.length === 0) {
        setError("Please check your email to confirm your account");
        setIsLoading(false);
        return;
      }

      onAuthenticated();
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!resetEmail || !resetEmail.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signIn(resetEmail, "dummy-password");

      // We expect an error here since we're using a dummy password
      // This is just to check if the email exists

      toast({
        title: "Password reset email sent",
        description:
          "If an account exists with this email, you'll receive instructions to reset your password.",
      });

      setShowResetForm(false);
    } catch (err) {
      // Don't show an error to prevent email enumeration
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-blue-500/30"
              style={{
                width: `${Math.random() * 300 + 50}px`,
                height: `${Math.random() * 300 + 50}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 10 + 10}s`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="z-10 w-full max-w-md"
      >
        <Card className="w-full max-w-md bg-gray-900/95 backdrop-blur-sm border border-gray-700 shadow-2xl">
          <CardHeader className="space-y-2">
            <div className="flex justify-center mb-2">
              <div className="p-3 rounded-full bg-blue-600/20 border border-blue-500/30 shadow-lg shadow-blue-500/10">
                <Network className="h-8 w-8 text-blue-300" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-400">
              Task Graph Manager
            </CardTitle>
            <CardDescription className="text-center text-gray-300">
              {showResetForm
                ? "Reset your password"
                : "Enter your credentials to access your workspace"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showResetForm ? (
              <form onSubmit={handleResetPassword}>
                <div className="space-y-4">
                  {error && (
                    <Alert
                      variant="destructive"
                      className="mb-4 bg-red-900/30 border border-red-700/50 text-red-300"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="font-medium">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label
                      htmlFor="reset-email"
                      className="text-gray-200 font-medium"
                    >
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-blue-300" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="name@example.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                        className="bg-gray-800/70 border-gray-600 pl-10 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 border-gray-600 text-gray-200 hover:bg-gray-800 hover:text-white"
                      onClick={() => setShowResetForm(false)}
                      disabled={isLoading}
                    >
                      Back to Login
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 transition-all duration-200 shadow-lg shadow-blue-900/30 text-white font-medium"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Reset Link"
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <Tabs
                defaultValue="login"
                value={activeTab}
                onValueChange={setActiveTab}
              >
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-800/70 p-1">
                  <TabsTrigger
                    value="login"
                    className="data-[state=active]:bg-blue-600/30 data-[state=active]:text-blue-200 font-medium"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger
                    value="signup"
                    className="data-[state=active]:bg-blue-600/30 data-[state=active]:text-blue-200 font-medium"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                {error && (
                  <Alert
                    variant="destructive"
                    className="mb-4 bg-red-900/30 border border-red-700/50 text-red-300"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-medium">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <TabsContent value="login">
                  <form onSubmit={handleLogin}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="text-gray-200 font-medium"
                        >
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-blue-300" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-gray-800/70 border-gray-600 pl-10 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor="password"
                            className="text-gray-200 font-medium"
                          >
                            Password
                          </Label>
                          <Button
                            type="button"
                            variant="link"
                            className="px-0 text-xs text-blue-300 hover:text-blue-200 font-medium"
                            onClick={() => setShowResetForm(true)}
                          >
                            Forgot password?
                          </Button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-300" />
                          <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="bg-gray-800/70 border-gray-600 pl-10 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                          />
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 transition-all duration-200 shadow-lg shadow-blue-900/30 text-white font-medium"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Logging in...
                          </>
                        ) : (
                          "Login"
                        )}
                      </Button>

                      <div className="relative my-4">
                        <Separator className="bg-gray-700" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="bg-gray-900 px-2 text-xs text-gray-400">
                            OR CONTINUE WITH
                          </span>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full bg-white hover:bg-gray-50 text-gray-800 font-medium flex items-center justify-center gap-2 rounded-lg shadow-sm border border-gray-300"
                        onClick={() => signInWithGoogle()}
                        disabled={isLoading}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                          <path fill="none" d="M1 1h22v22H1z" />
                        </svg>
                        <span>Sign in with Google</span>
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignup}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="signup-email"
                          className="text-gray-200 font-medium"
                        >
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-blue-300" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-gray-800/70 border-gray-600 pl-10 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="signup-password"
                          className="text-gray-200 font-medium"
                        >
                          Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-300" />
                          <Input
                            id="signup-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="bg-gray-800/70 border-gray-600 pl-10 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="confirm-password"
                          className="text-gray-200 font-medium"
                        >
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-300" />
                          <Input
                            id="confirm-password"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="bg-gray-800/70 border-gray-600 pl-10 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                          />
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 transition-all duration-200 shadow-lg shadow-blue-900/30 text-white font-medium"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </Button>

                      <div className="relative my-4">
                        <Separator className="bg-gray-700" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="bg-gray-900 px-2 text-xs text-gray-400">
                            OR CONTINUE WITH
                          </span>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full bg-white hover:bg-gray-50 text-gray-800 font-medium flex items-center justify-center gap-2 rounded-lg shadow-sm border border-gray-300"
                        onClick={() => signInWithGoogle()}
                        disabled={isLoading}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                          <path fill="none" d="M1 1h22v22H1z" />
                        </svg>
                        <span>Sign in with Google</span>
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-gray-300">
              By continuing, you agree to our{" "}
              <span className="text-blue-300 hover:text-blue-200 hover:underline cursor-pointer font-medium">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="text-blue-300 hover:text-blue-200 hover:underline cursor-pointer font-medium">
                Privacy Policy
              </span>
              .
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default AuthScreen;
