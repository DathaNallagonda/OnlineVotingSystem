import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Vote, ArrowLeft, TrendingUp, Users, Award, Home } from "lucide-react";

interface Election {
  id: string;
  title: string;
  description: string;
  is_active: boolean;
  constituency_id: string | null;
  constituency_name?: string;
  district_name?: string;
  state_name?: string;
}

interface State {
  id: string;
  name: string;
}

interface District {
  id: string;
  name: string;
  state_id: string;
}

interface Constituency {
  id: string;
  name: string;
  district_id: string;
}

interface CandidateVotes {
  candidate_id: string;
  candidate_name: string;
  party: string;
  vote_count: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B9D'];

const Results = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [allElections, setAllElections] = useState<Election[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  
  const [selectedElection, setSelectedElection] = useState<string>("");
  const [stateFilter, setStateFilter] = useState<string>("");
  const [districtFilter, setDistrictFilter] = useState<string>("");
  const [constituencyFilter, setConstituencyFilter] = useState<string>("");
  
  const [filteredDistricts, setFilteredDistricts] = useState<District[]>([]);
  const [filteredConstituencies, setFilteredConstituencies] = useState<Constituency[]>([]);
  
  const [resultsData, setResultsData] = useState<CandidateVotes[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    await Promise.all([
      loadElections(),
      loadStates(),
      loadDistricts(),
      loadConstituencies()
    ]);
  };

  const loadElections = async () => {
    const { data } = await supabase
      .from("elections")
      .select(`
        *,
        constituencies (
          id,
          name,
          district_id,
          districts (
            id,
            name,
            state_id,
            states (
              id,
              name
            )
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (data) {
      const formattedData = data.map((election: any) => ({
        ...election,
        constituency_name: election.constituencies?.name || null,
        district_name: election.constituencies?.districts?.name || null,
        state_name: election.constituencies?.districts?.states?.name || null
      }));
      setAllElections(formattedData);
      setElections(formattedData);
    }
  };

  const loadStates = async () => {
    const { data } = await supabase
      .from("states")
      .select("*")
      .order("name");
    if (data) setStates(data);
  };

  const loadDistricts = async () => {
    const { data } = await supabase
      .from("districts")
      .select("*")
      .order("name");
    if (data) setDistricts(data);
  };

  const loadConstituencies = async () => {
    const { data } = await supabase
      .from("constituencies")
      .select("*")
      .order("name");
    if (data) setConstituencies(data);
  };

  const handleStateFilter = async (stateId: string) => {
    setStateFilter(stateId);
    setDistrictFilter("");
    setConstituencyFilter("");
    setFilteredConstituencies([]);

    if (stateId) {
      const filtered = districts.filter(d => d.state_id === stateId);
      setFilteredDistricts(filtered);

      const filteredElections = allElections.filter(election => {
        if (!election.constituency_id) return true;
        const constituency = constituencies.find(c => c.id === election.constituency_id);
        if (!constituency) return false;
        const district = districts.find(d => d.id === constituency.district_id);
        return district?.state_id === stateId;
      });
      setElections(filteredElections);
    } else {
      setFilteredDistricts([]);
      setElections(allElections);
    }
  };

  const handleDistrictFilter = async (districtId: string) => {
    setDistrictFilter(districtId);
    setConstituencyFilter("");

    if (districtId) {
      const filtered = constituencies.filter(c => c.district_id === districtId);
      setFilteredConstituencies(filtered);

      const filteredElections = allElections.filter(election => {
        if (!election.constituency_id) return true;
        const constituency = constituencies.find(c => c.id === election.constituency_id);
        return constituency?.district_id === districtId;
      });
      setElections(filteredElections);
    } else {
      setFilteredConstituencies([]);
      if (stateFilter) {
        handleStateFilter(stateFilter);
      } else {
        setElections(allElections);
      }
    }
  };

  const handleConstituencyFilter = (constituencyId: string) => {
    setConstituencyFilter(constituencyId);

    if (constituencyId) {
      const filteredElections = allElections.filter(election => 
        !election.constituency_id || election.constituency_id === constituencyId
      );
      setElections(filteredElections);
    } else {
      if (districtFilter) {
        handleDistrictFilter(districtFilter);
      } else if (stateFilter) {
        handleStateFilter(stateFilter);
      } else {
        setElections(allElections);
      }
    }
  };

  const loadElectionResults = async (electionId: string) => {
    setSelectedElection(electionId);
    setLoading(true);

    const { data: votesData } = await supabase
      .from("votes")
      .select(`
        candidate_id,
        candidates (
          id,
          name,
          party
        )
      `)
      .eq("election_id", electionId);

    if (votesData) {
      const voteCounts: { [key: string]: CandidateVotes } = {};

      votesData.forEach((vote: any) => {
        const candidateId = vote.candidate_id;
        if (!voteCounts[candidateId]) {
          voteCounts[candidateId] = {
            candidate_id: candidateId,
            candidate_name: vote.candidates.name,
            party: vote.candidates.party || "Independent",
            vote_count: 0
          };
        }
        voteCounts[candidateId].vote_count++;
      });

      const results = Object.values(voteCounts).sort((a, b) => b.vote_count - a.vote_count);
      setResultsData(results);
      setTotalVotes(votesData.length);
    }

    setLoading(false);
  };

  const getWinner = () => {
    if (resultsData.length === 0) return null;
    return resultsData[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/user/home">
              <Button variant="ghost" size="sm" className="gap-2">
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Vote className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">SecureVote - Results</h1>
            </div>
          </div>
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Landing
            </Button>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Filter Section */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Elections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by State
                </label>
                <select
                  value={stateFilter}
                  onChange={(e) => handleStateFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All States</option>
                  {states.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by District
                </label>
                <select
                  value={districtFilter}
                  onChange={(e) => handleDistrictFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={!stateFilter}
                >
                  <option value="">All Districts</option>
                  {filteredDistricts.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Constituency
                </label>
                <select
                  value={constituencyFilter}
                  onChange={(e) => handleConstituencyFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={!districtFilter}
                >
                  <option value="">All Constituencies</option>
                  {filteredConstituencies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Elections List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {stateFilter || districtFilter || constituencyFilter
                ? "Filtered Elections"
                : "All Elections"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {elections.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No elections found</p>
              ) : (
                elections.map((election) => (
                  <div
                    key={election.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedElection === election.id
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-primary/50 hover:shadow-md"
                    }`}
                    onClick={() => loadElectionResults(election.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-800">{election.title}</h3>
                          {election.is_active ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Active</span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Completed</span>
                          )}
                          {election.constituency_name ? (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              Constituency-Specific
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                              General Election
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{election.description}</p>
                        {election.constituency_name && (
                          <p className="text-xs text-blue-600 mt-1">
                            📍 {election.constituency_name}, {election.district_name}, {election.state_name}
                          </p>
                        )}
                      </div>
                      <Button
                        variant={selectedElection === election.id ? "default" : "outline"}
                        size="sm"
                      >
                        View Results
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {selectedElection && !loading && resultsData.length > 0 && (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalVotes}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{resultsData.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Leading Candidate</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">{getWinner()?.candidate_name}</div>
                  <p className="text-xs text-muted-foreground">
                    {getWinner()?.party} - {getWinner()?.vote_count} votes
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vote Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={resultsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="candidate_name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="vote_count" fill="#8884d8" name="Votes" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Vote Share</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={resultsData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.candidate_name}: ${((entry.vote_count / totalVotes) * 100).toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="vote_count"
                      >
                        {resultsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Results Table */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Rank</th>
                        <th className="text-left p-3">Candidate</th>
                        <th className="text-left p-3">Party</th>
                        <th className="text-left p-3">Votes</th>
                        <th className="text-left p-3">Vote Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultsData.map((candidate, index) => (
                        <tr key={candidate.candidate_id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            {index === 0 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                                <Award className="h-3 w-3" />
                                #{index + 1}
                              </span>
                            ) : (
                              <span className="text-gray-600">#{index + 1}</span>
                            )}
                          </td>
                          <td className="p-3 font-medium">{candidate.candidate_name}</td>
                          <td className="p-3">{candidate.party}</td>
                          <td className="p-3">{candidate.vote_count}</td>
                          <td className="p-3">
                            {((candidate.vote_count / totalVotes) * 100).toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {selectedElection && !loading && resultsData.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">No votes recorded for this election yet</p>
            </CardContent>
          </Card>
        )}

        {loading && (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">Loading results...</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Results;
