import { parseIm20, validateBytes } from "./parser.js";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/parse" && request.method === "POST") {
      try {
        const payload = await request.json();
        const bytes = validateBytes(payload?.bytes);
        return jsonResponse(parseIm20(bytes));
      } catch (error) {
        return jsonResponse({ error: error.message || "Invalid input." }, 400);
      }
    }

    return env.ASSETS.fetch(request);
  }
};
