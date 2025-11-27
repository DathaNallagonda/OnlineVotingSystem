import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Vote as VoteIcon, LogOut, Calendar, Clock, Home } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface Election {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

const ElectionList = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [elections, setElections] = useState<Election[]>([]);
  const [votedElections, setVotedElections] = useState<Set<string>>(new Set());

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth/login");
        return;
      }

      setUser(session.user);
      
      // Load active elections
      const { data: electionsData, error: electionsError } = await supabase
        .from("elections")
        .select("*")
        .eq("is_active", true)
        .order("start_date", { ascending: false });

      if (electionsError) {
        toast.error("Failed to load elections");
        setLoading(false);
        return;
      }

      if (electionsData) {
        setElections(electionsData);

        // Check which elections the user has already voted in
        const { data: votesData } = await supabase
          .from("votes")
          .select("election_id")
          .eq("user_id", session.user.id);

        if (votesData) {
          setVotedElections(new Set(votesData.map(v => v.election_id)));
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleElectionSelect = (electionId: string) => {
    navigate(`/vote/${electionId}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isElectionActive = (election: Election) => {
    if (!election.is_active) return false;
    
    const now = new Date();
    const endDate = new Date(election.end_date);
    
    // Election is active if it hasn't ended yet and is_active flag is true
    return now <= endDate;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-4">
        <div className="container mx-auto max-w-4xl py-8 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/user/home")}
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Home
            </Button>
            <div className="flex items-center gap-2">
              <VoteIcon className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">SecureVote</h1>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground mb-2">Select an Election</h2>
          <p className="text-muted-foreground">Choose an election to cast your vote</p>
        </div>

        {elections.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <VoteIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Active Elections</h3>
              <p className="text-muted-foreground">There are currently no active elections available for voting.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {elections.map((election) => {
              const hasVoted = votedElections.has(election.id);
              const isActive = isElectionActive(election);
              const canVote = isActive && !hasVoted;

              return (
                <Card
                  key={election.id}
                  className={`transition-all duration-200 ${
                    canVote
                      ? "hover:shadow-lg cursor-pointer border-border hover:border-primary/50"
                      : "opacity-75"
                  }`}
                  onClick={() => canVote && handleElectionSelect(election.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 flex items-center gap-2">
                          {election.title}
                          {hasVoted && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Voted
                            </Badge>
                          )}
                          {!isActive && (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                              Closed
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="text-base">
                          {election.description || "No description available"}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Start: {formatDate(election.start_date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>End: {formatDate(election.end_date)}</span>
                      </div>
                    </div>
                    
                    {canVote && (
                      <Button 
                        variant="vote" 
                        className="w-full gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleElectionSelect(election.id);
                        }}
                      >
                        <VoteIcon className="h-4 w-4" />
                        Vote in this Election
                      </Button>
                    )}
                    
                    {hasVoted && (
                      <div className="text-sm text-green-600 font-medium">
                        ✓ You have already voted in this election
                      </div>
                    )}
                    
                    {!isActive && !hasVoted && (
                      <div className="text-sm text-muted-foreground">
                        This election is no longer accepting votes
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default ElectionList;
