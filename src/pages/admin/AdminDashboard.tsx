import React, { useEffect, useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Election {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ⚠️ Adjust these to match your real table columns in `candidates`
interface Candidate {
  id: string;
  election_id: string;
  constituency_id: string | null;
  name: string;
  party: string | null;
  bio: string | null;
}

// Used only on frontend for results display
interface CandidateResult {
  candidate_id: string;
  candidate_name: string;
  total_votes: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  // elections
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  // create election form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [savingElection, setSavingElection] = useState(false);

  // edit election
  const [editingElectionId, setEditingElectionId] = useState<string | null>(
    null
  );
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);

  // selected election for candidates/results
  const [selectedElectionId, setSelectedElectionId] = useState<string | null>(
    null
  );

  // candidates for selected election
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [candidateName, setCandidateName] = useState("");
  const [candidateParty, setCandidateParty] = useState("");
  const [candidateBio, setCandidateBio] = useState("");
  const [savingCandidate, setSavingCandidate] = useState(false);
  const [selectedConstituencyId, setSelectedConstituencyId] = useState<string | null>(null);

  // results
  const [results, setResults] = useState<CandidateResult[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);

  // ----------------- LOAD DASHBOARD DATA -----------------
  useEffect(() => {
    const load = async () => {
      // 1) check logged-in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error(userError);
        setErrorText("Error checking user session.");
        setLoading(false);
        return;
      }

      if (!user) {
        setErrorText("No user session. Please log in as admin.");
        setLoading(false);
        navigate("/admin/login");
        return;
      }

      // 2) check admin role
      const { data: roleRow, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (roleError) {
        console.error(roleError);
        setErrorText("Error checking admin role.");
        setLoading(false);
        return;
      }

      if (!roleRow || roleRow.role !== "admin") {
        setErrorText("You are logged in, but not as an admin.");
        setLoading(false);
        navigate("/");
        return;
      }

      // 3) load elections
      const { data, error } = await supabase
        .from("elections")
        .select("*")
        .order("start_date", { ascending: false });

      if (error) {
        console.error("Error loading elections:", error);
        setErrorText("Error loading elections.");
        setElections([]);
      } else {
        const mapped: Election[] = (data ?? []).map((row: any) => ({
          id: row.id,
          title: row.title,
          description: row.description,
          start_date: row.start_date,
          end_date: row.end_date,
          is_active: row.is_active,
          created_at: row.created_at,
          updated_at: row.updated_at,
        }));
        setElections(mapped);
        if (mapped.length > 0) {
          setSelectedElectionId(mapped[0].id);
        }
      }

      setLoading(false);
    };

    load();
  }, [navigate]);

  // When selected election changes, load candidates + results
  useEffect(() => {
    if (!selectedElectionId) return;
    loadCandidates(selectedElectionId);
    loadResults(selectedElectionId);
  }, [selectedElectionId]);

  // ----------------- LOAD CANDIDATES -----------------
  const loadCandidates = async (electionId: string) => {
    // ⚠️ If your table name is different, change "candidates" here.
    const { data, error } = await supabase
      .from("candidates")
      .select("*")
      .eq("election_id", electionId);

    if (error) {
      console.error("Error loading candidates:", error);
      setCandidates([]);
      return;
    }

    const mapped: Candidate[] = (data ?? []).map((row: any) => ({
      id: row.id,
      election_id: row.election_id,
      constituency_id: row.constituency_id ?? null,
      name: row.name,
      party: row.party ?? null,
      bio: row.bio ?? null,
    }));

    setCandidates(mapped);
  };

  // ----------------- LOAD RESULTS -----------------
  const loadResults = async (electionId: string) => {
    setLoadingResults(true);

    // ⚠️ Adjust "votes" table and column names to match your schema.
    const { data, error } = await supabase
      .from("votes")
      .select("candidate_id")
      .eq("election_id", electionId);

    if (error) {
      console.error("Error loading votes:", error);
      setResults([]);
      setLoadingResults(false);
      return;
    }

    const counts: Record<string, number> = {};
    for (const row of data ?? []) {
      const cid = (row as any).candidate_id;
      if (!cid) continue;
      counts[cid] = (counts[cid] || 0) + 1;
    }

    const res: CandidateResult[] = candidates.map((c) => ({
      candidate_id: c.id,
      candidate_name: c.name,
      total_votes: counts[c.id] || 0,
    }));

    setResults(res);
    setLoadingResults(false);
  };

  // ----------------- CREATE ELECTION -----------------
  const handleCreateElection = async (e: FormEvent) => {
    e.preventDefault();
    setErrorText(null);

    if (!title.trim()) {
      setErrorText("Title is required.");
      return;
    }
    if (!startDate || !endDate) {
      setErrorText("Start and end date/time are required.");
      return;
    }

    setSavingElection(true);

    const { data, error } = await supabase
      .from("elections")
      .insert([
        {
          title,
          description: description || null,
          start_date: startDate,
          end_date: endDate,
          is_active: isActive,
        },
      ])
      .select()
      .single();

    setSavingElection(false);

    if (error) {
      console.error("Error creating election:", error);
      setErrorText("Failed to create election.");
      return;
    }

    const newElection: Election = {
      id: data.id,
      title: data.title,
      description: data.description,
      start_date: data.start_date,
      end_date: data.end_date,
      is_active: data.is_active,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    setElections((prev) => [newElection, ...prev]);
    setSelectedElectionId(newElection.id);

    setTitle("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setIsActive(true);
  };

  // ----------------- START EDIT ELECTION -----------------
  const startEditElection = (election: Election) => {
    setEditingElectionId(election.id);
    setEditTitle(election.title);
    setEditDescription(election.description ?? "");
    setEditStartDate(election.start_date);
    setEditEndDate(election.end_date);
    setEditIsActive(election.is_active);
  };

  const cancelEditElection = () => {
    setEditingElectionId(null);
  };

  // ----------------- SAVE EDIT ELECTION -----------------
  const handleSaveEditElection = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingElectionId) return;

    const { data, error } = await supabase
      .from("elections")
      .update({
        title: editTitle,
        description: editDescription || null,
        start_date: editStartDate,
        end_date: editEndDate,
        is_active: editIsActive,
      })
      .eq("id", editingElectionId)
      .select()
      .single();

    if (error) {
      console.error("Error updating election:", error);
      setErrorText("Failed to update election.");
      return;
    }

    setElections((prev) =>
      prev.map((el) => (el.id === editingElectionId ? { ...el, ...data } : el))
    );

    setEditingElectionId(null);
  };

  // ----------------- DELETE ELECTION -----------------
  const handleDeleteElection = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this election?")) {
      return;
    }

    const { error } = await supabase
      .from("elections")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting election:", error);
      setErrorText("Failed to delete election.");
      return;
    }

    setElections((prev) => prev.filter((el) => el.id !== id));

    if (selectedElectionId === id) {
      setSelectedElectionId(elections[0]?.id ?? null);
    }
  };

  // ----------------- CREATE CANDIDATE -----------------
  const handleCreateCandidate = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedElectionId) {
      setErrorText("Select an election first.");
      return;
    }
    if (!candidateName.trim()) {
      setErrorText("Candidate name is required.");
      return;
    }

    setSavingCandidate(true);

    const { data, error } = await supabase
      .from("candidates") // ⚠️ change if table name differs
      .insert([
        {
          election_id: selectedElectionId,
          constituency_id: selectedConstituencyId,
          name: candidateName,
          party: candidateParty || null,
          bio: candidateBio || null,
        },
      ])
      .select()
      .single();

    setSavingCandidate(false);

    if (error) {
      console.error("Error creating candidate:", error);
      setErrorText("Failed to create candidate.");
      return;
    }

    const newCandidate: Candidate = {
      id: data.id,
      election_id: data.election_id,
      constituency_id: data.constituency_id,
      name: data.name,
      party: data.party ?? null,
      bio: data.bio ?? null,
    };

    setCandidates((prev) => [...prev, newCandidate]);

    setCandidateName("");
    setCandidateParty("");
    setCandidateBio("");

    // refresh results (new candidate with 0 votes)
    loadResults(selectedElectionId);
  };

  // ----------------- LOGOUT -----------------
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // ----------------- RENDER -----------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <p className="text-xl">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>

        {errorText && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {errorText}
          </div>
        )}

        {/* CREATE ELECTION FORM */}
        <section className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Create New Election</h2>
          <form onSubmit={handleCreateElection} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start date & time
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End date & time
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="isActive"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Is Active
              </label>
            </div>

            <button
              type="submit"
              disabled={savingElection}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg transition-colors"
            >
              {savingElection ? "Saving..." : "Create Election"}
            </button>
          </form>
        </section>

        {/* ELECTION LIST + EDIT/DELETE + SELECT */}
        <section className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Elections</h2>
          {elections.length === 0 ? (
            <p className="text-gray-500">No elections found.</p>
          ) : (
            <div className="space-y-4">
              {elections.map((election) => (
                <div
                  key={election.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedElectionId === election.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  {editingElectionId === election.id ? (
                    <form onSubmit={handleSaveEditElection} className="space-y-3">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start
                          </label>
                          <input
                            type="datetime-local"
                            value={editStartDate}
                            onChange={(e) => setEditStartDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            End
                          </label>
                          <input
                            type="datetime-local"
                            value={editEndDate}
                            onChange={(e) => setEditEndDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editIsActive}
                          onChange={(e) => setEditIsActive(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label className="text-sm font-medium text-gray-700">Is Active</label>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditElection}
                          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {election.title}
                          </h3>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            election.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {election.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-2">{election.description}</p>
                      <p className="text-sm text-gray-500 mb-3">
                        From: {new Date(election.start_date).toLocaleString()} To:{" "}
                        {new Date(election.end_date).toLocaleString()}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedElectionId(election.id)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                        >
                          Manage Candidates
                        </button>
                        <button
                          type="button"
                          onClick={() => startEditElection(election)}
                          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors text-sm"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteElection(election.id)}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* CANDIDATES & RESULTS FOR SELECTED ELECTION */}
        {selectedElectionId && (
          <section className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Manage Candidates
            </h2>

            {/* Create candidate */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Add New Candidate</h3>
              <form onSubmit={handleCreateCandidate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Candidate Name
                  </label>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Party
                  </label>
                  <input
                    type="text"
                    value={candidateParty}
                    onChange={(e) => setCandidateParty(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={candidateBio}
                    onChange={(e) => setCandidateBio(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingCandidate}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg transition-colors"
                >
                  {savingCandidate ? "Saving..." : "Add Candidate"}
                </button>
              </form>
            </div>

            {/* List candidates */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Candidates List</h3>
              {candidates.length === 0 ? (
                <p className="text-gray-500">No candidates added yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {candidates.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <h4 className="font-semibold text-gray-800">{c.name}</h4>
                      {c.party && (
                        <p className="text-sm text-blue-600 mt-1">{c.party}</p>
                      )}
                      {c.bio && (
                        <p className="text-sm text-gray-600 mt-2">{c.bio}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Results */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Results (Vote Counts)
              </h3>
              {loadingResults ? (
                <p className="text-gray-500">Loading results...</p>
              ) : results.length === 0 ? (
                <p className="text-gray-500">No votes recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {results
                    .sort((a, b) => b.total_votes - a.total_votes)
                    .map((r, index) => (
                      <div
                        key={r.candidate_id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-semibold text-sm">
                            {index + 1}
                          </span>
                          <span className="font-medium text-gray-800">
                            {r.candidate_name}
                          </span>
                        </div>
                        <span className="px-4 py-2 bg-blue-100 text-blue-800 font-semibold rounded-lg">
                          {r.total_votes} votes
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;