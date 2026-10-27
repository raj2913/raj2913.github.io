// Each project is a "play". The diagram is the real architecture drawn as a playbook:
// O = a component that handles the ball (the request), X = a check that can stop it, ◎ = where it scores.
// Coordinates are in a 400 × 300 half-court with the basket at the top.

export type PlayNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  kind: "player" | "check" | "basket";
  note: string;
  labelAt?: "below" | "above" | "left" | "right";
};

export type PlayEdge = { from: string; to: string; kind: "pass" | "drive" | "screen" | "shot" };

export type CaseSection = { title: string; body: string[] };

export type Project = {
  slug: string;
  number: string;
  title: string;
  call: string; // the play call
  callNote: string;
  year: string;
  tagline: string;
  problem: string;
  approach: string;
  decisions: string[];
  stack: string[];
  role: string;
  outcome: string[];
  repo: string;
  accent: "orange" | "signal" | "paper";
  diagram: { nodes: PlayNode[]; edges: PlayEdge[] };
  caseStudy: CaseSection[];
};

export const projects: Project[] = [
  {
    slug: "parley",
    number: "01",
    title: "Parley",
    call: "Box-and-one",
    callNote:
      "Zone everywhere, one defender locked on the threat. Here the threat is an out-of-policy offer, and code, not the model, guards it.",
    year: "2026",
    tagline: "A collections voice agent that cannot offer terms outside the client's policy.",
    problem:
      "Put an LLM on a live debt-collection call and three things go wrong: it answers what it assumes the caller asked, it offers a payment plan below the client's minimum, and it paraphrases disclosures that legally have to be read word for word.",
    approach:
      "Classify every caller turn before the agent may speak, route it with a deterministic procedure controller, and let the model only propose terms through tools that a Decimal-exact validator approves or rejects. An output guard blocks any dollar figure the validator did not approve, even spelled out in words. A replay-based eval suite decides whether a release ships.",
    decisions: [
      "Compliance logic does not live in the prompt. Anything with legal weight is code or scripted text, so the model handles conversation, not authority.",
      "“Impossible, not unlikely”: the validator, the guard and code-only recording mean an out-of-policy figure cannot reach the caller or the CRM.",
      "The settlement floor is never shown to the model. A rejected offer returns a counter-offer, because a model that knows the floor anchors on it.",
      "Eval checks recompute policy limits with their own arithmetic instead of calling the validator, so a validator bug shows up as a disagreement.",
    ],
    stack: ["Python", "FastAPI", "PostgreSQL", "SQLAlchemy", "Gemini / Claude", "DeepEval", "React", "Web Speech API"],
    role: "Personal project: designed and built end to end.",
    outcome: [
      "30 eval scenarios, including three simulated callers (a hard haggler, numbers said in words, an impersonator).",
      "agent@v2: a clean full run passed 19/19; the guard blocked one unapproved figure across the run.",
      "agent@v3: the first full run of 30 passed 22; the 8 failures were 1 real ordering bug (fixed and unit-tested), 1 scripted-caller issue and 5 rate limits, and all 8 passed on re-run.",
    ],
    repo: "https://github.com/raj2913/parley",
    accent: "orange",
    diagram: {
      nodes: [
        { id: "caller", label: "Caller", x: 200, y: 252, kind: "player", note: "Speaks. Browser speech-to-text turns it into a turn." },
        { id: "redact", label: "Redact", x: 84, y: 236, kind: "check", note: "Card and SSN digits are removed before the model, the database or any log sees them." },
        { id: "intent", label: "Intent", x: 66, y: 150, kind: "player", labelAt: "above", note: "Structured output: 22 intents and 9 compliance flags label every caller turn." },
        { id: "control", label: "Controller", x: 200, y: 184, kind: "player", note: "A deterministic state machine routes on the label. Disputes, cease requests and disclosures never reach the model." },
        { id: "script", label: "Script", x: 330, y: 160, kind: "player", note: "Disclosures and recaps are injected verbatim, word for word." },
        { id: "draft", label: "Draft", x: 200, y: 112, kind: "player", labelAt: "left", note: "The model drafts a reply and may only propose terms through tools." },
        { id: "validator", label: "Validator", x: 330, y: 62, kind: "check", note: "Decimal-exact policy check approves or rejects every proposed plan or settlement." },
        { id: "guard", label: "Guard", x: 76, y: 62, kind: "check", note: "Blocks any figure the validator did not approve, then retries with the reason." },
        { id: "rim", label: "Reply", x: 200, y: 30, kind: "basket", note: "What the caller hears, with the full trace persisted." },
      ],
      edges: [
        { from: "caller", to: "redact", kind: "pass" },
        { from: "redact", to: "intent", kind: "pass" },
        { from: "intent", to: "control", kind: "pass" },
        { from: "control", to: "script", kind: "pass" },
        { from: "control", to: "draft", kind: "drive" },
        { from: "draft", to: "validator", kind: "screen" },
        { from: "draft", to: "guard", kind: "pass" },
        { from: "guard", to: "rim", kind: "shot" },
        { from: "script", to: "rim", kind: "shot" },
      ],
    },
    caseStudy: [
      {
        title: "The challenge",
        body: [
          "A collections call is one of the least forgiving places to put a language model. A wrong number must hear nothing about the debt. A required disclosure must be read verbatim, exactly once. A payment plan below the client's minimum is not a bad answer; it is a compliance incident.",
          "Telling the model about those rules makes violations unlikely. Parley is an attempt to make them impossible.",
        ],
      },
      {
        title: "How a turn works",
        body: [
          "Every caller turn is redacted, then labelled by an intent layer (structured output: 22 intents plus 9 compliance flags) before the agent may speak. A deterministic procedure controller routes on that label.",
          "Disclosures, disputes, cease requests and recaps are scripted and injected verbatim. Everything else goes to the model with a per-turn directive: the goal, the rules, and which tools it may call.",
          "The model can only propose terms through tools. A Decimal-exact validator approves or rejects them against the versioned client policy, and an output guard blocks any dollar figure or payment count that was not approved, including amounts written out in words. Agreements are recorded by code from validated state, never by the model.",
        ],
      },
      {
        title: "Edge cases routed by code",
        body: [
          "Someone else answers; a wrong number; “is this a scam?”; a caller in crisis; “send me proof in writing”; “stop calling me”; an attorney or bankruptcy; driving or busy; asking for a human; a different language; a card number read aloud; garbled audio; a call outside permitted hours; prompt injection. Each is routed by code, and each has an eval scenario.",
        ],
      },
      {
        title: "The release gate",
        body: [
          "`parley eval run` drives every scenario through the real agent, then scores each call with deterministic checks (verbatim disclosure, no third-party disclosure, offers within policy, no prohibited language, compliance flags honoured) and LLM-judged checks for conduct and responsiveness.",
          "`parley eval replay` re-runs recorded production calls against the current agent, and any call can be captured as a permanent regression scenario: find the call, capture it, fix the cause, and the gate keeps it fixed.",
        ],
      },
      {
        title: "Trade-offs",
        body: [
          "Two model calls per turn is the main latency cost. The next options are a smaller classifier model, streaming the reply behind a sentence-level guard, and speculative classification while the caller is still speaking.",
          "Telephony (streaming STT/TTS with barge-in over WebSockets) is the next step; the pipeline is already turn-based behind a WebSocket.",
        ],
      },
    ],
  },
  {
    slug: "phenix",
    number: "02",
    title: "phenix",
    call: "Film room",
    callNote:
      "Every good team watches the tape. phenix records every LLM call so you can watch yours: latency, tokens, cost, and what changed between runs.",
    year: "2026",
    tagline: "Local-first LLM observability: traces, diffs and cost from your terminal.",
    problem:
      "Teams shipping LLM features either pay for a hosted tracing platform or fly blind. The middle option should be a single SQLite file and a CLI.",
    approach:
      "A Python library with decorator and context-manager APIs that capture latency, token usage and cost. Spans are queued and persisted by a background thread to a WAL-mode SQLite file, so instrumentation adds no blocking I/O to the request path. A CLI handles the analysis.",
    decisions: [
      "SQLite over Postgres: zero-config beats concurrent-writer throughput for a one-process-per-app tracer.",
      "A queue between the decorator and the disk. A hard crash can drop the queue tail; in exchange the hot path never touches disk.",
      "CLI before UI, so it works over SSH on day one.",
    ],
    stack: ["Python", "SQLite (WAL)", "pytest", "GitHub Actions"],
    role: "Personal project: designed and built end to end.",
    outcome: [
      "Benchmark suite measures p50/p99 overhead across 10,000 traced calls, against a target of under 1 ms p99.",
      "CLI for run-level analysis: span ledger, aggregate stats, run-to-run diff.",
      "CI on Python 3.11 and 3.12, plus a mock demo that needs no API keys.",
    ],
    repo: "https://github.com/raj2913/phenix",
    accent: "signal",
    diagram: {
      nodes: [
        { id: "code", label: "Your code", x: 200, y: 250, kind: "player", note: "@phenix.trace or `with phenix.span(...)` around any LLM call." },
        { id: "span", label: "Span", x: 90, y: 200, kind: "player", note: "Captures latency, token usage, cost, input and output." },
        { id: "queue", label: "Queue", x: 200, y: 150, kind: "check", note: "In-memory hand-off. The request path never waits on disk." },
        { id: "writer", label: "Writer", x: 310, y: 100, kind: "player", note: "Background thread drains the queue." },
        { id: "rim", label: "SQLite", x: 200, y: 30, kind: "basket", note: "One WAL-mode file. No server, no docker-compose, no key." },
        { id: "cli", label: "CLI", x: 90, y: 80, kind: "player", note: "phenix ls · inspect · stats · diff." },
      ],
      edges: [
        { from: "code", to: "span", kind: "pass" },
        { from: "span", to: "queue", kind: "pass" },
        { from: "queue", to: "writer", kind: "drive" },
        { from: "writer", to: "rim", kind: "shot" },
        { from: "rim", to: "cli", kind: "screen" },
      ],
    },
    caseStudy: [
      {
        title: "The challenge",
        body: [
          "Instrumentation that slows down the thing it measures gets turned off. The goal was tracing cheap enough to leave on: a target of under 1 ms p99 overhead per traced call, with no platform to run.",
        ],
      },
      {
        title: "Architecture",
        body: [
          "The decorator and context manager build a span in memory and enqueue it. A background thread writes spans to a WAL-mode SQLite file (`PHENIX_DB`, default `./phenix_traces.db`). Nothing on the hot path touches disk.",
          "The CLI reads the same file: `phenix ls` for the span ledger, `phenix inspect` for the full prompt and response of one span, `phenix diff` for what changed between two runs.",
        ],
      },
      {
        title: "Measuring it honestly",
        body: [
          "`python bench/overhead.py` runs 10,000 traced no-op calls, takes per-call perf_counter deltas, and reports p50/p99 net of plain-call cost. The README deliberately asks you to run it on your own machine for your own number rather than quoting one.",
        ],
      },
      {
        title: "Trade-offs",
        body: [
          "The queue is the trade: a hard crash can lose the tail of unwritten spans. For a development and debugging tool that is the right side of the bargain; for audit logging it would not be.",
          "Next: a PyPI release, `phenix stats --by-model`, and cost budgets.",
        ],
      },
    ],
  },
  {
    slug: "sidebet",
    number: "03",
    title: "sidebet",
    call: "Pick-and-roll",
    callNote:
      "Two players, one read. A bet only settles when both sides independently call it the same way.",
    year: "2026",
    tagline: "A shared ledger for the bets your group already makes: chais, biryanis, pushups.",
    problem:
      "Groups make bets constantly and settle almost none, because settling means someone has to remember the bet, agree on what happened, and keep count.",
    approach:
      "Domain logic (parsing, lifecycle state machine, ledger, rankings) is pure Python, decoupled from a small stdlib HTTP layer. A rules-first parser reads bets typed like a group-chat message; a ledger nets multi-party balances into a few settlements; standings rank by a Wilson-score lower bound, not raw win rate.",
    decisions: [
      "The parser is rules, not a model. A model that reads “2 chais” as “2 coffees” starts an argument; rules fail loudly and leave a field blank.",
      "An optional model pass may only fill fields the rules left empty, never overwrite one they matched. That is enforced in code and pinned by a test.",
      "Debts net within a stake unit and never across one: four chais and a dinner are not interchangeable, so the ledger raises instead of inventing an exchange rate.",
      "Win rate rewards betting on the sun rising. The Wilson lower bound means five-from-five does not outrank forty-from-fifty.",
    ],
    stack: ["Python", "JSON API", "pytest", "stdlib HTTP"],
    role: "Personal project: designed and built end to end.",
    outcome: [
      "114 automated tests that run in under a second, with no network and no keys.",
      "A seeded demo group, so a fresh clone never opens on an empty screen.",
    ],
    repo: "https://github.com/raj2913/sidebet",
    accent: "paper",
    diagram: {
      nodes: [
        { id: "composer", label: "Composer", x: 200, y: 252, kind: "player", note: "“bet you 2 chais India chases this by Friday”." },
        { id: "rules", label: "Rules", x: 95, y: 205, kind: "player", note: "Rules-only parser: claim, stake, deadline, opponent." },
        { id: "fill", label: "Model fill", x: 60, y: 120, kind: "check", labelAt: "above", note: "Optional. May only fill fields the rules left empty." },
        { id: "life", label: "Lifecycle", x: 200, y: 160, kind: "player", note: "open → active → settled, or disputed → group vote." },
        { id: "a", label: "Side A", x: 310, y: 210, kind: "player", note: "Calls the result independently." },
        { id: "b", label: "Side B", x: 330, y: 110, kind: "player", labelAt: "right", note: "Calls the result independently. Both must match." },
        { id: "rim", label: "Ledger", x: 200, y: 30, kind: "basket", note: "Per-unit netting into the fewest settlements." },
      ],
      edges: [
        { from: "composer", to: "rules", kind: "pass" },
        { from: "rules", to: "fill", kind: "screen" },
        { from: "rules", to: "life", kind: "pass" },
        { from: "life", to: "a", kind: "pass" },
        { from: "a", to: "b", kind: "screen" },
        { from: "life", to: "b", kind: "drive" },
        { from: "b", to: "rim", kind: "shot" },
      ],
    },
    caseStudy: [
      {
        title: "The challenge",
        body: [
          "A bet is a contract between two friends. The product has to hold the terms exactly, settle only when both sides agree, and keep score in a way nobody can game.",
        ],
      },
      {
        title: "Two rules carry the whole thing",
        body: [
          "Nobody grades their own bet alone: a bet settles only when both sides independently call it the same way. There is no “I won” button.",
          "Disagreement is a normal state, not an error. A disputed bet goes to the group, and anyone with a stake in the outcome does not get a vote. An even split voids the bet instead of flipping a coin.",
        ],
      },
      {
        title: "The ledger and the standings",
        body: [
          "Debts simplify within a unit: if A owes B two chais and B owes C two chais, A just buys C two chais. Across units, `Ledger.total()` raises `CrossUnitError` rather than adding them up.",
          "Standings use a conviction score: the Wilson lower bound of wins over settled bets, times how readily the group takes your action. You cannot farm conviction by offering bets nobody will touch.",
        ],
      },
      {
        title: "Engineering",
        body: [
          "Nothing in parsing, lifecycle, ledger or standings knows a server exists. That separation is what lets 114 tests run in under a second.",
          "Honest gaps, documented in the repo: no notifications yet, and the “not gambling” framing holds only while no money moves.",
        ],
      },
    ],
  },
];

export const archive = [
  {
    title: "Multi-label emotion detection API",
    note: "NLP classifier on transformer models (BERT, RoBERTa) behind a REST inference API.",
    href: "https://github.com/raj2913/Emotion-Detection",
  },
  {
    title: "PCB waste classification",
    note: "YOLO object detection with a backend pipeline for real-time image processing and inference.",
    href: null,
  },
] as const;
