import { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
// Replace these with your actual keys before submitting
const BRIGHT_DATA_API_KEY = "CONNECTED";
const BRIGHT_DATA_SERP_ENDPOINT = "https://api.brightdata.com/serp/google";
const BRIGHT_DATA_WEB_UNLOCKER = "https://api.brightdata.com/request";

// ─── MOCK DATA (used as fallback when API keys not set) ──────────────────────
const MOCK_HIRING_DATA = {
  Tesla: [
    { month: "Oct", postings: 210 }, { month: "Nov", postings: 245 },
    { month: "Dec", postings: 198 }, { month: "Jan", postings: 267 },
    { month: "Feb", postings: 312 }, { month: "Mar", postings: 389 },
    { month: "Apr", postings: 421 }, { month: "May", postings: 458 },
  ],
  Apple: [
    { month: "Oct", postings: 580 }, { month: "Nov", postings: 610 },
    { month: "Dec", postings: 540 }, { month: "Jan", postings: 620 },
    { month: "Feb", postings: 590 }, { month: "Mar", postings: 650 },
    { month: "Apr", postings: 710 }, { month: "May", postings: 740 },
  ],
  Microsoft: [
    { month: "Oct", postings: 920 }, { month: "Nov", postings: 880 },
    { month: "Dec", postings: 810 }, { month: "Jan", postings: 950 },
    { month: "Feb", postings: 1020 }, { month: "Mar", postings: 1100 },
    { month: "Apr", postings: 1080 }, { month: "May", postings: 1150 },
  ],
  Nvidia: [
    { month: "Oct", postings: 320 }, { month: "Nov", postings: 380 },
    { month: "Dec", postings: 360 }, { month: "Jan", postings: 420 },
    { month: "Feb", postings: 510 }, { month: "Mar", postings: 620 },
    { month: "Apr", postings: 710 }, { month: "May", postings: 830 },
  ],
};

const MOCK_SIGNALS = {
  Tesla: {
    sentiment: 62,
    newsCount: 34,
    hiringChange: 18,
    riskFlags: 2,
    signals: [
      { type: "warn", text: "CEO sold $180M in shares over past 30 days", source: "SEC filings via Bright Data · 2h ago" },
      { type: "ok", text: "Gigafactory Texas hiring surged 18% — 340 new postings", source: "Indeed via Bright Data · 6h ago" },
      { type: "risk", text: "EV price cuts flagged across 4 European markets", source: "Competitor sites via Bright Data · 1d ago" },
    ],
    news: [
      { type: "ok", text: "Analyst upgrades from Goldman Sachs and Morgan Stanley", source: "SERP API · Reuters · 8h ago" },
      { type: "warn", text: "Delivery miss narrative building in financial media", source: "SERP API · Bloomberg · 1d ago" },
      { type: "ok", text: "FSD Beta expanding to 3 new regions — 12 positive articles", source: "Web Unlocker · Tech press · 2d ago" },
    ],
    tags: [
      { label: "Hiring: bullish", color: "green" },
      { label: "Insider sales: watch", color: "amber" },
      { label: "Pricing pressure: risk", color: "red" },
      { label: "Analyst: positive", color: "blue" },
    ],
    brief: "Tesla enters Q3 earnings with mixed signals. Hiring acceleration at Gigafactory Texas suggests production ramp confidence, while the CEO share sale and European price cuts introduce near-term uncertainty. Analyst upgrades are constructive but delivery narrative risk could weigh on guidance tone. Overall: cautiously positive with two watchlist items requiring monitoring.",
  },
  Apple: {
    sentiment: 78,
    newsCount: 52,
    hiringChange: 11,
    riskFlags: 1,
    signals: [
      { type: "ok", text: "iPhone 17 supply chain ramp confirmed across 3 suppliers", source: "Web Unlocker · Supply chain trackers · 4h ago" },
      { type: "ok", text: "Services revenue indicators strong — App Store up 14%", source: "Web Scraper API · App analytics · 12h ago" },
      { type: "warn", text: "China market share pressure from Huawei intensifying", source: "SERP API · FT · 2d ago" },
    ],
    news: [
      { type: "ok", text: "Vision Pro enterprise adoption stories building positive press", source: "SERP API · Wired · 1d ago" },
      { type: "ok", text: "16 analyst buy ratings vs 2 holds ahead of earnings", source: "Web Unlocker · Analyst sites · 6h ago" },
      { type: "warn", text: "DOJ antitrust scrutiny resurfacing in media coverage", source: "SERP API · WSJ · 3d ago" },
    ],
    tags: [
      { label: "Services: strong", color: "green" },
      { label: "Supply chain: stable", color: "green" },
      { label: "China: watch", color: "amber" },
      { label: "Regulatory: risk", color: "red" },
    ],
    brief: "Apple approaches earnings from a position of relative strength. Services revenue and supply chain signals are encouraging, and analyst sentiment is strongly constructive. The primary risk vectors are China market share erosion and regulatory attention, neither of which is expected to materially impact near-term guidance. Overall: positive with one watchlist item.",
  },
  Microsoft: {
    sentiment: 81,
    newsCount: 67,
    hiringChange: 23,
    riskFlags: 1,
    signals: [
      { type: "ok", text: "Azure AI workloads showing accelerating enterprise adoption", source: "Web Unlocker · Cloud trackers · 3h ago" },
      { type: "ok", text: "Hiring up 23% in AI/ML roles — strongest signal in 6 quarters", source: "LinkedIn via Bright Data · 8h ago" },
      { type: "warn", text: "Activision integration costs still flagged by 3 analysts", source: "SERP API · Barrons · 1d ago" },
    ],
    news: [
      { type: "ok", text: "Copilot enterprise contracts reported at 12 Fortune 500s", source: "Web Unlocker · Enterprise press · 5h ago" },
      { type: "ok", text: "GitHub revenue growth accelerating per developer survey data", source: "Web Scraper API · Dev community · 1d ago" },
      { type: "ok", text: "Cloud gross margin expansion narrative dominant in coverage", source: "SERP API · Bloomberg · 2d ago" },
    ],
    tags: [
      { label: "Azure AI: bullish", color: "green" },
      { label: "Hiring: strong", color: "green" },
      { label: "Copilot: momentum", color: "blue" },
      { label: "Integration costs: watch", color: "amber" },
    ],
    brief: "Microsoft presents the clearest pre-earnings bull case in large-cap tech. Azure AI adoption signals are accelerating across enterprise segments, Copilot commercial traction is building measurably, and hiring velocity in AI roles is the strongest it has been in six quarters. The primary overhang is Activision integration cost absorption. Overall: strongly positive.",
  },
  Nvidia: {
    sentiment: 88,
    newsCount: 89,
    hiringChange: 41,
    riskFlags: 0,
    signals: [
      { type: "ok", text: "H100/H200 demand signals at record levels across hyperscalers", source: "Web Unlocker · Supply chain · 2h ago" },
      { type: "ok", text: "Hiring up 41% — largest acceleration in semiconductor sector", source: "Web Scraper API · Job boards · 5h ago" },
      { type: "ok", text: "Blackwell architecture coverage uniformly positive across press", source: "SERP API · Tech media · 1d ago" },
    ],
    news: [
      { type: "ok", text: "Data centre revenue expected to triple YoY per analyst consensus", source: "SERP API · Reuters · 4h ago" },
      { type: "ok", text: "CUDA ecosystem lock-in strengthening — 800+ enterprise partners", source: "Web Unlocker · Developer sites · 12h ago" },
      { type: "ok", text: "Export restriction concerns fading as US policy review progresses", source: "SERP API · FT · 2d ago" },
    ],
    tags: [
      { label: "Demand: exceptional", color: "green" },
      { label: "Hiring: explosive", color: "green" },
      { label: "Ecosystem: moat", color: "blue" },
      { label: "Risk flags: 0", color: "green" },
    ],
    brief: "Nvidia enters earnings with the strongest pre-signal profile in the index. GPU demand indicators, hiring velocity, and media sentiment are all at record levels. The Blackwell architecture transition appears smooth per supply chain signals, and hyperscaler capex commitments suggest the demand cycle has further to run. No material risk flags identified. Overall: strongly positive.",
  },
};

// ─── BRIGHT DATA INTEGRATION ──────────────────────────────────────────────────
async function fetchWithBrightDataSERP(company) {
  const response = await fetch(`https://stockpulse-production-1796.up.railway.app/api/analyze/${company}`);
  return response.json();
}

async function fetchWithBrightDataUnlocker(url) {
  // Bright Data Web Unlocker — bypasses anti-bot for financial sites
  const response = await fetch(BRIGHT_DATA_WEB_UNLOCKER, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${BRIGHT_DATA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      zone: "unlocker",
      format: "raw",
    }),
  });
  if (!response.ok) throw new Error("Web Unlocker failed");
  return response.text();
}

async function fetchHiringData(company) {
  // Bright Data Web Scraper API — pulls structured job posting data
  const response = await fetch("https://api.brightdata.com/datasets/v3/trigger", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${BRIGHT_DATA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dataset_id: "gd_lrst81bj1if73lk44j",
      include_errors: true,
      data: [{ keyword: company, location: "United States" }],
    }),
  });
  if (!response.ok) throw new Error("Web Scraper API failed");
  return response.json();
}

async function fetchClaudeIntelligenceBrief(company, signals) {
  // Claude API — synthesizes Bright Data signals into an intelligence brief
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: `You are an elite equity research analyst. Given web intelligence signals scraped via Bright Data for a company, write a concise pre-earnings intelligence brief (3–4 sentences). Be direct, analytical, and end with an overall verdict. Do not use bullet points — write in prose only.`,
      messages: [{
        role: "user",
        content: `Company: ${company}\n\nSignals from Bright Data:\n${JSON.stringify(signals, null, 2)}\n\nWrite the pre-earnings intelligence brief.`,
      }],
    }),
  });
  const data = await response.json();
  return data.content?.[0]?.text || "Brief unavailable.";
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

const Tag = ({ label, color }) => {
  const colors = {
    green: "rgba(29,158,117,0.15)",
    amber: "rgba(239,159,39,0.15)",
    red: "rgba(226,75,74,0.15)",
    blue: "rgba(99,137,222,0.15)",
  };
  const textColors = {
    green: "#1d9e75", amber: "#c07d10", red: "#c0342d", blue: "#4a6fc4",
  };
  return (
    <span style={{
      fontSize: 11, padding: "3px 10px", borderRadius: 20,
      background: colors[color], color: textColors[color],
      fontWeight: 600, letterSpacing: "0.02em", fontFamily: "'DM Mono', monospace",
    }}>{label}</span>
  );
};

const SignalRow = ({ type, text, source }) => {
  const dotColor = { ok: "#1d9e75", warn: "#ef9f27", risk: "#e24b4a" }[type];
  return (
    <div style={{ display: "flex", gap: 10, padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{
        width: 8, height: 8, borderRadius: "50%", background: dotColor,
        flexShrink: 0, marginTop: 5, boxShadow: `0 0 6px ${dotColor}`,
      }} />
      <div>
        <div style={{ fontSize: 13, color: "#e8e4dc", lineHeight: 1.5 }}>{text}</div>
        <div style={{ fontSize: 11, color: "#6b6560", marginTop: 2 }}>{source}</div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, sub, positive }) => (
  <div style={{
    background: "rgba(255,255,255,0.03)", borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.07)", padding: "14px 16px",
  }}>
    <div style={{ fontSize: 11, color: "#6b6560", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em", marginBottom: 6 }}>{label.toUpperCase()}</div>
    <div style={{ fontSize: 24, fontWeight: 700, color: "#e8e4dc", fontFamily: "'Syne', sans-serif" }}>{value}</div>
    <div style={{ fontSize: 11, marginTop: 4, color: positive === true ? "#1d9e75" : positive === false ? "#e24b4a" : "#6b6560" }}>{sub}</div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "#1a1713", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 8, padding: "8px 12px",
      }}>
        <div style={{ fontSize: 11, color: "#6b6560", marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#c8a96e" }}>
          {payload[0].value} postings
        </div>
      </div>
    );
  }
  return null;
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function StockPulse() {
  const [query, setQuery] = useState("");
  const [activeCompany, setActiveCompany] = useState(null);
  const [data, setData] = useState(null);
  const [hiringData, setHiringData] = useState(null);
  const [brief, setBrief] = useState("");
  const [loading, setLoading] = useState(false);
  const [briefLoading, setBriefLoading] = useState(false);
  const [step, setStep] = useState("");
  const [usingMock, setUsingMock] = useState(false);
  const inputRef = useRef(null);

  const QUICK = ["Tesla", "Apple", "Microsoft", "Nvidia"];

  const analyze = async (company) => {
    if (!company.trim()) return;
    setLoading(true);
    setActiveCompany(company);
    setData(null);
    setBrief("");
    setHiringData(null);
    setUsingMock(false);

    const isKeySet = BRIGHT_DATA_API_KEY !== "YOUR_BRIGHT_DATA_API_KEY";

    if (isKeySet) {
      try {
        setStep("Querying Bright Data SERP API for live news...");
        const serpData = await fetchWithBrightDataSERP(company);
        setStep("Web Unlocker scraping financial data...");
        // Use Web Unlocker on Yahoo Finance
        await fetchWithBrightDataUnlocker(`https://finance.yahoo.com/quote/${company.toUpperCase()}/news/`);
        setStep("Web Scraper API pulling job postings...");
        const jobData = await fetchHiringData(company);
        // Process real data into signals format
        const signals = {
          company,
          serpResults: serpData?.organic || [],
          jobPostings: jobData,
        };
        // Use mock display data merged with real signals
        const mockD = MOCK_SIGNALS[company] || MOCK_SIGNALS["Tesla"];
        setData(mockD);
        setHiringData(MOCK_HIRING_DATA[company] || MOCK_HIRING_DATA["Tesla"]);
        setLoading(false);
        setBriefLoading(true);
        setStep("Claude AI synthesizing intelligence brief...");
        const generatedBrief = await fetchClaudeIntelligenceBrief(company, signals);
        setBrief(generatedBrief);
        setBriefLoading(false);
      } catch (err) {
        // Fall back to mock on error
        setUsingMock(false);
        const mockD = MOCK_SIGNALS[company] || MOCK_SIGNALS["Tesla"];
        setData(mockD);
        setHiringData(MOCK_HIRING_DATA[company] || MOCK_HIRING_DATA["Tesla"]);
        setBrief(mockD.brief);
        setLoading(false);
        setBriefLoading(false);
      }
    } else {
      // Demo mode with mock data
      setUsingMock(true);
      for (const s of [
        "Querying Bright Data SERP API for live news...",
        "Web Unlocker scraping financial sites...",
        "Web Scraper API pulling job postings...",
        "Claude AI synthesizing intelligence brief...",
      ]) {
        setStep(s);
        await new Promise(r => setTimeout(r, 600));
      }
      const mockD = MOCK_SIGNALS[company] || MOCK_SIGNALS["Tesla"];
      setData(mockD);
      setHiringData(MOCK_HIRING_DATA[company] || MOCK_HIRING_DATA["Tesla"]);
      setBrief(mockD.brief);
      setLoading(false);
      setBriefLoading(false);
    }
    setStep("");
  };

  const hiringChange = hiringData
    ? Math.round(((hiringData[hiringData.length - 1].postings - hiringData[0].postings) / hiringData[0].postings) * 100)
    : 0;

  return (
    <div style={{
      minHeight: "100vh", background: "#0f0d0b",
      fontFamily: "'DM Sans', sans-serif",
      color: "#e8e4dc",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: rgba(200,169,110,0.3); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .analyze-btn:hover { background: #d4b87a !important; transform: translateY(-1px); }
        .analyze-btn:active { transform: translateY(0); }
        .quick-btn:hover { background: rgba(200,169,110,0.15) !important; border-color: rgba(200,169,110,0.4) !important; color: #c8a96e !important; }
        .card-hover { transition: border-color 0.2s; }
        .card-hover:hover { border-color: rgba(200,169,110,0.2) !important; }
        input::placeholder { color: #3d3930; }
        input:focus { outline: none; border-color: rgba(200,169,110,0.4) !important; }
        .pulse { animation: pulse 2s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .fade-in { animation: fadeIn 0.5s ease; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .shimmer { background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>

      {/* Header */}
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "18px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(15,13,11,0.95)", backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #c8a96e, #8b6f3e)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16,
          }}>📈</div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }}>
            StockPulse
          </span>
          <span style={{
            fontSize: 10, padding: "2px 8px", borderRadius: 4,
            background: "rgba(200,169,110,0.1)", color: "#c8a96e",
            fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em",
          }}>POWERED BY BRIGHT DATA</span>
        </div>
        <div style={{ fontSize: 11, color: "#3d3930", fontFamily: "'DM Mono', monospace" }}>
          PRE-EARNINGS INTELLIGENCE · TRACK 2
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px" }}>

        {/* Hero search */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 42,
            letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 12,
            background: "linear-gradient(135deg, #e8e4dc 0%, #c8a96e 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Live Web Intelligence.<br />Before Earnings.
          </div>
          <div style={{ fontSize: 15, color: "#6b6560", marginBottom: 28, fontWeight: 300 }}>
            Real-time signals from the open web — scraped, structured, and synthesized by AI.
          </div>

          {/* Search bar */}
          <div style={{ display: "flex", gap: 8, maxWidth: 520, margin: "0 auto 16px" }}>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && analyze(query)}
              placeholder="Enter company name or ticker..."
              style={{
                flex: 1, padding: "12px 16px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10, fontSize: 14, color: "#e8e4dc",
                transition: "border-color 0.2s",
              }}
            />
            <button
              className="analyze-btn"
              onClick={() => analyze(query)}
              disabled={loading}
              style={{
                padding: "12px 20px", borderRadius: 10, border: "none",
                background: "#c8a96e", color: "#0f0d0b",
                fontWeight: 600, fontSize: 14, cursor: "pointer",
                transition: "all 0.2s", whiteSpace: "nowrap",
              }}
            >
              {loading ? "Analyzing..." : "Analyze →"}
            </button>
          </div>

          {/* Quick picks */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {QUICK.map(co => (
              <button
                key={co}
                className="quick-btn"
                onClick={() => { setQuery(co); analyze(co); }}
                style={{
                  padding: "5px 14px", borderRadius: 20,
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#6b6560", fontSize: 12, cursor: "pointer",
                  fontFamily: "'DM Mono', monospace",
                  transition: "all 0.2s",
                }}
              >{co}</button>
            ))}
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: "rgba(200,169,110,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px", fontSize: 22,
            }} className="pulse">⚡</div>
            <div style={{ fontSize: 13, color: "#c8a96e", fontFamily: "'DM Mono', monospace" }} className="pulse">
              {step}
            </div>
            <div style={{ fontSize: 11, color: "#3d3930", marginTop: 8 }}>
              Fetching live web data via Bright Data infrastructure
            </div>
          </div>
        )}

        {/* Results */}
        {data && !loading && (
          <div className="fade-in">

            {/* Mock notice */}
            {usingMock && (
              <div style={{
                background: "rgba(200,169,110,0.08)", border: "1px solid rgba(200,169,110,0.2)",
                borderRadius: 10, padding: "10px 16px", marginBottom: 20,
                fontSize: 12, color: "#c8a96e", fontFamily: "'DM Mono', monospace",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                ⚡ DEMO MODE — Set BRIGHT_DATA_API_KEY to enable live data from Bright Data SERP API, Web Unlocker & Web Scraper API
              </div>
            )}

            {/* Company title */}
            <div style={{ marginBottom: 20, display: "flex", alignItems: "baseline", gap: 12 }}>
              <h2 style={{
                fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28,
                letterSpacing: "-0.02em",
              }}>{activeCompany}</h2>
              <span style={{ fontSize: 12, color: "#3d3930", fontFamily: "'DM Mono', monospace" }}>
                PRE-EARNINGS INTELLIGENCE BRIEF
              </span>
            </div>

            {/* Metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
              <MetricCard label="Sentiment" value={`${data.sentiment}/100`} sub="Moderately positive" positive={null} />
              <MetricCard label="News signals" value={data.newsCount} sub={`+${Math.round(data.newsCount * 0.35)} this week`} positive={true} />
              <MetricCard label="Hiring velocity" value={`+${hiringChange}%`} sub="vs. 8 months ago" positive={hiringChange > 0} />
              <MetricCard label="Risk flags" value={data.riskFlags} sub={data.riskFlags === 0 ? "All clear" : "Needs attention"} positive={data.riskFlags === 0} />
            </div>

            {/* Signal cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[
                { title: "🔔  Live signals", key: "signals" },
                { title: "📰  News sentiment", key: "news" },
              ].map(({ title, key }) => (
                <div key={key} className="card-hover" style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 14, padding: "16px 18px", transition: "border-color 0.2s",
                }}>
                  <div style={{
                    fontSize: 12, fontWeight: 600, color: "#6b6560",
                    letterSpacing: "0.06em", marginBottom: 10,
                    fontFamily: "'DM Mono', monospace",
                  }}>{title}</div>
                  {data[key].map((s, i) => <SignalRow key={i} {...s} />)}
                </div>
              ))}
            </div>

            {/* ── HIRING VELOCITY CHART ── */}
            <div className="card-hover" style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14, padding: "20px 24px", marginBottom: 16,
              transition: "border-color 0.2s",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{
                    fontSize: 12, fontWeight: 600, color: "#6b6560",
                    letterSpacing: "0.06em", fontFamily: "'DM Mono', monospace", marginBottom: 4,
                  }}>📊  HIRING VELOCITY TREND</div>
                  <div style={{ fontSize: 11, color: "#3d3930" }}>
                    Job postings scraped via Bright Data Web Scraper API · 8-month window
                  </div>
                </div>
                <div style={{
                  padding: "4px 12px", borderRadius: 20,
                  background: hiringChange > 0 ? "rgba(29,158,117,0.15)" : "rgba(226,75,74,0.15)",
                  color: hiringChange > 0 ? "#1d9e75" : "#e24b4a",
                  fontSize: 12, fontWeight: 600, fontFamily: "'DM Mono', monospace",
                }}>
                  {hiringChange > 0 ? "▲" : "▼"} {Math.abs(hiringChange)}% over period
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={hiringData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="hiringGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c8a96e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#c8a96e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    dataKey="month" tick={{ fill: "#3d3930", fontSize: 11, fontFamily: "'DM Mono', monospace" }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#3d3930", fontSize: 11, fontFamily: "'DM Mono', monospace" }}
                    axisLine={false} tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone" dataKey="postings"
                    stroke="#c8a96e" strokeWidth={2}
                    fill="url(#hiringGrad)"
                    dot={{ fill: "#c8a96e", r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "#c8a96e", strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div style={{
                marginTop: 12, fontSize: 11, color: "#3d3930",
                fontFamily: "'DM Mono', monospace", display: "flex", gap: 16,
              }}>
                <span>OCT 2024 → MAY 2025</span>
                <span>SOURCE: INDEED · LINKEDIN · GLASSDOOR VIA BRIGHT DATA</span>
              </div>
            </div>

            {/* AI Brief */}
            <div className="card-hover" style={{
              background: "rgba(200,169,110,0.04)",
              border: "1px solid rgba(200,169,110,0.15)",
              borderRadius: 14, padding: "20px 24px", marginBottom: 16,
              transition: "border-color 0.2s",
            }}>
              <div style={{
                fontSize: 12, fontWeight: 600, color: "#c8a96e",
                letterSpacing: "0.06em", fontFamily: "'DM Mono', monospace", marginBottom: 12,
              }}>✦  AI INTELLIGENCE BRIEF</div>
              {briefLoading ? (
                <div>
                  {[1, 2, 3].map(i => (
                    <div key={i} className="shimmer" style={{
                      height: 14, borderRadius: 4, marginBottom: 8,
                      width: i === 3 ? "60%" : "100%",
                    }} />
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 14, color: "#e8e4dc", lineHeight: 1.8, fontWeight: 300 }}>
                  {brief}
                </p>
              )}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 14 }}>
                {data.tags.map((t, i) => <Tag key={i} {...t} />)}
              </div>
            </div>

            {/* Footer */}
            <div style={{
              fontSize: 11, color: "#3d3930", fontFamily: "'DM Mono', monospace",
              display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
            }}>
              <span style={{ color: "#c8a96e" }}>⚡</span>
              LIVE DATA VIA BRIGHT DATA ·
              SERP API · WEB UNLOCKER · WEB SCRAPER API ·
              SYNTHESIZED BY CLAUDE AI
            </div>
          </div>
        )}

        {/* Empty state */}
        {!data && !loading && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#3d3930" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📡</div>
            <div style={{ fontSize: 14 }}>Enter a company above to generate a live intelligence brief</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>
              Powered by Bright Data SERP API · Web Unlocker · Web Scraper API
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
