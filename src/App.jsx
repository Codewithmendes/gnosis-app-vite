import { useState, useRef, useEffect, useCallback } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const BACKEND = "https://gnosis-backend-production-e3ca.up.railway.app";

const WS_URL = BACKEND.replace("https://","wss://").replace("http://","ws://");
const GOOGLE_CLIENT_ID = "96873408972-e6m0cqs4i274ret164cjmhfnrdmlt76b.apps.googleusercontent.com";



// ─── THEMES ───────────────────────────────────────────────────────────────────
const DARK = {
  bg: "#07080f", panel: "rgba(255,255,255,0.04)", card: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.10)",
  gold: "#C8A96E", goldFaint: "rgba(200,169,110,0.10)", goldBorder: "rgba(200,169,110,0.28)",
  text: "rgba(255,255,255,0.92)", sub: "rgba(255,255,255,0.58)", muted: "rgba(255,255,255,0.30)",
  input: "rgba(255,255,255,0.06)", nav: "rgba(7,8,15,0.7)",
  green: "#22c55e", red: "#ef4444", blue: "#3b82f6",
  userBg: "rgba(200,169,110,0.12)", userBorder: "rgba(200,169,110,0.28)", userText: "#F0D9A8",
  aiBg: "rgba(255,255,255,0.05)", aiBorder: "rgba(255,255,255,0.09)",
  glass: "rgba(255,255,255,0.06)", glassBorder: "rgba(255,255,255,0.13)", glassShine: "rgba(255,255,255,0.09)",
};
const LIGHT = {
  bg: "#f0ece4", panel: "rgba(255,255,255,0.45)", card: "rgba(255,255,255,0.55)", border: "rgba(0,0,0,0.08)",
  gold: "#8B6B14", goldFaint: "rgba(139,107,20,0.09)", goldBorder: "rgba(139,107,20,0.28)",
  text: "rgba(10,8,0,0.9)", sub: "rgba(10,8,0,0.62)", muted: "rgba(10,8,0,0.36)",
  input: "rgba(255,255,255,0.55)", nav: "rgba(240,236,228,0.75)",
  green: "#16a34a", red: "#dc2626", blue: "#2563eb",
  userBg: "rgba(139,107,20,0.09)", userBorder: "rgba(139,107,20,0.22)", userText: "#4A3000",
  aiBg: "rgba(255,255,255,0.5)", aiBorder: "rgba(0,0,0,0.07)",
  glass: "rgba(255,255,255,0.45)", glassBorder: "rgba(255,255,255,0.7)", glassShine: "rgba(255,255,255,0.6)",
};

const makeCSS = (T) => `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Cinzel:wght@500;600;700&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  html,body { background:${T.bg}; color:${T.text}; font-family:'Inter',sans-serif; font-size:15px; min-height:100vh; }

  /* Animated background orbs */
  body::before, body::after {
    content:''; position:fixed; border-radius:50%; pointer-events:none; z-index:0;
    filter:blur(80px); opacity:.35;
  }
  body::before {
    width:520px; height:520px; top:-120px; left:-100px;
    background:radial-gradient(circle, rgba(200,169,110,.45) 0%, transparent 70%);
    animation:orbDrift1 18s ease-in-out infinite;
  }
  body::after {
    width:440px; height:440px; bottom:-80px; right:-80px;
    background:radial-gradient(circle, rgba(100,80,200,.35) 0%, transparent 70%);
    animation:orbDrift2 22s ease-in-out infinite;
  }

  /* Glass utility */
  .glass {
    background: ${T.glass};
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid ${T.glassBorder};
    box-shadow: 0 2px 24px rgba(0,0,0,.18), inset 0 1px 0 ${T.glassShine};
  }
  .glass-card {
    background: ${T.glass};
    backdrop-filter: blur(20px) saturate(160%);
    -webkit-backdrop-filter: blur(20px) saturate(160%);
    border: 1px solid ${T.glassBorder};
    box-shadow: 0 4px 32px rgba(0,0,0,.14), inset 0 1px 0 ${T.glassShine}, inset 0 -1px 0 rgba(0,0,0,.08);
    border-radius: 14px;
  }
  .glass-gold {
    background: linear-gradient(135deg, rgba(200,169,110,.15) 0%, rgba(200,169,110,.06) 100%);
    backdrop-filter: blur(20px) saturate(160%);
    -webkit-backdrop-filter: blur(20px) saturate(160%);
    border: 1px solid rgba(200,169,110,.3);
    box-shadow: 0 4px 24px rgba(200,169,110,.10), inset 0 1px 0 rgba(200,169,110,.2);
    border-radius: 14px;
  }
  .glass-input {
    background: ${T.input};
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid ${T.glassBorder};
    box-shadow: inset 0 1px 3px rgba(0,0,0,.12), inset 0 -1px 0 ${T.glassShine};
    transition: border-color .2s, box-shadow .2s;
  }
  .glass-input:focus {
    border-color: rgba(200,169,110,.6) !important;
    box-shadow: 0 0 0 3px rgba(200,169,110,.12), inset 0 1px 3px rgba(0,0,0,.08) !important;
    outline: none;
  }
  .glass-btn {
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    transition: all .18s;
  }
  .glass-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(200,169,110,.22);
  }
  .glass-btn:active:not(:disabled) { transform: translateY(0); }
  .glass-nav {
    background: ${T.nav};
    backdrop-filter: blur(32px) saturate(200%);
    -webkit-backdrop-filter: blur(32px) saturate(200%);
    border-right: 1px solid ${T.glassBorder};
    box-shadow: inset -1px 0 0 ${T.glassShine};
  }
  .glass-msg {
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:${T.border};border-radius:4px}
  textarea{resize:none} textarea:focus,input:focus,select:focus{outline:none} button{cursor:pointer;font-family:inherit}

  @keyframes unravel{0%{stroke-dashoffset:420;opacity:0}50%{opacity:1}100%{stroke-dashoffset:0;opacity:1}}
  @keyframes glow{0%,100%{filter:drop-shadow(0 0 8px rgba(200,169,110,.2))}50%{filter:drop-shadow(0 0 30px rgba(200,169,110,.55))}}
  @keyframes expand{0%{transform:scale(.2);opacity:0}80%{opacity:1}100%{transform:scale(1);opacity:1}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
  @keyframes pulse{0%,80%,100%{transform:scale(1);opacity:.35}40%{transform:scale(1.4);opacity:1}}
  @keyframes bar{0%,100%{height:3px}50%{height:14px}}
  @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
  @keyframes modalIn{from{opacity:0;transform:scale(.95) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
  @keyframes voicePulse{0%,100%{box-shadow:0 0 0 0 rgba(200,169,110,.4)}50%{box-shadow:0 0 0 8px rgba(200,169,110,0)}}
  @keyframes roomBlink{0%,100%{opacity:1}50%{opacity:.4}}
  @keyframes orbDrift1{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(60px,40px) scale(1.1)}66%{transform:translate(-30px,60px) scale(.95)}}
  @keyframes orbDrift2{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(-50px,-40px) scale(1.08)}66%{transform:translate(40px,-60px) scale(.93)}}
  @keyframes glassShimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}

  .shimmer-text{background:linear-gradient(90deg,#C8A96E,#f0d080,#C8A96E);background-size:200%;animation:shimmer 2.5s linear infinite;-webkit-background-clip:text;-webkit-text-fill-color:transparent}
`;

// ─── NAV ──────────────────────────────────────────────────────────────────────
const NAV = [
  { id:"chat",    icon:"✦",  label:"Chat"         },
  { id:"sources", icon:"⊞",  label:"Sources"      },
  { id:"quiz",    icon:"◈",  label:"Quiz"         },
  { id:"group",   icon:"⊛",  label:"Study Rooms"  },
  { id:"pastq",   icon:"◎",  label:"Past Q"       },
  { id:"flash",    icon:"◫",  label:"Flashcards"   },
  { id:"explain",  icon:"◑",  label:"Explain This" },
];

// ─── MICRO COMPONENTS ─────────────────────────────────────────────────────────
const Dots = ({ c }) => (
  <span style={{ display:"inline-flex", gap:4, alignItems:"center", padding:"10px 14px" }}>
    {[0,1,2].map(i => <span key={i} style={{ width:5,height:5,borderRadius:"50%",background:c,animation:"pulse 1.4s ease infinite",animationDelay:`${i*.18}s`,opacity:.4,display:"block" }}/>)}
  </span>
);

const Bars = ({ c }) => (
  <span style={{ display:"inline-flex", gap:2, alignItems:"flex-end", height:16 }}>
    {[0,1,2,3].map(i => <span key={i} style={{ width:3,borderRadius:2,background:c,height:3,animation:"bar .8s ease infinite",animationDelay:`${i*.12}s`,display:"block" }}/>)}
  </span>
);



// ─── GOOGLE AUTH LOADER ───────────────────────────────────────────────────────
const loadGoogleAuth = () => new Promise(resolve => {
  if (window.google) return resolve();
  const s = document.createElement("script");
  s.src = "https://accounts.google.com/gsi/client";
  s.onload = resolve;
  document.head.appendChild(s);
});

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function Gnosis() {
  // Theme
  const [mode, setMode] = useState(() => localStorage.getItem("g_theme") || "dark");
  const [sysDark, setSysDark] = useState(() => window.matchMedia("(prefers-color-scheme:dark)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme:dark)");
    const h = e => setSysDark(e.matches);
    mq.addEventListener("change", h); return () => mq.removeEventListener("change", h);
  }, []);
  const dark = mode === "dark" || (mode === "system" && sysDark);
  const T = dark ? DARK : LIGHT;
  const setTheme = m => { setMode(m); localStorage.setItem("g_theme", m); };

  // Nav
  const [tab, setTab] = useState("landing");
  const [mobileView, setMobileView] = useState("sidebar"); // "sidebar" | "content"
  const isMobile = window.innerWidth < 768;
  const navTo = (id) => { setTab(id); if (isMobile) setMobileView("content"); };

  // Auth
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem("g_user")) || null; } catch { return null; } });
  const [showAuth, setShowAuth] = useState(false);
  const [authStep, setAuthStep] = useState("form"); // form | verify | sending
  const [authForm, setAuthForm] = useState({ email:"", password:"" });
  const [otp, setOtp] = useState("");
  const [otpExpiry, setOtpExpiry] = useState(null);
  const [otpLeft, setOtpLeft] = useState(0);
  const [authLoading, setAuthLoading] = useState(false);
  const [authErr, setAuthErr] = useState("");


  // Chat
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [photo, setPhoto] = useState(null); // { data, type, name, preview } for images
  const [chatFile, setChatFile] = useState(null); // { text, name } for docs
  const chatFileRef = useRef(null);
  const [insights, setInsights] = useState("");
  const voiceOK = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  const ttsOK = "speechSynthesis" in window;

  // Sources
  const [slides, setSlides] = useState(() => {
    try { return JSON.parse(localStorage.getItem("g_slides")||"[]"); } catch { return []; }
  });
  const saveSlides = (s) => { setSlides(s); try { localStorage.setItem("g_slides", JSON.stringify(s)); } catch {} };
  const [pasteText, setPasteText] = useState("");
  const [pasteTitle, setPasteTitle] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [artifact, setArtifact] = useState(null);
  const [artLoading, setArtLoading] = useState(false);
  const [artType, setArtType] = useState("");

  // MCQ
  const [mcqs, setMcqs] = useState([]);
  const [qi, setQi] = useState(0);
  const [quizTimer, setQuizTimer] = useState(null);
  const [quizTimeLeft, setQuizTimeLeft] = useState(0);
  const quizTimerRef = useRef(null);
  const [ans, setAns] = useState(null);
  const [score, setScore] = useState({ c:0, t:0 });
  const [genMCQ, setGenMCQ] = useState(false);
  const [mcqSrc, setMcqSrc] = useState(0);

  // Group Study
  const [rooms, setRooms] = useState({}); // { [code]: { name, members, messages, created } }
  const [currentRoom, setCurrentRoom] = useState(null);
  const [roomInput, setRoomInput] = useState("");
  const [roomName, setRoomName] = useState("");
  const [wsConn, setWsConn] = useState(null);
  const [wsRoom, setWsRoom] = useState(null); // { name, code, members, messages }
  const [wsStatus, setWsStatus] = useState("disconnected"); // connecting|connected|disconnected
  const [wsJoinCode, setWsJoinCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [roomLoading, setRoomLoading] = useState(false);
  const [roomMsg, setRoomMsg] = useState("");

  // Past Q
  const [pq, setPQ] = useState({ course:"", code:"", level:"", year:"" });
  const [pqResult, setPqResult] = useState("");
  const [pqLoading, setPqLoading] = useState(false);

  // Streak
  const [streak, setStreak] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem("g_streak")||"{}");
      const today = new Date().toDateString();
      if (s.last === today) return s;
      const yesterday = new Date(Date.now()-86400000).toDateString();
      const count = s.last === yesterday ? (s.count||0)+1 : 1;
      const updated = { count, last: today };
      localStorage.setItem("g_streak", JSON.stringify(updated));
      return updated;
    } catch { return { count:1, last:new Date().toDateString() }; }
  });

  // Flashcards
  const [fcInput, setFcInput] = useState("");
  const [fcCards, setFcCards] = useState([]);
  const [fcIdx, setFcIdx] = useState(0);
  const [fcFlipped, setFcFlipped] = useState(false);
  const [fcLoading, setFcLoading] = useState(false);
  const [fcSummary, setFcSummary] = useState("");
  const [fcDrag, setFcDrag] = useState(false);
  const [fcFileErr, setFcFileErr] = useState("");
  const [fcFileName, setFcFileName] = useState("");
  const fcFileRef = useRef(null);

  // Explain This (image)
  const [explainImg, setExplainImg] = useState(null);
  const [explainResult, setExplainResult] = useState("");
  const [explainLoading, setExplainLoading] = useState(false);
  const explainRef = useRef(null);

  // Bug
  const [showBug, setShowBug] = useState(false);
  const [bugText, setBugText] = useState("");
  const [bugDone, setBugDone] = useState(false);

  const recRef = useRef(null);
  const bottomRef = useRef(null);
  const fileRef = useRef(null);
  const photoRef = useRef(null);
  const taRef = useRef(null);
  const roomBottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs, loading]);
  useEffect(() => { roomBottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [rooms, currentRoom]);
  useEffect(() => {
    if (quizTimeLeft > 0 && mcqs.length > 0 && !ans) {
      quizTimerRef.current = setInterval(() => {
        setQuizTimeLeft(t => { if (t <= 1) { clearInterval(quizTimerRef.current); return 0; } return t-1; });
      }, 1000);
    }
    return () => clearInterval(quizTimerRef.current);
  }, [qi, ans, mcqs.length]);

  useEffect(() => { fetch(`${BACKEND}/api/slides`).then(r=>r.json()).then(d=>{ if(d.slides) setSlides(d.slides); }).catch(()=>{}); }, []);

  // OTP countdown
  useEffect(() => {
    if (!otpExpiry) return;
    const t = setInterval(() => {
      const left = Math.max(0, Math.ceil((otpExpiry - Date.now()) / 1000));
      setOtpLeft(left);
      if (left === 0) { clearInterval(t); setOtpExpiry(null); }
    }, 1000);
    return () => clearInterval(t);
  }, [otpExpiry]);

  const slideCtx = slides.map(s => `[${s.name}]: ${s.preview||""}`).join("\n");

  const gated = (feature, action) => action();



  // ── GOOGLE LOGIN ──────────────────────────────────────────────────────────
  const googleLogin = async () => {
    await loadGoogleAuth();
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (resp) => {
        setAuthLoading(true);
        try {
          const r = await fetch(`${BACKEND}/api/auth/google`, {
            method:"POST", headers:{"Content-Type":"application/json"},
            body: JSON.stringify({ credential: resp.credential })
          });
          const d = await r.json();
          if (d.error) { setAuthErr(d.error); }
          else {
            const u = { email:d.email, name:d.name, avatar:d.avatar, premium:d.premium||false, token:d.token };
            localStorage.setItem("g_user", JSON.stringify(u));
            setUser(u); setShowAuth(false);
            setMsgs([{ role:"assistant", content:`Welcome, ${d.name||d.email}. What are we working on?` }]);
            if (tab==="landing") navTo("chat");          }
        } catch { setAuthErr("Google login failed."); }
        setAuthLoading(false);
      }
    });
    window.google.accounts.id.prompt();
  };

  // ── EMAIL AUTH ────────────────────────────────────────────────────────────
  const sendOTP = async () => {
    if (!authForm.email) { setAuthErr("Enter your email address."); return; }
    setAuthLoading(true); setAuthErr("");
    try {
      const r = await fetch(`${BACKEND}/api/auth/send-otp`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(authForm)
      });
      const d = await r.json();
      if (d.error) setAuthErr(d.error);
      else { setAuthStep("verify"); setOtpExpiry(Date.now() + 600_000); setOtpLeft(600); }
    } catch { setAuthErr("Server unreachable."); }
    setAuthLoading(false);
  };

  const verifyOTP = async () => {
    if (!otp.trim()) { setAuthErr("Enter the code."); return; }
    if (otpExpiry && Date.now() > otpExpiry) { setAuthErr("Code expired."); return; }
    setAuthLoading(true); setAuthErr("");
    try {
      const r = await fetch(`${BACKEND}/api/auth/verify-otp`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ email:authForm.email, code:otp })
      });
      const d = await r.json();
      if (d.error) setAuthErr(d.error);
      else {
        const u = { email:authForm.email, premium:d.premium||false, token:d.token };
        localStorage.setItem("g_user", JSON.stringify(u));
        setUser(u); setShowAuth(false); setAuthStep("form"); setOtp("");
        setMsgs([{ role:"assistant", content:`Logged in as ${authForm.email}. What are we working on?` }]);
        if (tab==="landing") navTo("chat");
      }
    } catch { setAuthErr("Verification failed."); }
    setAuthLoading(false);
  };

  const logout = () => { localStorage.removeItem("g_user"); setUser(null); setMsgs([]); setTab("landing"); setMobileView("sidebar"); };

  // ── TTS ───────────────────────────────────────────────────────────────────
  const speak = useCallback((text) => {
    if (!ttsOK || !text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.slice(0, 1000));
    u.lang = "en-NG"; u.rate = 0.9; u.pitch = 1.05;
    const vs = window.speechSynthesis.getVoices();
    const v = vs.find(v => v.lang.startsWith("en") && v.name.includes("Google")) || vs.find(v => v.lang.startsWith("en")) || vs[0];
    if (v) u.voice = v;
    u.onstart = () => setSpeaking(true);
    u.onend = u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }, [ttsOK]);
  const stopSpeak = () => { window.speechSynthesis.cancel(); setSpeaking(false); };

  // ── FLASHCARDS ───────────────────────────────────────────────────────────────
  const parseFcFile = async (file) => {
    setFcFileErr(""); setFcFileName("");
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["txt","pdf","pptx"].includes(ext)) {
      setFcFileErr("Only .txt, .pdf, and .pptx files are supported."); return;
    }
    setFcFileName(file.name);
    if (ext === "txt") {
      const text = await file.text();
      setFcInput(text.slice(0, 6000));
      return;
    }
    if (ext === "pdf") {
      // Read as base64, send to backend for extraction
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result.split(",")[1];
        try {
          const r = await fetch(`${BACKEND}/api/chat`, {
            method:"POST", headers:{"Content-Type":"application/json"},
            body: JSON.stringify({ messages:[{ role:"user", content:[
              { type:"document", source:{ type:"base64", media_type:"application/pdf", data:base64 }},
              { type:"text", text:"Extract all the readable text from this PDF. Return only the raw text, no commentary, no markdown." }
            ]}] })
          });
          const d = await r.json();
          setFcInput((d.reply||"").slice(0, 6000));
        } catch { setFcFileErr("Failed to read PDF. Try copy-pasting the text instead."); }
      };
      reader.readAsDataURL(file);
      return;
    }
    if (ext === "pptx") {
      // Use mammoth-style extraction via ArrayBuffer
      try {
        const JSZip = (await import("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js")).default;
        const ab = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(ab);
        const slideFiles = Object.keys(zip.files).filter(n => n.match(/^ppt\/slides\/slide\d+\.xml$/)).sort();
        const texts = [];
        for (const sf of slideFiles) {
          const xml = await zip.files[sf].async("string");
          const matches = xml.match(/<a:t>([^<]*)<\/a:t>/g)||[];
          const slideText = matches.map(m => m.replace(/<[^>]+>/g,"")).join(" ");
          if (slideText.trim()) texts.push(slideText.trim());
        }
        setFcInput(texts.join("\n\n").slice(0, 6000));
      } catch { setFcFileErr("Failed to read PPTX. Try exporting as .txt first."); }
    }
  };

  const handleFcFile = (file) => { if (file) parseFcFile(file); };

  const genFlashcards = async () => {
    if (!fcInput.trim()) return;
    setFcLoading(true); setFcCards([]); setFcSummary("");
    try {
      const r = await fetch(`${BACKEND}/api/chat`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ messages:[{ role:"user", content:`You are a study assistant for Nigerian university students.

Given this lecture text, do two things:

1. Write a SHORT SUMMARY (3–5 sentences max) of the key ideas.

2. Generate exactly 8 flashcards. Each card has a FRONT (a question or term) and BACK (the answer or definition). Be concise.

Format your response EXACTLY like this — no extra text, no asterisks:
SUMMARY: [your summary here]
CARD1_FRONT: [question or term]
CARD1_BACK: [answer]
CARD2_FRONT: ...
CARD2_BACK: ...
(continue to CARD8)

TEXT:
${fcInput.slice(0,3000)}` }] })
      });
      const d = await r.json();
      const text = d.reply||"";
      const summaryMatch = text.match(/SUMMARY:\s*(.+?)(?=CARD1_FRONT)/s);
      if (summaryMatch) setFcSummary(summaryMatch[1].trim());
      const cards = [];
      for (let i=1;i<=8;i++) {
        const fMatch = text.match(new RegExp(`CARD${i}_FRONT:\s*(.+?)(?=CARD${i}_BACK)`, 's'));
        const bMatch = text.match(new RegExp(`CARD${i}_BACK:\s*(.+?)(?=CARD${i+1}_FRONT|$)`, 's'));
        if (fMatch && bMatch) cards.push({ front:fMatch[1].trim(), back:bMatch[1].trim() });
      }
      setFcCards(cards); setFcIdx(0); setFcFlipped(false);
    } catch { alert("Failed. Check connection."); }
    setFcLoading(false);
  };

  // ── EXPLAIN THIS ──────────────────────────────────────────────────────────────
  const handleExplainImg = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result.split(",")[1];
      setExplainImg({ data, type:file.type, name:file.name });
      setExplainResult("");
    };
    reader.readAsDataURL(file);
  };

  const runExplain = async () => {
    if (!explainImg) return;
    setExplainLoading(true); setExplainResult("");
    try {
      const r = await fetch(`${BACKEND}/api/explain`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ imageData: explainImg.data, mimeType: explainImg.type })
      });
      const d = await r.json();
      setExplainResult(d.reply || "Could not explain image.");
    } catch (e) { setExplainResult("Failed. Check connection."); }
    setExplainLoading(false);
  };

  // ── VOICE INPUT ───────────────────────────────────────────────────────────
  const toggleVoice = () => {
    if (!voiceOK) return;
    if (listening) { recRef.current?.stop(); setListening(false); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR(); r.lang = "en-NG"; r.interimResults = false;
    r.onresult = e => { setInput(e.results[0][0].transcript); setListening(false); };
    r.onerror = r.onend = () => setListening(false);
    r.start(); recRef.current = r; setListening(true);
  };

  // ── SEND CHAT ─────────────────────────────────────────────────────────────
  const send = async (override) => {
    const msg = override || input;
    if (!msg?.trim() && !photo && !chatFile) return;
    if (loading) return;
    setInput(""); if (taRef.current) taRef.current.style.height = "auto";

    let content = msg?.trim() || "";
    let userMsgDisplay = { role:"user", content:"" };

    if (photo) {
      // Step 1: Get vision description from backend
      setLoading(true);
      setMsgs(prev => [...prev, { role:"user", content:[
        { type:"image_preview", previewUrl:photo.previewUrl, name:photo.name },
        { type:"text", text:msg?.trim()||"Analyse this image in full detail." }
      ]}]);
      try {
        const vr = await fetch(`${BACKEND}/api/explain`, {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ imageData:photo.data, mimeType:photo.type })
        });
        const vd = await vr.json();
        const imgDesc = vd.reply || "I could not read the image.";
        // Now send image description + user question as chat context
        const imageContext = `[The student uploaded an image: ${photo.name}. Here is what the image contains: ${imgDesc}]

Student question: ${msg?.trim()||"Please explain this image."}`;
        const chatMsgs = [...msgs, { role:"user", content: imageContext }];
        const r = await fetch(`${BACKEND}/api/chat`, {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ messages: chatMsgs.filter(m=>!m.hidden).map(m=>({role:m.role,content:typeof m.content==="string"?m.content:Array.isArray(m.content)?m.content.find(b=>b.type==="text")?.text||imageContext:imageContext})), studentInsights:insights })
        });
        const d = await r.json();
        const reply = d.reply || "No response.";
        setMsgs(prev => [...prev, { role:"assistant", content:reply }]);
      } catch (e) {
        setMsgs(prev => [...prev, { role:"assistant", content:`Connection error. (${e.message})` }]);
      }
      setPhoto(null); setLoading(false); return;
    }

    if (chatFile) {
      content = `[Document: ${chatFile.name}]

${chatFile.text}

${msg?.trim()||"Summarise this document and help me study it."}`;
      userMsgDisplay = { role:"user", content:`📄 ${chatFile.name}${msg?.trim()?" — "+msg.trim():""}` };
      setChatFile(null);
    } else {
      userMsgDisplay = { role:"user", content: content };
    }

    const next = [...msgs, userMsgDisplay];
    setMsgs(next); setLoading(true);
    try {
      const apiMsgs = [...msgs, { role:"user", content }].filter(m => !m.hidden).map(m => ({ role:m.role, content:typeof m.content==="string"?m.content:Array.isArray(m.content)?m.content.find(b=>b.type==="text")?.text||"":JSON.stringify(m.content) }));
      const r = await fetch(`${BACKEND}/api/chat`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ messages:apiMsgs, studentInsights:insights })
      });
      const d = await r.json();
      const reply = d.reply || "No response.";
      const updated = [...next, { role:"assistant", content:reply }];
      setMsgs(updated);
      if (updated.length % 6 === 0) extractInsights(updated);
    } catch (e) {
      setMsgs(prev => [...prev, { role:"assistant", content:`Connection error. (${e.message})` }]);
    }
    setLoading(false);
  };

  const handleKey = e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  // ── INSIGHTS ──────────────────────────────────────────────────────────────
  const extractInsights = async (convo) => {
    try {
      const snip = convo.slice(-6).map(m => `${m.role}: ${typeof m.content==="string" ? m.content : m.content?.find?.(b=>b.type==="text")?.text||""}`).join("\n");
      const r = await fetch(`${BACKEND}/api/chat`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ messages:[{ role:"user", content:`Extract 1-2 new academic facts worth remembering from this conversation. Reply NONE if nothing valuable.\n\n${snip}` }] })
      });
      const d = await r.json();
      if (d.reply && !d.reply.includes("NONE")) setInsights(p => p ? p+"\n"+d.reply : d.reply);
    } catch {}
  };

  // ── PHOTO ─────────────────────────────────────────────────────────────────
  const handlePhoto = f => {
    if (!f) return;
    const r = new FileReader();
    r.onload = e => {
      const data = e.target.result.split(",")[1];
      // Create a small preview URL too
      const previewUrl = e.target.result;
      setPhoto({ data, type:f.type, name:f.name, previewUrl });
    };
    r.readAsDataURL(f);
  };

  const handleChatFile = async (f) => {
    if (!f) return;
    const ext = f.name.split(".").pop().toLowerCase();
    if (["jpg","jpeg","png","gif","webp","bmp"].includes(ext)) { handlePhoto(f); return; }
    if (ext === "txt" || ext === "md") {
      const text = await f.text();
      setChatFile({ text: text.slice(0,6000), name: f.name });
    } else if (ext === "pdf") {
      // Send to backend vision endpoint to extract text
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result.split(",")[1];
        try {
          const r = await fetch(`${BACKEND}/api/explain`, {
            method:"POST", headers:{"Content-Type":"application/json"},
            body: JSON.stringify({ imageData:base64, mimeType:"application/pdf", extractOnly:true })
          });
          const d = await r.json();
          setChatFile({ text:(d.reply||"").slice(0,6000), name:f.name });
        } catch { setChatFile({ text:"Could not read PDF.", name:f.name }); }
      };
      reader.readAsDataURL(f);
    } else {
      alert("Supported: images (jpg,png,gif,webp), PDF, txt, md");
    }
  };

  // ── SLIDES ────────────────────────────────────────────────────────────────
  const uploadFiles = async (files) => {
    setUploading(true);
    const form = new FormData();
    Array.from(files).filter(f => f.name.endsWith(".txt")||f.name.endsWith(".md")).forEach(f => form.append("slides",f));
    try {
      await fetch(`${BACKEND}/api/slides/upload`, { method:"POST", body:form });
      const s = await fetch(`${BACKEND}/api/slides`).then(r=>r.json());
      if (s.slides) saveSlides(s.slides);
    } catch { alert("Upload failed."); }
    setUploading(false);
  };

  const addPaste = async () => {
    if (!pasteText.trim()) return;
    setUploading(true);
    try {
      await fetch(`${BACKEND}/api/slides/add`, { method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ name:pasteTitle||`Lecture Note ${slides.length+1}`, content:pasteText }) });
      const s = await fetch(`${BACKEND}/api/slides`).then(r=>r.json());
      if (s.slides) saveSlides(s.slides);
      setPasteText(""); setPasteTitle("");
    } catch { alert("Failed."); }
    setUploading(false);
  };

  const removeSlide = async i => { try { await fetch(`${BACKEND}/api/slides/${i}`, { method:"DELETE" }); saveSlides(slides.filter((_,j)=>j!==i)); } catch {} };

  // ── ARTIFACTS ────────────────────────────────────────────────────────────
  const ARTIFACTS = {
    audio_overview: { icon:"🔊", label:"Audio Overview",  desc:"Spoken summary of all sources" },
    study_guide:    { icon:"📖", label:"Study Guide",     desc:"Key concepts and practice questions" },
    faq:            { icon:"❓", label:"FAQ",             desc:"15 questions students always ask" },
    timeline:       { icon:"⏱", label:"Timeline",        desc:"Dates, sequences, processes" },
    briefing:       { icon:"📋", label:"Briefing Doc",    desc:"3-minute exam brief" },
    deep_research:  { icon:"🔍", label:"Deep Research",   desc:"Themes, gaps, connections" },
  };

  const ARTIFACT_PROMPTS = {
    audio_overview: "Write an engaging spoken summary of all sources. 4-6 paragraphs. Conversational, as if briefing a peer before an exam. Cover key concepts, relationships, and what students must know. No asterisks.",
    study_guide:    "Generate a study guide from all sources. Include: key definitions, core concepts, important processes, common exam mistakes, and 5 practice questions. No asterisks.",
    faq:            "Generate the 15 most important student questions about this material with direct answers. Numbered Q&A format. No asterisks.",
    timeline:       "Extract all dates, sequences, and chronological information. Present as a clear ordered timeline. Where no dates exist, order by logical progression. No asterisks.",
    briefing:       "Write a concise briefing document — what a student must know in 3 minutes before the exam. Be ruthlessly selective. No asterisks.",
    deep_research:  "Analyse all sources deeply. Cover: core themes, connections between topics, gaps in the material, contradictions, and recommended study order. Be analytical. No asterisks.",
  };

  const genArtifact = (type) => gated(type, async () => {
    if (!slides.length) { alert("Upload at least one source first."); return; }
    setArtLoading(true); setArtType(type);
    try {
      const src = slides.map(s => `[${s.name}]: ${s.preview||s.name}`).join("\n\n");
      const r = await fetch(`${BACKEND}/api/chat`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ messages:[{ role:"user", content:`${ARTIFACT_PROMPTS[type]}\n\nSources:\n${src}` }] })
      });
      const d = await r.json();
      setArtifact({ type, content:d.reply||"" });
    } catch { alert("Generation failed."); }
    setArtLoading(false);
  });

  // ── MCQ ───────────────────────────────────────────────────────────────────
  const genMCQs = () => gated("mcq_generate", async () => {
    if (!slides.length) { alert("Upload a source first."); return; }
    setGenMCQ(true);
    try {
      const r = await fetch(`${BACKEND}/api/mcq/generate`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          content: slides[mcqSrc]?.preview||slides[mcqSrc]?.name,
          sourceName: slides[mcqSrc]?.name,
          systemHint: `You are a DUFUHS CCMAS exam question generator. NEVER use asterisks, bold, or any markdown formatting. Generate exactly 10 multiple-choice questions strictly based on the provided lecture content. Follow CCMAS/Nigerian university exam style: each question must have 4 options (A–D), one correct answer, and a brief explanation. Cover a spread of topics from the content. Questions should test understanding, not just recall. Format each as: Q[n]. [question]\nA. [option]\nB. [option]\nC. [option]\nD. [option]\nAnswer: [letter]\nExplanation: [1–2 sentences]. No asterisks. No markdown.`
        })
      });
      const d = await r.json();
      if (d.mcqs) { setMcqs(d.mcqs); setQi(0); setAns(null); setScore({c:0,t:0}); setQuizTimeLeft(d.mcqs.length*30); navTo("quiz"); }
    } catch { alert("Failed."); }
    setGenMCQ(false);
  });

  const answerMCQ = opt => {
    if (ans !== null) return;
    const correct = opt.startsWith(mcqs[qi]?.answer);
    setAns({ chosen:opt, correct });
    setScore(p => ({ c:p.c+(correct?1:0), t:p.t+1 }));
    // speak removed
  };

  // ── GROUP STUDY ROOMS ─────────────────────────────────────────────────────
  const generateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    return Array.from({length:6}, () => chars[Math.floor(Math.random()*chars.length)]).join("");
  };

  const createRoom = () => {
    if (!roomName.trim()) return;
    const code = generateCode();
    const displayName = user?.name || user?.email?.split("@")[0] || "Student";
    const room = {
      code, name: roomName.trim(),
      createdBy: displayName,
      members: [displayName],
      messages: [
        { from:"Gnosis", text:`Welcome to "${roomName.trim()}". I'm Gnosis — your AI study companion for this session. Share a topic, ask a question, or paste a concept and let's get to work.`, at: Date.now() }
      ],
      created: Date.now()
    };
    setRooms(p => ({ ...p, [code]:room }));
    setCurrentRoom(code);
    setRoomName("");
  };

  const joinRoom = () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    if (!rooms[code]) { alert("Room not found. Check the code."); return; }
    const displayName = user?.name || user?.email?.split("@")[0] || "Student";
    setRooms(p => ({
      ...p,
      [code]: {
        ...p[code],
        members: p[code].members.includes(displayName) ? p[code].members : [...p[code].members, displayName],
        messages: [...p[code].messages, { from:"Gnosis", text:`${displayName} joined the room.`, at:Date.now(), system:true }]
      }
    }));
    setCurrentRoom(code);
    setJoinCode("");
  };

  const sendRoomMsg = async () => {
    if (!roomMsg.trim() || !currentRoom) return;
    const room = rooms[currentRoom];
    const displayName = user?.name || user?.email?.split("@")[0] || "You";
    const userMessage = { from:displayName, text:roomMsg.trim(), at:Date.now() };
    const updated = { ...room, messages:[...room.messages, userMessage] };
    setRooms(p => ({ ...p, [currentRoom]:updated }));
    setRoomMsg("");
    setRoomLoading(true);

    // Gnosis responds to the group
    try {
      const history = updated.messages.slice(-8).map(m => ({
        role: m.from==="Gnosis" ? "assistant" : "user",
        content: m.from==="Gnosis" ? m.text : `${m.from}: ${m.text}`
      }));
      const r = await fetch(`${BACKEND}/api/chat`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ messages:history, studentInsights:insights })
      });
      const d = await r.json();
      setRooms(p => ({
        ...p,
        [currentRoom]: { ...p[currentRoom], messages:[...p[currentRoom].messages, { from:"Gnosis", text:d.reply||"", at:Date.now() }] }
      }));
    } catch {}
    setRoomLoading(false);
  };

  const roomHandleKey = e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); sendRoomMsg(); } };

  const genPastQ = () => gated("pastq", async () => {
    if (!pq.course) return;
    setPqLoading(true);
    const prompt = `You are a past questions expert with deep knowledge of examination papers from Nigerian universities including DUFUHS, EBSU, UNN, UNIBEN, UI, ABU Zaria, UNILAG, LUTH, UNIJOS, OAU, UNIPORT, UNICAL, Madonna University and other Nigerian health sciences and polytechnic institutions. You have studied thousands of past question papers across all medical, health sciences, and natural sciences disciplines.

Generate realistic past examination questions for the following course exactly as they appear in Nigerian university exam papers:

Course: ${pq.course}
Course Code: ${pq.code||"N/A"}
Level: ${pq.level||"N/A"} Level
Session/Year: ${pq.year||"any year"}

Format the output EXACTLY like this:

SECTION A — OBJECTIVE (Multiple Choice) [30 marks]
Instructions: Choose the most correct option for each question.

1. [Question]
   A. [option]  B. [option]  C. [option]  D. [option]
   Answer: [letter]

[Generate 10 objective questions in this format]

---

SECTION B — SHORT ANSWER / THEORY [40 marks]
Instructions: Answer ALL questions. Each question carries 8 marks.

1. [Short answer question requiring 5–10 line response]
   [Model answer / marking guide in brackets]

[Generate 5 short answer questions]

---

SECTION C — ESSAY / LONG ANSWER [30 marks]
Instructions: Answer ANY 2 questions. Each question carries 15 marks.

1. [Essay question]
   [Marking guide: list key points expected, 15 marks allocation breakdown]

[Generate 3 essay questions]

---

Rules:
- Base questions on ACTUAL topics typically examined at ${pq.level||"university"} level in Nigerian universities for this subject
- For MBBS/health science courses: use clinical scenarios, drug names, anatomical terms, pathological conditions common in Nigerian medical examinations
- For Basic Medical Sciences: include biochemical pathways, physiological mechanisms, anatomical structures
- For Computer Science/Engineering: include algorithms, data structures, programming concepts, software engineering principles
- For Pure Sciences (Maths, Physics, Chemistry, Biology): include calculations, diagrams descriptions, laboratory procedures
- Each objective question must have exactly one clearly correct answer
- Theory questions must have detailed model answers and mark allocation
- Write exactly like Nigerian university exam papers - formal, precise, unambiguous
- No asterisks, no markdown, plain text only, number all questions clearly`;

    try {
      const r = await fetch(`${BACKEND}/api/chat`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ messages:[{ role:"user", content:prompt }] })
      });
      const d = await r.json();
      setPqResult(d.reply||"");
    } catch { setPqResult("Failed. Check connection and try again."); }
    setPqLoading(false);
  });

  // ─── SHARED UI PIECES ─────────────────────────────────────────────────────
  const Btn = ({ children, onClick, disabled, variant="outline", full, sm, style={} }) => {
    const base = { fontFamily:"'Inter',sans-serif", borderRadius:10, cursor:"pointer", transition:"all .18s",
      fontSize:sm?12:13, fontWeight:500, letterSpacing:.3, border:"none",
      opacity:disabled?.45:1, width:full?"100%":"auto", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)", ...style };
    if (variant==="solid") return <button onClick={onClick} disabled={disabled} className="glass-btn"
      style={{ ...base, background:`linear-gradient(135deg, ${T.gold} 0%, rgba(200,169,110,.8) 100%)`,
        color:"#07070f", padding:sm?"6px 14px":"10px 22px",
        boxShadow:`0 2px 16px rgba(200,169,110,.3), inset 0 1px 0 rgba(255,255,255,.25)` }}>{children}</button>;
    if (variant==="ghost") return <button onClick={onClick} disabled={disabled} className="glass-btn"
      style={{ ...base, background:"rgba(255,255,255,.04)", color:T.muted,
        border:`1px solid ${T.glassBorder}`, padding:sm?"6px 14px":"10px 22px",
        boxShadow:"inset 0 1px 0 rgba(255,255,255,.07)" }}>{children}</button>;
    return <button onClick={onClick} disabled={disabled} className="glass-btn"
      style={{ ...base, background:T.goldFaint, color:T.gold,
        border:`1px solid ${T.goldBorder}`, padding:sm?"6px 14px":"10px 22px",
        boxShadow:`inset 0 1px 0 rgba(200,169,110,.15), 0 1px 8px rgba(200,169,110,.08)` }}>{children}</button>;
  };

  const Label = ({ children }) => <p style={{ color:T.muted, fontSize:11, fontWeight:500, letterSpacing:.8, textTransform:"uppercase", marginBottom:6 }}>{children}</p>;

  const Field = ({ label, val, set, ph, type="text" }) => (
    <div style={{ marginBottom:14 }}>
      {label && <Label>{label}</Label>}
      <input type={type} defaultValue={val} onInput={e=>set(e.target.value)} placeholder={ph}
        className="glass-input" autoComplete="off"
        style={{ width:"100%", borderRadius:10, padding:"10px 14px", color:T.text, fontSize:15 }}/>
    </div>
  );

  const ThemePicker = () => (
    <div style={{ display:"flex", gap:3, background:T.input, border:`1px solid ${T.border}`, borderRadius:6, padding:3 }}>
      {[["🌙","dark"],["☀️","light"],["⚙️","system"]].map(([icon,m]) => (
        <button key={m} onClick={()=>setTheme(m)}
          style={{ background:mode===m?T.goldFaint:"transparent", border:`1px solid ${mode===m?T.goldBorder:"transparent"}`,
            borderRadius:4, padding:"3px 8px", fontSize:12, color:mode===m?T.gold:T.muted, transition:"all .2s" }}>
          {icon}
        </button>
      ))}
    </div>
  );

  const PageHeader = ({ title, sub }) => (
    <div style={{ marginBottom:24, padding:"16px 18px", borderRadius:14,
      background:"linear-gradient(135deg, rgba(200,169,110,.08) 0%, rgba(200,169,110,.03) 100%)",
      border:`1px solid rgba(200,169,110,.18)`,
      backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)",
      boxShadow:"inset 0 1px 0 rgba(200,169,110,.12)" }}>
      <h2 style={{ fontSize:18, fontWeight:600, color:T.text, marginBottom:sub?4:0 }}>{title}</h2>
      {sub && <p style={{ color:T.sub, fontSize:14, lineHeight:1.65, maxWidth:480 }}>{sub}</p>}
    </div>
  );

  const Footer = () => (
    <div style={{ marginTop:32, paddingTop:16, borderTop:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
      <button onClick={()=>setShowBug(true)} style={{ background:"none", border:"none", color:T.muted, fontSize:12, padding:0, textDecoration:"underline", textDecorationColor:T.border }}>Report a bug</button>
      <p style={{ color:T.muted, fontSize:11, opacity:.5 }}>Developed by Jordan Mendes</p>
    </div>
  );


  // ── AUTH MODAL ────────────────────────────────────────────────────────────
  const AuthModal = () => (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:400,padding:20 }}>
      <div className="glass-card" style={{ padding:28,width:"100%",maxWidth:400,animation:"modalIn .25s ease",backdropFilter:"blur(32px)",WebkitBackdropFilter:"blur(32px)" }}>
        
        {/* Header */}
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
          <div>
            <p style={{ fontFamily:"'Cinzel',serif",fontSize:15,fontWeight:600,color:T.gold,letterSpacing:2 }}>GNOSIS</p>
            <p style={{ color:T.sub,fontSize:13,marginTop:2 }}>Sign in to your account</p>
          </div>
          <button onClick={()=>{setShowAuth(false);setAuthStep("form");setOtp("");setAuthErr("");}}
            style={{ background:"none",border:"none",color:T.muted,fontSize:20,lineHeight:1,padding:4 }}>×</button>
        </div>

        {authErr && <div style={{ background:"rgba(239,68,68,.08)",border:`1px solid rgba(239,68,68,.25)`,borderRadius:8,padding:"9px 12px",marginBottom:14,color:T.red,fontSize:13 }}>{authErr}</div>}

        {/* Google */}
        <button onClick={googleLogin} disabled={authLoading}
          style={{ width:"100%",background:T.input,border:`1px solid ${T.border}`,borderRadius:10,padding:"11px 16px",
            display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:16,color:T.text,fontSize:14,fontWeight:500,transition:"all .2s" }}
          onMouseEnter={e=>e.currentTarget.style.borderColor=T.gold}
          onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>

        <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:16 }}>
          <div style={{ flex:1,height:1,background:T.border }}/>
          <span style={{ color:T.muted,fontSize:12 }}>or use email</span>
          <div style={{ flex:1,height:1,background:T.border }}/>
        </div>

        {/* Email field — always visible */}
        <div style={{ marginBottom:12 }}>
          <p style={{ fontSize:11,fontWeight:600,color:T.muted,letterSpacing:.8,textTransform:"uppercase",marginBottom:6 }}>Email Address</p>
          <input type="email" defaultValue={authForm.email} onInput={e=>setAuthForm(p=>({...p,email:e.target.value}))}
            placeholder="your@email.com" className="glass-input" autoComplete="email"
            style={{ width:"100%",borderRadius:10,padding:"10px 14px",color:T.text,fontSize:15 }}/>
        </div>

        {/* Send code button — shown before OTP is sent */}
        {authStep==="form" && (
          <Btn variant="solid" full onClick={sendOTP} disabled={authLoading||!authForm.email}>
            {authLoading?"Sending code...":"Send verification code →"}
          </Btn>
        )}

        {/* OTP field — shown after code is sent */}
        {authStep==="verify" && (
          <>
            <div style={{ background:T.goldFaint,border:`1px solid ${T.goldBorder}`,borderRadius:8,padding:"9px 12px",marginBottom:12,fontSize:13,color:T.gold }}>
              Code sent to {authForm.email} · expires in {Math.floor(otpLeft/60)}:{String(otpLeft%60).padStart(2,"0")}
            </div>
            <div style={{ marginBottom:12 }}>
              <p style={{ fontSize:11,fontWeight:600,color:T.muted,letterSpacing:.8,textTransform:"uppercase",marginBottom:6 }}>6-Digit Code</p>
              <input type="text" defaultValue={otp} onInput={e=>setOtp(e.target.value)} placeholder="Enter code" autoFocus
                maxLength={6} className="glass-input" autoComplete="one-time-code"
                style={{ width:"100%",borderRadius:10,padding:"10px 14px",color:T.text,fontSize:18,letterSpacing:6,textAlign:"center" }}/>
            </div>
            {otpLeft===0 && <p style={{ color:T.red,fontSize:12,marginBottom:10 }}>Code expired. <button onClick={()=>{setAuthStep("form");setOtp("");}} style={{ background:"none",border:"none",color:T.gold,fontSize:12,cursor:"pointer",textDecoration:"underline" }}>Resend</button></p>}
            <div style={{ display:"flex",gap:8 }}>
              <Btn variant="solid" full onClick={verifyOTP} disabled={authLoading||otp.length<4}>{authLoading?"Verifying...":"Verify & Sign In"}</Btn>
              <Btn variant="ghost" onClick={()=>{setAuthStep("form");setOtp("");setAuthErr("");}}>Back</Btn>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // ── BUG MODAL ─────────────────────────────────────────────────────────────
  const BugModal = () => (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:20 }}>
      <div style={{ background:T.panel,border:`1px solid ${T.border}`,borderRadius:16,padding:26,width:"100%",maxWidth:380,animation:"modalIn .25s ease" }}>
        <h3 style={{ fontSize:16,fontWeight:600,color:T.text,marginBottom:6 }}>Report a bug</h3>
        <p style={{ color:T.sub,fontSize:14,lineHeight:1.65,marginBottom:16 }}>What happened? What did you expect instead?</p>
        {bugDone
          ? <p style={{ color:T.green,fontSize:13,textAlign:"center",padding:"16px 0" }}>Report sent. Thank you.</p>
          : <>
              <textarea value={bugText} onChange={e=>setBugText(e.target.value)} placeholder="Describe the issue..." rows={4}
                style={{ width:"100%",background:T.input,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 12px",color:T.text,fontSize:14,lineHeight:1.65,marginBottom:14 }}/>
              <div style={{ display:"flex",gap:8 }}>
                <Btn variant="solid" onClick={()=>{
                  if(!bugText.trim()) return;
                  fetch(`${BACKEND}/api/bug-report`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({description:bugText,email:user?.email||"anonymous"})}).catch(()=>{});
                  setBugDone(true); setTimeout(()=>{setShowBug(false);setBugText("");setBugDone(false);},2000);
                }}>Submit</Btn>
                <Btn variant="ghost" onClick={()=>setShowBug(false)}>Cancel</Btn>
              </div>
            </>
        }
      </div>
    </div>
  );

  // ─── LANDING ──────────────────────────────────────────────────────────────
  if (tab==="landing") return (
    <div style={{ minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,position:"relative",overflow:"hidden" }}>
      <style>{makeCSS(T)}</style>
      <div style={{ position:"absolute",top:"5%",left:"50%",transform:"translateX(-50%)",width:700,height:500,background:`radial-gradient(ellipse,${T.goldFaint} 0%,transparent 62%)`,pointerEvents:"none" }}/>
      <div style={{ position:"absolute",top:18,right:18 }}><ThemePicker/></div>

      {/* Logo */}
      <div style={{ position:"relative",width:104,height:104,marginBottom:28,animation:"expand .85s cubic-bezier(.34,1.5,.64,1) both" }}>
        <div style={{ position:"absolute",inset:-14,border:`1px dashed ${T.goldBorder}`,borderRadius:"50%",animation:"spin 28s linear infinite" }}/>
        <div style={{ position:"absolute",inset:-28,border:`1px dashed ${T.goldFaint}`,borderRadius:"50%",animation:"spin 55s linear infinite reverse" }}/>
        <div style={{ width:104,height:104,borderRadius:"50%",border:`1.5px solid ${T.gold}`,display:"flex",alignItems:"center",justifyContent:"center",
          boxShadow:`0 0 0 1px ${T.goldFaint},0 0 50px ${T.goldFaint}`,animation:"glow 3.5s ease-in-out infinite" }}>
          <svg viewBox="0 0 60 60" width="66" height="66" fill="none">
            <path d="M44 18 C38 10,22 10,16 20 C10 30,14 48,28 50 C38 51,46 44,46 36 L34 36 L34 30 L50 30 L50 42 C46 52,34 58,24 55 C10 51,4 36,8 22 C12 8,28 2,42 8"
              stroke={T.gold} strokeWidth="2.2" strokeLinecap="round"
              style={{ strokeDasharray:420,strokeDashoffset:420,animation:"unravel 2s cubic-bezier(.4,0,.2,1) .2s forwards" }}/>
          </svg>
        </div>
      </div>

      <h1 style={{ fontFamily:"'Cinzel',serif",fontSize:"clamp(40px,7vw,58px)",fontWeight:700,color:T.gold,
        letterSpacing:12,marginBottom:12,animation:"fadeUp .6s ease .7s both",
        textShadow:`0 0 60px ${T.goldFaint}` }}>GNOSIS</h1>

      <p style={{ fontSize:12,letterSpacing:3,color:T.sub,textTransform:"uppercase",marginBottom:6,
        animation:"fadeUp .6s ease 1.3s both" }}>Built by a student, for every student</p>

      <p style={{ color:T.muted,fontSize:11,letterSpacing:2,textTransform:"uppercase",marginBottom:48,
        animation:"fadeUp .5s ease 1.6s both" }}>DUFUHS · Uburu, Ebonyi State</p>

      <div style={{ display:"flex",gap:10,marginBottom:44,flexWrap:"wrap",justifyContent:"center",animation:"fadeUp .5s ease 1.9s both" }}>
        <button onClick={()=>{ navTo("chat"); if(!msgs.length) setMsgs([{role:"assistant",content:"Welcome to Gnosis. What are we studying today?"}]); }}
          style={{ background:T.gold,border:"none",color:dark?"#07070f":"#fff",padding:"12px 34px",
            borderRadius:10,fontSize:14,fontWeight:600,boxShadow:`0 4px 24px ${T.goldFaint}` }}>
          Start Learning
        </button>
        <button onClick={()=>setShowAuth(true)}
          style={{ background:T.input,border:`1px solid ${T.border}`,color:T.text,padding:"12px 34px",
            borderRadius:10,fontSize:14,fontWeight:500 }}>
          Sign In
        </button>
      </div>

      <div style={{ display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center",maxWidth:520,animation:"fadeUp .5s ease 2.1s both" }}>
        {["💬 AI Chat","📚 Sources","🧠 MCQ Quiz","🔊 Audio Overview","👥 Study Rooms","📝 Past Questions","🎙️ Voice","📷 Images"].map(f => (
          <span key={f} style={{ background:T.input,border:`1px solid ${T.border}`,color:T.sub,
            padding:"5px 12px",borderRadius:20,fontSize:12 }}>{f}</span>
        ))}
      </div>

      {showAuth && <AuthModal/>}
    </div>
  );

  // ─── MAIN SHELL ───────────────────────────────────────────────────────────
  return (
    <div style={{ height:"100vh",background:T.bg,display:"flex",overflow:"hidden" }}>
      <style>{makeCSS(T)}</style>
      {showAuth && <AuthModal/>}
      {showBug && <BugModal/>}

      {/* SIDEBAR */}
      <div style={{ width: isMobile ? "100%" : 220, flexShrink:0, borderRight:`1px solid ${T.border}`, background:T.panel,
        display: isMobile && mobileView === "content" ? "none" : "flex",
        flexDirection:"column", padding:"16px 10px", gap:2 }} className="glass-nav">

        {/* Logo */}
        <div style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 8px 16px",borderBottom:`1px solid ${T.border}`,marginBottom:8 }}>
          <div style={{ width:28,height:28,borderRadius:"50%",border:`1px solid ${T.gold}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Cinzel',serif",fontSize:11,color:T.gold,flexShrink:0 }}>G</div>
          <span style={{ fontFamily:"'Cinzel',serif",color:T.gold,fontSize:12,letterSpacing:2 }}>GNOSIS</span>
          <div style={{ width:6,height:6,borderRadius:"50%",background:T.green,boxShadow:`0 0 5px ${T.green}`,marginLeft:"auto",flexShrink:0 }}/>
        </div>

        {/* Nav items */}
        {NAV.map(n => (
          <button key={n.id} onClick={()=>navTo(n.id)}
            style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 10px",borderRadius:8,
              background:tab===n.id?T.goldFaint:"transparent",
              border:`1px solid ${tab===n.id?T.goldBorder:"transparent"}`,
              color:tab===n.id?T.gold:T.sub,fontSize:13,fontWeight:tab===n.id?500:400,
              textAlign:"left",transition:"all .18s",width:"100%" }}
            onMouseEnter={e=>{ if(tab!==n.id){e.currentTarget.style.background=T.input; e.currentTarget.style.color=T.text;}}}
            onMouseLeave={e=>{ if(tab!==n.id){e.currentTarget.style.background="transparent"; e.currentTarget.style.color=T.sub;}}}>
            <span style={{ fontSize:14,opacity:.8 }}>{n.icon}</span>
            {n.label}
          </button>
        ))}

        {/* Bottom of sidebar */}
        <div style={{ marginTop:"auto",paddingTop:12,borderTop:`1px solid ${T.border}` }}>
          <ThemePicker/>
          <div style={{ marginTop:10 }}>
            {user ? (
              <div style={{ display:"flex",alignItems:"center",gap:8,padding:"8px 6px" }}>
                {user.avatar
                  ? <img src={user.avatar} alt="" style={{ width:26,height:26,borderRadius:"50%",objectFit:"cover" }}/>
                  : <div style={{ width:26,height:26,borderRadius:"50%",background:T.goldFaint,border:`1px solid ${T.goldBorder}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:T.gold }}>{(user.name||user.email||"?")[0].toUpperCase()}</div>
                }
                <div style={{ flex:1,minWidth:0 }}>
                  <p style={{ color:T.text,fontSize:12,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user.name||user.email}</p>
                  {user.premium && <p className="shimmer-text" style={{ fontSize:9,fontFamily:"'Cinzel',serif",letterSpacing:1 }}>PRO</p>}
                </div>
                <button onClick={logout} style={{ background:"none",border:"none",color:T.muted,fontSize:11,padding:0 }}>↩</button>
              </div>
            ) : (
              <button onClick={()=>setShowAuth(true)} style={{ width:"100%",background:T.input,border:`1px solid ${T.border}`,color:T.sub,
                padding:"9px",borderRadius:8,fontSize:13,fontWeight:500,transition:"all .18s" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=T.gold;e.currentTarget.style.color=T.text;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.sub;}}>
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex:1, display: isMobile && mobileView === "sidebar" ? "none" : "flex",
        flexDirection:"column", overflow:"hidden", minWidth:0, background:"transparent", position:"relative", zIndex:1 }}>

        {/* Mobile back button */}
        {isMobile && mobileView === "content" && (
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 16px",
            borderBottom:`1px solid ${T.glassBorder}`, background:"transparent", backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)", flexShrink:0, boxShadow:`inset 0 -1px 0 ${T.glassBorder}` }}>
            <button onClick={()=>setMobileView("sidebar")}
              style={{ background:"none", border:"none", color:T.gold, fontSize:18, padding:0, lineHeight:1, display:"flex", alignItems:"center" }}>←</button>
            <span style={{ fontFamily:"'Cinzel',serif", color:T.gold, fontSize:12, letterSpacing:2 }}>GNOSIS</span>
            <span style={{ color:T.sub, fontSize:13, marginLeft:4 }}>· {NAV.find(n=>n.id===tab)?.label||""}</span>
          </div>
        )}

        {/* ── CHAT ─────────────────────────────────────────────────────────*/}
        {tab==="chat" && (
          <>
            <div style={{ flex:1,overflowY:"auto",padding:"20px 16px",display:"flex",flexDirection:"column",gap:12 }}>
              {msgs.filter(m=>!m.hidden).map((msg,i)=>{
                const isU = msg.role==="user";
                const txt = typeof msg.content==="string" ? msg.content : Array.isArray(msg.content) ? msg.content.find(b=>b.type==="text")?.text||"" : "";
                const imgPreview = Array.isArray(msg.content) && msg.content.find(b=>b.type==="image_preview");
                return (
                  <div key={i} style={{ display:"flex",justifyContent:isU?"flex-end":"flex-start",alignItems:"flex-start",gap:8 }}>
                    {!isU && <div style={{ width:28,height:28,borderRadius:"50%",border:`1px solid ${T.goldBorder}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Cinzel',serif",fontSize:10,color:T.gold,flexShrink:0,marginTop:2,background:T.goldFaint }}>G</div>}
                    <div style={{ maxWidth:"72%",background:isU?T.userBg:T.aiBg,
                      border:`1px solid ${isU?T.userBorder:T.aiBorder}`,
                      borderRadius:isU?"14px 4px 14px 14px":"4px 14px 14px 14px",
                      padding:"11px 15px",color:isU?T.userText:T.text,
                      fontSize:15,lineHeight:1.75,whiteSpace:"pre-wrap",overflow:"hidden" }}>
                      {imgPreview && (
                        <div style={{ marginBottom:8 }}>
                          <img src={imgPreview.previewUrl} alt={imgPreview.name}
                            style={{ maxWidth:"100%",maxHeight:200,borderRadius:8,display:"block",objectFit:"cover" }}/>
                          <p style={{ fontSize:11,color:T.gold,opacity:.7,marginTop:4 }}>📷 {imgPreview.name}</p>
                        </div>
                      )}
                      {txt}
                      {!isU && ttsOK && <button onClick={()=>speak(txt)} style={{ display:"block",marginTop:8,background:"none",border:"none",color:T.muted,fontSize:12,padding:0 }}>Listen</button>}
                    </div>
                    {isU && user?.avatar && <img src={user.avatar} alt="" style={{ width:28,height:28,borderRadius:"50%",objectFit:"cover",flexShrink:0,marginTop:2 }}/>}
                  </div>
                );
              })}
              {loading && (
                <div style={{ display:"flex",alignItems:"flex-start",gap:8 }}>
                  <div style={{ width:28,height:28,borderRadius:"50%",border:`1px solid ${T.goldBorder}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Cinzel',serif",fontSize:10,color:T.gold,background:T.goldFaint }}>G</div>
                  <div style={{ background:T.aiBg,border:`1px solid ${T.aiBorder}`,borderRadius:"4px 14px 14px 14px" }}><Dots c={T.gold}/></div>
                </div>
              )}
              <div ref={bottomRef}/>
            </div>

            {photo && (
              <div style={{ padding:"7px 14px",borderTop:`1px solid ${T.border}`,background:T.goldFaint,display:"flex",alignItems:"center",gap:8,flexShrink:0 }}>
                <span style={{ color:T.gold,fontSize:13 }}>📷 {photo.name}</span>
                <button onClick={()=>setPhoto(null)} style={{ marginLeft:"auto",background:"none",border:"none",color:T.muted,fontSize:18 }}>×</button>
              </div>
            )}

            {speaking && (
              <div style={{ padding:"6px 14px",borderTop:`1px solid ${T.border}`,background:T.goldFaint,display:"flex",alignItems:"center",gap:10,flexShrink:0 }}>
                <Bars c={T.gold}/>
                <span style={{ color:T.gold,fontSize:13 }}>Speaking</span>
                <button onClick={stopSpeak} style={{ marginLeft:"auto",background:"none",border:`1px solid ${T.border}`,color:T.muted,padding:"2px 10px",borderRadius:5,fontSize:12 }}>Stop</button>
              </div>
            )}

            <div style={{ padding:"12px 14px",borderTop:`1px solid ${T.border}`,background:T.nav,backdropFilter:"blur(12px)",flexShrink:0 }}>
              <div style={{ display:"flex",gap:6,alignItems:"flex-end",background:T.input,border:`1px solid ${T.border}`,borderRadius:12,padding:"8px 10px",transition:"border .2s" }}
                onFocus={e=>e.currentTarget.style.borderColor=T.goldBorder}
                onBlur={e=>e.currentTarget.style.borderColor=T.border}>
                <button onClick={()=>chatFileRef.current?.click()}
                  style={{ width:30,height:30,borderRadius:7,border:`1px solid ${T.border}`,background:"transparent",color:T.muted,fontSize:14,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center" }}>📎</button>
                <input ref={chatFileRef} type="file" accept="image/*,.pdf,.txt,.md"
                  style={{ display:"none" }} onChange={e=>handleChatFile(e.target.files[0])}/>
                <textarea ref={taRef} value={input}
                  onChange={e=>{ setInput(e.target.value); e.target.style.height="auto"; e.target.style.height=Math.min(e.target.scrollHeight,120)+"px"; }}
                  onKeyDown={handleKey} placeholder={listening?"Listening...":"Ask anything across any faculty..."}
                  rows={1} style={{ flex:1,background:"transparent",border:"none",color:listening?T.gold:T.text,fontSize:15,lineHeight:1.5,maxHeight:120,caretColor:T.gold }}/>
                {voiceOK && <button onClick={toggleVoice} style={{ width:30,height:30,borderRadius:7,border:`1px solid ${listening?T.gold:T.border}`,background:listening?T.goldFaint:"transparent",color:listening?T.gold:T.muted,fontSize:14,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",animation:listening?"voicePulse 1.5s infinite":"none" }}>🎤</button>}
                {ttsOK && <button onClick={()=>speaking?stopSpeak():speak(msgs.at(-1)?.content?.toString?.()?.slice(0,800)||"")} style={{ width:30,height:30,borderRadius:7,border:`1px solid ${speaking?T.gold:T.border}`,background:speaking?T.goldFaint:"transparent",color:speaking?T.gold:T.muted,fontSize:14,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center" }}>🔊</button>}
                <button onClick={()=>send()} disabled={loading||(!input.trim()&&!photo)}
                  style={{ width:30,height:30,borderRadius:7,border:"none",flexShrink:0,
                    background:(input.trim()||photo)&&!loading?T.gold:T.input,
                    color:(input.trim()||photo)&&!loading?(dark?"#07070f":"#fff"):T.muted,
                    fontSize:16,fontWeight:600,transition:"all .18s" }}>↑</button>
              </div>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:7 }}>
                <p style={{ color:T.muted,fontSize:10,opacity:.5 }}>Enter to send · Shift+Enter for new line · Voice and image active on hosted site</p>
                <div style={{ display:"flex",gap:10,alignItems:"center" }}>
                  <button onClick={()=>setShowBug(true)} style={{ background:"none",border:"none",color:T.muted,fontSize:11,padding:0,textDecoration:"underline",textDecorationColor:T.border }}>Report a bug</button>
                  <p style={{ color:T.muted,fontSize:10,opacity:.4 }}>by Jordan Mendes</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── SOURCES ───────────────────────────────────────────────────────*/}
        {tab==="sources" && (
          <div style={{ flex:1,overflowY:"auto",padding:24 }}>
            <PageHeader title="Sources" sub="Upload lecture material. Gnosis reads and analyses it. Generate structured study artifacts from any source."/>

            {/* Artifact grid */}
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:8,marginBottom:24 }}>
              {Object.entries(ARTIFACTS).map(([key,a]) => (
                <button key={key} onClick={()=>genArtifact(key)} disabled={artLoading&&artType===key}
                  style={{ background:artifact?.type===key?T.goldFaint:T.input,
                    border:`1px solid ${artifact?.type===key?T.goldBorder:T.border}`,
                    borderRadius:10,padding:"14px 12px",textAlign:"left",transition:"all .18s",color:T.text }}
                  onMouseEnter={e=>{ if(artifact?.type!==key){e.currentTarget.style.borderColor=T.goldBorder;e.currentTarget.style.background=T.goldFaint;}}}
                  onMouseLeave={e=>{ if(artifact?.type!==key){e.currentTarget.style.borderColor=T.border;e.currentTarget.style.background=T.input;}}}>
                  <p style={{ fontSize:20,marginBottom:6 }}>{artLoading&&artType===key?"⏳":a.icon}</p>
                  <p style={{ fontSize:12,fontWeight:600,color:T.text,marginBottom:3 }}>{a.label}</p>
                  <p style={{ color:T.muted,fontSize:11,lineHeight:1.4 }}>{a.desc}</p>
                </button>
              ))}
            </div>

            {/* Artifact output */}
            {artifact && (
              <div style={{ background:T.glass,border:`1px solid ${T.glassBorder}`,borderRadius:14,padding:"16px 18px",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",boxShadow:`0 4px 24px rgba(0,0,0,.12), inset 0 1px 0 ${T.glassShine}`,marginBottom:22,animation:"modalIn .25s ease" }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8 }}>
                  <p style={{ fontWeight:600,color:T.text,fontSize:14 }}>{ARTIFACTS[artifact.type]?.label}</p>
                  <div style={{ display:"flex",gap:6 }}>
                    {ttsOK && <Btn sm onClick={()=>speak(artifact.content)}>Listen</Btn>}
                    {speaking && <Btn sm onClick={stopSpeak}>Stop</Btn>}
                    <Btn sm variant="ghost" onClick={()=>setArtifact(null)}>✕</Btn>
                  </div>
                </div>
                {speaking && artifact.type==="audio_overview" && <div style={{ marginBottom:10 }}><Bars c={T.gold}/></div>}
                <p style={{ color:T.sub,fontSize:15,lineHeight:1.85,whiteSpace:"pre-wrap" }}>{artifact.content}</p>
              </div>
            )}

            {/* Upload */}
            <div onDragOver={e=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)}
              onDrop={e=>{e.preventDefault();setDragOver(false);uploadFiles(e.dataTransfer.files);}}
              onClick={()=>fileRef.current?.click()}
              style={{ border:`2px dashed ${dragOver?T.gold:T.border}`,borderRadius:12,padding:"28px 20px",
                textAlign:"center",cursor:"pointer",background:dragOver?T.goldFaint:"transparent",
                transition:"all .25s",marginBottom:18 }}>
              <input ref={fileRef} type="file" multiple accept=".txt,.md" style={{ display:"none" }} onChange={e=>uploadFiles(e.target.files)}/>
              <p style={{ fontSize:24,marginBottom:8 }}>⊕</p>
              <p style={{ color:T.sub,fontSize:14,fontWeight:500 }}>{uploading?"Uploading...":"Upload study material"}</p>
              <p style={{ color:T.muted,fontSize:12,marginTop:4 }}>.txt or .md files</p>
            </div>

            <div style={{ marginBottom:20 }}>
              <Label>Or paste content</Label>
              <input value={pasteTitle} onChange={e=>setPasteTitle(e.target.value)} placeholder="Title (optional)"
                style={{ width:"100%",background:T.input,border:`1px solid ${T.border}`,borderRadius:"8px 8px 0 0",
                  padding:"9px 12px",color:T.text,fontSize:14,marginBottom:1 }}/>
              <textarea value={pasteText} onChange={e=>setPasteText(e.target.value)} placeholder="Paste lecture notes..." rows={4}
                style={{ width:"100%",background:T.input,border:`1px solid ${T.border}`,borderRadius:"0 0 8px 8px",
                  padding:"9px 12px",color:T.text,fontSize:14,lineHeight:1.65 }}/>
              <div style={{ marginTop:8 }}>
                <Btn onClick={addPaste} disabled={uploading}>{uploading?"Saving...":"Add source"}</Btn>
              </div>
            </div>

            {slides.length > 0 && (
              <div>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:8 }}>
                  <Label>{slides.length} source{slides.length>1?"s":""} loaded</Label>
                  <div style={{ display:"flex",gap:6,alignItems:"center" }}>
                    <select value={mcqSrc} onChange={e=>setMcqSrc(+e.target.value)}
                      style={{ background:T.card,border:`1px solid ${T.border}`,color:T.text,padding:"5px 8px",borderRadius:6,fontSize:12 }}>
                      {slides.map((s,i) => <option key={i} value={i}>{s.name}</option>)}
                    </select>
                    <Btn sm onClick={genMCQs} disabled={genMCQ}>{genMCQ?"...":"Generate MCQs"}</Btn>
                  </div>
                </div>
                {slides.map((s,i) => (
                  <div key={i} style={{ background:T.input,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 13px",marginBottom:6,display:"flex",alignItems:"center",justifyContent:"space-between",gap:8 }}>
                    <div>
                      <p style={{ color:T.text,fontSize:13,fontWeight:500 }}>{s.name}</p>
                      <p style={{ color:T.muted,fontSize:11,marginTop:2 }}>{s.chars?.toLocaleString()||"—"} chars · {s.addedAt?new Date(s.addedAt).toLocaleDateString():"recent"}</p>
                    </div>
                    <button onClick={()=>removeSlide(i)} style={{ background:"none",border:`1px solid rgba(239,68,68,.3)`,color:"rgba(239,68,68,.6)",width:26,height:26,borderRadius:5,fontSize:14,flexShrink:0 }}>×</button>
                  </div>
                ))}
              </div>
            )}
            <Footer/>
          </div>
        )}

        {/* ── MCQ QUIZ ─────────────────────────────────────────────────────*/}
        {tab==="quiz" && (
          <div style={{ flex:1,overflowY:"auto",padding:24 }}>
            <PageHeader title="MCQ Practice Quiz" sub="Questions generated from your uploaded sources."/>
            {mcqs.length===0
              ? <div style={{ textAlign:"center",padding:"48px 20px" }}>
                  <p style={{ color:T.sub,fontSize:15,marginBottom:20 }}>No questions yet. Go to Sources, select a slide, and click Generate MCQs.</p>
                  <Btn onClick={()=>navTo("sources")}>Go to Sources</Btn>
                </div>
              : <>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,background:T.input,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 14px",flexWrap:"wrap",gap:6 }}>
                    <span style={{ color:T.gold,fontSize:13,fontWeight:500 }}>Q {qi+1} / {mcqs.length}</span>
                    <span style={{ color:T.text,fontSize:14 }}>Score: {score.c}/{score.t}</span>
                    {quizTimeLeft>0 && <span style={{ color:quizTimeLeft<=10?T.red:T.sub,fontSize:13,fontWeight:600,fontVariantNumeric:"tabular-nums" }}>⏱ {Math.floor(quizTimeLeft/60)}:{String(quizTimeLeft%60).padStart(2,"0")}</span>}
                    <Btn sm variant="ghost" onClick={()=>{setQi(0);setAns(null);setScore({c:0,t:0});setQuizTimeLeft(mcqs.length*30);}}>Restart</Btn>
                  </div>
                  {mcqs[qi]?.source && <p style={{ color:T.muted,fontSize:12,marginBottom:8 }}>Source: {mcqs[qi].source}</p>}
                  <div style={{ background:T.input,border:`1px solid ${T.border}`,borderRadius:10,padding:"15px 17px",marginBottom:12 }}>
                    <p style={{ color:T.text,fontSize:16,lineHeight:1.8 }}>{mcqs[qi]?.question}</p>
                  </div>
                  <div style={{ display:"flex",flexDirection:"column",gap:7,marginBottom:12 }}>
                    {mcqs[qi]?.options?.map((opt,i) => {
                      const chosen=ans?.chosen===opt, correct=opt.startsWith(mcqs[qi]?.answer);
                      let bc=T.border,bg=T.input;
                      if(ans){if(correct){bc=T.green;bg="rgba(34,197,94,.07)";}else if(chosen){bc=T.red;bg="rgba(239,68,68,.07)";}}
                      return <button key={i} onClick={()=>answerMCQ(opt)} disabled={ans!==null}
                        style={{ background:bg,border:`1px solid ${bc}`,borderRadius:12,padding:"11px 14px",color:T.text,fontSize:15,textAlign:"left",lineHeight:1.6,transition:"all .18s",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",boxShadow:`inset 0 1px 0 rgba(255,255,255,.06)` }}>{opt}</button>;
                    })}
                  </div>
                  {ans && (
                    <div style={{ background:ans.correct?"rgba(34,197,94,.06)":"rgba(239,68,68,.06)",border:`1px solid ${ans.correct?"rgba(34,197,94,.3)":"rgba(239,68,68,.3)"}`,borderRadius:8,padding:"12px 14px",marginBottom:14 }}>
                      <p style={{ color:ans.correct?T.green:T.red,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",marginBottom:5 }}>{ans.correct?"Correct":"Incorrect"}</p>
                      <p style={{ color:T.sub,fontSize:14,lineHeight:1.75 }}>{mcqs[qi]?.explanation}</p>
                    </div>
                  )}
                  {ans && qi<mcqs.length-1 && <Btn onClick={()=>{setQi(p=>p+1);setAns(null);}}>Next →</Btn>}
                  {ans && qi===mcqs.length-1 && (
                    <div style={{ textAlign:"center",padding:"24px 0" }}>
                      <p style={{ fontSize:20,fontWeight:600,color:T.text,marginBottom:8 }}>Quiz Complete</p>
                      <p style        {/* ── GROUP STUDY ROOMS ─────────────────────────────────────────────*/}
        {tab==="group" && (() => {
          const roomBottomRef2 = useRef(null);
          useEffect(() => { roomBottomRef2.current?.scrollIntoView({ behavior:"smooth" }); }, [wsRoom?.messages?.length]);

          const connectWS = (action, payload) => {
            setWsStatus("connecting");
            const ws = new WebSocket(WS_URL.replace("/api",""));
            ws.onopen = () => {
              setWsStatus("connected");
              ws.send(JSON.stringify({ type:action, name:user?.name||user?.email||"Student", avatar:user?.avatar||null, ...payload }));
            };
            ws.onmessage = (e) => {
              const d = JSON.parse(e.data);
              if (d.type==="joined") setWsRoom({ ...d.room, code:d.code });
              if (d.type==="message") setWsRoom(r => r ? ({ ...r, messages:[...r.messages, d.message], members:d.members }) : r);
              if (d.type==="error") { alert(d.msg); ws.close(); setWsStatus("disconnected"); }
            };
            ws.onclose = () => { setWsStatus("disconnected"); setWsConn(null); };
            ws.onerror = () => { setWsStatus("disconnected"); };
            setWsConn(ws);
          };

          const sendRoomMsg = () => {
            if (!roomMsg.trim() || !wsConn || wsConn.readyState!==1) return;
            wsConn.send(JSON.stringify({ type:"message", text:roomMsg.trim(), avatar:user?.avatar||null }));
            setRoomMsg("");
          };

          const leaveRoom = () => {
            if (wsConn) { wsConn.send(JSON.stringify({type:"leave"})); wsConn.close(); }
            setWsRoom(null); setWsStatus("disconnected"); setWsConn(null);
          };

          // In room view
          if (wsRoom) return (
            <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden" }}>
              {/* Header */}
              <div style={{ padding:"12px 18px",borderBottom:`1px solid ${T.glassBorder}`,background:"transparent",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",display:"flex",alignItems:"center",gap:12,flexShrink:0 }}>
                <div style={{ flex:1,minWidth:0 }}>
                  <p style={{ color:T.text,fontSize:15,fontWeight:600 }}>{wsRoom.name}</p>
                  <p style={{ color:T.muted,fontSize:12,marginTop:1 }}>{wsRoom.members?.length||1} member{(wsRoom.members?.length||1)>1?"s":""} · {wsRoom.members?.join(", ")}</p>
                </div>
                <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                  <div style={{ background:T.input,border:`1px solid ${T.goldBorder}`,borderRadius:6,padding:"4px 10px",textAlign:"center" }}>
                    <p style={{ color:T.muted,fontSize:9,textTransform:"uppercase",letterSpacing:1 }}>Code</p>
                    <p style={{ color:T.gold,fontSize:14,fontWeight:700,letterSpacing:2 }}>{wsRoom.code}</p>
                  </div>
                  <button onClick={()=>navigator.clipboard?.writeText(wsRoom.code)} style={{ background:T.input,border:`1px solid ${T.border}`,color:T.muted,padding:"5px 10px",borderRadius:6,fontSize:12 }}>Copy</button>
                  <button onClick={leaveRoom} style={{ background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.2)",color:T.red,padding:"5px 10px",borderRadius:6,fontSize:12 }}>Leave</button>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex:1,overflowY:"auto",padding:"16px 18px",display:"flex",flexDirection:"column",gap:10 }}>
                {wsRoom.messages?.map((msg,i) => {
                  const isGnosis = msg.from==="Gnosis";
                  const isMe = msg.from===(user?.name||user?.email||"Student");
                  const isSystem = msg.system;
                  if (isSystem) return (
                    <p key={i} style={{ textAlign:"center",color:T.muted,fontSize:12,padding:"4px 0" }}>{msg.text}</p>
                  );
                  return (
                    <div key={i} style={{ display:"flex",justifyContent:isMe?"flex-end":"flex-start",alignItems:"flex-end",gap:8 }}>
                      {!isMe && (
                        <div style={{ width:28,height:28,borderRadius:"50%",background:isGnosis?T.goldFaint:T.input,border:`1px solid ${isGnosis?T.goldBorder:T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:isGnosis?10:13,flexShrink:0 }}>
                          {isGnosis?"G":msg.from?.[0]?.toUpperCase()||"?"}
                        </div>
                      )}
                      <div style={{ maxWidth:"72%" }}>
                        {!isMe && <p style={{ color:T.muted,fontSize:11,marginBottom:3 }}>{msg.from}</p>}
                        <div style={{ background:isMe?T.userBg:isGnosis?T.goldFaint:T.aiBg,border:`1px solid ${isMe?T.userBorder:isGnosis?T.goldBorder:T.aiBorder}`,borderRadius:isMe?"14px 4px 14px 14px":"4px 14px 14px 14px",padding:"10px 14px",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)" }}>
                          <p style={{ color:isMe?T.userText:T.text,fontSize:14,lineHeight:1.7,whiteSpace:"pre-wrap" }}>{msg.text}</p>
                        </div>
                        <p style={{ color:T.muted,fontSize:10,marginTop:3,textAlign:isMe?"right":"left" }}>{new Date(msg.at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</p>
                      </div>
                      {isMe && user?.avatar && <img src={user.avatar} alt="" style={{ width:28,height:28,borderRadius:"50%",objectFit:"cover",flexShrink:0 }}/>}
                    </div>
                  );
                })}
                <div ref={roomBottomRef2}/>
              </div>

              {/* Input */}
              <div style={{ padding:"12px 16px",borderTop:`1px solid ${T.glassBorder}`,background:"transparent",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",flexShrink:0 }}>
                <p style={{ color:T.muted,fontSize:11,marginBottom:6 }}>End message with ? or start with @gnosis to get AI help</p>
                <div style={{ display:"flex",gap:10,alignItems:"flex-end" }}>
                  <textarea value={roomMsg} onChange={e=>setRoomMsg(e.target.value)} placeholder="Type a message..."
                    rows={2} onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendRoomMsg();} }}
                    style={{ flex:1,background:T.input,border:`1px solid ${T.glassBorder}`,borderRadius:10,padding:"10px 12px",color:T.text,fontSize:14,lineHeight:1.5,fontFamily:"inherit",backdropFilter:"blur(8px)" }}/>
                  <Btn variant="solid" onClick={sendRoomMsg} disabled={!roomMsg.trim()||wsStatus!=="connected"}>Send</Btn>
                </div>
              </div>
            </div>
          );

          // Lobby view
          return (
            <div style={{ flex:1,overflowY:"auto",padding:24,maxWidth:480,margin:"0 auto",width:"100%" }}>
              <PageHeader title="Study Rooms" sub="Create a room or join one. Real-time group chat with AI support."/>

              {wsStatus==="connecting" && <p style={{ color:T.gold,fontSize:13,marginBottom:16,textAlign:"center" }}>Connecting...</p>}

              <div style={{ marginBottom:20 }}>
                <p style={{ fontSize:12,fontWeight:600,color:T.muted,letterSpacing:.6,textTransform:"uppercase",marginBottom:10 }}>Create a Room</p>
                <div style={{ background:T.glass,border:`1px solid ${T.glassBorder}`,borderRadius:12,padding:16,backdropFilter:"blur(12px)" }}>
                  <input defaultValue={roomName} onInput={e=>setRoomName(e.target.value)} placeholder="Room name e.g. Anatomy Study Group"
                    className="glass-input" style={{ width:"100%",borderRadius:8,padding:"10px 12px",color:T.text,fontSize:14,marginBottom:12 }}/>
                  <Btn variant="solid" full onClick={()=>{ if(!roomName.trim()) return; connectWS("create",{roomName:roomName.trim()}); }} disabled={wsStatus==="connecting"||!roomName.trim()}>
                    Create Room →
                  </Btn>
                </div>
              </div>

              <div>
                <p style={{ fontSize:12,fontWeight:600,color:T.muted,letterSpacing:.6,textTransform:"uppercase",marginBottom:10 }}>Join with Code</p>
                <div style={{ background:T.glass,border:`1px solid ${T.glassBorder}`,borderRadius:12,padding:16,backdropFilter:"blur(12px)" }}>
                  <input defaultValue={wsJoinCode} onInput={e=>setWsJoinCode(e.target.value.toUpperCase())} placeholder="Enter 6-digit room code"
                    maxLength={6} className="glass-input"
                    style={{ width:"100%",borderRadius:8,padding:"10px 12px",color:T.gold,fontSize:20,letterSpacing:6,fontWeight:600,textAlign:"center",marginBottom:12 }}/>
                  <Btn variant="solid" full onClick={()=>{ if(!wsJoinCode.trim()) return; connectWS("join",{code:wsJoinCode.trim()}); }} disabled={wsStatus==="connecting"||wsJoinCode.length<6}>
                    Join Room →
                  </Btn>
                </div>
              </div>

              <div style={{ marginTop:20,padding:14,background:T.goldFaint,border:`1px solid ${T.goldBorder}`,borderRadius:10 }}>
                <p style={{ color:T.gold,fontSize:13,fontWeight:500,marginBottom:4 }}>How it works</p>
                <p style={{ color:T.sub,fontSize:13,lineHeight:1.7 }}>Create a room and share the 6-digit code with your study group. Everyone who joins can chat in real time. Ask a question ending with ? and Gnosis will answer for the whole group.</p>
              </div>
              <Footer/>
            </div>
          );
        })()}

        {/* ── PAST QUESTIONS ────────────────────────────────────────────────*/}
        {tab==="pastq" && (
          <div style={{ flex:1,overflowY:"auto",padding:24 }}>
            <PageHeader title="Past Questions Bank" sub="Generate past-exam-style questions for any DUFUHS course."/>
            <div style={{ display:"grid",gap:14,marginBottom:20,maxWidth:480 }}>
              {[["Course / Subject","course","e.g. Human Physiology, Java Programming"],["Course Code","code","e.g. BMS 201, COS 301"],["Level","level","e.g. 200, 300, 400"],["Year","year","e.g. 2022/2023"]].map(([l,k,ph]) => (
                <Field key={k} label={l} val={pq[k]} set={v=>setPQ(p=>({...p,[k]:v}))} ph={ph}/>
              ))}
            </div>
            <Btn variant="solid" onClick={genPastQ} disabled={pqLoading||!pq.course}>{pqLoading?"Generating...":"Generate Past Questions"}</Btn>
            {pqResult && (
              <div style={{ marginTop:22,background:T.glass,border:`1px solid ${T.glassBorder}`,borderRadius:14,padding:"16px 18px",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",boxShadow:`0 4px 24px rgba(0,0,0,.12), inset 0 1px 0 ${T.glassShine}` }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8 }}>
                  <p style={{ fontWeight:600,color:T.text,fontSize:14 }}>{pq.course}{pq.code?` · ${pq.code}`:""}{pq.level?` · ${pq.level} Level`:""}{pq.year?` · ${pq.year}`:""}</p>
                  {ttsOK && <Btn sm onClick={()=>speak(pqResult.slice(0,1000))}>Listen</Btn>}
                </div>
                <p style={{ color:T.sub,fontSize:15,lineHeight:1.9,whiteSpace:"pre-wrap" }}>{pqResult}</p>
                <div style={{ marginTop:14 }}>
                  <Btn onClick={()=>{ send(`Quiz me on these past questions:\n${pqResult.slice(0,2000)}`); navTo("chat"); }}>Quiz Me on These →</Btn>
                </div>
              </div>
            )}
            <Footer/>
          </div>
        )}

                {/* ── FLASHCARDS ────────────────────────────────────────────────────*/}
        {tab==="flash" && (
          <div style={{ flex:1,overflowY:"auto",padding:24 }}>
            <PageHeader title="Flashcards" sub="Drop a file or paste text — Gnosis generates a summary and swipeable flashcards."/>
            <input ref={fcFileRef} type="file" accept=".txt,.pdf,.pptx" onChange={e=>handleFcFile(e.target.files?.[0])} style={{ display:"none" }}/>
            {fcCards.length===0 ? (
              <>
                {/* Drop zone */}
                <div
                  onDragOver={e=>{ e.preventDefault(); setFcDrag(true); }}
                  onDragLeave={()=>setFcDrag(false)}
                  onDrop={e=>{ e.preventDefault(); setFcDrag(false); handleFcFile(e.dataTransfer.files?.[0]); }}
                  onClick={()=>fcFileRef.current?.click()}
                  style={{
                    border:`2px dashed ${fcDrag?T.gold:T.glassBorder}`,
                    borderRadius:14, padding:"28px 20px", textAlign:"center", cursor:"pointer",
                    marginBottom:14, transition:"all .2s",
                    background:fcDrag?T.goldFaint:`rgba(255,255,255,.03)`,
                    backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)",
                    boxShadow:fcDrag?`0 0 0 3px rgba(200,169,110,.15)`:"none"
                  }}>
                  <div style={{ fontSize:28, marginBottom:8 }}>📎</div>
                  <p style={{ color:fcDrag?T.gold:T.sub, fontSize:14, fontWeight:500, marginBottom:4 }}>
                    {fcDrag ? "Drop it!" : "Drop a file here"}
                  </p>
                  <p style={{ color:T.muted, fontSize:12 }}>Supports .txt · .pdf · .pptx</p>
                  {fcFileName && <p style={{ color:T.gold, fontSize:12, marginTop:8, fontWeight:500 }}>📄 {fcFileName}</p>}
                  {fcFileErr && <p style={{ color:T.red, fontSize:12, marginTop:8 }}>{fcFileErr}</p>}
                </div>

                <p style={{ color:T.muted, fontSize:12, textAlign:"center", marginBottom:10 }}>or paste text below</p>

                <textarea value={fcInput} onChange={e=>setFcInput(e.target.value)}
                  placeholder="Paste your lecture notes, textbook excerpt, or any study text here..."
                  rows={8}
                  style={{ width:"100%",background:T.input,border:`1px solid ${T.glassBorder}`,borderRadius:10,
                    padding:"13px 15px",color:T.text,fontSize:14,lineHeight:1.8,marginBottom:14,
                    fontFamily:"inherit",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)" }}/>
                <Btn variant="solid" onClick={genFlashcards} disabled={fcLoading||!fcInput.trim()}>
                  {fcLoading?"Reading & generating...":"Generate Summary + Flashcards"}
                </Btn>
              </>
            ) : (
              <>
                {fcSummary && (
                  <div style={{ background:T.goldFaint,border:`1px solid ${T.goldBorder}`,borderRadius:10,padding:"13px 16px",marginBottom:20 }}>
                    <p style={{ fontSize:11,fontWeight:600,color:T.gold,letterSpacing:.8,textTransform:"uppercase",marginBottom:7 }}>Summary</p>
                    <p style={{ color:T.text,fontSize:14,lineHeight:1.85 }}>{fcSummary}</p>
                  </div>
                )}
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
                  <p style={{ color:T.muted,fontSize:12 }}>Card {fcIdx+1} of {fcCards.length}</p>
                  <Btn sm variant="ghost" onClick={()=>{setFcCards([]);setFcInput("");setFcSummary("");setFcIdx(0);setFcFlipped(false);}}>New Text</Btn>
                </div>
                {/* Card */}
                <div onClick={()=>setFcFlipped(f=>!f)}
                  style={{ background:fcFlipped?`linear-gradient(135deg, rgba(200,169,110,.15), rgba(200,169,110,.07))`:`rgba(255,255,255,.06)`, border:`1px solid ${fcFlipped?T.goldBorder:T.glassBorder}`,backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",boxShadow:fcFlipped?`0 8px 32px rgba(200,169,110,.18), inset 0 1px 0 rgba(200,169,110,.25)`:`0 8px 32px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.10)`,
                    borderRadius:14,padding:"32px 24px",minHeight:180,display:"flex",flexDirection:"column",
                    alignItems:"center",justifyContent:"center",cursor:"pointer",marginBottom:16,
                    textAlign:"center",transition:"all .2s",userSelect:"none" }}>
                  <p style={{ fontSize:10,fontWeight:600,color:fcFlipped?T.gold:T.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:12 }}>
                    {fcFlipped?"ANSWER":"QUESTION — tap to flip"}
                  </p>
                  <p style={{ color:T.text,fontSize:17,lineHeight:1.75 }}>
                    {fcFlipped ? fcCards[fcIdx]?.back : fcCards[fcIdx]?.front}
                  </p>
                </div>
                <div style={{ display:"flex",gap:10,justifyContent:"center" }}>
                  <Btn onClick={()=>{if(fcIdx>0){setFcIdx(i=>i-1);setFcFlipped(false);}}} disabled={fcIdx===0}>← Prev</Btn>
                  {fcFlipped && fcIdx<fcCards.length-1 && (
                    <Btn variant="solid" onClick={()=>{setFcIdx(i=>i+1);setFcFlipped(false);}}>Next →</Btn>
                  )}
                  {fcFlipped && fcIdx===fcCards.length-1 && (
                    <Btn variant="solid" onClick={()=>{setFcIdx(0);setFcFlipped(false);}}>Restart</Btn>
                  )}
                </div>
              </>
            )}
            <Footer/>
          </div>
        )}

        {/* ── EXPLAIN THIS ──────────────────────────────────────────────────*/}
        {tab==="explain" && (
          <div style={{ flex:1,overflowY:"auto",padding:24 }}>
            <PageHeader title="Explain This" sub="Take a photo of a textbook page, diagram, or handwritten note — Gnosis explains it."/>
            <input ref={explainRef} type="file" accept="image/*" capture="environment"
              onChange={handleExplainImg} style={{ display:"none" }}/>
            {!explainImg ? (
              <div style={{ display:"flex",flexDirection:"column",gap:12,alignItems:"center",padding:"48px 20px",textAlign:"center" }}>
                <div style={{ width:72,height:72,borderRadius:"50%",background:`linear-gradient(135deg, rgba(200,169,110,.18), rgba(200,169,110,.07))`,border:`1px solid ${T.goldBorder}`,
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",boxShadow:"0 4px 24px rgba(200,169,110,.18), inset 0 1px 0 rgba(200,169,110,.25)" }}>📷</div>
                <p style={{ color:T.sub,fontSize:15 }}>Point your camera at anything you want explained</p>
                <Btn variant="solid" onClick={()=>explainRef.current?.click()}>Take Photo / Upload Image</Btn>
              </div>
            ) : (
              <>
                <div style={{ marginBottom:16,borderRadius:12,overflow:"hidden",border:`1px solid ${T.border}`,maxHeight:280 }}>
                  <img src={`data:${explainImg.type};base64,${explainImg.data}`} alt="uploaded"
                    style={{ width:"100%",objectFit:"cover",display:"block" }}/>
                </div>
                <div style={{ display:"flex",gap:10,marginBottom:20,flexWrap:"wrap" }}>
                  <Btn variant="solid" onClick={runExplain} disabled={explainLoading}>
                    {explainLoading?"Explaining...":"Explain This →"}
                  </Btn>
                  <Btn variant="ghost" onClick={()=>{setExplainImg(null);setExplainResult("");}}>Change Image</Btn>
                </div>
                {explainResult && (
                  <div style={{ background:T.glass,border:`1px solid ${T.glassBorder}`,borderRadius:14,padding:"16px 18px",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)",boxShadow:`0 4px 24px rgba(0,0,0,.12), inset 0 1px 0 ${T.glassShine}` }}>
                    <p style={{ fontSize:11,fontWeight:600,color:T.gold,letterSpacing:.8,textTransform:"uppercase",marginBottom:10 }}>Explanation</p>
                    <p style={{ color:T.sub,fontSize:15,lineHeight:1.9,whiteSpace:"pre-wrap" }}>{explainResult}</p>
                    {ttsOK && (
                      <div style={{ marginTop:14 }}>
                        <Btn sm onClick={()=>speak(explainResult)}>🔊 Listen</Btn>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
            <Footer/>
          </div>
        )}
      </div>
    </div>
  );
}
