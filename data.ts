export interface HackathonTeam {
  id: string;
  title: string;
  event: string;
  description: string;
  tags: string[];
  slotsFilled: number;
  slotsTotal: number;
}

export const teams: HackathonTeam[] = [
  {
    id: "team-001",
    title: "CampusPulse - Real-time Canteen Queue & Transit Tracker",
    event: "HackNIT 2026",
    description: "Developing a mobile app and IoT sensor pipeline to track college shuttle locations live and predict peak queue times at campus cafeterias.",
    tags: ["React Native", "FastAPI", "IoT", "WebSockets"],
    slotsFilled: 3,
    slotsTotal: 4,
  },
  {
    id: "team-002",
    title: "NoteNexus - AI Peer Tutoring & Syllabus Resource Hub",
    event: "Smart India Hackathon 2026",
    description: "A centralized platform for college departments to share verified lecture notes, generate slide summaries using LLMs, and pair students for exam prep.",
    tags: ["Next.js", "TypeScript", "Python", "PostgreSQL", "Tailwind CSS"],
    slotsFilled: 2,
    slotsTotal: 4,
  },
  {
    id: "team-003",
    title: "GreenGrid - Hostel Energy Monitor & Eco-Reward System",
    event: "InnovateIndia GreenTech 2026",
    description: "Creating smart sub-metering hardware and a gamified student portal to track hostel wing power consumption and reward energy conservation.",
    tags: ["Embedded C++", "Flutter", "Node.js", "Firebase"],
    slotsFilled: 3,
    slotsTotal: 5,
  },
];

export default teams;
