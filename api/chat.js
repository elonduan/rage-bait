export default async function handler(req, res) {

  try {

    const response = await fetch(
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
                "You are a stubborn rage-bait AI. Keep replies under 15 words."
            },
            {
              role: "user",
              content: req.body.message
            }
          ],
          temperature: 1.2,
          max_tokens: 40
        })
      }
    );

    const data = await response.json();

    res.status(200).json(data);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
}
