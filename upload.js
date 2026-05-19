// api/upload.js
// Vercel serverless function – tar emot filer och laddar upp till GitHub
// Token lagras säkert som miljövariabel på Vercel, aldrig synlig för användaren

export default async function handler(req, res) {

  // Tillåt anrop från alla origins (CORS)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Hantera preflight-anrop från webbläsaren
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Tillåt bara POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { path, content, repo } = req.body;

    // Validera att vi fått med det vi behöver
    if (!path || !content || !repo) {
      return res.status(400).json({ error: "Missing path, content or repo" });
    }

    // Tillåtna repos – lägg till fler här om du skapar nya verktyg
    const allowedRepos = [
      "Sukrutaraj/checklist-pages",
      "Sukrutaraj/digital-aktivitets-val"
    ];

    if (!allowedRepos.includes(repo)) {
      return res.status(403).json({ error: "Repo not allowed" });
    }

    // Hämta token från Vercel-miljövariabeln (aldrig synlig för användaren)
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
      return res.status(500).json({ error: "Server misconfigured – token missing" });
    }

    // Ladda upp till GitHub
    const githubRes = await fetch(
      `https://api.github.com/repos/${repo}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          "Authorization": `token ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: "upload via tool",
          content: content
        })
      }
    );

    const data = await githubRes.json();

    if (data.message && data.message !== "create file" && !data.content) {
      return res.status(500).json({ error: data.message });
    }

    return res.status(200).json({ ok: true, url: data.content?.html_url });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
