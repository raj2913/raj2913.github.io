// "Courtside": the Voice Lab's demo agent. It books court time at a fictional gym.
// This is a small rule-based dialogue manager (keyword intents + slot filling), not a language model.
// The Voice Lab labels it that way on screen; keep it honest if you change it.

export type Slots = { day?: string; time?: string; court?: "full" | "half" };

export type Stage = "collect" | "confirm" | "booked" | "handoff" | "ended";

export type AgentState = { stage: Stage; slots: Slots; silences: number; turns: number };

export type Intent =
  | "greeting"
  | "book"
  | "provide_details"
  | "affirm"
  | "deny"
  | "ask_price"
  | "ask_hours"
  | "human"
  | "change_language"
  | "frustrated"
  | "goodbye"
  | "silence"
  | "unclear";

export type AgentTurn = { reply: string; intent: Intent; state: AgentState; filled: (keyof Slots)[] };

export const OPENER = "Hey, this is Courtside at Northside Courts. Want to book some court time?";

export const initialState = (): AgentState => ({ stage: "collect", slots: {}, silences: 0, turns: 0 });

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const has = (text: string, re: RegExp) => re.test(text);

function extractSlots(text: string): Slots {
  const out: Slots = {};
  if (has(text, /\b(today|tonight)\b/)) out.day = "today";
  else if (has(text, /\btomorrow\b/)) out.day = "tomorrow";
  else if (has(text, /\bweekend\b/)) out.day = "Saturday";
  else {
    const day = DAYS.find((d) => text.includes(d) || text.includes(d.slice(0, 3) + " "));
    if (day) out.day = day[0].toUpperCase() + day.slice(1);
  }

  const clock = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?\b/);
  if (clock) {
    const hour = Number(clock[1]);
    const suffix = clock[3]?.startsWith("a") ? "am" : clock[3]?.startsWith("p") ? "pm" : hour >= 6 && hour <= 11 ? "pm" : "";
    if (hour >= 1 && hour <= 23) out.time = `${hour}${clock[2] ? ":" + clock[2] : ""}${suffix ? " " + suffix : ""}`.trim();
  } else if (has(text, /\bmorning\b/)) out.time = "8 am";
  else if (has(text, /\bafternoon\b/)) out.time = "3 pm";
  else if (has(text, /\b(evening|tonight|night)\b/)) out.time = "7 pm";

  if (has(text, /\bfull\b/)) out.court = "full";
  else if (has(text, /\bhalf\b/)) out.court = "half";
  return out;
}

function classify(text: string, stage: Stage, newSlots: Slots): Intent {
  if (!text.trim()) return "silence";
  if (has(text, /\b(human|person|someone real|representative|real agent|manager|operator)\b/)) return "human";
  if (has(text, /\b(hindi|tamil|telugu|kannada|marathi|bengali|spanish|another language)\b|हिंदी/)) return "change_language";
  if (has(text, /\b(useless|stupid|annoying|ridiculous|not helping|frustrat)/)) return "frustrated";
  if (has(text, /\b(price|cost|how much|rate|charge|fee)\b/)) return "ask_price";
  if (has(text, /\b(open|close|hours|timings)\b/)) return "ask_hours";
  if (stage === "confirm") {
    if (has(text, /\b(yes|yeah|yep|sure|correct|confirm|book it|do it|sounds good|ok|okay)\b/)) return "affirm";
    if (has(text, /\b(no|nope|wrong|change|actually|wait)\b/)) return Object.keys(newSlots).length ? "provide_details" : "deny";
  }
  if (Object.keys(newSlots).length) return "provide_details";
  if (has(text, /\b(bye|goodbye|that's all|thats all|no thanks|nothing|hang up)\b/)) return "goodbye";
  if (has(text, /\b(book|reserve|court|play|slot|run|game)\b/) || (stage === "collect" && has(text, /\b(yes|yeah|sure|ok|okay)\b/))) return "book";
  if (has(text, /\b(hi|hello|hey)\b/)) return "greeting";
  return "unclear";
}

const courtName = (c?: Slots["court"]) => (c === "half" ? "a half court" : "a full court");

function nextQuestion(s: Slots): string {
  if (!s.day) return "What day were you thinking?";
  if (!s.time) return `What time ${s.day === "today" || s.day === "tomorrow" ? s.day : "on " + s.day}?`;
  if (!s.court) return "Full court or half court?";
  return "";
}

function confirmLine(s: Slots): string {
  const when = s.day === "today" || s.day === "tomorrow" ? `${s.day} at ${s.time}` : `${s.day} at ${s.time}`;
  return `So that's ${courtName(s.court)}, ${when}, for an hour. Should I lock it in?`;
}

export function respond(input: string, prev: AgentState): AgentTurn {
  const text = input.toLowerCase();
  const found = extractSlots(text);
  const intent = classify(text, prev.stage, found);
  const state: AgentState = { ...prev, slots: { ...prev.slots }, turns: prev.turns + 1 };
  const filled = (Object.keys(found) as (keyof Slots)[]).filter((k) => found[k] !== prev.slots[k]);
  if (intent !== "silence") state.silences = 0;

  const done = (reply: string, stage: Stage = state.stage): AgentTurn => ({ reply, intent, state: { ...state, stage }, filled });

  switch (intent) {
    case "silence":
      state.silences = prev.silences + 1;
      return state.silences >= 2
        ? done("I'll let you go for now. Call back whenever you're ready to play.", "ended")
        : done(state.stage === "booked" ? "Anything else I can help with?" : "Still there? You can say something like “full court tomorrow at 7”.");
    case "human":
      return done("Sure. I'll hand you to someone at the front desk, and pass along what we've covered so you don't repeat yourself.", "handoff");
    case "change_language":
      return done("In a real deployment I'd switch languages right here, mid-call. This demo only speaks English, so I've noted the preference. Shall we keep going?");
    case "frustrated":
      return done("Sorry, that's on me. I can keep it short, or put you through to a person. Which would you prefer?");
    case "ask_price":
      return done(`It's ₹1,200 an hour for a full court and ₹700 for a half court. ${nextQuestion(state.slots) || confirmLine(state.slots)}`);
    case "ask_hours":
      return done(`We're open 6 am to 11 pm, every day. ${nextQuestion(state.slots) || confirmLine(state.slots)}`);
    case "goodbye":
      return done("No problem. Enjoy your game.", "ended");
    case "greeting":
      return done("Hey! Want to book a court? Tell me a day and a time.");
    case "deny":
      state.slots = {};
      return done("No worries, let's start over. What day works for you?", "collect");
    case "affirm": {
      const code = "NC-" + (((state.slots.day?.length ?? 3) * 97 + (state.slots.time?.length ?? 2) * 13) % 900 + 100);
      return done(`Booked. ${courtName(state.slots.court)[0].toUpperCase() + courtName(state.slots.court).slice(1)}, ${state.slots.day} at ${state.slots.time}. Your code is ${code.replace("-", " ").split("").join(" ").replace(/\s+/g, " ")}. See you on the floor.`, "booked");
    }
    case "provide_details":
    case "book": {
      Object.assign(state.slots, found);
      const q = nextQuestion(state.slots);
      const ack = filled.length ? ["Got it.", "Okay.", "Nice."][state.turns % 3] + " " : "";
      if (q) return done(`${ack}${q}`, "collect");
      return done(`${ack}${confirmLine(state.slots)}`, "confirm");
    }
    default:
      return done(`Sorry, I didn't catch that. ${nextQuestion(state.slots) || confirmLine(state.slots)}`);
  }
}

export const suggestions: Record<Stage, string[]> = {
  collect: ["Book a full court tomorrow at 7", "How much is it?", "Can I talk to a person?", "Hindi mein baat karein?"],
  confirm: ["Yes, lock it in", "Actually, make it half court", "No, start over"],
  booked: ["What are your hours?", "That's all, bye"],
  handoff: [],
  ended: [],
};
