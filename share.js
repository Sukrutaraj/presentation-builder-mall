async function createShareLink(options) {

  const {
    repo,
    htmlContent
  } = options;

  try {

    const id = crypto.randomUUID();

    const response = await fetch(
      "https://upload-api-kappa.vercel.app/api/upload",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({

          repo,

          path: `shared/${id}.html`,

          content: btoa(unescape(
            encodeURIComponent(htmlContent)
          ))

        })
      }
    );

    const data = await response.json();

    if (!data.ok) {
      throw new Error(
        data.error || "Upload failed"
      );
    }

    return data.shareUrl;

  } catch(err) {

    console.error(err);
    alert(err.message);

    return null;
  }

}