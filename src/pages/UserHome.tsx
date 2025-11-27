import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Vote as VoteIcon, LogOut, BarChart3, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const UserHome = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth/login");
        return;
      }

      setUser(session.user);

      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setUserProfile(profile);
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-4">
        <div className="container mx-auto max-w-4xl py-8 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <VoteIcon className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">SecureVote</h1>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 max-w-4xl animate-fade-in">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome, {userProfile?.full_name || user?.email}!
          </h2>
          <p className="text-muted-foreground text-lg">
            What would you like to do today?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <Card 
            className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50 group"
            onClick={() => navigate("/elections")}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <VoteIcon className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Vote</CardTitle>
              <CardDescription className="text-base">
                Cast your vote in active elections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="vote" 
                className="w-full gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/elections");
                }}
              >
                <VoteIcon className="h-4 w-4" />
                View Elections
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50 group"
            onClick={() => navigate("/results")}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
                <BarChart3 className="h-8 w-8 text-accent" />
              </div>
              <CardTitle className="text-2xl">Results</CardTitle>
              <CardDescription className="text-base">
                View election results and statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/results");
                }}
              >
                <BarChart3 className="h-4 w-4" />
                View Results
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default UserHome;
