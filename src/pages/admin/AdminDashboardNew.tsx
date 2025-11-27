import React, { useEffect, useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Trash2, Edit, BarChart3, Plus, X, Check } from "lucide-react";
import { toast } from "sonner";

// Interfaces
interface Election {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  constituency_id?: string | null;
  constituency_name?: string | null;
  district_name?: string | null;
  state_name?: string | null;
}

interface Candidate {
  id: string;
  election_id: string;
  constituency_id: string | null;
  name: string;
  party: string | null;
  bio: string | null;
}

interface State {
  id: string;
  name: string;
  code: string;
}

interface District {
  id: string;
  state_id: string;
  name: string;
}

interface Constituency {
  id: string;
  district_id: string;
  name: string;
  state_name?: string;
  district_name?: string;
}

interface Vote {
  id: string;
  user_id: string;
  election_id: string;
  candidate_id: string;
  voted_at: string;
  user_email?: string;
  candidate_name?: string;
  election_title?: string;
  constituency_id?: string | null;
  constituency_name?: string | null;
  district_id?: string | null;
  district_name?: string | null;
  state_id?: string | null;
}

const AdminDashboardNew: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("elections");

  // Elections
  const [elections, setElections] = useState<Election[]>([]);
  const [allElections, setAllElections] = useState<Election[]>([]);
  const [electionForm, setElectionForm] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    is_active: true,
    constituency_id: ""
  });
  const [editingElection, setEditingElection] = useState<string | null>(null);
  
  // Location selection for election
  const [selectedStateForElection, setSelectedStateForElection] = useState<string>("");
  const [selectedDistrictForElection, setSelectedDistrictForElection] = useState<string>("");
  const [filteredDistrictsForElection, setFilteredDistrictsForElection] = useState<District[]>([]);
  const [filteredConstituenciesForElection, setFilteredConstituenciesForElection] = useState<Constituency[]>([]);
  
  // Filters for election list
  const [stateFilterForElections, setStateFilterForElections] = useState<string>("");
  const [districtFilterForElections, setDistrictFilterForElections] = useState<string>("");
  const [constituencyFilterForElections, setConstituencyFilterForElections] = useState<string>("");
  const [filteredDistrictsForElectionList, setFilteredDistrictsForElectionList] = useState<District[]>([]);
  const [filteredConstituenciesForElectionList, setFilteredConstituenciesForElectionList] = useState<Constituency[]>([]);

  // Candidates
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
  const [candidateForm, setCandidateForm] = useState({
    election_id: "",
    constituency_id: "",
    name: "",
    party: "",
    bio: ""
  });
  const [editingCandidate, setEditingCandidate] = useState<string | null>(null);
  const [selectedStateForCandidate, setSelectedStateForCandidate] = useState<string>("");
  const [selectedDistrictForCandidate, setSelectedDistrictForCandidate] = useState<string>("");
  const [filteredDistrictsForCandidate, setFilteredDistrictsForCandidate] = useState<District[]>([]);
  const [filteredConstituenciesForCandidate, setFilteredConstituenciesForCandidate] = useState<Constituency[]>([]);
  
  // Filters for candidate list
  const [stateFilterForList, setStateFilterForList] = useState<string>("");
  const [districtFilterForList, setDistrictFilterForList] = useState<string>("");
  const [constituencyFilterForList, setConstituencyFilterForList] = useState<string>("");
  const [filteredDistrictsForList, setFilteredDistrictsForList] = useState<District[]>([]);
  const [filteredConstituenciesForList, setFilteredConstituenciesForList] = useState<Constituency[]>([]);

  // States
  const [states, setStates] = useState<State[]>([]);
  const [stateForm, setStateForm] = useState({ name: "", code: "" });
  const [editingState, setEditingState] = useState<string | null>(null);

  // Districts
  const [districts, setDistricts] = useState<District[]>([]);
  const [allDistricts, setAllDistricts] = useState<District[]>([]);
  const [districtForm, setDistrictForm] = useState({ state_id: "", name: "" });
  const [editingDistrict, setEditingDistrict] = useState<string | null>(null);
  const [selectedStateFilterForDistricts, setSelectedStateFilterForDistricts] = useState<string>("");

  // Constituencies
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [allConstituencies, setAllConstituencies] = useState<Constituency[]>([]);
  const [constituencyForm, setConstituencyForm] = useState({ district_id: "", name: "" });
  const [editingConstituency, setEditingConstituency] = useState<string | null>(null);
  const [selectedStateForConstituency, setSelectedStateForConstituency] = useState<string>("");
  const [filteredDistrictsForConstituency, setFilteredDistrictsForConstituency] = useState<District[]>([]);
  
  // Filters for constituency list
  const [stateFilterForConstituencyList, setStateFilterForConstituencyList] = useState<string>("");
  const [districtFilterForConstituencyList, setDistrictFilterForConstituencyList] = useState<string>("");
  const [filteredDistrictsForConstituencyList, setFilteredDistrictsForConstituencyList] = useState<District[]>([]);

  // Votes
  const [votes, setVotes] = useState<Vote[]>([]);
  const [allVotes, setAllVotes] = useState<Vote[]>([]);
  const [voteForm, setVoteForm] = useState({
    user_email: "",
    election_id: "",
    candidate_id: ""
  });
  const [editingVote, setEditingVote] = useState<string | null>(null);
  const [selectedElectionFilter, setSelectedElectionFilter] = useState<string>("");
  const [stateFilterForVotes, setStateFilterForVotes] = useState<string>("");
  const [districtFilterForVotes, setDistrictFilterForVotes] = useState<string>("");
  const [constituencyFilterForVotes, setConstituencyFilterForVotes] = useState<string>("");
  const [filteredDistrictsForVotes, setFilteredDistrictsForVotes] = useState<District[]>([]);
  const [filteredConstituenciesForVotes, setFilteredConstituenciesForVotes] = useState<Constituency[]>([]);
  const [filteredCandidatesForVote, setFilteredCandidatesForVote] = useState<Candidate[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (activeTab === "elections") loadElections();
    else if (activeTab === "candidates") loadCandidates();
    else if (activeTab === "states") loadStates();
    else if (activeTab === "districts") loadDistricts();
    else if (activeTab === "constituencies") loadConstituencies();
    else if (activeTab === "votes") loadVotes();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "votes") {
      applyVotesFilters();
    }
  }, [selectedElectionFilter, stateFilterForVotes, districtFilterForVotes, constituencyFilterForVotes]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/admin/login");
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!roleData || roleData.role !== "admin") {
      toast.error("Access denied. Admin only.");
      navigate("/");
      return;
    }

    setLoading(false);
    loadElections();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  // ==================== ELECTIONS ====================
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
      const formattedData = data.map((e: any) => ({
        ...e,
        constituency_name: e.constituencies?.name || null,
        district_name: e.constituencies?.districts?.name || null,
        state_name: e.constituencies?.districts?.states?.name || null
      }));
      setAllElections(formattedData);
      setElections(formattedData);
    }
  };

  const handleStateFilterForElections = async (stateId: string) => {
    setStateFilterForElections(stateId);
    setDistrictFilterForElections("");
    setConstituencyFilterForElections("");
    setFilteredConstituenciesForElectionList([]);
    
    if (stateId) {
      const { data: districtsData } = await supabase
        .from("districts")
        .select("*")
        .eq("state_id", stateId)
        .order("name");
      
      if (districtsData) setFilteredDistrictsForElectionList(districtsData);
      
      const filtered = allElections.filter((e: any) => 
        e.constituencies?.districts?.state_id === stateId
      );
      setElections(filtered.length > 0 ? filtered : allElections.filter(e => !e.constituency_id));
    } else {
      setFilteredDistrictsForElectionList([]);
      setElections(allElections);
    }
  };

  const handleDistrictFilterForElections = async (districtId: string) => {
    setDistrictFilterForElections(districtId);
    setConstituencyFilterForElections("");
    
    if (districtId) {
      const { data: constituenciesData } = await supabase
        .from("constituencies")
        .select("*")
        .eq("district_id", districtId)
        .order("name");
      
      if (constituenciesData) setFilteredConstituenciesForElectionList(constituenciesData);
      
      const filtered = allElections.filter((e: any) => 
        e.constituencies?.district_id === districtId
      );
      setElections(filtered.length > 0 ? filtered : allElections.filter(e => !e.constituency_id));
    } else if (stateFilterForElections) {
      setFilteredConstituenciesForElectionList([]);
      const filtered = allElections.filter((e: any) => 
        e.constituencies?.districts?.state_id === stateFilterForElections
      );
      setElections(filtered.length > 0 ? filtered : allElections.filter(e => !e.constituency_id));
    } else {
      setFilteredConstituenciesForElectionList([]);
      setElections(allElections);
    }
  };

  const handleConstituencyFilterForElections = (constituencyId: string) => {
    setConstituencyFilterForElections(constituencyId);
    
    if (constituencyId) {
      const filtered = allElections.filter(e => e.constituency_id === constituencyId);
      setElections(filtered);
    } else if (districtFilterForElections) {
      const filtered = allElections.filter((e: any) => 
        e.constituencies?.district_id === districtFilterForElections
      );
      setElections(filtered.length > 0 ? filtered : allElections.filter(e => !e.constituency_id));
    } else if (stateFilterForElections) {
      const filtered = allElections.filter((e: any) => 
        e.constituencies?.districts?.state_id === stateFilterForElections
      );
      setElections(filtered.length > 0 ? filtered : allElections.filter(e => !e.constituency_id));
    } else {
      setElections(allElections);
    }
  };

  const handleStateChangeForElection = async (stateId: string) => {
    setSelectedStateForElection(stateId);
    setSelectedDistrictForElection("");
    setElectionForm({ ...electionForm, constituency_id: "" });
    setFilteredConstituenciesForElection([]);
    
    if (stateId) {
      const { data } = await supabase
        .from("districts")
        .select("*")
        .eq("state_id", stateId)
        .order("name");
      
      if (data) setFilteredDistrictsForElection(data);
    } else {
      setFilteredDistrictsForElection([]);
    }
  };

  const handleDistrictChangeForElection = async (districtId: string) => {
    setSelectedDistrictForElection(districtId);
    setElectionForm({ ...electionForm, constituency_id: "" });
    
    if (districtId) {
      const { data } = await supabase
        .from("constituencies")
        .select("*")
        .eq("district_id", districtId)
        .order("name");
      
      if (data) setFilteredConstituenciesForElection(data);
    } else {
      setFilteredConstituenciesForElection([]);
    }
  };

  const handleElectionSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...electionForm,
      constituency_id: electionForm.constituency_id || null
    };
    
    if (editingElection) {
      const { error } = await supabase
        .from("elections")
        .update(payload)
        .eq("id", editingElection);
      
      if (error) {
        console.error("Election update error:", error);
        toast.error(`Failed to update election: ${error.message}`);
      } else {
        toast.success("Election updated successfully");
        setEditingElection(null);
        resetElectionForm();
        loadElections();
      }
    } else {
      const { error } = await supabase
        .from("elections")
        .insert([payload]);
      
      if (error) {
        console.error("Election creation error:", error);
        toast.error(`Failed to create election: ${error.message}`);
      } else {
        toast.success("Election created successfully");
        resetElectionForm();
        loadElections();
      }
    }
  };

  const handleEditElection = (election: Election) => {
    setEditingElection(election.id);
    setElectionForm({
      title: election.title,
      description: election.description || "",
      start_date: election.start_date,
      end_date: election.end_date,
      is_active: election.is_active,
      constituency_id: election.constituency_id || ""
    });
  };

  const handleToggleElectionStatus = async (electionId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("elections")
      .update({ is_active: !currentStatus })
      .eq("id", electionId);
    
    if (error) {
      toast.error("Failed to update election status");
    } else {
      toast.success(`Election ${!currentStatus ? 'started' : 'stopped'} successfully`);
      loadElections();
    }
  };

  const handleDeleteElection = async (id: string) => {
    if (!confirm("Are you sure? This will delete all related candidates and votes.")) return;
    
    const { error } = await supabase
      .from("elections")
      .delete()
      .eq("id", id);
    
    if (error) {
      toast.error("Failed to delete election");
    } else {
      toast.success("Election deleted successfully");
      loadElections();
    }
  };

  const resetElectionForm = () => {
    setElectionForm({
      title: "",
      description: "",
      start_date: "",
      end_date: "",
      is_active: true,
      constituency_id: ""
    });
    setEditingElection(null);
    setSelectedStateForElection("");
    setSelectedDistrictForElection("");
    setFilteredDistrictsForElection([]);
    setFilteredConstituenciesForElection([]);
  };

  // ==================== CANDIDATES ====================
  const loadCandidates = async () => {
    const { data } = await supabase
      .from("candidates")
      .select(`
        *,
        constituencies (
          id,
          name,
          district_id,
          districts (
            id,
            name,
            state_id
          )
        )
      `)
      .order("name");
    if (data) {
      setAllCandidates(data);
      setCandidates(data);
    }
  };

  const handleStateFilterForList = async (stateId: string) => {
    setStateFilterForList(stateId);
    setDistrictFilterForList("");
    setConstituencyFilterForList("");
    setFilteredConstituenciesForList([]);
    
    if (stateId) {
      // Load districts for this state
      const { data: districtsData } = await supabase
        .from("districts")
        .select("*")
        .eq("state_id", stateId)
        .order("name");
      
      if (districtsData) setFilteredDistrictsForList(districtsData);
      
      // Filter candidates by state
      const filtered = allCandidates.filter((c: any) => 
        c.constituencies?.districts?.state_id === stateId
      );
      setCandidates(filtered);
    } else {
      setFilteredDistrictsForList([]);
      setCandidates(allCandidates);
    }
  };

  const handleDistrictFilterForList = async (districtId: string) => {
    setDistrictFilterForList(districtId);
    setConstituencyFilterForList("");
    
    if (districtId) {
      // Load constituencies for this district
      const { data: constituenciesData } = await supabase
        .from("constituencies")
        .select("*")
        .eq("district_id", districtId)
        .order("name");
      
      if (constituenciesData) setFilteredConstituenciesForList(constituenciesData);
      
      // Filter candidates by district
      const filtered = allCandidates.filter((c: any) => 
        c.constituencies?.district_id === districtId
      );
      setCandidates(filtered);
    } else if (stateFilterForList) {
      setFilteredConstituenciesForList([]);
      // If district cleared but state selected, show all candidates in state
      const filtered = allCandidates.filter((c: any) => 
        c.constituencies?.districts?.state_id === stateFilterForList
      );
      setCandidates(filtered);
    } else {
      setFilteredConstituenciesForList([]);
      setCandidates(allCandidates);
    }
  };

  const handleConstituencyFilterForList = (constituencyId: string) => {
    setConstituencyFilterForList(constituencyId);
    
    if (constituencyId) {
      // Filter candidates by constituency
      const filtered = allCandidates.filter((c: any) => 
        c.constituency_id === constituencyId
      );
      setCandidates(filtered);
    } else if (districtFilterForList) {
      // If constituency cleared but district selected, show all candidates in district
      const filtered = allCandidates.filter((c: any) => 
        c.constituencies?.district_id === districtFilterForList
      );
      setCandidates(filtered);
    } else if (stateFilterForList) {
      // If constituency cleared but state selected, show all candidates in state
      const filtered = allCandidates.filter((c: any) => 
        c.constituencies?.districts?.state_id === stateFilterForList
      );
      setCandidates(filtered);
    } else {
      setCandidates(allCandidates);
    }
  };

  const handleCandidateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...candidateForm,
      constituency_id: candidateForm.constituency_id || null
    };

    if (editingCandidate) {
      const { error } = await supabase
        .from("candidates")
        .update(payload)
        .eq("id", editingCandidate);
      
      if (error) {
        console.error("Candidate update error:", error);
        toast.error(`Failed to update candidate: ${error.message}`);
      } else {
        toast.success("Candidate updated successfully");
        setEditingCandidate(null);
        resetCandidateForm();
        loadCandidates();
      }
    } else {
      const { error } = await supabase
        .from("candidates")
        .insert([payload]);
      
      if (error) {
        console.error("Candidate creation error:", error);
        toast.error(`Failed to create candidate: ${error.message}`);
      } else {
        toast.success("Candidate created successfully");
        resetCandidateForm();
        loadCandidates();
      }
    }
  };

  const handleEditCandidate = (candidate: Candidate) => {
    setEditingCandidate(candidate.id);
    setCandidateForm({
      election_id: candidate.election_id,
      constituency_id: candidate.constituency_id || "",
      name: candidate.name,
      party: candidate.party || "",
      bio: candidate.bio || ""
    });
  };

  const handleDeleteCandidate = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    
    const { error } = await supabase
      .from("candidates")
      .delete()
      .eq("id", id);
    
    if (error) {
      toast.error("Failed to delete candidate");
    } else {
      toast.success("Candidate deleted successfully");
      loadCandidates();
    }
  };

  const resetCandidateForm = () => {
    setCandidateForm({
      election_id: "",
      constituency_id: "",
      name: "",
      party: "",
      bio: ""
    });
    setEditingCandidate(null);
    setSelectedStateForCandidate("");
    setSelectedDistrictForCandidate("");
    setFilteredDistrictsForCandidate([]);
    setFilteredConstituenciesForCandidate([]);
  };

  const handleStateChangeForCandidate = async (stateId: string) => {
    setSelectedStateForCandidate(stateId);
    setSelectedDistrictForCandidate("");
    setCandidateForm({ ...candidateForm, constituency_id: "" });
    setFilteredConstituenciesForCandidate([]);
    
    if (stateId) {
      const { data } = await supabase
        .from("districts")
        .select("*")
        .eq("state_id", stateId)
        .order("name");
      
      if (data) setFilteredDistrictsForCandidate(data);
    } else {
      setFilteredDistrictsForCandidate([]);
    }
  };

  const handleDistrictChangeForCandidate = async (districtId: string) => {
    setSelectedDistrictForCandidate(districtId);
    setCandidateForm({ ...candidateForm, constituency_id: "" });
    
    if (districtId) {
      const { data } = await supabase
        .from("constituencies")
        .select("*")
        .eq("district_id", districtId)
        .order("name");
      
      if (data) setFilteredConstituenciesForCandidate(data);
    } else {
      setFilteredConstituenciesForCandidate([]);
    }
  };

  // ==================== STATES ====================
  const loadStates = async () => {
    const { data } = await supabase
      .from("states")
      .select("*")
      .order("name");
    if (data) setStates(data);
  };

  const handleStateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (editingState) {
      const { error } = await supabase
        .from("states")
        .update(stateForm)
        .eq("id", editingState);
      
      if (error) {
        toast.error("Failed to update state");
      } else {
        toast.success("State updated successfully");
        setEditingState(null);
        resetStateForm();
        loadStates();
      }
    } else {
      const { error } = await supabase
        .from("states")
        .insert([stateForm]);
      
      if (error) {
        console.error("State creation error:", error);
        toast.error(`Failed to create state: ${error.message}`);
      } else {
        toast.success("State created successfully");
        resetStateForm();
        loadStates();
      }
    }
  };

  const handleEditState = (state: State) => {
    setEditingState(state.id);
    setStateForm({ name: state.name, code: state.code });
  };

  const handleDeleteState = async (id: string) => {
    if (!confirm("Are you sure? This will delete all related districts and constituencies.")) return;
    
    const { error } = await supabase
      .from("states")
      .delete()
      .eq("id", id);
    
    if (error) {
      toast.error("Failed to delete state");
    } else {
      toast.success("State deleted successfully");
      loadStates();
    }
  };

  const resetStateForm = () => {
    setStateForm({ name: "", code: "" });
    setEditingState(null);
  };

  // ==================== DISTRICTS ====================
  const loadDistricts = async () => {
    const { data } = await supabase
      .from("districts")
      .select("*")
      .order("name");
    if (data) {
      setAllDistricts(data);
      setDistricts(data);
    }
  };

  const filterDistrictsByState = (stateId: string) => {
    setSelectedStateFilterForDistricts(stateId);
    if (stateId) {
      const filtered = allDistricts.filter(d => d.state_id === stateId);
      setDistricts(filtered);
    } else {
      setDistricts(allDistricts);
    }
  };

  const handleDistrictSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (editingDistrict) {
      const { error } = await supabase
        .from("districts")
        .update(districtForm)
        .eq("id", editingDistrict);
      
      if (error) {
        toast.error("Failed to update district");
      } else {
        toast.success("District updated successfully");
        setEditingDistrict(null);
        resetDistrictForm();
        loadDistricts();
      }
    } else {
      const { error } = await supabase
        .from("districts")
        .insert([districtForm]);
      
      if (error) {
        console.error("District creation error:", error);
        toast.error(`Failed to create district: ${error.message}`);
      } else {
        toast.success("District created successfully");
        resetDistrictForm();
        loadDistricts();
      }
    }
  };

  const handleEditDistrict = (district: District) => {
    setEditingDistrict(district.id);
    setDistrictForm({ state_id: district.state_id, name: district.name });
  };

  const handleDeleteDistrict = async (id: string) => {
    if (!confirm("Are you sure? This will delete all related constituencies.")) return;
    
    const { error } = await supabase
      .from("districts")
      .delete()
      .eq("id", id);
    
    if (error) {
      toast.error("Failed to delete district");
    } else {
      toast.success("District deleted successfully");
      loadDistricts();
    }
  };

  const resetDistrictForm = () => {
    setDistrictForm({ state_id: "", name: "" });
    setEditingDistrict(null);
  };

  // ==================== CONSTITUENCIES ====================
  const loadConstituencies = async () => {
    const { data } = await supabase
      .from("constituencies")
      .select(`
        *,
        districts (
          id,
          name,
          state_id,
          states (
            id,
            name
          )
        )
      `)
      .order("name");
    
    if (data) {
      const formattedData = data.map((c: any) => ({
        ...c,
        district_name: c.districts?.name,
        state_name: c.districts?.states?.name,
        state_id: c.districts?.state_id
      }));
      setAllConstituencies(formattedData);
      setConstituencies(formattedData);
    }
  };

  const handleStateFilterForConstituencyList = async (stateId: string) => {
    setStateFilterForConstituencyList(stateId);
    setDistrictFilterForConstituencyList("");
    
    if (stateId) {
      // Load districts for this state
      const { data: districtsData } = await supabase
        .from("districts")
        .select("*")
        .eq("state_id", stateId)
        .order("name");
      
      if (districtsData) setFilteredDistrictsForConstituencyList(districtsData);
      
      // Filter constituencies by state
      const filtered = allConstituencies.filter((c: any) => c.state_id === stateId);
      setConstituencies(filtered);
    } else {
      setFilteredDistrictsForConstituencyList([]);
      setConstituencies(allConstituencies);
    }
  };

  const handleDistrictFilterForConstituencyList = (districtId: string) => {
    setDistrictFilterForConstituencyList(districtId);
    
    if (districtId) {
      // Filter constituencies by district
      const filtered = allConstituencies.filter((c: any) => c.district_id === districtId);
      setConstituencies(filtered);
    } else if (stateFilterForConstituencyList) {
      // If district cleared but state selected, show all constituencies in state
      const filtered = allConstituencies.filter((c: any) => c.state_id === stateFilterForConstituencyList);
      setConstituencies(filtered);
    } else {
      setConstituencies(allConstituencies);
    }
  };

  const handleConstituencySubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (editingConstituency) {
      const { error } = await supabase
        .from("constituencies")
        .update(constituencyForm)
        .eq("id", editingConstituency);
      
      if (error) {
        toast.error("Failed to update constituency");
      } else {
        toast.success("Constituency updated successfully");
        setEditingConstituency(null);
        resetConstituencyForm();
        loadConstituencies();
      }
    } else {
      const { error } = await supabase
        .from("constituencies")
        .insert([constituencyForm]);
      
      if (error) {
        console.error("Constituency creation error:", error);
        toast.error(`Failed to create constituency: ${error.message}`);
      } else {
        toast.success("Constituency created successfully");
        resetConstituencyForm();
        loadConstituencies();
      }
    }
  };

  const handleEditConstituency = (constituency: Constituency) => {
    setEditingConstituency(constituency.id);
    setConstituencyForm({
      district_id: constituency.district_id,
      name: constituency.name
    });
  };

  const handleDeleteConstituency = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    
    const { error } = await supabase
      .from("constituencies")
      .delete()
      .eq("id", id);
    
    if (error) {
      toast.error("Failed to delete constituency");
    } else {
      toast.success("Constituency deleted successfully");
      loadConstituencies();
    }
  };

  const resetConstituencyForm = () => {
    setConstituencyForm({ district_id: "", name: "" });
    setEditingConstituency(null);
    setSelectedStateForConstituency("");
    setFilteredDistrictsForConstituency([]);
  };

  const handleStateChangeForConstituency = async (stateId: string) => {
    setSelectedStateForConstituency(stateId);
    setConstituencyForm({ ...constituencyForm, district_id: "" });
    
    if (stateId) {
      const { data } = await supabase
        .from("districts")
        .select("*")
        .eq("state_id", stateId)
        .order("name");
      
      if (data) setFilteredDistrictsForConstituency(data);
    } else {
      setFilteredDistrictsForConstituency([]);
    }
  };

  // ==================== VOTES ====================
  const loadVotes = async () => {
    const { data, error } = await supabase
      .from("votes")
      .select(`
        *,
        candidates (
          name,
          constituency_id,
          constituencies (
            id,
            name,
            district_id,
            districts (
              id,
              name,
              state_id
            )
          )
        ),
        elections (title)
      `)
      .order("voted_at", { ascending: false });
    
    if (error) {
      console.error("Error loading votes:", error);
      toast.error("Failed to load votes");
      return;
    }

    if (data) {
      console.log("Votes loaded:", data.length);
      
      // Get user emails from profiles table
      const userIds = [...new Set(data.map((v: any) => v.user_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", userIds);
      
      const userMap: { [key: string]: string } = {};
      if (profilesError) {
        console.error("Error loading profiles:", profilesError);
        // Use user_id as fallback
        data.forEach((v: any) => {
          userMap[v.user_id] = v.user_id.substring(0, 8) + "...";
        });
      } else if (profilesData) {
        profilesData.forEach((profile: any) => {
          userMap[profile.id] = profile.email || "Unknown";
        });
      }

      const formattedVotes = data.map((v: any) => ({
        ...v,
        user_email: userMap[v.user_id] || "Unknown",
        candidate_name: v.candidates?.name || "Unknown",
        election_title: v.elections?.title || "Unknown",
        constituency_id: v.candidates?.constituency_id || null,
        constituency_name: v.candidates?.constituencies?.name || null,
        district_id: v.candidates?.constituencies?.district_id || null,
        district_name: v.candidates?.constituencies?.districts?.name || null,
        state_id: v.candidates?.constituencies?.districts?.state_id || null
      }));

      console.log("Formatted votes:", formattedVotes.length);
      setAllVotes(formattedVotes);
      setVotes(formattedVotes);
    } else {
      console.log("No votes data returned");
    }
  };

  const applyVotesFilters = () => {
    let filtered = [...allVotes];

    // Filter by election
    if (selectedElectionFilter) {
      filtered = filtered.filter(v => v.election_id === selectedElectionFilter);
    }

    // Filter by state
    if (stateFilterForVotes) {
      filtered = filtered.filter(v => v.state_id === stateFilterForVotes);
    }

    // Filter by district
    if (districtFilterForVotes) {
      filtered = filtered.filter(v => v.district_id === districtFilterForVotes);
    }

    // Filter by constituency
    if (constituencyFilterForVotes) {
      filtered = filtered.filter(v => v.constituency_id === constituencyFilterForVotes);
    }

    setVotes(filtered);
  };

  const handleStateFilterForVotes = async (stateId: string) => {
    setStateFilterForVotes(stateId);
    setDistrictFilterForVotes("");
    setConstituencyFilterForVotes("");
    setFilteredConstituenciesForVotes([]);
    
    if (stateId) {
      // Load districts for this state
      const { data: districtsData } = await supabase
        .from("districts")
        .select("*")
        .eq("state_id", stateId)
        .order("name");
      
      if (districtsData) setFilteredDistrictsForVotes(districtsData);
    } else {
      setFilteredDistrictsForVotes([]);
    }
  };

  const handleDistrictFilterForVotes = async (districtId: string) => {
    setDistrictFilterForVotes(districtId);
    setConstituencyFilterForVotes("");
    
    if (districtId) {
      // Load constituencies for this district
      const { data: constituenciesData } = await supabase
        .from("constituencies")
        .select("*")
        .eq("district_id", districtId)
        .order("name");
      
      if (constituenciesData) setFilteredConstituenciesForVotes(constituenciesData);
    } else {
      setFilteredConstituenciesForVotes([]);
    }
  };

  const handleVoteElectionChange = async (electionId: string) => {
    setVoteForm({ ...voteForm, election_id: electionId, candidate_id: "" });
    
    if (electionId) {
      const { data } = await supabase
        .from("candidates")
        .select("*")
        .eq("election_id", electionId)
        .order("name");
      
      if (data) setFilteredCandidatesForVote(data);
    } else {
      setFilteredCandidatesForVote([]);
    }
  };

  const handleVoteSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Get user ID from email via profiles table
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", voteForm.user_email)
      .single();
    
    if (profileError || !profileData) {
      console.error("Profile lookup error:", profileError);
      toast.error("User not found with this email");
      return;
    }

    const payload = {
      user_id: profileData.id,
      election_id: voteForm.election_id,
      candidate_id: voteForm.candidate_id
    };

    if (editingVote) {
      const { error } = await supabase
        .from("votes")
        .update(payload)
        .eq("id", editingVote);
      
      if (error) {
        console.error("Vote update error:", error);
        toast.error(`Failed to update vote: ${error.message}`);
      } else {
        toast.success("Vote updated successfully");
        setEditingVote(null);
        resetVoteForm();
        loadVotes();
      }
    } else {
      const { error } = await supabase
        .from("votes")
        .insert([payload]);
      
      if (error) {
        console.error("Vote creation error:", error);
        toast.error(`Failed to create vote: ${error.message}`);
      } else {
        toast.success("Vote created successfully");
        resetVoteForm();
        loadVotes();
      }
    }
  };

  const handleEditVote = async (vote: Vote) => {
    setEditingVote(vote.id);
    setVoteForm({
      user_email: vote.user_email || "",
      election_id: vote.election_id,
      candidate_id: vote.candidate_id
    });
    
    // Load candidates for the election
    const { data } = await supabase
      .from("candidates")
      .select("*")
      .eq("election_id", vote.election_id)
      .order("name");
    
    if (data) setFilteredCandidatesForVote(data);
  };

  const resetVoteForm = () => {
    setVoteForm({
      user_email: "",
      election_id: "",
      candidate_id: ""
    });
    setEditingVote(null);
    setFilteredCandidatesForVote([]);
  };

  const handleDeleteVote = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vote?")) return;
    
    const { error } = await supabase
      .from("votes")
      .delete()
      .eq("id", id);
    
    if (error) {
      toast.error("Failed to delete vote");
    } else {
      toast.success("Vote deleted successfully");
      loadVotes();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white p-1 rounded-lg shadow-sm">
            <TabsTrigger value="elections">Elections</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="votes">Votes</TabsTrigger>
            <TabsTrigger value="states">States</TabsTrigger>
            <TabsTrigger value="districts">Districts</TabsTrigger>
            <TabsTrigger value="constituencies">Constituencies</TabsTrigger>
          </TabsList>

          {/* ELECTIONS TAB */}
          <TabsContent value="elections" className="space-y-6">
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
                      value={stateFilterForElections}
                      onChange={(e) => handleStateFilterForElections(e.target.value)}
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
                      value={districtFilterForElections}
                      onChange={(e) => handleDistrictFilterForElections(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={!stateFilterForElections}
                    >
                      <option value="">All Districts</option>
                      {filteredDistrictsForElectionList.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Filter by Constituency
                    </label>
                    <select
                      value={constituencyFilterForElections}
                      onChange={(e) => handleConstituencyFilterForElections(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={!districtFilterForElections}
                    >
                      <option value="">All Constituencies</option>
                      {filteredConstituenciesForElectionList.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{editingElection ? "Edit Election" : "Create Election"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleElectionSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        value={electionForm.title}
                        onChange={(e) => setElectionForm({ ...electionForm, title: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <input
                        type="text"
                        value={electionForm.description}
                        onChange={(e) => setElectionForm({ ...electionForm, description: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <input
                        type="datetime-local"
                        value={electionForm.start_date}
                        onChange={(e) => setElectionForm({ ...electionForm, start_date: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                      <input
                        type="datetime-local"
                        value={electionForm.end_date}
                        onChange={(e) => setElectionForm({ ...electionForm, end_date: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      Constituency Scope (Optional - leave blank for general election)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                        <select
                          value={selectedStateForElection}
                          onChange={(e) => handleStateChangeForElection(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select State</option>
                          {states.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                        <select
                          value={selectedDistrictForElection}
                          onChange={(e) => handleDistrictChangeForElection(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          disabled={!selectedStateForElection}
                        >
                          <option value="">Select District</option>
                          {filteredDistrictsForElection.map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Constituency</label>
                        <select
                          value={electionForm.constituency_id}
                          onChange={(e) => setElectionForm({ ...electionForm, constituency_id: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          disabled={!selectedDistrictForElection}
                        >
                          <option value="">Select Constituency</option>
                          {filteredConstituenciesForElection.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={electionForm.is_active}
                      onChange={(e) => setElectionForm({ ...electionForm, is_active: e.target.checked })}
                      className="rounded"
                    />
                    <label className="text-sm font-medium text-gray-700">Active Election</label>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingElection ? <Check className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                      {editingElection ? "Update" : "Create"}
                    </Button>
                    {editingElection && (
                      <Button type="button" variant="outline" onClick={resetElectionForm}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {stateFilterForElections || districtFilterForElections || constituencyFilterForElections
                    ? "Filtered Elections"
                    : "All Elections"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {elections.map((election) => (
                    <div key={election.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-800">{election.title}</h3>
                            {election.is_active ? (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Active</span>
                            ) : (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Inactive</span>
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
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(election.start_date).toLocaleString()} - {new Date(election.end_date).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant={election.is_active ? "destructive" : "default"}
                            size="sm"
                            onClick={() => handleToggleElectionStatus(election.id, election.is_active)}
                            title={election.is_active ? "Stop Election" : "Start Election"}
                          >
                            {election.is_active ? "Stop" : "Start"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/results/${election.id}`)}
                          >
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditElection(election)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteElection(election.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CANDIDATES TAB */}
          <TabsContent value="candidates" className="space-y-6">
            {/* Filter Section */}
            <Card>
              <CardHeader>
                <CardTitle>Filter Candidates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Filter by State
                    </label>
                    <select
                      value={stateFilterForList}
                      onChange={(e) => handleStateFilterForList(e.target.value)}
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
                      value={districtFilterForList}
                      onChange={(e) => handleDistrictFilterForList(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={!stateFilterForList}
                    >
                      <option value="">All Districts</option>
                      {filteredDistrictsForList.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Filter by Constituency
                    </label>
                    <select
                      value={constituencyFilterForList}
                      onChange={(e) => handleConstituencyFilterForList(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={!districtFilterForList}
                    >
                      <option value="">All Constituencies</option>
                      {filteredConstituenciesForList.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{editingCandidate ? "Edit Candidate" : "Create Candidate"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCandidateSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Election</label>
                      <select
                        value={candidateForm.election_id}
                        onChange={(e) => setCandidateForm({ ...candidateForm, election_id: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Election</option>
                        {elections.map((e) => (
                          <option key={e.id} value={e.id}>{e.title}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        value={candidateForm.name}
                        onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Party</label>
                      <input
                        type="text"
                        value={candidateForm.party}
                        onChange={(e) => setCandidateForm({ ...candidateForm, party: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Location Selection (Optional)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                        <select
                          value={selectedStateForCandidate}
                          onChange={(e) => handleStateChangeForCandidate(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select State</option>
                          {states.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                        <select
                          value={selectedDistrictForCandidate}
                          onChange={(e) => handleDistrictChangeForCandidate(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          disabled={!selectedStateForCandidate}
                        >
                          <option value="">Select District</option>
                          {filteredDistrictsForCandidate.map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Constituency</label>
                        <select
                          value={candidateForm.constituency_id}
                          onChange={(e) => setCandidateForm({ ...candidateForm, constituency_id: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          disabled={!selectedDistrictForCandidate}
                        >
                          <option value="">Select Constituency</option>
                          {filteredConstituenciesForCandidate.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      value={candidateForm.bio}
                      onChange={(e) => setCandidateForm({ ...candidateForm, bio: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingCandidate ? <Check className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                      {editingCandidate ? "Update" : "Create"}
                    </Button>
                    {editingCandidate && (
                      <Button type="button" variant="outline" onClick={resetCandidateForm}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {constituencyFilterForList
                    ? `Candidates in ${filteredConstituenciesForList.find(c => c.id === constituencyFilterForList)?.name || 'Selected Constituency'}`
                    : stateFilterForList && districtFilterForList
                    ? `Candidates in ${filteredDistrictsForList.find(d => d.id === districtFilterForList)?.name || 'Selected District'}`
                    : stateFilterForList
                    ? `Candidates in ${states.find(s => s.id === stateFilterForList)?.name || 'Selected State'}`
                    : 'All Candidates'}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Showing {candidates.length} {candidates.length === 1 ? 'candidate' : 'candidates'}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {candidates.map((candidate: any) => (
                    <div key={candidate.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{candidate.name}</h3>
                          {candidate.party && <p className="text-sm text-blue-600">{candidate.party}</p>}
                          {candidate.constituencies && (
                            <p className="text-xs text-gray-500 mt-1">
                              {candidate.constituencies.name}
                              {candidate.constituencies.districts && ` • ${candidate.constituencies.districts.name}`}
                            </p>
                          )}
                          {candidate.bio && <p className="text-sm text-gray-600 mt-1">{candidate.bio}</p>}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCandidate(candidate)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteCandidate(candidate.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {candidates.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No candidates found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* VOTES TAB */}
          <TabsContent value="votes" className="space-y-6">
            {/* Create/Edit Vote Form */}
            <Card>
              <CardHeader>
                <CardTitle>{editingVote ? "Edit Vote" : "Create Vote"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleVoteSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">User Email</label>
                      <input
                        type="email"
                        value={voteForm.user_email}
                        onChange={(e) => setVoteForm({ ...voteForm, user_email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="user@example.com"
                        required
                        disabled={!!editingVote}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Election</label>
                      <select
                        value={voteForm.election_id}
                        onChange={(e) => handleVoteElectionChange(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Election</option>
                        {elections.map((e) => (
                          <option key={e.id} value={e.id}>{e.title}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Candidate</label>
                      <select
                        value={voteForm.candidate_id}
                        onChange={(e) => setVoteForm({ ...voteForm, candidate_id: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        disabled={!voteForm.election_id}
                        required
                      >
                        <option value="">Select Candidate</option>
                        {filteredCandidatesForVote.map((c) => (
                          <option key={c.id} value={c.id}>{c.name} ({c.party})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingVote ? <Check className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                      {editingVote ? "Update" : "Create"}
                    </Button>
                    {editingVote && (
                      <Button type="button" variant="outline" onClick={resetVoteForm}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Filters Card */}
            <Card>
              <CardHeader>
                <CardTitle>Filter Votes</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Apply multiple filters to narrow down the votes list</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Election Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Election
                    </label>
                    <select
                      value={selectedElectionFilter}
                      onChange={(e) => setSelectedElectionFilter(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Elections</option>
                      {elections.map((election) => (
                        <option key={election.id} value={election.id}>
                          {election.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* State Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <select
                      value={stateFilterForVotes}
                      onChange={(e) => handleStateFilterForVotes(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All States</option>
                      {states.map((state) => (
                        <option key={state.id} value={state.id}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* District Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      District
                    </label>
                    <select
                      value={districtFilterForVotes}
                      onChange={(e) => handleDistrictFilterForVotes(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={!stateFilterForVotes}
                    >
                      <option value="">All Districts</option>
                      {filteredDistrictsForVotes.map((district) => (
                        <option key={district.id} value={district.id}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Constituency Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Constituency
                    </label>
                    <select
                      value={constituencyFilterForVotes}
                      onChange={(e) => setConstituencyFilterForVotes(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={!districtFilterForVotes}
                    >
                      <option value="">All Constituencies</option>
                      {filteredConstituenciesForVotes.map((constituency) => (
                        <option key={constituency.id} value={constituency.id}>
                          {constituency.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Votes List Card */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {constituencyFilterForVotes
                    ? `Votes in ${filteredConstituenciesForVotes.find(c => c.id === constituencyFilterForVotes)?.name || 'Selected Constituency'}`
                    : districtFilterForVotes
                    ? `Votes in ${filteredDistrictsForVotes.find(d => d.id === districtFilterForVotes)?.name || 'Selected District'}`
                    : stateFilterForVotes
                    ? `Votes in ${states.find(s => s.id === stateFilterForVotes)?.name || 'Selected State'}`
                    : selectedElectionFilter
                    ? `Votes for ${elections.find(e => e.id === selectedElectionFilter)?.title || 'Selected Election'}`
                    : 'All Votes'}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Showing {votes.length} {votes.length === 1 ? 'vote' : 'votes'}
                </p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold text-gray-700">User Email</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Election</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Candidate</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Location</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Voted At</th>
                        <th className="text-right p-3 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {votes.map((vote) => (
                        <tr key={vote.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 text-gray-800">{vote.user_email}</td>
                          <td className="p-3 text-gray-800">{vote.election_title}</td>
                          <td className="p-3 font-medium text-gray-800">{vote.candidate_name}</td>
                          <td className="p-3 text-xs text-gray-600">
                            {vote.constituency_name && (
                              <div>
                                <div>{vote.constituency_name}</div>
                                {vote.district_name && <div className="text-gray-500">{vote.district_name}</div>}
                              </div>
                            )}
                            {!vote.constituency_name && <span className="text-gray-400">N/A</span>}
                          </td>
                          <td className="p-3 text-gray-600">{new Date(vote.voted_at).toLocaleString()}</td>
                          <td className="p-3 text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditVote(vote)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteVote(vote.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {votes.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-gray-500">
                            No votes found matching the filters
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Vote Statistics */}
                {votes.length > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Statistics</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        Total votes: <span className="font-semibold text-blue-600">{votes.length}</span>
                      </div>
                      {selectedElectionFilter && (
                        <div>
                          For this election: <span className="font-semibold text-blue-600">{votes.length}</span>
                        </div>
                      )}
                      {(stateFilterForVotes || districtFilterForVotes || constituencyFilterForVotes) && (
                        <div>
                          In selected location: <span className="font-semibold text-blue-600">{votes.length}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* STATES TAB */}
          <TabsContent value="states" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{editingState ? "Edit State" : "Create State"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleStateSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State Name</label>
                      <input
                        type="text"
                        value={stateForm.name}
                        onChange={(e) => setStateForm({ ...stateForm, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State Code</label>
                      <input
                        type="text"
                        value={stateForm.code}
                        onChange={(e) => setStateForm({ ...stateForm, code: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingState ? <Check className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                      {editingState ? "Update" : "Create"}
                    </Button>
                    {editingState && (
                      <Button type="button" variant="outline" onClick={resetStateForm}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All States</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {states.map((state) => (
                    <div key={state.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-800">{state.name}</h3>
                          <p className="text-sm text-gray-600">{state.code}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditState(state)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteState(state.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DISTRICTS TAB */}
          <TabsContent value="districts" className="space-y-6">
            {/* Filter Section */}
            <Card>
              <CardHeader>
                <CardTitle>Filter Districts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full md:w-96">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by State
                  </label>
                  <select
                    value={selectedStateFilterForDistricts}
                    onChange={(e) => filterDistrictsByState(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All States</option>
                    {states.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{editingDistrict ? "Edit District" : "Create District"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDistrictSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                      <select
                        value={districtForm.state_id}
                        onChange={(e) => setDistrictForm({ ...districtForm, state_id: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select State</option>
                        {states.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">District Name</label>
                      <input
                        type="text"
                        value={districtForm.name}
                        onChange={(e) => setDistrictForm({ ...districtForm, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingDistrict ? <Check className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                      {editingDistrict ? "Update" : "Create"}
                    </Button>
                    {editingDistrict && (
                      <Button type="button" variant="outline" onClick={resetDistrictForm}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedStateFilterForDistricts 
                    ? `Districts in ${states.find(s => s.id === selectedStateFilterForDistricts)?.name || 'Selected State'}`
                    : 'All Districts'}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Showing {districts.length} {districts.length === 1 ? 'district' : 'districts'}
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {districts.map((district) => (
                    <div key={district.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-800">{district.name}</h3>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditDistrict(district)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteDistrict(district.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {districts.length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      No districts found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CONSTITUENCIES TAB */}
          <TabsContent value="constituencies" className="space-y-6">
            {/* Filter Section */}
            <Card>
              <CardHeader>
                <CardTitle>Filter Constituencies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Filter by State
                    </label>
                    <select
                      value={stateFilterForConstituencyList}
                      onChange={(e) => handleStateFilterForConstituencyList(e.target.value)}
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
                      value={districtFilterForConstituencyList}
                      onChange={(e) => handleDistrictFilterForConstituencyList(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={!stateFilterForConstituencyList}
                    >
                      <option value="">All Districts</option>
                      {filteredDistrictsForConstituencyList.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{editingConstituency ? "Edit Constituency" : "Create Constituency"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleConstituencySubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                      <select
                        value={selectedStateForConstituency}
                        onChange={(e) => handleStateChangeForConstituency(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select State</option>
                        {states.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                      <select
                        value={constituencyForm.district_id}
                        onChange={(e) => setConstituencyForm({ ...constituencyForm, district_id: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={!selectedStateForConstituency}
                      >
                        <option value="">Select District</option>
                        {filteredDistrictsForConstituency.map((d) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Constituency Name</label>
                      <input
                        type="text"
                        value={constituencyForm.name}
                        onChange={(e) => setConstituencyForm({ ...constituencyForm, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingConstituency ? <Check className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                      {editingConstituency ? "Update" : "Create"}
                    </Button>
                    {editingConstituency && (
                      <Button type="button" variant="outline" onClick={resetConstituencyForm}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {districtFilterForConstituencyList
                    ? `Constituencies in ${filteredDistrictsForConstituencyList.find(d => d.id === districtFilterForConstituencyList)?.name || 'Selected District'}`
                    : stateFilterForConstituencyList
                    ? `Constituencies in ${states.find(s => s.id === stateFilterForConstituencyList)?.name || 'Selected State'}`
                    : 'All Constituencies'}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Showing {constituencies.length} {constituencies.length === 1 ? 'constituency' : 'constituencies'}
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {constituencies.map((constituency) => (
                    <div key={constituency.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-800">{constituency.name}</h3>
                          <p className="text-xs text-gray-600">{constituency.district_name}, {constituency.state_name}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditConstituency(constituency)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteConstituency(constituency.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {constituencies.length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      No constituencies found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboardNew;
