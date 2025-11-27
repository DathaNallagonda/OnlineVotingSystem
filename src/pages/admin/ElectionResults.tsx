import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, Users, Vote } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface CandidateResult {
  candidate_id: string;
  candidate_name: string;
  candidate_party: string | null;
  total_votes: number;
}

interface VoteDetail {
  id: string;
  user_email: string;
  candidate_name: string;
  candidate_party: string | null;
  voted_at: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const ElectionResults: React.FC = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const navigate = useNavigate();
  
  const [electionTitle, setElectionTitle] = useState("");
  const [results, setResults] = useState<CandidateResult[]>([]);
  const [voteDetails, setVoteDetails] = useState<VoteDetail[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [electionId]);

  const loadResults = async () => {
    if (!electionId) return;

    try {
      // Get election details
      const { data: election } = await supabase
        .from("elections")
        .select("title")
        .eq("id", electionId)
        .single();

      if (election) setElectionTitle(election.title);

      // Get vote counts by candidate
      const { data: votesData } = await supabase
        .from("votes")
        .select(`
          candidate_id,
          candidates (
            name,
            party
          )
        `)
        .eq("election_id", electionId);

      if (votesData) {
        // Count votes per candidate
        const voteCounts: { [key: string]: CandidateResult } = {};
        
        votesData.forEach((vote: any) => {
          const candidateId = vote.candidate_id;
          if (!voteCounts[candidateId]) {
            voteCounts[candidateId] = {
              candidate_id: candidateId,
              candidate_name: vote.candidates?.name || "Unknown",
              candidate_party: vote.candidates?.party || null,
              total_votes: 0
            };
          }
          voteCounts[candidateId].total_votes++;
        });

        const resultsArray = Object.values(voteCounts).sort((a, b) => b.total_votes - a.total_votes);
        setResults(resultsArray);
        setTotalVotes(votesData.length);
      }

      // Get detailed vote records
      const { data: detailsData } = await supabase
        .from("votes")
        .select(`
          id,
          created_at,
          user_id,
          candidates (
            name,
            party
          )
        `)
        .eq("election_id", electionId)
        .order("created_at", { ascending: false });

      if (detailsData) {
        // Get user emails
        const userIds = detailsData.map((v: any) => v.user_id);
        const { data: usersData } = await supabase.auth.admin.listUsers();
        
        const userMap: { [key: string]: string } = {};
        if (usersData?.users) {
          usersData.users.forEach((user: any) => {
            userMap[user.id] = user.email || "Unknown";
          });
        }

        const details: VoteDetail[] = detailsData.map((vote: any) => ({
          id: vote.id,
          user_email: userMap[vote.user_id] || "Unknown",
          candidate_name: vote.candidates?.name || "Unknown",
          candidate_party: vote.candidates?.party || null,
          voted_at: new Date(vote.created_at).toLocaleString()
        }));

        setVoteDetails(details);
      }
    } catch (error) {
      console.error("Error loading results:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <p className="text-gray-600">Loading results...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Button
              variant="outline"
              onClick={() => navigate("/admin/dashboard")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-800">{electionTitle}</h1>
            <p className="text-gray-600 mt-1">Election Results & Analytics</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Votes</CardTitle>
              <Vote className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800">{totalVotes}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Candidates</CardTitle>
              <Users className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800">{results.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Leading Candidate</CardTitle>
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-gray-800">
                {results[0]?.candidate_name || "N/A"}
              </div>
              <p className="text-sm text-gray-600">{results[0]?.total_votes || 0} votes</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Vote Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={results}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="candidate_name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total_votes" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Vote Share</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={results}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ candidate_name, total_votes }) => `${candidate_name}: ${total_votes}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total_votes"
                  >
                    {results.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Results Table */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Candidate Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold text-gray-700">Rank</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Candidate</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Party</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Votes</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr key={result.candidate_id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-semibold text-sm">
                          {index + 1}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-gray-800">{result.candidate_name}</td>
                      <td className="p-3 text-gray-600">{result.candidate_party || "Independent"}</td>
                      <td className="p-3 text-right font-semibold text-gray-800">{result.total_votes}</td>
                      <td className="p-3 text-right text-gray-600">
                        {totalVotes > 0 ? ((result.total_votes / totalVotes) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Vote Details */}
        <Card>
          <CardHeader>
            <CardTitle>Vote Details</CardTitle>
            <p className="text-sm text-gray-600 mt-1">Individual vote records</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold text-gray-700">Voter Email</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Candidate</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Party</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Voted At</th>
                  </tr>
                </thead>
                <tbody>
                  {voteDetails.map((vote) => (
                    <tr key={vote.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-gray-800">{vote.user_email}</td>
                      <td className="p-3 font-medium text-gray-800">{vote.candidate_name}</td>
                      <td className="p-3 text-gray-600">{vote.candidate_party || "Independent"}</td>
                      <td className="p-3 text-gray-600">{vote.voted_at}</td>
                    </tr>
                  ))}
                  {voteDetails.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-gray-500">
                        No votes recorded yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ElectionResults;
