// Conversation tests for the Voice Lab agent. Run: npm run test:agent
import assert from "node:assert/strict";
import { formatTime, initialState, respond, type AgentState, type AgentTurn } from "../src/lib/courtside";

type Check = (t: AgentTurn) => void;
let passed = 0;
const failures: string[] = [];

function convo(name: string, turns: [string, Check][]) {
  let s: AgentState = initialState();
  const log: string[] = [];
  try {
    for (const [said, check] of turns) {
      const r = respond(said, s);
      log.push(`  U: ${said}\n  A: [${r.intent}/${r.state.stage}] ${r.reply}`);
      check(r);
      s = r.state;
    }
    passed++;
  } catch (e) {
    failures.push(`✗ ${name}\n${log.join("\n")}\n  → ${(e as Error).message}`);
  }
}

const says = (re: RegExp) => (t: AgentTurn) => assert.match(t.reply, re);
const stage = (st: string) => (t: AgentTurn) => assert.equal(t.state.stage, st);
const intent = (i: string) => (t: AgentTurn) => assert.equal(t.intent, i);
const time = (h: number, m = 0) => (t: AgentTurn) => assert.deepEqual(t.state.slots.time, { h, m });
const day = (d: string) => (t: AgentTurn) => assert.equal(t.state.slots.day, d);
const court = (c: string) => (t: AgentTurn) => assert.equal(t.state.slots.court, c);
const hours = (n: number) => (t: AgentTurn) => assert.equal(t.state.slots.hours, n);
const noTime = (t: AgentTurn) => assert.equal(t.state.slots.time, undefined);
const all = (...cs: Check[]) => (t: AgentTurn) => cs.forEach((c) => c(t));
const notConfused = (t: AgentTurn) => assert.doesNotMatch(t.reply, /didn't catch/);

// Happy paths
convo("step by step", [
  ["hi", all(intent("greeting"), says(/book a court/))],
  ["i want to play tomorrow", all(day("tomorrow"), says(/What time tomorrow/))],
  ["around 6", all(time(18), says(/Full court or half/))],
  ["full", all(court("full"), stage("confirm"), says(/full court tomorrow at 6 pm, for an hour\. That's ₹1,200/))],
  ["yes", all(stage("booked"), says(/Booked\..*N C \d/))],
]);
convo("all at once", [["full court tomorrow at 7pm", all(stage("confirm"), time(19), court("full"), day("tomorrow"))]]);
convo("duration is not a time and not an hours question", [
  ["book a court for 2 hours on friday at 7pm", all(intent("provide_details"), hours(2), time(19), day("Friday"), says(/Full court or half/))],
  ["half", says(/for 2 hours\. That's ₹1,400/)],
]);
convo("abbreviated day and evening", [["can I get a half court on sat evening", all(day("Saturday"), time(19), court("half"), stage("confirm"))], ["yep", stage("booked")]]);
convo("number words", [["tomorrow at seven thirty", time(19, 30)]]);
convo("half past", [["half past six on monday, full court", all(time(18, 30), day("Monday"), court("full"))]]);
convo("24h clock", [["tomorrow at 18:00 full court", all(time(18), says(/6 pm/))]]);
convo("noon and day after tomorrow", [["day after tomorrow at noon, full court", all(time(12), day("the day after tomorrow"), says(/the day after tomorrow at noon/))]]);
convo("next weekday", [["next thursday 8pm half", all(day("next Thursday"), time(20), court("half"))]]);
convo("bare number answer", [["tomorrow", day("tomorrow")], ["5", all(time(17), says(/Full court or half/))]]);
convo("morning means am", [["saturday morning at 9", time(9)], ["full", says(/9 am/)]]);
convo("tonight", [["tonight, half court", all(day("today"), time(19), court("half"))]]);
convo("people count is not a time", [["full court tomorrow for 4 people", all(noTime, day("tomorrow"), says(/What time/))]]);
convo("ordinal is not a time", [["on the 5th", all(noTime)]]);

// Opening hours
convo("3 am is closed", [["tomorrow at 3am", all(noTime, day("tomorrow"), says(/open 6 am to 11 pm/))], ["7pm", time(19)]]);
convo("11 pm is too late to start", [["full court today at 11pm", all(noTime, says(/last start time is 10 pm/))]]);
convo("too long", [["full court tomorrow at 7 for 5 hours", all(says(/1 to 3 hours/))]]);

// Confirm-stage edits
convo("no at confirm asks what to change, keeps slots", [
  ["full court tomorrow 7", stage("confirm")],
  ["no", all(says(/What should I change/), day("tomorrow"), court("full"))],
  ["make it friday", all(day("Friday"), stage("confirm"))],
]);
convo("change the time", [
  ["full court tomorrow 7", stage("confirm")],
  ["change the time", all(noTime, says(/What time tomorrow/))],
  ["8", all(time(20), stage("confirm"))],
]);
convo("swap court size", [["full court tomorrow 7", stage("confirm")], ["actually make it half court", all(court("half"), stage("confirm"), says(/₹700/))]]);
convo("no thanks bye ends politely", [["full court tomorrow 7", stage("confirm")], ["no thanks bye", all(stage("ended"), says(/won't book it/))]]);

// After booking
convo("book another starts fresh", [
  ["full court tomorrow 7", stage("confirm")],
  ["yes", stage("booked")],
  ["book another one", all(stage("collect"), says(/new booking/), (t) => assert.deepEqual(t.state.slots, {}))],
  ["sunday at 6, half", all(stage("confirm"), day("Sunday"), court("half"))],
]);
convo("new details after booking start a new booking", [["full court tomorrow 7", stage("confirm")], ["yes", stage("booked")], ["saturday 8pm", all(day("Saturday"), time(20), says(/Full court or half/))]]);
convo("no after booked ends", [["full court tomorrow 7", stage("confirm")], ["yes", stage("booked")], ["no", stage("ended")]]);
convo("cancel this call's booking", [["full court tomorrow 7", stage("confirm")], ["yes", stage("booked")], ["cancel that booking", says(/is cancelled/)]]);
convo("reschedule this call's booking", [["half court tomorrow 7", stage("confirm")], ["yes", stage("booked")], ["can I reschedule", all(says(/What day works instead/), court("half"))], ["friday at 6", all(stage("confirm"), court("half"))]]);
convo("cancel with nothing booked", [["cancel my booking", says(/only change bookings made on this call/)]]);

// Questions mid-flow keep the flow
convo("price keeps slots and flow", [["how much for a half court?", all(intent("ask_price"), court("half"), says(/₹700.*What day/))], ["ok saturday at 6", stage("confirm")]]);
convo("hours question", [["what time do you close", all(intent("ask_hours"), says(/11 pm/))]]);
convo("amenities", [["do you rent balls", all(intent("ask_amenities"), notConfused)]]);
convo("location", [["where are you located", all(intent("ask_location"), notConfused)]]);
convo("identity disclosure", [["are you a bot?", all(intent("identity"), says(/automated assistant/))]]);
convo("help", [["what can you do", all(intent("help"), notConfused)]]);
convo("thanks", [["thanks", all(intent("thanks"), notConfused)]]);
convo("question at confirm returns to confirm", [["full court tomorrow 7", stage("confirm")], ["do you have parking?", says(/parking.*Shall I book it/)], ["yes", stage("booked")]]);

// Off-ramps
convo("human", [["can I talk to a person", stage("handoff")]]);
convo("language", [["hindi mein baat karein?", all(intent("change_language"), says(/English/))]]);
convo("maybe later", [["maybe later", stage("ended")]]);
convo("plain no at start", [["no", all(notConfused, stage("collect"))]]);
convo("frustration offers a person", [["this is useless", says(/person/)]]);
convo("abuse: warn, then end", [["fuck off", all(stage("collect"), says(/civil/))], ["shut up you idiot", stage("ended")]]);
convo("repeated nonsense escalates", [["asdf qwer", says(/didn't catch/)], ["blorp", says(/person/)]]);
convo("silence twice ends", [["", says(/Still there/)], ["", stage("ended")]]);

convo("time range sets start and length", [["half court saturday from 6 to 8", all(time(18), hours(2), court("half"), stage("confirm"), says(/for 2 hours\. That's ₹1,400/))]]);
convo("dash range", [["tomorrow 7-9 full", all(time(19), hours(2))]]);
convo("taken slot offers alternatives", [
  ["full court saturday at 7pm", all(stage("collect"), noTime, says(/already booked.*6 pm or 8 pm/))],
  ["8 then", all(time(20), stage("confirm"))],
]);
convo("taken slot, switch to half", [["full court saturday at 7pm", says(/already booked/)], ["half court at 7 is fine", all(court("half"), time(19), stage("confirm"))]]);
convo("polite request", [["hi, I'd like to book a court please", all(intent("book"), says(/What day/))]]);
convo("bare time with no day asks for day", [["a court at 7", all(time(19), says(/What day/))]]);
convo("sounds good confirms", [["half court tuesday at 6", stage("confirm")], ["sounds good", stage("booked")]]);
convo("time change at confirm", [["half court tuesday at 6", stage("confirm")], ["can we do 7:30 instead", all(time(19, 30), stage("confirm"))]]);

convo("accepting the front-desk offer hands off", [["cancel my booking", says(/front desk/)], ["yes please", stage("handoff")]]);
convo("frustrated, then yes", [["this is useless", says(/person/)], ["yeah", stage("handoff")]]);
convo("next weekday phrasing", [["next thursday 8pm half", says(/half court next Thursday at 8 pm/)]]);

// Formatting
assert.equal(formatTime({ h: 12, m: 0 }), "noon");
assert.equal(formatTime({ h: 18, m: 30 }), "6:30 pm");
assert.equal(formatTime({ h: 9, m: 0 }), "9 am");

if (failures.length) {
  console.error(failures.join("\n\n"));
  console.error(`\n${failures.length} failed, ${passed} passed`);
  process.exit(1);
}
console.log(`✓ ${passed} conversations passed`);
