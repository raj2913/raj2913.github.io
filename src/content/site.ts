// Everything a visitor reads about Raj lives in src/content/. Edit these files, not the components.
// Source of truth: Raj's resume (Mumbai, 2026) and his public GitHub repositories.

export const site = {
  name: "Raj Vardhan",
  firstName: "Raj",
  lastName: "Vardhan",
  role: "Forward Deployed AI Engineer",
  focus: "Voice AI",
  location: "Mumbai, India",
  url: "https://raj2913.github.io",
  email: "rajvardhan2913@gmail.com",
  phone: { display: "+91 63543 20430", tel: "+916354320430" },
  links: {
    github: "https://github.com/raj2913",
    linkedin: "https://www.linkedin.com/in/raj-vardhan-721ba8220",
  },
  // Set to a path in /public (e.g. "/raj-vardhan-resume.pdf") to show a résumé link in the contact section.
  resumeUrl: null as string | null,
  // The contact form posts here. FormSubmit forwards each message to the email in the URL.
  // The first submission sends an activation email to that inbox; click it once. Afterwards FormSubmit
  // gives you a random alias (https://formsubmit.co/ajax/<alias>) you can swap in to keep the address out of the code.
  contactFormEndpoint: "https://formsubmit.co/ajax/rajvardhan2913@gmail.com",
  // Paste a Cal.com, Calendly or Google Calendar appointment-schedule link here to embed a real scheduler.
  // While it is null, "Book a 1:1" lets visitors pick a slot and sends you a Google Calendar invite.
  bookingUrl: null as string | null,
  timezone: { id: "Asia/Kolkata", label: "IST", utcOffsetMinutes: 330 },
  headline: ["Built for", "live play."],
  description:
    "Raj Vardhan is a Forward Deployed AI Engineer who ships production voice AI for enterprise clients: backend services, conversation state machines, and the evaluations that decide what goes live.",
  intro:
    "I ship production voice AI: agents that hold real conversations, in real time, for enterprise clients. Backend services, conversation state, and the evaluations that decide what goes live.",
} as const;

export const nav = [
  { id: "top", label: "Tip-off", short: "00" },
  { id: "about", label: "The Read", short: "01" },
  { id: "work", label: "Playbook", short: "02" },
  { id: "voice-lab", label: "Voice Lab", short: "03" },
  { id: "experience", label: "Game Log", short: "04" },
  { id: "kit", label: "Kit", short: "05" },
  { id: "contact", label: "Contact", short: "06" },
] as const;

export const scoutingReport = [
  { label: "Position", value: "Forward Deployed Product Engineer, Voice AI" },
  { label: "Current team", value: "Ignosis AI · Mumbai" },
  { label: "Previously", value: "Gnani.ai · Razorpay" },
  { label: "Education", value: "B.Tech CSE, VIT Vellore · 2021–25 · CGPA 8.81" },
  { label: "Certified", value: "Google Cloud Digital Leader · Cloud Foundation" },
] as const;

export const readDecideExecute = [
  {
    n: "01",
    word: "Read",
    court: "The defense, the clock, the matchup in front of you.",
    code: "Production transcripts, latency traces, the failure that keeps coming back.",
  },
  {
    n: "02",
    word: "Decide",
    court: "Drive, kick, or reset. Pick one, quickly, with what you can see.",
    code: "Constraints first. Then the smallest change that moves the number.",
  },
  {
    n: "03",
    word: "Execute",
    court: "On time, under pressure, the same way you practised it.",
    code: "Regression-tested releases, measured against a baseline, rolled back if they lose.",
  },
] as const;
