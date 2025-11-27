import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Home, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import VoteCounter from "@/components/VoteCounter";

const VoteSuccess = () => {
  const navigate = useNavigate();
  const [showAnimation, setShowAnimation] = useState(false);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    // Check auth
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth/login");
        return;
      }

      // Check if user has voted
      const { data: votes } = await supabase
        .from("votes")
        .select("id")
        .eq("user_id", session.user.id)
        .limit(1);

      if (!votes || votes.length === 0) {
        navigate("/elections");
        return;
      }

      // Get total votes count
      const { count } = await supabase
        .from("votes")
        .select("*", { count: "exact", head: true });
      
      if (count) setTotalVotes(count);

      // Trigger animation
      setTimeout(() => setShowAnimation(true), 100);
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-4">
      <div className="container mx-auto max-w-5xl py-8 space-y-8">
        {/* Vote Counter Animation */}
        <div className={`transition-all duration-700 ${showAnimation ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
          <VoteCounter targetCount={totalVotes} duration={2500} />
        </div>

        {/* Success Card */}
        <Card className={`shadow-strong border-accent transition-all duration-700 delay-500 ${showAnimation ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
          <CardHeader className="text-center space-y-4">
            <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto animate-scale-in">
              <CheckCircle className="h-16 w-16 text-accent" />
            </div>
            <CardTitle className="text-3xl text-foreground">Vote Recorded!</CardTitle>
            <CardDescription className="text-base">
              Thank you for participating in democracy. Your vote has been successfully recorded and secured.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                ✓ Vote confirmed and encrypted
              </p>
              <p className="text-sm text-muted-foreground">
                ✓ Confirmation email sent
              </p>
              <p className="text-sm text-muted-foreground">
                ✓ One vote per election ensured
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                className="flex-1 gap-2"
                onClick={() => navigate("/")}
              >
                <Home className="h-5 w-5" />
                Return Home
              </Button>

              <Button
                variant="hero"
                size="lg"
                className="flex-1 gap-2"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                Logout
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Your participation strengthens our democracy
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoteSuccess;
