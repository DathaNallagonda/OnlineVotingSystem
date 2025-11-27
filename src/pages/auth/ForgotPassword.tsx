import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Vote, ArrowLeft, AlertCircle, Info } from "lucide-react";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmailInfo, setShowEmailInfo] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);

    try {
      const normalizedEmail = email.toLowerCase().trim();
      
      // Try to send reset email
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        console.error("Password reset error:", error);
        setShowEmailInfo(true);
        toast.error("Unable to send reset email. Email service may not be configured. Please see instructions below.", {
          duration: 6000,
        });
      } else {
        toast.success("Password reset email has been sent! Please check your inbox and spam folder.", {
          duration: 8000,
        });
        setShowEmailInfo(true);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setShowEmailInfo(true);
      toast.error("An error occurred. Please see alternative options below.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 animate-fade-in">
        <Link to="/auth/login" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>

        <Card className="shadow-medium border-border">
          <CardHeader className="text-center space-y-2">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Vote className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Forgot Password?</CardTitle>
            <CardDescription>
              Enter your email to receive a password reset link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>

              {showEmailInfo && (
                <Alert className="border-blue-200 bg-blue-50">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-sm space-y-2">
                    <p className="font-semibold text-blue-900">What to do next:</p>
                    <ol className="list-decimal list-inside space-y-1 text-blue-800">
                      <li>Check your email inbox for the reset link</li>
                      <li>Check your spam/junk folder</li>
                      <li>Wait 5-10 minutes for the email to arrive</li>
                    </ol>
                  </AlertDescription>
                </Alert>
              )}

              <Alert className="border-orange-200 bg-orange-50">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-sm">
                  <p className="font-semibold text-orange-900 mb-1">Email not working?</p>
                  <p className="text-orange-800">
                    Contact administrator at <strong>chanakyavakkalagadda@gmail.com</strong> with your registered email address for manual password reset.
                  </p>
                </AlertDescription>
              </Alert>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Remember your password?{" "}
                  <Link to="/auth/login" className="text-primary hover:underline font-medium">
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
