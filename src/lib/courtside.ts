// "Courtside": the Voice Lab's demo agent. It books court time at a fictional gym.
// This is a small rule-based dialogue manager (normalisation, keyword intents, slot filling, a stage machine),
// not a language model. The Voice Lab labels it that way on screen; keep it honest if you change it.
// Behaviour is pinned by scripts/test-courtside.ts (npm run test:agent).

export type Time = { h: number; m: number };
export type Slots = { day?: string; time?: Time; court?: "full" | "half"; hours?: number };
export type Stage = "collect" | "confirm" | "booked" | "handoff" | "ended";

export type AgentState = {
  stage: Stage;
  slots: Slots;
  silences: number;
  misses: number;
  warned: boolean;
  offeredHandoff?: boolean;
  turns: number;
  lastCode?: string;
};

export type Intent =
  | "greeting"
  | "book"
  | "provide_details"
  | "affirm"
  | "deny"
  | "change"
  | "cancel"
  | "reschedule"
  | "ask_price"
  | "ask_hours"
  | "ask_location"
  | "ask_amenities"
  | "identity"
  | "help"
  | "thanks"
  | "human"
  | "change_language"
  | "frustrated"
  | "abuse"
  | "goodbye"
  | "silence"
  | "unclear";

export type AgentTurn = { reply: string; intent: Intent; state: AgentState; filled: (keyof Slots)[] };

export const OPEN_HOUR = 6;
export const CLOSE_HOUR = 23;
export const PRICE = { full: 1200, half: 700 } as const;
export const OPENER = "Hey, this is Courtside at Northside Courts. Want to book some court time?";

export const initialState = (): AgentState => ({ stage: "collect", slots: {}, silences: 0, misses: 0, warned: false, turns: 0 });

// ---------- normalisation ----------

const NUMBERS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
};
const NUM = Object.keys(NUMBERS).join("|");

export function normalise(input: string): string {
  let t = ` ${input.toLowerCase().replace(/(\d)\s*[-–]\s*(\d)/g, "$1 to $2").replace(/[’']/g, "'").replace(/[^\p{L}\p{N}:' ]+/gu, " ")} `;
  t = t.replace(new RegExp(`\\bhalf past (${NUM}|\\d{1,2})\\b`, "g"), (_, n) => `${NUMBERS[n] ?? n}:30`);
  t = t.replace(new RegExp(`\\bquarter past (${NUM}|\\d{1,2})\\b`, "g"), (_, n) => `${NUMBERS[n] ?? n}:15`);
  t = t.replace(new RegExp(`\\bquarter to (${NUM}|\\d{1,2})\\b`, "g"), (_, n) => `${(NUMBERS[n] ?? +n) - 1}:45`);
  t = t.replace(new RegExp(`\\b(${NUM}) (thirty|fifteen|forty five|forty-five)\\b`, "g"), (_, n, m) => `${NUMBERS[n]}:${m === "thirty" ? "30" : m === "fifteen" ? "15" : "45"}`);
  t = t.replace(new RegExp(`\\b(${NUM})\\b`, "g"), (n) => String(NUMBERS[n]));
  t = t.replace(/\ban hour\b/g, "1 hours").replace(/\ba couple of hours\b/g, "2 hours");
  t = t.replace(/\b(\d{1,2}) ?o'?clock\b/g, "$1");
  t = t.replace(/\b(\d{1,2})(:\d{2})? ?([ap])\.? ?m\b\.?/g, "$1$2$3m");
  return t.replace(/\s+/g, " ");
}

const has = (t: string, re: RegExp) => re.test(t);

// ---------- slot extraction ----------

const WEEKDAYS = [
  ["monday", /\b(monday|mon)\b/],
  ["tuesday", /\b(tuesday|tues|tue)\b/],
  ["wednesday", /\b(wednesday|wed)\b/],
  ["thursday", /\b(thursday|thurs|thur|thu)\b/],
  ["friday", /\b(friday|fri)\b/],
  ["saturday", /\b(saturday|sat)\b/],
  ["sunday", /\b(sunday|sun)\b/],
] as const;

function extractDay(t: string): string | undefined {
  if (has(t, /\bday after tomorrow\b/)) return "the day after tomorrow";
  if (has(t, /\b(today|tonight|this evening|this afternoon|this morning)\b/)) return "today";
  if (has(t, /\b(tomorrow|tmrw|tmr)\b/)) return "tomorrow";
  const wd = WEEKDAYS.find(([, re]) => has(t, re));
  if (wd) return (has(t, /\bnext\b/) ? "next " : "") + wd[0][0].toUpperCase() + wd[0].slice(1);
  if (has(t, /\b(weekend)\b/)) return "Saturday";
  return undefined;
}

type TimeResult = { time?: Time; invalid?: boolean };

function extractTime(t: string, expectingTime = false): TimeResult {
  if (has(t, /\b(noon|midday)\b/)) return { time: { h: 12, m: 0 } };
  if (has(t, /\bmidnight\b/)) return { invalid: true };

  // Explicit clock times first: 7pm, 7:30pm, 18:00, 7:30.
  const re = /\b(\d{1,2})(?::(\d{2}))?(am|pm)?\b(?!st\b|nd\b|rd\b|th\b)(?!\s*(hours?|hrs?|h\b|people|players|persons|of us|guys|courts?|mins?|minutes|%|percent))/g;
  for (const m of t.matchAll(re)) {
    const raw = Number(m[1]);
    const min = m[2] ? Number(m[2]) : 0;
    const ap = m[3];
    const explicit = !!(ap || m[2]);
    const cue = has(t.slice(Math.max(0, m.index! - 8), m.index!), /\b(at|around|by|from|@|after|before|for)\s*$/);
    const alone = t.trim() === m[0];
    const context = has(t, /\b(time|slot|today|tonight|tomorrow|tmrw|day after|court|monday|mon|tuesday|tues|tue|wednesday|wed|thursday|thurs|thu|friday|fri|saturday|sat|sunday|sun|weekend)\b/);
    if (!explicit && !cue && !alone && !context && !expectingTime) continue;
    if (raw > 23 || min > 59) continue;
    let h = raw;
    if (ap === "pm" && h < 12) h += 12;
    else if (ap === "am" && h === 12) h = 0;
    else if (!ap && h <= 12) {
      const morning = has(t, /\bmorning\b/);
      if (h === 12) h = 12;
      else if (morning) h = h;
      else if (h <= 5) h += 12; // "at 5" means 5 pm at a gym that opens at 6
      else if (h <= 11 && !morning) h += 12;
    }
    return validTime(h, min) ? { time: { h, m: min } } : { invalid: true };
  }
  if (has(t, /\bmorning\b/)) return { time: { h: 8, m: 0 } };
  if (has(t, /\bafternoon\b/)) return { time: { h: 15, m: 0 } };
  if (has(t, /\b(evening|tonight)\b/)) return { time: { h: 19, m: 0 } };
  if (has(t, /\bnight\b/)) return { time: { h: 20, m: 0 } };
  return {};
}

const validTime = (h: number, m: number) => h >= OPEN_HOUR && h * 60 + m <= (CLOSE_HOUR - 1) * 60;

function extractHours(t: string): number | undefined {
  const m = t.match(/\b(\d)\s*(hours?|hrs?)\b/);
  if (m) return Number(m[1]);
  const range = t.match(/\b(\d{1,2})(?::\d{2})?\s*(?:am|pm)?\s*(?:to|till|until|-)\s*(\d{1,2})(?::\d{2})?\s*(?:am|pm)?\b/);
  if (range) {
    const span = (Number(range[2]) - Number(range[1]) + 12) % 12;
    if (span >= 1) return span;
  }
  return undefined;
}

function extractCourt(t: string): Slots["court"] {
  if (has(t, /\b(full|whole|entire)\b/)) return "full";
  if (has(t, /\bhalf\b(?! past)/)) return "half";
  return undefined;
}

// ---------- formatting ----------

export function formatTime({ h, m }: Time) {
  const suffix = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return h === 12 && m === 0 ? "noon" : `${h12}${m ? ":" + String(m).padStart(2, "0") : ""} ${suffix}`;
}
const courtName = (c?: Slots["court"]) => (c === "half" ? "a half court" : "a full court");
const dayPhrase = (d: string) => (d === "today" || d === "tomorrow" || d.startsWith("the ") || d.startsWith("next ") ? d : `on ${d}`);
const hoursPhrase = (n = 1) => (n === 1 ? "an hour" : `${n} hours`);
const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

function nextQuestion(s: Slots): string {
  if (!s.day) return "What day works for you?";
  if (!s.time) return `What time ${dayPhrase(s.day)}?`;
  if (!s.court) return "Full court or half court?";
  return "";
}

function confirmLine(s: Slots): string {
  const total = PRICE[s.court ?? "full"] * (s.hours ?? 1);
  return `So that's ${courtName(s.court)} ${dayPhrase(s.day!)} at ${formatTime(s.time!)}, for ${hoursPhrase(s.hours)}. That's ${rupees(total)}. Shall I book it?`;
}

const continueFlow = (s: Slots) => nextQuestion(s) || confirmLine(s);

// One slot is always taken, so the demo can show how the agent offers alternatives.
const isTaken = (s: Slots) => s.court === "full" && s.time?.h === 19 && s.time.m === 0 && /saturday/i.test(s.day ?? "");

function bookingCode(s: Slots, turns: number) {
  const key = `${s.day}|${s.time?.h}:${s.time?.m}|${s.court}|${s.hours}|${turns}`;
  let x = 7;
  for (const c of key) x = (x * 31 + c.charCodeAt(0)) % 9000;
  return `NC${x + 1000}`;
}
const spell = (code: string) => code.split("").join(" ");

// ---------- intents ----------

const PROFANITY = /\b(fuck\w*|shit\w*|bitch\w*|bastard|asshole|idiot|stfu|madarchod|bhenchod|chutiya)\b/;
const YES = /\b(yes|yeah|yep|yup|sure|correct|confirm|book it|do it|sounds good|go ahead|ok|okay|perfect|great|absolutely|haan|ha)\b/;
const NO = /\b(no|nope|nah|not right|wrong|incorrect|don't|dont)\b/;
const BYE = /\b(bye|goodbye|that's all|thats all|that's it|thats it|nothing else|no thanks|no thank you|maybe later|not now|later|hang up|never mind|nevermind|forget it)\b/;

function classify(t: string, st: AgentState, found: Slots, timeInvalid: boolean): Intent {
  if (!t.trim()) return "silence";
  if (has(t, PROFANITY)) return "abuse";
  if (has(t, /\b(human|person|someone real|real person|representative|agent please|manager|operator|front desk|staff)\b/)) return "human";
  if (has(t, /\b(hindi|tamil|telugu|kannada|marathi|bengali|gujarati|spanish|another language|other language)\b|हिंदी/)) return "change_language";
  if (has(t, /\b(are you|r u|is this) (a |an )?(bot|robot|ai|machine|human|real|computer|recording)\b|\bwho (are|is) (you|this)\b|\bwhat are you\b/)) return "identity";
  if (has(t, /\b(cancel)\b/)) return "cancel";
  if (has(t, /\b(reschedule|move my|change my booking|shift my)\b/)) return "reschedule";
  if (has(t, /\b(useless|stupid|annoying|ridiculous|not helping|frustrat\w*|waste of time|terrible)\b/)) return "frustrated";
  if (has(t, BYE) && !Object.keys(found).length) return "goodbye";
  if (has(t, /\b(what can you do|help|options|how does this work|what do you do)\b/)) return "help";
  if (has(t, /\b(price|prices|pricing|cost|costs|how much|rate|rates|charge|charges|fee|fees)\b/)) return "ask_price";
  if (has(t, /\b(when (do|are) you (open|close)|what time do you (open|close)|opening|closing|timings|your hours|open hours|open till|open until|are you open)\b/)) return "ask_hours";
  if (has(t, /\b(where|address|located|location|directions|how do i get)\b/)) return "ask_location";
  if (has(t, /\b(ball|balls|shoes|parking|park|locker|lockers|shower|showers|water|changing room)\b/)) return "ask_amenities";
  if (has(t, /^\s*(thanks|thank you|thx|ty|cheers|great thanks|ok thanks|okay thanks)\s*$/)) return "thanks";

  const newInfo = Object.keys(found).length > 0 || timeInvalid;
  if (st.stage === "confirm") {
    if (newInfo) return "provide_details";
    if (has(t, /\b(change|different|another|instead|actually|wait)\b/)) return "change";
    if (has(t, NO)) return "deny";
    if (has(t, YES)) return "affirm";
  }
  if (st.stage === "booked") {
    if (has(t, /\b(another|one more|again|new booking|book more)\b/)) return "book";
    if (newInfo) return "book";
    if (has(t, NO)) return "goodbye";
    if (has(t, YES)) return "help";
  }
  if (newInfo) return "provide_details";
  if (has(t, /\b(book|booking|reserve|court|play|slot|game|run|shoot)\b/)) return "book";
  if (st.stage === "collect" && has(t, YES)) return "book";
  if (st.stage === "collect" && has(t, NO)) return "deny";
  if (has(t, /\b(hi|hello|hey|hii|namaste|good (morning|afternoon|evening))\b/)) return "greeting";
  return "unclear";
}

// ---------- the turn ----------

const ACKS = ["Got it.", "Okay.", "Perfect.", "Sure."];

export function respond(input: string, prev: AgentState): AgentTurn {
  const t = normalise(input);
  // Right after "What time…?", a bare number is a time.
  const timeRes = extractTime(t, prev.stage === "collect" && !!prev.slots.day && !prev.slots.time);
  const found: Slots = {};
  const day = extractDay(t);
  if (day) found.day = day;
  if (timeRes.time) found.time = timeRes.time;
  const court = extractCourt(t);
  if (court) found.court = court;
  const hrs = extractHours(t);
  if (hrs) found.hours = hrs;

  const intent = classify(t, prev, found, !!timeRes.invalid);
  const state: AgentState = { ...prev, slots: { ...prev.slots }, turns: prev.turns + 1 };
  if (intent !== "silence") state.silences = 0;
  state.offeredHandoff = false;
  if (prev.offeredHandoff && has(t, YES) && !Object.keys(found).length)
    return { reply: "Putting you through to the front desk now.", intent: "human", state: { ...state, stage: "handoff" }, filled: [] };
  const offer = (reply: string) => {
    state.offeredHandoff = true;
    return done(reply);
  };
  state.misses = intent === "unclear" ? prev.misses + 1 : 0;

  let filled: (keyof Slots)[] = [];
  const absorb = () => {
    // After a finished booking, new details start a new booking.
    if (prev.stage === "booked") state.slots = {};
    const tooLong = found.hours !== undefined && (found.hours < 1 || found.hours > 3);
    if (tooLong) delete found.hours;
    filled = (Object.keys(found) as (keyof Slots)[]).filter((k) => JSON.stringify(found[k]) !== JSON.stringify(prev.slots[k]));
    Object.assign(state.slots, found);
    return tooLong;
  };
  const done = (reply: string, stage: Stage = state.stage): AgentTurn => ({ reply, intent, state: { ...state, stage }, filled });
  const ack = () => (filled.length ? ACKS[state.turns % ACKS.length] + " " : "");
  const proceed = (prefix = "") => {
    const q = nextQuestion(state.slots);
    if (q) return done(`${prefix}${q}`, "collect");
    if (isTaken(state.slots)) {
      delete state.slots.time;
      return done(`That full court is already booked ${dayPhrase(state.slots.day!)} at 7 pm. I have 6 pm or 8 pm, or a half court at 7. Which works?`, "collect");
    }
    return done(`${prefix}${confirmLine(state.slots)}`, "confirm");
  };
  const inFlow = prev.stage === "collect" || prev.stage === "confirm";
  const tail = () => (inFlow ? " " + (nextQuestion(state.slots) || "Shall I book it?") : " Anything else?");

  switch (intent) {
    case "silence": {
      state.silences = prev.silences + 1;
      if (state.silences >= 2) return done("I'll let you go for now. Call back whenever you're ready to play.", "ended");
      return done(prev.stage === "booked" ? "Anything else I can help with?" : "Still there? You can say something like “full court tomorrow at 7”.");
    }
    case "abuse":
      if (prev.warned) return done("I'm going to end the call here. You're welcome to call back any time.", "ended");
      state.warned = true;
      return done("I want to help, but I'll need us to keep it civil. What can I book for you?");
    case "human":
      return done("Sure. I'm handing you to someone at the front desk, with everything we've covered so you won't have to repeat yourself.", "handoff");
    case "change_language":
      return done("In a real deployment I'd switch languages right here, mid-call. This demo only speaks English, so I've noted the preference." + tail());
    case "identity":
      return done("I'm Courtside, an automated assistant for Northside Courts. I can book courts and answer quick questions, and I'll put you through to a person whenever you like." + tail());
    case "help":
      return done("I can book a full or half court, tell you prices and hours, or change a booking made on this call. Try “half court Saturday at 6”." + (inFlow && nextQuestion(state.slots) ? " " + nextQuestion(state.slots) : ""));
    case "thanks":
      return done(prev.stage === "booked" ? "You're welcome! Anything else?" : "You're welcome." + tail());
    case "ask_price": {
      absorb();
      return done(`A full court is ${rupees(PRICE.full)} an hour and a half court is ${rupees(PRICE.half)}.` + tail());
    }
    case "ask_hours":
      absorb();
      return done("We're open 6 am to 11 pm, every day." + tail());
    case "ask_location":
      return done("We're at 14 Carter Road, Bandra West. It's a demo gym, so please don't go looking for it." + tail());
    case "ask_amenities":
      return done("Balls are free at the desk, lockers and showers are included, and there's parking out front." + tail());
    case "goodbye":
      return done(prev.stage === "confirm" ? "No problem, I won't book it. Enjoy your day." : "No problem. Enjoy your game.", "ended");
    case "frustrated":
      return offer("Sorry about that. Want me to put you through to a person?");
    case "greeting":
      return done(prev.turns === 0 ? "Hey! Want to book a court? Tell me a day and a time." : "Hey! " + continueFlow(state.slots));
    case "cancel":
      if (prev.lastCode) {
        state.slots = {};
        return done(`Done. Booking ${spell(prev.lastCode)} is cancelled. Anything else?`, "booked");
      }
      if (prev.stage === "confirm" || Object.keys(prev.slots).length) {
        state.slots = {};
        return done("Okay, I've dropped that. Anything else I can help with?", "collect");
      }
      return offer("I can only change bookings made on this call. For an older booking, I can put you through to the front desk. Want that?");
    case "reschedule":
      if (prev.lastCode) {
        state.slots = { court: prev.slots.court, hours: prev.slots.hours };
        return done(`Sure, let's move ${spell(prev.lastCode)}. What day works instead?`, "collect");
      }
      return offer("I can only move bookings made on this call. For an older one, I can put you through to the front desk. Want that?");
    case "deny":
      if (prev.stage === "confirm") return done("No problem. What should I change: the day, the time, or the court?", "collect");
      return done("No worries. I can tell you prices or hours, or book whenever you're ready.");
    case "change": {
      if (has(t, /\b(day|date)\b/)) delete state.slots.day;
      else if (has(t, /\b(time|hour|earlier|later)\b/)) delete state.slots.time;
      else if (has(t, /\b(court|size)\b/)) delete state.slots.court;
      else return done("Sure. What should I change: the day, the time, or the court?", "collect");
      return proceed();
    }
    case "affirm": {
      const code = bookingCode(state.slots, state.turns);
      state.lastCode = code;
      const s = state.slots;
      return done(`Booked. ${cap(courtName(s.court))} ${dayPhrase(s.day!)} at ${formatTime(s.time!)} for ${hoursPhrase(s.hours)}. Your code is ${spell(code)}. See you on the floor.`, "booked");
    }
    case "book":
    case "provide_details": {
      const tooLong = absorb();
      if (timeRes.invalid) return done(`We're open ${OPEN_HOUR} am to 11 pm, so the last start time is 10 pm. What time works in that window?`, "collect");
      if (tooLong) return proceed("Bookings run from 1 to 3 hours, so I'll keep it at an hour for now. ");
      if (prev.stage === "booked" && !filled.length) return done("Sure, a new booking. What day works for you?", "collect");
      return proceed(ack());
    }
    default: {
      if (state.misses >= 2) return offer("I'm not getting this one, sorry. Try something like “half court Saturday at 6”, or I can put you through to a person. Want that?");
      return done("Sorry, I didn't catch that." + (inFlow ? " " + continueFlow(state.slots) : " Anything else I can help with?"));
    }
  }
}

export const suggestions: Record<Stage, string[]> = {
  collect: ["Full court tomorrow at 7", "Half court Saturday evening for 2 hours", "How much is it?", "Are you a bot?", "Can I talk to a person?"],
  confirm: ["Yes, book it", "Make it half court", "Change the time", "No thanks, bye"],
  booked: ["Book another one", "Cancel that booking", "Do you rent balls?", "That's all, bye"],
  handoff: [],
  ended: [],
};
