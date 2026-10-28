"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { initialState, OPENER, respond, type AgentState, type Intent, type Slots } from "@/lib/courtside";

export type Phase = "idle" | "listening" | "processing" | "responding" | "interrupted" | "ended";

export type Entry = {
  id: number;
  who: "agent" | "caller" | "system";
  text: string;
  shown: number; // words revealed so far (agent lines)
  cut?: boolean;
};

export type TurnInfo = { intent: Intent; filled: (keyof Slots)[]; engineMs: number; thinkMs: number };

const SILENCE_MS = 9000;
const WORD_MS = 190;

// Minimal Web Speech API typing (not in every TS DOM lib, and prefixed in Chrome).
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
};

function recognitionCtor(): (new () => Recognition) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useVoiceSession() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [agent, setAgent] = useState<AgentState>(initialState);
  const [turn, setTurn] = useState<TurnInfo | null>(null);
  const [voiceOn, setVoiceOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [partial, setPartial] = useState("");
  const [support, setSupport] = useState({ stt: false, tts: false });

  // Refs mirror state for timer and event callbacks.
  const phaseRef = useRef<Phase>("idle");
  const agentRef = useRef<AgentState>(agent);
  const voiceRef = useRef(false);
  const speakingId = useRef<number | null>(null);
  const timers = useRef<number[]>([]);
  const silenceTimer = useRef<number | null>(null);
  const revealTimer = useRef<number | null>(null);
  const nextId = useRef(1);
  const recognition = useRef<Recognition | null>(null);
  const micStream = useRef<MediaStream | null>(null);
  const audioCtx = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);

  // Read by the waveform every frame, without re-rendering React.
  const level = useRef(0);
  const shownRef = useRef<Record<number, number>>({});
  const entriesRef = useRef<Entry[]>([]);
  // Speech that lands while the agent is thinking waits for the next turn instead of being dropped.
  const pending = useRef("");

  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  const go = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  const later = (fn: () => void, ms: number) => {
    const t = window.setTimeout(fn, ms);
    timers.current.push(t);
    return t;
  };

  const clearSilence = () => {
    if (silenceTimer.current) window.clearTimeout(silenceTimer.current);
    silenceTimer.current = null;
  };

  const stopReveal = () => {
    if (revealTimer.current) window.clearInterval(revealTimer.current);
    revealTimer.current = null;
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  };

  const addEntry = useCallback((e: Omit<Entry, "id">) => {
    const id = nextId.current++;
    setEntries((xs) => [...xs, { ...e, id }]);
    return id;
  }, []);

  const setShown = (id: number, shown: number) => {
    shownRef.current[id] = shown;
    setEntries((xs) => xs.map((x) => (x.id === id ? { ...x, shown } : x)));
  };

  const handleRef = useRef<(raw: string, silent?: boolean) => void>(() => {});
  const armSilence = useCallback(() => {
    clearSilence();
    silenceTimer.current = window.setTimeout(() => {
      if (phaseRef.current === "listening") handleRef.current("", true);
    }, SILENCE_MS);
  }, []);

  const speak = useCallback(
    (text: string, onDone: () => void) => {
      go("responding");
      const id = addEntry({ who: "agent", text, shown: 0 });
      speakingId.current = id;
      const words = text.split(" ");
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        stopReveal();
        setShown(id, words.length);
        speakingId.current = null;
        onDone();
      };

      if (voiceRef.current && "speechSynthesis" in window) {
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 1.05;
        u.onboundary = (ev) => {
          if (ev.name && ev.name !== "word") return;
          setShown(id, Math.min(words.length, text.slice(0, ev.charIndex).split(" ").length));
          level.current = 1;
        };
        u.onend = () => phaseRef.current === "responding" && finish();
        u.onerror = () => phaseRef.current === "responding" && finish();
        window.speechSynthesis.speak(u);
        // Safety net for voices that never fire boundary or end events.
        const started = performance.now();
        revealTimer.current = window.setInterval(() => {
          const elapsed = performance.now() - started;
          const estimate = Math.min(words.length, Math.floor(elapsed / (WORD_MS * 1.8)));
          if (estimate > (shownRef.current[id] ?? 0)) setShown(id, estimate);
          if (elapsed > words.length * WORD_MS * 1.8 + 4000) finish();
        }, 300);
      } else {
        let shown = 0;
        revealTimer.current = window.setInterval(() => {
          shown += 1;
          level.current = 1;
          setShown(id, shown);
          if (shown >= words.length) window.setTimeout(finish, 280);
        }, WORD_MS);
      }
    },
    [addEntry, go],
  );

  const afterAgentTurn = useCallback(() => {
    const st = agentRef.current;
    if (st.stage === "ended" || st.stage === "handoff") {
      go("ended");
      addEntry({ who: "system", text: st.stage === "handoff" ? "Call transferred to a person. Session over." : "Call ended.", shown: 0 });
      return;
    }
    go("listening");
    armSilence();
    if (pending.current) {
      const text = pending.current;
      pending.current = "";
      handleRef.current(text);
    }
  }, [addEntry, armSilence, go]);

  // Barge-in: the caller speaks while the agent is talking. Keep only the words actually said.
  const interrupt = useCallback(() => {
    if (phaseRef.current !== "responding" || speakingId.current === null) return false;
    const id = speakingId.current;
    stopReveal();
    speakingId.current = null;
    setEntries((xs) => xs.map((x) => (x.id === id ? { ...x, cut: true, shown: Math.max(1, shownRef.current[id] ?? 1) } : x)));
    go("interrupted");
    return true;
  }, [go]);

  const handleInput = useCallback(
    (raw: string, silent = false) => {
      const text = raw.trim();
      if (phaseRef.current === "processing" && text && !silent) {
        pending.current = `${pending.current} ${text}`.trim();
        return;
      }
      if (phaseRef.current === "idle" || phaseRef.current === "ended" || phaseRef.current === "processing") return;
      if (!silent && !text) return;
      clearSilence();
      const wasInterrupt = interrupt();

      addEntry(silent ? { who: "system", text: `${SILENCE_MS / 1000}s of silence`, shown: 0 } : { who: "caller", text, shown: 0 });
      const begin = () => {
        go("processing");
        const t0 = performance.now();
        const result = respond(silent ? "" : text, agentRef.current);
        const engineMs = performance.now() - t0;
        const thinkMs = 520 + Math.round(Math.random() * 380);
        agentRef.current = result.state;
        setAgent(result.state);
        setTurn({ intent: result.intent, filled: result.filled, engineMs, thinkMs });
        later(() => speak(result.reply, afterAgentTurn), thinkMs);
      };
      if (wasInterrupt) later(begin, 450);
      else begin();
    },
    [addEntry, afterAgentTurn, go, interrupt, speak],
  );

  useEffect(() => {
    handleRef.current = handleInput;
  }, [handleInput]);

  const start = useCallback(() => {
    setSupport({ stt: recognitionCtor() !== null, tts: "speechSynthesis" in window });
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    stopReveal();
    clearSilence();
    const fresh = initialState();
    agentRef.current = fresh;
    setAgent(fresh);
    setTurn(null);
    setEntries([]);
    shownRef.current = {};
    pending.current = "";
    later(() => speak(OPENER, afterAgentTurn), 350);
    go("processing");
  }, [afterAgentTurn, go, speak]);

  const toggleVoice = useCallback(() => {
    voiceRef.current = !voiceRef.current;
    setVoiceOn(voiceRef.current);
    if (!voiceRef.current && "speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  const stopMic = useCallback(() => {
    const rec = recognition.current;
    recognition.current = null;
    rec?.abort();
    micStream.current?.getTracks().forEach((t) => t.stop());
    micStream.current = null;
    audioCtx.current?.close().catch(() => {});
    audioCtx.current = null;
    analyser.current = null;
    setMicOn(false);
    setPartial("");
  }, []);

  // The mic hears the agent's own voice through the speakers. Ignore speech that is just the agent's line coming back.
  const isEcho = (heard: string) => {
    if (!voiceRef.current || speakingId.current === null) return false;
    const line = entriesRef.current.find((x) => x.id === speakingId.current)?.text.toLowerCase() ?? "";
    const words = heard.toLowerCase().match(/[a-z0-9']+/g) ?? [];
    return words.length > 0 && words.filter((w) => line.includes(w)).length / words.length >= 0.6;
  };

  // Only ever called from a click. Recognition starts before any await so browsers that need the click (Safari) accept it.
  const startMic = useCallback(() => {
    setMicError(null);
    const Ctor = recognitionCtor();
    if (!Ctor) {
      setMicError("Speech recognition isn't available in this browser. Try Chrome, Edge or Safari, or type instead.");
      return;
    }
    const rec = new Ctor();
    rec.lang = "en-IN";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        const heard = r[0].transcript.trim();
        if (!heard || isEcho(heard)) continue;
        if (r.isFinal) {
          setPartial("");
          handleRef.current(heard);
        } else interim += r[0].transcript;
      }
      setPartial(interim.trim());
      if (interim.trim()) {
        if (phaseRef.current === "listening") clearSilence();
        if (phaseRef.current === "responding") interrupt();
      }
    };
    rec.onerror = (e) => {
      const fatal: Record<string, string> = {
        "not-allowed": "Microphone access is blocked. Allow it from the icon in the address bar, or type instead.",
        "service-not-allowed": "This browser won't run speech recognition here. Try Chrome or Edge, or type instead.",
        "audio-capture": "No microphone was found. Plug one in, or type instead.",
        network: "This browser's speech service isn't reachable (Brave and some Chromium browsers don't include one). Try Chrome or Edge, or type instead.",
        "language-not-supported": "This browser doesn't support English (India) recognition. Type instead.",
      };
      if (fatal[e.error] && recognition.current === rec) {
        stopMic();
        setMicError(fatal[e.error]);
      }
    };
    let restarts = 0;
    let since = performance.now();
    rec.onend = () => {
      // Browsers end continuous recognition after a pause; restart while the mic is on, but not in a tight loop.
      if (recognition.current !== rec) return;
      if (performance.now() - since > 5000) {
        restarts = 0;
        since = performance.now();
      }
      if (++restarts > 5) {
        stopMic();
        setMicError("The speech service keeps stopping. Turn the mic on again, or type instead.");
        return;
      }
      window.setTimeout(() => {
        if (recognition.current !== rec) return;
        try {
          rec.start();
        } catch {
          /* already started */
        }
      }, 200);
    };
    recognition.current = rec;
    try {
      rec.start();
    } catch {
      recognition.current = null;
      setMicError("Couldn't start the microphone. Type instead.");
      return;
    }
    setMicOn(true);

    // A second, separate stream drives the level meter. If it fails, recognition still works.
    navigator.mediaDevices
      ?.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
      .then((stream) => {
        if (recognition.current !== rec) return stream.getTracks().forEach((t) => t.stop());
        micStream.current = stream;
        const ctx = new AudioContext();
        const an = ctx.createAnalyser();
        an.fftSize = 512;
        ctx.createMediaStreamSource(stream).connect(an);
        audioCtx.current = ctx;
        analyser.current = an;
      })
      .catch(() => {});
  }, [interrupt, stopMic]);

  const toggleMic = useCallback(() => (micOn ? stopMic() : startMic()), [micOn, startMic, stopMic]);

  // Live mic level for the waveform.
  const readMic = useCallback(() => {
    const an = analyser.current;
    if (!an) return null;
    const buf = new Uint8Array(an.frequencyBinCount);
    an.getByteTimeDomainData(buf);
    let sum = 0;
    for (const v of buf) sum += ((v - 128) / 128) ** 2;
    return Math.min(1, Math.sqrt(sum / buf.length) * 4);
  }, []);

  // Typing counts as the caller's voice on the waveform.
  const nudge = useCallback(() => {
    level.current = Math.min(1, level.current + 0.35);
    // Someone typing isn't silence.
    if (phaseRef.current === "listening") armSilence();
  }, [armSilence]);

  const end = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    stopReveal();
    clearSilence();
    stopMic();
    go("idle");
  }, [go, stopMic]);

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      stopReveal();
      clearSilence();
      recognition.current?.abort();
      micStream.current?.getTracks().forEach((t) => t.stop());
      audioCtx.current?.close().catch(() => {});
    },
    [],
  );

  return {
    phase,
    entries,
    agent,
    turn,
    voiceOn,
    micOn,
    micError,
    partial,
    support,
    level,
    start,
    end,
    send: handleInput,
    toggleVoice,
    toggleMic,
    startMic,
    readMic,
    nudge,
  };
}
