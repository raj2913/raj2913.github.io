// The kit. Every tool has an "evidence" line pointing at where it was actually used,
// and `where` lists the roles/projects it connects to (matched by company name or project slug).

export type Tool = { name: string; evidence: string; where: string[] };
export type Kit = { id: string; title: string; blurb: string; tools: Tool[] };

export const kit: Kit[] = [
  {
    id: "voice",
    title: "Voice AI, LLMs & ML",
    blurb: "Agents that talk to real people, and the evaluations that decide whether they ship.",
    tools: [
      { name: "Speech AI (STT / TTS)", evidence: "Benchmarked 8 LLM, STT and TTS providers under real telephony; ~22% lower WER in production.", where: ["Gnani.ai"] },
      { name: "Conversation state machines", evidence: "Multi-turn flows in 5 Indian languages, with regression-tested releases.", where: ["Gnani.ai", "parley"] },
      { name: "LLMs", evidence: "Prompt, model and flow experiments in production; tool-calling agents behind validators.", where: ["Ignosis AI", "parley"] },
      { name: "Evaluation design", evidence: "Eval suites built from production failures; a replay-based release gate.", where: ["Ignosis AI", "Gnani.ai", "parley"] },
      { name: "Voice orchestration", evidence: "Contributes to an in-house orchestration platform that runs alongside Bolna.", where: ["Ignosis AI"] },
      { name: "Transformers · YOLO", evidence: "Earlier ML work: a BERT/RoBERTa multi-label emotion classifier behind a REST API, and YOLO object detection for PCB waste. Both are in the archive under the playbook.", where: ["archive"] },
    ],
  },
  {
    id: "backend",
    title: "Backend engineering",
    blurb: "Python services that stay up while a call is live.",
    tools: [
      { name: "Python", evidence: "The main language across every role and project here.", where: ["Ignosis AI", "Gnani.ai", "Razorpay", "parley", "phenix", "sidebet"] },
      { name: "FastAPI", evidence: "Backend services with idempotent retry scheduling and stage routing.", where: ["Gnani.ai", "parley"] },
      { name: "asyncio", evidence: "Async Python services; a background writer thread in phenix.", where: ["Gnani.ai", "phenix"] },
      { name: "REST APIs", evidence: "Client integrations and JSON APIs.", where: ["Ignosis AI", "sidebet"] },
      { name: "pytest", evidence: "114 tests in under a second in sidebet; CI on 3.11 and 3.12 in phenix.", where: ["sidebet", "phenix", "parley"] },
    ],
  },
  {
    id: "data",
    title: "Data & analytics",
    blurb: "Making the numbers make the decision.",
    tools: [
      { name: "SQL", evidence: "Payment-data analysis for IRCTC, IndiGo and Airtel.", where: ["Razorpay"] },
      { name: "Grafana", evidence: "Performance analytics across 3+ voice AI client deployments.", where: ["Ignosis AI"] },
      { name: "Experiment design", evidence: "10+ controlled experiments against baselines; go/no-go rollout calls.", where: ["Ignosis AI"] },
      { name: "ETL & reporting", evidence: "Automated pipelines; 60%+ faster reporting turnaround.", where: ["Razorpay", "Gnani.ai"] },
      { name: "Anomaly detection", evidence: "Threshold-based alerting on payment-failure spikes.", where: ["Razorpay"] },
      { name: "Pandas · NumPy", evidence: "Day-to-day analysis tooling.", where: ["Razorpay"] },
    ],
  },
  {
    id: "infra",
    title: "Data stores & cloud",
    blurb: "Where state lives, and where it runs.",
    tools: [
      { name: "MongoDB", evidence: "Conversation and session state for voice deployments.", where: ["Gnani.ai"] },
      { name: "Redis", evidence: "Caching and scheduling in production voice services.", where: ["Gnani.ai"] },
      { name: "PostgreSQL", evidence: "Turn traces and policy-versioned conversations in Parley.", where: ["parley"] },
      { name: "SQLite", evidence: "WAL-mode trace store in phenix.", where: ["phenix"] },
      { name: "GCP · Cloud Run", evidence: "Deployed backend services; Google Cloud Digital Leader certified.", where: ["Gnani.ai"] },
      { name: "GitHub Actions", evidence: "CI, including an eval gate that runs on push.", where: ["parley", "phenix"] },
    ],
  },
];
