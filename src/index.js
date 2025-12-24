export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    const url = new URL(request.url);
    const sharedLink = url.searchParams.get("link") || env.DROPBOX_SHARED_LINK;
    if (!sharedLink) {
      return new Response(JSON.stringify({ error: "Missing Dropbox shared link" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const dbxRes = await fetch("https://content.dropboxapi.com/2/sharing/get_shared_link_file", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.DROPBOX_ACCESS_TOKEN}`,
        "Dropbox-API-Arg": JSON.stringify({ url: sharedLink }),
      },
    });

    if (!dbxRes.ok) {
      const errText = await dbxRes.text();
      return new Response(JSON.stringify({ error: "Dropbox download failed", status: dbxRes.status, detail: errText.slice(0, 2000) }), {
        status: 502,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const metaHeader = dbxRes.headers.get("dropbox-api-result");
    let meta = null;
    try { meta = metaHeader ? JSON.parse(metaHeader) : null; } catch {}

    const bytes = await dbxRes.arrayBuffer();
    const name = meta?.name || "shared-file";
    const lower = name.toLowerCase();

    if (lower.endsWith(".csv")) {
      const text = new TextDecoder("utf-8").decode(bytes);
      const lines = text.split(/\r?\n/).filter(Boolean);
      const headers = (lines.shift() || "").split(",").map(s => s.trim());
      const rows = lines.map(line => {
        const cols = line.split(",");
        const obj = {};
        headers.forEach((h, i) => (obj[h] = (cols[i] ?? "").trim()));
        return obj;
      });

      return new Response(JSON.stringify({ fileName: name, fetchedAt: new Date().toISOString(), kind: "csv", headers, rows }), {
        status: 200,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const b64 = arrayBufferToBase64(bytes);
    return new Response(JSON.stringify({ fileName: name, fetchedAt: new Date().toISOString(), kind: "binary", encoding: "base64", base64: b64 }), {
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  },
};

function arrayBufferToBase64(buf) {
  let binary = "";
  const bytes = new Uint8Array(buf);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}
