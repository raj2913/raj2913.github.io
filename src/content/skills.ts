// The kit. Each tool has a one-line summary and evidence points, each tagged with where it happened:
// a company name from experience.ts, a project slug from projects.ts, or "archive".
// The "shows up in" links are derived from those tags.

export type Evidence = { at: string; text: string };
export type Tool = { name: string; summary: string; points: Evidence[] };
export type Kit = { id: string; title: string; blurb: string; tools: Tool[] };

export const kit: Kit[] = [
  {
    id: "voice",
    title: "Voice AI, LLMs & ML",
    blurb: "Agents that talk to real people on real phone lines, and the evaluations that decide whether they ship.",
    tools: [
      {
        name: "Speech AI (STT / TTS)",
        summary: "Speech recognition and synthesis on live phone calls, in production at Ignosis AI and Gnani.ai.",
        points: [
          { at: "Ignosis AI", text: "Speech-to-text and text-to-speech choices for a new voice AI product line, tracked against call quality and latency across client deployments." },
          { at: "Gnani.ai", text: "Benchmarked 8 LLM, STT and TTS providers on latency, cost and accuracy under real telephony. The pick cut word error rate by ~22% on noisy, multilingual call audio." },
          { at: "parley", text: "Voice mode runs browser speech-to-text and text-to-speech around the agent pipeline." },
        ],
      },
      {
        name: "Conversation state machines",
        summary: "Multi-turn flows that know where the call is, what's been confirmed, and what happens next.",
        points: [
          { at: "Ignosis AI", text: "Conversation flows for client voice agents, changed through controlled experiments against a baseline." },
          { at: "Gnani.ai", text: "Multi-turn state machines in 5 Indian languages, with regression-tested releases." },
          { at: "parley", text: "A deterministic procedure controller routes every caller turn; disclosures and disputes never reach the model." },
        ],
      },
      {
        name: "LLMs",
        summary: "Prompts, models and tool calls in production voice agents, measured rather than guessed.",
        points: [
          { at: "Ignosis AI", text: "10+ controlled experiments on prompts, models and flows; the strongest lifted conversion by 20%+ for that client." },
          { at: "Gnani.ai", text: "LLMs benchmarked alongside STT and TTS providers under real call conditions." },
          { at: "parley", text: "Tool-calling agent on Gemini or Claude behind one interface, with a validator and output guard on every reply." },
        ],
      },
      {
        name: "Evaluation design",
        summary: "Turning production calls into tests, so a fix stays fixed.",
        points: [
          { at: "Ignosis AI", text: "Recurring failure patterns from production conversations turned into evaluation suites and targeted fixes." },
          { at: "Gnani.ai", text: "Pipelines that convert call transcripts into structured outcomes and stage codes, replacing manual QA tagging." },
          { at: "parley", text: "30-scenario release gate with replay of recorded calls; any call can become a permanent regression test." },
        ],
      },
      {
        name: "Voice orchestration",
        summary: "Owning voice agents end to end, from client requirements to the live call.",
        points: [
          { at: "Ignosis AI", text: "Code in the in-house voice orchestration platform that runs alongside Bolna, and end-to-end ownership of client deployments." },
          { at: "Gnani.ai", text: "Sole technical owner for 15+ enterprise voice deployments, including candidate-screening agents for Naukri.com." },
        ],
      },
      {
        name: "Transformers · YOLO",
        summary: "Earlier machine-learning work, before voice.",
        points: [
          { at: "archive", text: "A BERT/RoBERTa multi-label emotion classifier behind a REST inference API." },
          { at: "archive", text: "YOLO object detection with a real-time image-processing pipeline for PCB waste." },
        ],
      },
    ],
  },
  {
    id: "backend",
    title: "Backend engineering",
    blurb: "The part a caller never hears when it works: the services, state, retries and tests behind a live call.",
    tools: [
      {
        name: "Python services",
        summary: "Production Python behind live voice agents, and the systems I build on my own.",
        points: [
          { at: "Ignosis AI", text: "Python backend services and client integrations for a new voice AI product line." },
          { at: "Gnani.ai", text: "Backend services on GCP Cloud Run behind 15+ enterprise voice deployments." },
          { at: "Razorpay", text: "ETL, reporting and SLA-monitoring pipelines in Python and SQL, with threshold-based alerting." },
          { at: "parley", text: "A turn pipeline where every step is persisted: intent, route, model calls, tool verdicts, guard attempts." },
        ],
      },
      {
        name: "FastAPI",
        summary: "APIs that sit in the path of a live conversation.",
        points: [
          { at: "Gnani.ai", text: "Services with stage routing for multi-turn calls, backed by MongoDB and Redis." },
          { at: "parley", text: "REST and WebSocket API; the console streams a live trace of each pipeline step as the call happens." },
        ],
      },
      {
        name: "Reliability",
        summary: "Making the second attempt as safe as the first.",
        points: [
          { at: "Gnani.ai", text: "Idempotent retry scheduling, so a retried job can't act twice." },
          { at: "Razorpay", text: "Anomaly detection on payment-failure spikes and gateway degradation, alerting in near real time." },
          { at: "parley", text: "Out-of-policy offers made impossible in code: a Decimal-exact validator, an output guard, and agreements recorded only from validated state." },
        ],
      },
      {
        name: "Async & performance",
        summary: "Keeping slow work off the request path.",
        points: [
          { at: "Gnani.ai", text: "asyncio services for concurrent, real-time call traffic." },
          { at: "parley", text: "Async SQLAlchemy on PostgreSQL; instructions prompt-cached and history kept append-only." },
          { at: "phenix", text: "A queue and background writer keep disk I/O off the hot path, against a target of under 1 ms p99 overhead." },
        ],
      },
      {
        name: "Integrations & APIs",
        summary: "Connecting voice agents to the systems a business already runs on.",
        points: [
          { at: "Ignosis AI", text: "Client integrations for each voice AI deployment." },
          { at: "Gnani.ai", text: "Solution design and delivery for enterprise accounts including Naukri.com, ET Prime, Axis Bank and SIB." },
          { at: "sidebet", text: "Domain logic kept free of the HTTP layer, behind a small JSON API." },
        ],
      },
      {
        name: "Testing & CI",
        summary: "Releases that a test suite, not a hunch, lets through.",
        points: [
          { at: "Gnani.ai", text: "Regression-tested releases for conversation flows." },
          { at: "parley", text: "Unit and pipeline tests on a scripted fake model and real Postgres; the eval gate runs in CI." },
          { at: "sidebet", text: "114 tests that run in under a second, with no network and no keys." },
          { at: "phenix", text: "CI on Python 3.11 and 3.12, plus a benchmark suite over 10,000 traced calls." },
        ],
      },
    ],
  },
  {
    id: "data",
    title: "Data & analytics",
    blurb: "Making the numbers make the decision.",
    tools: [
      { name: "SQL", summary: "Finding where the funnel leaks.", points: [{ at: "Razorpay", text: "Payment-data analysis for IRCTC, IndiGo and Airtel: funnel drop-offs, latency outliers, gateway gaps." }] },
      { name: "Grafana", summary: "One shared view of how the agents are doing.", points: [{ at: "Ignosis AI", text: "Performance analytics for conversion, call quality and latency across 3+ client deployments." }] },
      { name: "Experiment design", summary: "Baselines first, then go/no-go.", points: [{ at: "Ignosis AI", text: "10+ controlled experiments presented to stakeholders for rollout decisions." }] },
      {
        name: "ETL & reporting",
        summary: "Replacing manual reporting with pipelines.",
        points: [
          { at: "Razorpay", text: "Automated ETL and reporting; 60%+ faster turnaround." },
          { at: "Gnani.ai", text: "Auditable outcome reporting on every live deployment." },
        ],
      },
      { name: "Anomaly detection", summary: "Catching it before the merchant does.", points: [{ at: "Razorpay", text: "Threshold-based alerting on payment-failure spikes." }] },
    ],
  },
  {
    id: "infra",
    title: "Data stores & cloud",
    blurb: "Where state lives, and where it runs.",
    tools: [
      { name: "MongoDB", summary: "Conversation and session state.", points: [{ at: "Gnani.ai", text: "State for multi-turn voice conversations." }] },
      { name: "Redis", summary: "Caching and scheduling.", points: [{ at: "Gnani.ai", text: "Caching and session context in production voice services." }] },
      { name: "PostgreSQL", summary: "Traces you can audit.", points: [{ at: "parley", text: "Every turn stored, with content-hashed prompt and policy versions on each conversation." }] },
      { name: "SQLite", summary: "Zero-config persistence.", points: [{ at: "phenix", text: "WAL-mode trace store: one file, no server." }] },
      { name: "GCP · Cloud Run", summary: "Where the services run.", points: [{ at: "Gnani.ai", text: "Backend services deployed on Cloud Run. Google Cloud Digital Leader certified." }] },
      { name: "GitHub Actions", summary: "CI with a gate.", points: [{ at: "parley", text: "Lint, tests and an LLM eval gate on push." }, { at: "phenix", text: "Test matrix on 3.11 and 3.12." }] },
    ],
  },
];
