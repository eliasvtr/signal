'use server';

export async function saveToRaindropAction(url: string, title?: string) {
  const token = process.env.RAINDROP_API_TOKEN;

  if (!token) {
    console.error("Raindrop API Token not configured in Environment Variables.");
    return { error: 'Raindrop API Token not configured' };
  }

  try {
    const res = await fetch('https://api.raindrop.io/rest/v1/raindrop', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        link: url,
        title: title || 'Saved item from Signal'
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Raindrop API Failure:", errText);
      try {
         const errJson = JSON.parse(errText);
         return { error: errJson.errorMessage || errJson.message || `API Error: ${res.status}` };
      } catch {
         return { error: `Raindrop API Error (${res.status}): ${errText.slice(0, 100)}` };
      }
    }

    return { success: true };
  } catch (e: any) {
    console.error("Raindrop Error:", e.message);
    return { error: e.message };
  }
}
