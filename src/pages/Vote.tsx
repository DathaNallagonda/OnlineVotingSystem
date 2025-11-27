import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Vote as VoteIcon, LogOut, MapPin, ArrowLeft, Home } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface State {
  id: string;
  name: string;
  code: string;
}

interface District {
  id: string;
  name: string;
}

interface Constituency {
  id: string;
  name: string;
}

interface Candidate {
  id: string;
  name: string;
  party: string;
  bio: string;
  photo_url: string;
}

const Vote = () => {
  const navigate = useNavigate();
  const { electionId } = useParams<{ electionId: string }>();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [election, setElection] = useState<any>(null);
  
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedConstituency, setSelectedConstituency] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState("");
  
  const [hasVoted, setHasVoted] = useState(false);
  const [votingLoading, setVotingLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth/login");
        return;
      }

      if (!electionId) {
        navigate("/elections");
        return;
      }

      setUser(session.user);
      
      // Load election details
      const { data: electionData, error: electionError } = await supabase
        .from("elections")
        .select("*")
        .eq("id", electionId)
        .single();

      if (electionError || !electionData) {
        toast.error("Election not found");
        navigate("/elections");
        return;
      }

      setElection(electionData);

      // Check if user has already voted in this election
      const { data: votes } = await supabase
        .from("votes")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("election_id", electionId)
        .limit(1);

      if (votes && votes.length > 0) {
        setHasVoted(true);
        toast.info("You have already voted in this election");
        navigate("/elections");
        return;
      }
      
      // Load states
      const { data: statesData } = await supabase
        .from("states")
        .select("*")
        .order("name");
      
      if (statesData) setStates(statesData);
      setLoading(false);
    };

    checkAuth();
  }, [navigate, electionId]);

  useEffect(() => {
    if (selectedState) {
      loadDistricts(selectedState);
      setSelectedDistrict("");
      setSelectedConstituency("");
      setDistricts([]);
      setConstituencies([]);
      setCandidates([]);
    }
  }, [selectedState]);

  useEffect(() => {
    if (selectedDistrict) {
      loadConstituencies(selectedDistrict);
      setSelectedConstituency("");
      setConstituencies([]);
      setCandidates([]);
    }
  }, [selectedDistrict]);

  useEffect(() => {
    if (selectedConstituency) {
      loadCandidates(selectedConstituency);
    }
  }, [selectedConstituency]);

  const loadDistricts = async (stateId: string) => {
    const { data } = await supabase
      .from("districts")
      .select("*")
      .eq("state_id", stateId)
      .order("name");
    
    if (data) setDistricts(data);
  };

  const loadConstituencies = async (districtId: string) => {
    const { data } = await supabase
      .from("constituencies")
      .select("*")
      .eq("district_id", districtId)
      .order("name");
    
    if (data) setConstituencies(data);
  };

  const loadCandidates = async (constituencyId: string) => {
    if (!electionId) return;
    
    const { data } = await supabase
      .from("candidates")
      .select("*")
      .eq("constituency_id", constituencyId)
      .eq("election_id", electionId);
    
    if (data) setCandidates(data);
  };

  const handleVote = async () => {
    if (!selectedCandidate) {
      toast.error("Please select a candidate");
      return;
    }

    if (!electionId) {
      toast.error("Election not found");
      return;
    }

    setVotingLoading(true);

    try {
      const { error } = await supabase
        .from("votes")
        .insert({
          user_id: user.id,
          election_id: electionId,
          candidate_id: selectedCandidate,
        });

      if (error) {
        if (error.message.includes("duplicate")) {
          toast.error("You have already voted in this election");
        } else {
          toast.error("Failed to submit vote");
        }
      } else {
        navigate("/vote/success");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setVotingLoading(false);
    }
  };

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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/user/home")}
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/elections")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </div>
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
        {election && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">{election.title}</h2>
            {election.description && (
              <p className="text-muted-foreground mt-1">{election.description}</p>
            )}
          </div>
        )}
        
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <MapPin className="h-6 w-6 text-primary" />
              Cast Your Vote
            </CardTitle>
            <CardDescription>
              Select your location and choose your preferred candidate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">State</label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-[300px] overflow-y-auto">
                    {states.map((state) => (
                      <SelectItem key={state.id} value={state.id}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {districts.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">District</label>
                  <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your district" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="max-h-[300px] overflow-y-auto">
                      {districts.map((district) => (
                        <SelectItem key={district.id} value={district.id}>
                          {district.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {constituencies.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Constituency</label>
                  <Select value={selectedConstituency} onValueChange={setSelectedConstituency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your constituency" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="max-h-[300px] overflow-y-auto">
                      {constituencies.map((constituency) => (
                        <SelectItem key={constituency.id} value={constituency.id}>
                          {constituency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {candidates.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-lg font-semibold text-foreground">Candidates</h3>
                <div className="grid gap-4">
                  {candidates.map((candidate) => (
                    <Card
                      key={candidate.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedCandidate === candidate.id
                          ? "border-accent border-2 shadow-md"
                          : "border-border"
                      }`}
                      onClick={() => setSelectedCandidate(candidate.id)}
                    >
                      <CardContent className="p-4 flex items-start gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{candidate.name}</h4>
                          <p className="text-sm text-primary">{candidate.party}</p>
                          <p className="text-sm text-muted-foreground mt-2">{candidate.bio}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button
                  variant="vote"
                  size="lg"
                  className="w-full gap-2"
                  onClick={handleVote}
                  disabled={!selectedCandidate || votingLoading}
                >
                  <VoteIcon className="h-5 w-5" />
                  {votingLoading ? "Submitting Vote..." : "Confirm Vote"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Vote;