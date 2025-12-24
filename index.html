export default {
  async fetch(request, env) {
    // Basic CORS (so your dashboard can call the Worker)
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);

    // You can optionally pass ?link=... but default to env.DROPBOX_SHARED_LINK
    const sharedLink = url.searchParams.get("link") || env.DROPBOX_SHARED_LINK;
    if (!sharedLink) {
      return new Response(
        JSON.stringify({ error: "Missing Dropbox shared link" }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    // Fetch file bytes via Dropbox "get_shared_link_file"
    const dbxRes = await fetch("https://www.dropbox.com/scl/fi/ezqsso7exvh8yiiyc5n8t/DLX-Margin.Labor-Spreadsheet-2.27.25.xlsx?rlkey=6mpsb8553mrriro9x9s3nsxxa&st=kieak49i&dl=0", {
      method: "POST",
      headers: {
        "Authorization": `sl.u.AGN0_s_nCe300_-_TRmiY7NyKI_M4t7gq1A14XRIiLn2EvI6dnkNiLLOMcu9EVwBHfHh47tfzq0z3KLkKXJh5nw3qPPCXx5dvnZA_vqhOil5A-8KVc5X_qo8CM6EB0SZaeBQDW26aHDWt4uqSbYyeaK14GDvNU93ZRTwUKNzwbLq0QSa6J8ft8AEFogUjFLX8sQUih5xjZwtgJ6lYtKBw7GbVXS_oK3caOd3h8gXanZzXMP2K59CK3ujnOcP_8vRF1rMJr8oKnLEvIFnSVth7d6ZVRJLrj-wAU8jJbfC-Az6jaRq3XT2reEq2x9WF7iBiDuX007pTIOxTRxUB6Xo8a71adyiLMXGaZgnq5uDYw721NkJEF0nLjlQg1EmhTdoA1lz-XcIFgXg92a91e7kZHqBmKxNCsYyZLW8711OneKo5Oaj1MF6WfoXXFUeOwMS4ujRMNN4EG4gX25TESRDciYKtTCFE4ggmyXOPGPvTQZjRPurki_ywpOfHznwFTAqpKVllLNzikSKCC7PM1tKuWSYgPEO_rEAQ33jogGSW8BZGJhZ2QvGaaOEfugSUWdz9QamzSUf_PXlJ4AZKXwHisFWuIwCGrXagthgX0EKwwSG06lYONTr0DLn64MNIKZ4E72CydOzuhWQqF6mhvGv-Oo0UAT0LhJPt5LQ7gGtrTjx3gnGo6O081uE21mUonEblxUEn5pGRWqmWyy3GxV_lrkrq4tLjYe3RqAIRcaFI2pW8u5D1WUcp4YZ5xHErQZ9hxBU05DYfeVxaAJ-dkdsIPj33azGAc_yTt0p31Esb5I8p-13Rd0KstIzQQdHiVga7jdfTe_2UExGLiyndUzcwfP5k0UMxioyRNmrLAZJwiaIv9X-LKADjqjLfyxWlHCnZGFShcn0svrR2HssQdysVPmkqjE8SC8nM_5oM2CVdIXhggmEAyYBcI3VBBTk4xOaE7jBWrBnbPMnGWxz2kXSRy4iRxGkRriC7br_otDxRYw9cPg0JvaWvrNVLs6kRd7dUaErYp2X5ONa2FDLA9IdOAlsXOY6YhQv7Z0Z1HTUaweVunGojIganAFWD14d2n5bTDc6Wmxs0kfoxRMa_DZ5j4hraMFEaT6vHF3QCuvoXw3ca5nSPhwJKzVV3kaKdUfLFR2wLnxxpmmXRWauaErmj751Xm5cK55LSSyn3sRPBzH0nTsbfoXLHE1wlL5XWo9aHd6DVIRkk0tJ_7wcOFpwZYZ-ywm8JZCMaqWrhst91-c5cobw8NzTH9WSYaSHFYzBU11WuWe3gN3I2M_z2jF7wssmaB4sFQ_KmCXwu-ln0Nuq06juzWBCkFgErVVBRudXx3V_nRnsXQzypH0ZCMJx3xu-lWpGQCyOQP3GyhDzxSnvCrvaGp23Jvb-s--oqKVzWWJHkr2YbbeELpybr1FThYRzcxuhLha_9fpGrxvZw-xxZy4q09EQVGCRZb3-qcx6uiM`,
        "Dropbox-API-Arg": JSON.stringify({ url: sharedLink }),
      },
    });

    if (!dbxRes.ok) {
      const errText = await dbxRes.text();
      return new Response(
        JSON.stringify({ error: "Dropbox download failed", status: dbxRes.status, detail: errText.slice(0, 2000) }),
        { status: 502, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    // File bytes (Excel/CSV). We'll detect type by Dropbox metadata header if present.
    const metaHeader = dbxRes.headers.get("dropbox-api-result");
    let meta = null;
    try { meta = metaHeader ? JSON.parse(metaHeader) : null; } catch {}

    const bytes = await dbxRes.arrayBuffer();

    // If it's a CSV file already, we can parse to JSON quickly.
    // If it's XLSX, we’ll just return the raw bytes as base64 OR you can switch to XLSX parsing in the worker.
    // Best practice: parse XLSX in the browser (less pain in Workers).
    const name = meta?.name || "shared-file";
    const lower = name.toLowerCase();

    if (lower.endsWith(".csv")) {
      const text = new TextDecoder("utf-8").decode(bytes);

      // Simple CSV -> rows (basic parsing; for real CSV edge cases use PapaParse in the client)
      const lines = text.split(/\r?\n/).filter(Boolean);
      const headers = (lines.shift() || "").split(",").map(s => s.trim());
      const rows = lines.map(line => {
        const cols = line.split(",");
        const obj = {};
        headers.forEach((h, i) => obj[h] = (cols[i] ?? "").trim());
        return obj;
      });

      return new Response(
        JSON.stringify({
          fileName: name,
          fetchedAt: new Date().toISOString(),
          kind: "csv",
          headers,
          rows,
        }),
        { status: 200, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    // XLSX or other: return bytes base64 so the browser can parse with SheetJS
    const b64 = arrayBufferToBase64(bytes);

    return new Response(
      JSON.stringify({
        fileName: name,
        fetchedAt: new Date().toISOString(),
        kind: "binary",
        encoding: "base64",
        base64: b64,
      }),
      { status: 200, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }
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
