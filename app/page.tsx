"use client";

import { useState } from "react";
import { teams, HackathonTeam } from "../data";

// Mapping team leads and department hosts to enhance realism for campus projects
const teamHosts: Record<string, { lead: string; hostOrg: string; avatar: string }> = {
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

export default function CampusForgeDashboard() {
  const [appliedTeams, setAppliedTeams] = useState<Set<string>>(new Set());
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<{ [id: string]: string }>({});
  const [filterTag, setFilterTag] = useState<string>("All");

  const allTags = ["All", ...Array.from(new Set(teams.flatMap((t) => t.tags)))];

  const filteredTeams =
    filterTag === "All" ? teams : teams.filter((t) => t.tags.includes(filterTag));

  const handleJoinTeam = async (projectId: string) => {
    if (appliedTeams.has(projectId) || loadingId === projectId) return;

    setLoadingId(projectId);
    setErrorMessage((prev) => ({ ...prev, [projectId]: "" }));

    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAppliedTeams((prev) => new Set(prev).add(projectId));
      } else {
        setErrorMessage((prev) => ({
          ...prev,
          [projectId]: data.error || "Failed to submit request",
        }));
      }
    } catch {
      setErrorMessage((prev) => ({
        ...prev,
        [projectId]: "Network error. Please try again.",
      }));
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Background Glow Accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[130px]" />
        <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-purple-600/10 blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Navigation & Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-slate-800/80 gap-6">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-1 ring-white/20">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Campus <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Forge</span>
                </h1>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  College Hub
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Discover student-led hackathon teams, collaborate, and build winning campus innovations.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 sm:gap-4 self-start md:self-auto">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 backdrop-blur">
              <span className="block text-xs font-medium text-slate-400">Active Teams</span>
              <span className="text-lg font-bold text-slate-100">{teams.length} Teams</span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 backdrop-blur">
              <span className="block text-xs font-medium text-slate-400">Total Open Slots</span>
              <span className="text-lg font-bold text-indigo-400">
                {teams.reduce((acc, t) => acc + (t.slotsTotal - t.slotsFilled), 0)} Left
              </span>
            </div>
          </div>
        </header>

        {/* Filter bar */}
        <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">
            Filter Tech:
          </span>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                filterTag === tag
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/40"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Project Cards Grid */}
        <main className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team: HackathonTeam) => {
            const hostInfo = teamHosts[team.id] || {
              lead: "Campus Student Lead",
              hostOrg: "College Innovation Cell",
              avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
            };
            const openSlots = team.slotsTotal - team.slotsFilled;
            const isApplied = appliedTeams.has(team.id);
            const isLoading = loadingId === team.id;
            const progressPercent = Math.round((team.slotsFilled / team.slotsTotal) * 100);

            return (
              <div
                key={team.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-slate-900/70 p-6 backdrop-blur transition-all duration-300 hover:border-slate-700 hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1"
              >
                <div>
                  {/* Event & Availability Badges */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300 border border-purple-500/20">
                      <svg className="w-3.5 h-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {team.event}
                    </span>

                    <span
                      className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${
                        openSlots > 0
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {openSlots > 0 ? `${openSlots} slots open` : "Team Full"}
                    </span>
                  </div>

                  {/* Project Title & Description */}
                  <h2 className="text-lg font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2">
                    {team.title}
                  </h2>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-400 line-clamp-3">
                    {team.description}
                  </p>

                  {/* Host & Lead Information */}
                  <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center gap-3">
                    <img
                      src={hostInfo.avatar}
                      alt={hostInfo.lead}
                      className="h-9 w-9 rounded-full ring-2 ring-indigo-500/30 object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-200 truncate">{hostInfo.lead}</p>
                      <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block"></span>
                        {hostInfo.hostOrg}
                      </p>
                    </div>
                  </div>

                  {/* Roster Capacity Progress Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-400 font-medium">
                      <span>Roster Filling</span>
                      <span>
                        {team.slotsFilled} / {team.slotsTotal} members
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
                  <div className="mt-4">
                    <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 mb-2">
                      Required Skills & Stack
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {team.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-slate-800/90 px-2.5 py-1 text-xs font-medium text-slate-300 border border-slate-700/60"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Section */}
                <div className="mt-6 pt-4 border-t border-slate-800/80">
                  {errorMessage[team.id] && (
                    <p className="text-xs text-rose-400 mb-2.5">{errorMessage[team.id]}</p>
                  )}

                  <button
                    onClick={() => handleJoinTeam(team.id)}
                    disabled={isApplied || isLoading || openSlots <= 0}
                    className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-md ${
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
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          />
                        </svg>
                        Submitting Application...
                      </>
                    ) : isApplied ? (
                      <>
                        <svg
                          className="w-4 h-4 text-emerald-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        ✓ Application Sent
                      </>
                    ) : openSlots <= 0 ? (
                      "Team Slots Filled"
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                          />
                        </svg>
                        Request to Join Team
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </main>
      </div>
    </div>
  );
}
