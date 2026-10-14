"use client";

import { useState } from "react";
import { teams as defaultTeams, HackathonTeam } from "../data";

// Initial campus host and student lead details
const initialTeamHosts: Record<string, { lead: string; hostOrg: string; avatar: string }> = {
  "team-001": {
    lead: "Aarav Sharma (Final Year, CSE)",
    hostOrg: "Dept. of Computer Science & Tech Society",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
  },
  "team-002": {
    lead: "Sneha Patel (3rd Year, AI & DS)",
    hostOrg: "Campus AI & Machine Learning Club",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
  },
  "team-003": {
    lead: "Rohan Verma (Final Year, ECE)",
    hostOrg: "Robotics & Sustainable Tech Lab",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
  },
};

interface FreeAgent {
  id: string;
  name: string;
  role: string;
  department: string;
  skills: string[];
  avatar: string;
}

const mockFreeAgents: FreeAgent[] = [
  {
    id: "fa-1",
    name: "Amit Kumar",
    role: "Figma Specialist & UI/UX Designer",
    department: "3rd Year • Design & Media",
    skills: ["Figma", "UI/UX", "Tailwind", "Prototyping"],
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "fa-2",
    name: "Neha Sharma",
    role: "Python Dev & ML Enthusiast",
    department: "Final Year • Computer Science",
    skills: ["Python", "FastAPI", "PyTorch", "NumPy"],
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "fa-3",
    name: "Karan Patel",
    role: "Full-Stack & Mobile Developer",
    department: "2nd Year • Information Tech",
    skills: ["React Native", "TypeScript", "Node.js"],
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
  },
];

export default function CampusForgePortal() {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");
  const [userSessionEmail, setUserSessionEmail] = useState<string>("");

  // Dashboard Projects State Engine
  const [teamList, setTeamList] = useState<HackathonTeam[]>(defaultTeams);
  const [teamHosts, setTeamHosts] = useState(initialTeamHosts);

  // Real-time Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("All");

  // Team Application & Async Action State
  const [appliedTeams, setAppliedTeams] = useState<Set<string>>(new Set());
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<{ [id: string]: string }>({});

  // Form State for "Launch Project Channel"
  const [newTitle, setNewTitle] = useState<string>("");
  const [newEvent, setNewEvent] = useState<string>("");
  const [newSkills, setNewSkills] = useState<string>("");
  const [newDescription, setNewDescription] = useState<string>("");
  const [formSuccessMessage, setFormSuccessMessage] = useState<string>("");

  // Free Agents State
  const [invitedAgents, setInvitedAgents] = useState<Set<string>>(new Set());

  // Aggregate tags for filtering
  const allTags = ["All", ...Array.from(new Set(teamList.flatMap((t) => t.tags)))];

  // Dynamic Real-Time Filtering
  const filteredTeams = teamList.filter((team) => {
    const matchesTag =
      selectedTag === "All" ||
      team.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase());

    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesTag;

    const matchesTitle = team.title.toLowerCase().includes(query);
    const matchesDescription = team.description.toLowerCase().includes(query);
    const matchesTags = team.tags.some((t) => t.toLowerCase().includes(query));
    const matchesEvent = team.event.toLowerCase().includes(query);

    return matchesTag && (matchesTitle || matchesDescription || matchesTags || matchesEvent);
  });

  // Handle Login Validation
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail.includes("@")) {
      setLoginError("Please enter a valid campus email containing '@'.");
      return;
    }

    if (password.length < 4) {
      setLoginError("Password must be at least 4 characters.");
      return;
    }

    setUserSessionEmail(trimmedEmail);
    setIsLoggedIn(true);
  };

  // Handle Join Team with Reactive Local State Increment (e.g. 2/4 -> 3/4)
  const handleJoinTeam = async (projectId: string) => {
    if (appliedTeams.has(projectId) || loadingId === projectId) return;

    const targetTeam = teamList.find((t) => t.id === projectId);
    if (!targetTeam || targetTeam.slotsFilled >= targetTeam.slotsTotal) return;

    setLoadingId(projectId);
    setErrorMessage((prev) => ({ ...prev, [projectId]: "" }));

    try {
      // Optional async ping to API route
      await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
    } catch {
      // Graceful fallback for local offline state
    } finally {
      // Dynamically increment slotsFilled directly in the local state array
      setTeamList((prevList) =>
        prevList.map((team) => {
          if (team.id === projectId && team.slotsFilled < team.slotsTotal) {
            return {
              ...team,
              slotsFilled: team.slotsFilled + 1,
            };
          }
          return team;
        })
      );

      setAppliedTeams((prev) => new Set(prev).add(projectId));
      setLoadingId(null);
    }
  };

  // Handle "Launch Project Channel" Form Submission
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTitle.trim() || !newEvent.trim() || !newSkills.trim()) {
      return;
    }

    const uniqueId = `team-${Date.now()}`;
    const parsedTags = newSkills
      .split(",")
      .map((skill) => skill.trim())
      .filter((s) => s.length > 0);

    const createdTeam: HackathonTeam = {
      id: uniqueId,
      title: newTitle.trim(),
      event: newEvent.trim(),
      description:
        newDescription.trim() ||
        "Newly formed campus project team looking for enthusiastic collaborators to build and compete.",
      tags: parsedTags.length > 0 ? parsedTags : ["Full Stack", "Campus Innovation"],
      slotsFilled: 1,
      slotsTotal: 4,
    };

    // Prepend new project card directly into active state
    setTeamList((prev) => [createdTeam, ...prev]);

    // Add creator profile to hosts
    setTeamHosts((prev) => ({
      ...prev,
      [uniqueId]: {
        lead: userSessionEmail ? `${userSessionEmail.split("@")[0]} (Creator)` : "You (Creator)",
        hostOrg: "Campus Student Project Channel",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
      },
    }));

    // Reset Form Fields
    setNewTitle("");
    setNewEvent("");
    setNewSkills("");
    setNewDescription("");
    setFormSuccessMessage("🎉 Project channel launched and added to the live feed!");

    setTimeout(() => {
      setFormSuccessMessage("");
    }, 4500);
  };

  // Free Agent Invite Handler
  const handleInviteAgent = (agentId: string) => {
    setInvitedAgents((prev) => {
      const next = new Set(prev);
      next.add(agentId);
      return next;
    });
  };

  // ----------------------------------------------------
  // VIEW 1: SECURE PORTAL LOGIN SCREEN (isLoggedIn === false)
  // ----------------------------------------------------
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
        {/* Ambient Glows */}
        <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-indigo-600/15 blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-40 right-1/4 h-[500px] w-[500px] rounded-full bg-purple-600/15 blur-[150px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          {/* Card Container */}
          <div className="rounded-3xl border border-slate-800/90 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
            {/* Header / Brand */}
            <div className="flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-1 ring-white/20 mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>

              <div className="inline-flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-black tracking-tight text-white">
                  Campus <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Forge</span>
                </h1>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                  Secure Portal
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Authenticate with your college credentials to enter the matchmaking hub.
              </p>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="mt-5 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400 flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{loginError}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Campus Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@college.edu"
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Password must be at least 4 characters long.
                </span>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>Access Matchmaking Hub</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>

            {/* Quick Demo Footer */}
            <div className="mt-6 pt-5 border-t border-slate-800 text-center">
              <p className="text-[11px] text-slate-500">
                ⚡ Demo Portal: Any email with <code className="text-indigo-400">@</code> and 4+ character password is accepted.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW 2: FULL INTERACTIVE DASHBOARD (isLoggedIn === true)
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white pb-16">
      {/* Background Ambient Glow Accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[140px]" />
        <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-purple-600/10 blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        {/* Navigation & Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-slate-800/80 gap-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Campus <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Forge</span>
                </h1>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                  College Hub
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Connect with student hackathon teams, launch channels, and recruit campus free agents.
              </p>
            </div>
          </div>

          {/* User Session & Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 self-start md:self-auto">
            {/* User Session Badge with Sign Out */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 backdrop-blur flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <div className="text-left">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Signed In</span>
                <span className="text-xs font-semibold text-slate-200 truncate max-w-[140px] block">
                  {userSessionEmail || "Student User"}
                </span>
              </div>
              <button
                onClick={() => setIsLoggedIn(false)}
                className="ml-2 rounded-lg bg-slate-800 hover:bg-slate-700 px-2 py-1 text-[11px] font-medium text-slate-300 hover:text-white transition-colors"
                title="Sign out of portal"
              >
                Sign Out
              </button>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-2.5 backdrop-blur">
              <span className="block text-xs font-medium text-slate-400">Active Projects</span>
              <span className="text-lg font-bold text-slate-100">{teamList.length}</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-2.5 backdrop-blur">
              <span className="block text-xs font-medium text-slate-400">Total Open Slots</span>
              <span className="text-lg font-bold text-indigo-400">
                {teamList.reduce((acc, t) => acc + Math.max(0, t.slotsTotal - t.slotsFilled), 0)} Left
              </span>
            </div>
          </div>
        </header>

        {/* Main Grid: Feed (Left 8 cols) & Sidebar (Right 4 cols) */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Search Bar & Project Cards Feed */}
          <section className="lg:col-span-8 flex flex-col gap-6">
            
            {/* REAL-TIME SEARCH BAR */}
            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/80 p-4 shadow-xl backdrop-blur">
              <div className="relative flex items-center">
                <svg
                  className="absolute left-3.5 h-5 w-5 text-slate-400 pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Real-time search by title, description, or tech stack (e.g., Python, Next.js, IoT)..."
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 py-3 pl-11 pr-10 text-sm text-slate-100 placeholder-slate-500 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Tech Filter Tags */}
              <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1.5 shrink-0">
                  Tag:
                </span>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all shrink-0 ${
                      selectedTag === tag
                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 ring-1 ring-indigo-400/40"
                        : "bg-slate-800/80 text-slate-400 border border-slate-700/60 hover:border-slate-600 hover:text-slate-200"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Feed Results Counter */}
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400 px-1">
                <span>
                  Showing <strong className="text-slate-200">{filteredTeams.length}</strong> of{" "}
                  <strong className="text-slate-200">{teamList.length}</strong> project channels
                </span>
                {searchQuery && (
                  <span className="text-indigo-400">
                    Filtered by &ldquo;{searchQuery}&rdquo;
                  </span>
                )}
              </div>
            </div>

            {/* Empty Search Result State */}
            {filteredTeams.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-slate-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-3 text-base font-semibold text-slate-300">
                  No hackathon projects found
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  No projects match &ldquo;{searchQuery}&rdquo;. Try tweaking your search terms or launch your own project channel!
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedTag("All");
                  }}
                  className="mt-4 inline-flex items-center rounded-lg bg-indigo-600/20 px-3.5 py-1.5 text-xs font-medium text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/30 transition-all"
                >
                  Reset Search & Filters
                </button>
              </div>
            )}

            {/* Dynamic Project Cards Feed */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredTeams.map((team: HackathonTeam) => {
                const hostInfo = teamHosts[team.id] || {
                  lead: "Student Project Creator",
                  hostOrg: "Campus Innovation Team",
                  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
                };
                const openSlots = Math.max(0, team.slotsTotal - team.slotsFilled);
                const isApplied = appliedTeams.has(team.id);
                const isLoading = loadingId === team.id;
                const progressPercent = Math.min(100, Math.round((team.slotsFilled / team.slotsTotal) * 100));

                return (
                  <article
                    key={team.id}
                    className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-slate-900/70 p-5 backdrop-blur transition-all duration-300 hover:border-slate-700 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5"
                  >
                    <div>
                      {/* Event Banner & Slots Badge */}
                      <div className="flex items-center justify-between gap-2 mb-3.5">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/15 px-2.5 py-1 text-[11px] font-semibold text-purple-300 border border-purple-500/25">
                          <svg className="w-3 h-3 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {team.event}
                        </span>

                        <span
                          className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full ${
                            openSlots > 0
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {openSlots > 0 ? `${openSlots} slots open` : "Team Full"}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h2 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2">
                        {team.title}
                      </h2>
                      <p className="mt-2 text-xs leading-relaxed text-slate-400 line-clamp-3">
                        {team.description}
                      </p>

                      {/* Host & Lead Information */}
                      <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center gap-2.5">
                        <img
                          src={hostInfo.avatar}
                          alt={hostInfo.lead}
                          className="h-8 w-8 rounded-full ring-2 ring-indigo-500/30 object-cover"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-200 truncate">{hostInfo.lead}</p>
                          <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block"></span>
                            {hostInfo.hostOrg}
                          </p>
                        </div>
                      </div>

                      {/* Roster Progress Bar & Dynamic Reactive Counter */}
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                          <span>Roster Capacity</span>
                          <span className="font-semibold text-slate-200">
                            {team.slotsFilled} / {team.slotsTotal}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Tech Stack Badges */}
                      <div className="mt-3.5">
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1.5">
                          Needed Skills
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {team.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-md bg-slate-800/90 px-2 py-0.5 text-[11px] font-medium text-slate-300 border border-slate-700/60"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Button Action */}
                    <div className="mt-5 pt-3.5 border-t border-slate-800/80">
                      {errorMessage[team.id] && (
                        <p className="text-[11px] text-rose-400 mb-2">{errorMessage[team.id]}</p>
                      )}

                      <button
                        onClick={() => handleJoinTeam(team.id)}
                        disabled={isApplied || isLoading || openSlots <= 0}
                        className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-md ${
                          isApplied
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default shadow-none"
                            : isLoading
                            ? "bg-indigo-700/60 text-indigo-200 cursor-wait border border-indigo-500/30"
                            : openSlots <= 0
                            ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/40 shadow-none"
                            : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25 hover:shadow-indigo-600/40 active:scale-[0.98]"
                        }`}
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-1.5 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            Submitting Request...
                          </>
                        ) : isApplied ? (
                          <>
                            <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            ✓ Application Sent
                          </>
                        ) : openSlots <= 0 ? (
                          "Team Slots Filled"
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            Request to Join Team
                          </>
                        )}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* RIGHT COLUMN: SIDEBAR */}
          <aside className="lg:col-span-4 flex flex-col gap-6">

            {/* FORM SUBMISSION: LAUNCH PROJECT CHANNEL */}
            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/80 p-5 shadow-xl backdrop-blur">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
                  🚀
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Launch Project Channel</h3>
                  <p className="text-[11px] text-slate-400">Add your hackathon project to the live feed</p>
                </div>
              </div>

              {formSuccessMessage && (
                <div className="mt-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-xs text-emerald-400">
                  {formSuccessMessage}
                </div>
              )}

              <form onSubmit={handleCreateProject} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Project Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., CampusBot - Autonomous Library Assistant"
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Target Hackathon <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newEvent}
                    onChange={(e) => setNewEvent(e.target.value)}
                    placeholder="e.g., HackNIT 2026 or SIH 2026"
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Needed Skills <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newSkills}
                    onChange={(e) => setNewSkills(e.target.value)}
                    placeholder="Comma separated: React, Python, OpenCV, IoT"
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <span className="text-[10px] text-slate-500">Separate multiple skills with commas</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Short Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="What problem are you solving? Who are you looking for?"
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-600/25 active:scale-[0.98] transition-all"
                >
                  ⚡ Launch Project Channel
                </button>
              </form>
            </div>

            {/* FREE AGENTS LIST */}
            <div className="rounded-2xl border border-slate-800/90 bg-slate-900/80 p-5 shadow-xl backdrop-blur">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                    👥
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">Available Free Agents</h3>
                    <p className="text-[11px] text-slate-400">Campus talent ready to join a team</p>
                  </div>
                </div>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>

              {/* Free Agent Student Cards */}
              <div className="mt-4 space-y-3.5">
                {mockFreeAgents.map((agent) => {
                  const isInvited = invitedAgents.has(agent.id);

                  return (
                    <div
                      key={agent.id}
                      className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 transition-all hover:border-slate-700"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={agent.avatar}
                          alt={agent.name}
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-500/20 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-100 truncate">{agent.name}</h4>
                            <span className="text-[10px] text-emerald-400 font-medium">Free Agent</span>
                          </div>
                          <p className="text-[11px] font-medium text-indigo-400 truncate">{agent.role}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{agent.department}</p>

                          {/* Skill badges */}
                          <div className="mt-2 flex flex-wrap gap-1">
                            {agent.skills.map((skill) => (
                              <span
                                key={skill}
                                className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700/50"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>

                          {/* Interactive Invite Button */}
                          <div className="mt-3">
                            <button
                              onClick={() => handleInviteAgent(agent.id)}
                              disabled={isInvited}
                              className={`w-full py-1.5 px-3 rounded-lg text-[11px] font-semibold transition-all ${
                                isInvited
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default"
                                  : "bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white border border-slate-700 hover:border-indigo-500 active:scale-[0.98]"
                              }`}
                            >
                              {isInvited ? "✓ Invited" : "Invite to Team"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}
