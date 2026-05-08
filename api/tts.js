export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const upstream = await fetch("http://15.165.189.36:8153/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      console.error("TTS upstream error:", upstream.status, errText);
      return res.status(upstream.status).json({ error: `TTS server error: ${upstream.status}`, detail: errText });
    }

    const audioBuffer = await upstream.arrayBuffer();
    const contentType = upstream.headers.get("Content-Type") || "audio/wav";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "no-store");
    res.status(200).send(Buffer.from(audioBuffer));

  } catch (err) {
    console.error("TTS proxy error:", err.message);
    res.status(500).json({ error: "TTS proxy failed", detail: err.message });
  }
}