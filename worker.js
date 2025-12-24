const WORKER_URL = "https://YOUR-WORKER.your-subdomain.workers.dev"; // <-- change
const POLL_MS = 120000; // 2 min

async function fetchDropboxData() {
  const res = await fetch(WORKER_URL, { cache: "no-store" });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.detail || data.error || "Fetch failed");

  if (data.kind === "csv") {
    // data.rows already there (basic parse)
    return { type: "csv", rows: data.rows, fileName: data.fileName, fetchedAt: data.fetchedAt };
  }

  // XLSX binary base64 -> parse via SheetJS
  const bytes = base64ToUint8Array(data.base64);
  const wb = XLSX.read(bytes, { type: "array" });

  // Choose sheet(s)
  const sheetName = wb.SheetNames[0]; // or pick by name
  const ws = wb.Sheets[sheetName];

  // Convert to JSON rows (header row inferred)
  const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

  return { type: "xlsx", rows, sheetName, fileName: data.fileName, fetchedAt: data.fetchedAt };
}

function base64ToUint8Array(b64) {
  const bin = atob(b64);
  const len = bin.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function refreshDashboard() {
  try {
    const { rows, fileName, fetchedAt, sheetName } = await fetchDropboxData();

    // TODO: map rows -> your regions / revenue / cost logic
    // Example:
    // const computed = computeMetrics(rows);
    // updateUI(computed);

    console.log("Updated from Dropbox:", { fileName, sheetName, fetchedAt, rowCount: rows.length });

    // If you have a UI label:
    const label = document.getElementById("lastSyncLabel");
    if (label) label.textContent = `Last sync: ${new Date(fetchedAt).toLocaleString()}`;
  } catch (e) {
    console.error("Refresh failed:", e);
    const label = document.getElementById("lastSyncLabel");
    if (label) label.textContent = `Sync failed: ${String(e.message || e)}`;
  }
}

// Start live polling
refreshDashboard();
setInterval(refreshDashboard, POLL_MS);
