export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.text();
    const upstream = await fetch("http://15.165.189.36:8153/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    const audioBuffer = await upstream.arrayBuffer();
    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") || "audio/wav",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "TTS proxy failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}