import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const SMITHERY_API_KEY = process.env.SMITHERY_API_KEY || "";
const PORT = process.env.BRIDGE_PORT || 3100;
const BASE = "https://server.smithery.ai";

// ── 직접 구현 툴 ──
const DIRECT_TOOLS = {

  "@ismailbl72/weather-forecast-mcp": async (toolName, args) => {
    let city = args.city || args.location;
    if (!city) {
      try {
        const ipRes = await fetch("https://ipapi.co/json/");
        const ipData = await ipRes.json();
        city = ipData.city || ipData.region || "Seoul";
      } catch { city = "Seoul"; }
    }
    const res = await fetch(
      `https://wttr.in/${encodeURIComponent(city)}?format=j1`,
      { headers: { "User-Agent": "curl/7.68.0" } }
    );
    if (!res.ok) throw new Error(`날씨 조회 실패: ${res.status}`);
    const data = await res.json();
    const current = data.current_condition[0];
    const area = data.nearest_area[0];
    const areaName = area.areaName[0].value;
    const country = area.country[0].value;
    const temp = current.temp_C;
    const feels = current.FeelsLikeC;
    const desc = current.lang_ko?.[0]?.value || current.weatherDesc[0].value;
    const humidity = current.humidity;
    const wind = current.windspeedKmph;
    return {
      content: [{ type: "text", text: `📍 ${areaName}, ${country}\n🌡️ 현재 기온: ${temp}°C (체감 ${feels}°C)\n🌤️ 날씨: ${desc}\n💧 습도: ${humidity}%\n💨 풍속: ${wind} km/h` }]
    };
  },

  "@modelcontextprotocol/server-puppeteer": async (toolName, args) => {
    const url = args.url;
    if (!url) throw new Error("URL이 필요합니다");
    window.open(url, "_blank");
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "ko-KR,ko;q=0.9",
      }
    });
    if (!res.ok) throw new Error(`페이지 로드 실패: ${res.status}`);
    const html = await res.text();
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 3000);
    return { content: [{ type: "text", text: `📄 ${url}\n\n${text}` }] };
  },

  "@modelcontextprotocol/server-filesystem": async (toolName, args) => {
    const { readFile, writeFile, mkdir } = await import("fs/promises");
    const { resolve, dirname } = await import("path");
    const action = args.action || (args.content ? "write" : "read");
    const filePath = args.path;
    if (!filePath) throw new Error("파일 경로(path)가 필요합니다.");
    if (action === "read") {
      const content = await readFile(resolve(filePath), "utf-8");
      return { content: [{ type: "text", text: content }] };
    }
    if (action === "write") {
      const content = args.content || args.text || "";
      await mkdir(dirname(resolve(filePath)), { recursive: true });
      await writeFile(resolve(filePath), content, "utf-8");
      return { content: [{ type: "text", text: `✅ 파일 저장 완료: ${filePath}` }] };
    }
    throw new Error("action은 'read' 또는 'write'여야 합니다.");
  },

  "@smithery-ai/fetch": async (toolName, args) => {
    const url = args.url;
    if (!url) throw new Error("URL이 필요합니다");
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const text = await res.text();
    return { content: [{ type: "text", text: text.slice(0, 3000) }] };
  },

};

// ── MCP 세션 캐시 ──
const sessions = new Map();

async function getSession(qualifiedName, config = {}) {
  const key = qualifiedName;
  if (sessions.has(key)) return sessions.get(key);
  const initRes = await fetch(`${BASE}/${qualifiedName}/mcp?api_key=${SMITHERY_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0", id: 1, method: "initialize",
      params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "chatbot-bridge", version: "1.0.0" } }
    })
  });
  const sessionId = initRes.headers.get("mcp-session-id") || null;
  sessions.set(key, { sessionId, qualifiedName });
  return { sessionId, qualifiedName };
}

async function mcpCall(qualifiedName, method, params, config = {}) {
  const url = `${BASE}/${qualifiedName}/mcp?api_key=${SMITHERY_API_KEY}`;
  const { sessionId } = await getSession(qualifiedName, config);
  const headers = { "Content-Type": "application/json", "Accept": "application/json, text/event-stream" };
  if (sessionId) headers["mcp-session-id"] = sessionId;
  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method, params }) });
  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();
  if (contentType.includes("text/event-stream")) {
    for (const line of text.split("\n")) {
      if (line.startsWith("data:")) {
        try { const data = JSON.parse(line.slice(5).trim()); if (data.result) return data.result; } catch {}
      }
    }
    return null;
  }
  const data = JSON.parse(text);
  if (data.error) throw new Error(data.error.message || "MCP 오류");
  return data.result;
}

// ── 엔드포인트 ──

app.get("/health", (req, res) => {
  res.json({ status: "ok", apiKeySet: !!SMITHERY_API_KEY });
});

app.post("/tools", async (req, res) => {
  const { qualifiedName, config = {} } = req.body;
  try {
    const result = await mcpCall(qualifiedName, "tools/list", {}, config);
    res.json({ tools: result?.tools || [] });
  } catch (e) {
    console.error(`[tools] ${qualifiedName}:`, e.message);
    res.status(500).json({ error: e.message });
  }
});

app.post("/call", async (req, res) => {
  const { qualifiedName, toolName, arguments: args = {}, config = {} } = req.body;
  try {
    if (DIRECT_TOOLS[qualifiedName]) {
      const result = await DIRECT_TOOLS[qualifiedName](toolName, args);
      return res.json({ result });
    }
    const result = await mcpCall(qualifiedName, "tools/call", { name: toolName, arguments: args }, config);
    res.json({ result });
  } catch (e) {
    console.error(`[call] ${qualifiedName}/${toolName}:`, e.message);
    res.status(500).json({ error: e.message });
  }
});

app.get("/search", async (req, res) => {
  const { q = "", pageSize = 10 } = req.query;
  try {
    const response = await fetch(
      `https://registry.smithery.ai/servers?q=${encodeURIComponent(q)}&pageSize=${pageSize}`,
      { headers: { Authorization: `Bearer ${SMITHERY_API_KEY}` } }
    );
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Smithery Bridge: http://localhost:${PORT}`);
  console.log(`   API Key: ${SMITHERY_API_KEY ? "✅ 설정됨" : "❌ 없음"}`);
});
