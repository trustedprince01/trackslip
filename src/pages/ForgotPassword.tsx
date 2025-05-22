
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Mail } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle password reset logic here
    console.log("Reset password requested for:", email);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[rgb(111,104,215)] to-[rgb(42,33,156)]">
      <div className="w-full max-w-[430px] px-4 py-8">
        <Card className="bg-white/95 shadow-lg border-none">
          <CardHeader className="pb-2">
            <h1 className="text-2xl font-medium text-center">Reset Password</h1>
            <p className="text-muted-foreground text-center text-sm mt-1">
              {!submitted 
                ? "Enter your email to receive a password reset link" 
                : "Check your email for reset instructions"}
            </p>
          </CardHeader>
          <CardContent>
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-5 pt-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 text-base"
                      required
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-medium bg-gradient-to-r from-trackslip-blue to-trackslip-lightBlue hover:opacity-90 transition-opacity"
                >
                  Send Reset Link
                </Button>
              </form>
            ) : (
              <div className="pt-4 pb-2 text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-700 mb-4">
                  If there's an account associated with {email}, we've sent instructions to reset your password.
                </p>
                <p className="text-gray-500 text-sm">
                  Please check your email inbox and spam folder.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center pb-6">
            <p className="text-sm text-gray-600">
              <Link to="/login" className="text-blue-600 hover:underline">
                Back to Login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
