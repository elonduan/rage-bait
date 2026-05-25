export default async function handler(req, res) {

  console.log("METHOD:", req.method);

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Only POST allowed"
    });
  }

  try {

    const message = req.body.message;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Message must be a non-empty string"
      });
    }

    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content:
                "You are a stubborn rage-bait AI that is funny, creative, and stubborn. Keep your response short. Evaluate the user's message and return valid JSON only with this exact shape: {\"reply\": string, \"score\": number}. The score must be an integer from 1000 to 99999 based on how effective the rage-bait message is. Do not include the score in the reply text."
            },
            {
              role: "user",
              content: message
            }
          ],
          temperature: 1.2,
          max_tokens: 300
        })
      }
    );

    const data = await groqResponse.json();
    const rawContent = data.choices?.[0]?.message?.content || "";

    let parsed;

    try {
      parsed = JSON.parse(rawContent);
    } catch {
      const scoreMatch = rawContent.match(/\b(\d{4,5})\b/);
      const scoreValue = scoreMatch ? Number(scoreMatch[1]) : 1000;

      parsed = {
        reply: rawContent || "Imagine losing this hard 💀",
        score: scoreValue
      };
    }

    const normalizedScore = Math.max(
      1000,
      Math.min(99999, Math.floor(Number(parsed.score) || 1000))
    );

    return res.status(200).json({
      reply: parsed.reply || "Imagine losing this hard 💀",
      score: normalizedScore
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: error.message
    });

  }
}
