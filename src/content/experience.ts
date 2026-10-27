// Roles, newest first. Stats are quoted from the resume; keep them that way.

export type Stat = { value: number; prefix?: string; suffix?: string; label: string };

export type Role = {
  company: string;
  role: string;
  start: string;
  end: string;
  year: string;
  location: string;
  current?: boolean;
  summary: string;
  stats: Stat[];
  details: string[];
  tags: string[];
};

export const roles: Role[] = [
  {
    company: "Ignosis AI",
    role: "Forward Deployed Product Engineer (Voice AI)",
    start: "Aug 2026",
    end: "Present",
    year: "2026",
    location: "Mumbai",
    current: true,
    summary:
      "Owns client deployments end to end for a new Voice AI product line: client integrations, Python backend services, and code in the in-house voice orchestration platform.",
    stats: [
      { value: 20, suffix: "%+", label: "conversion lift from the strongest experiment, for that client" },
      { value: 10, suffix: "+", label: "controlled experiments on prompts, models and flows" },
      { value: 3, suffix: "+", label: "client deployments tracked in Grafana" },
    ],
    details: [
      "Owns client deployments end to end for a new Voice AI product line, building client integrations and Python backend services, and contributing code to the in-house voice orchestration platform that runs alongside Bolna, shaping its roadmap.",
      "Built and maintains the product's performance analytics in Grafana, tracking conversion, call quality and latency across 3+ client deployments, giving product, engineering and business teams one shared view of agent performance.",
      "Leads experimentation on prompts, models and conversation flows: 10+ controlled experiments against baselines, presented to stakeholders for go/no-go rollout decisions. The strongest change lifted conversion by 20%+ for that client.",
      "Analyzes production conversations to surface recurring failure patterns, converts them into evaluation suites and targeted fixes, and carries the highest-impact improvements through to live, measured deployment.",
    ],
    tags: ["Voice AI", "Python", "Grafana", "Experimentation", "Evaluation suites", "Bolna"],
  },
  {
    company: "Gnani.ai",
    role: "Forward Deployed Engineer (AI Engineer)",
    start: "Feb 2026",
    end: "Jul 2026",
    year: "2026",
    location: "Bangalore",
    summary:
      "Sole technical owner for 15+ enterprise voice AI accounts, from discovery and solution design to production support.",
    stats: [
      { value: 15, suffix: "+", label: "enterprise accounts as sole technical owner" },
      { value: 8, label: "LLM, STT and TTS providers benchmarked under real telephony" },
      { value: 22, prefix: "~", suffix: "%", label: "lower word error rate on noisy, multilingual call audio" },
      { value: 5, label: "Indian languages in multi-turn state machines" },
    ],
    details: [
      "Sole technical owner for 15+ enterprise accounts (Naukri.com, ET Prime, Arohan, HDBFC, SIB, Axis Bank) across discovery, solution design, delivery and production support, including candidate-screening agents for Naukri.com recruitment.",
      "Developed Python evaluation and reporting pipelines that turned call transcripts into structured outcomes and stage codes, replacing manual QA tagging and giving clients consistent, auditable reporting on every live deployment.",
      "Built backend services in Python (FastAPI, MongoDB, Redis on GCP Cloud Run) with idempotent retry scheduling and stage routing, and designed multi-turn conversation state machines in 5 Indian languages, with regression-tested releases.",
      "Benchmarked 8 LLM, speech-to-text and text-to-speech providers on latency, cost and accuracy under real telephony conditions; the findings informed provider selection and reduced word error rate by ~22% in production.",
    ],
    tags: ["FastAPI", "MongoDB", "Redis", "GCP Cloud Run", "STT / TTS", "State machines"],
  },
  {
    company: "Razorpay",
    role: "Associate Technical Consultant (Analytics & Data)",
    start: "Jun 2025",
    end: "Feb 2026",
    year: "2025",
    location: "Bangalore",
    summary:
      "Python and SQL automation, payment-data analysis and SLA monitoring for enterprise merchants.",
    stats: [{ value: 60, suffix: "%+", label: "faster reporting turnaround after automating ETL" }],
    details: [
      "Automated recurring ETL and reporting workflows in Python and SQL that previously needed manual analyst effort, cutting reporting turnaround by 60%+.",
      "Analyzed payment data for enterprise merchants (IRCTC, IndiGo, Airtel) to find funnel drop-offs, latency outliers and gateway performance gaps, feeding product roadmap and merchant-facing decisions.",
      "Developed SLA monitoring and anomaly detection pipelines in Python with threshold-based alerting, flagging payment-failure spikes and gateway degradation in near real time.",
      "Technical point of contact for merchant and internal stakeholders, turning ambiguous business questions into scoped analyses and clear recommendations.",
    ],
    tags: ["Python", "SQL", "ETL", "Anomaly detection", "Alerting"],
  },
];

export const education = {
  school: "Vellore Institute of Technology",
  degree: "B.Tech in Computer Science",
  dates: "2021 – 2025",
  note: "CGPA 8.81 / 10",
};
