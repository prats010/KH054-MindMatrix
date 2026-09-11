import Groq from "groq-sdk";

const PRIMARY_MODEL = "openai/gpt-oss-120b";
const FALLBACK_MODEL = "openai/gpt-oss-20b";
const AGENT_TIMEOUT = 15000; // 15 seconds
const RETRY_DELAY = 1000; // 1 second

const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Call a Groq LLM agent with retry and timeout logic.
 * @param {string} systemPrompt - The agent's system prompt
 * @param {string} userMessage - The user/input message (JSON string)
 * @param {object} options - Optional overrides
 * @returns {object} Parsed JSON response from the LLM
 */
export async function callAgent(systemPrompt, userMessage, options = {}) {
  const model = options.model || PRIMARY_MODEL;
  const temperature = options.temperature ?? 0.1;
  const maxRetries = options.maxRetries ?? 1;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), AGENT_TIMEOUT);

      const response = await groqClient.chat.completions.create(
        {
          model,
          temperature,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          response_format: { type: "json_object" },
          max_tokens: 4096,
        },
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      const content = response.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("Empty response from LLM");
      }

      // Parse JSON response
      const parsed = JSON.parse(content);
      return parsed;
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;

      if (isLastAttempt) {
        console.error(
          `Agent call failed after ${maxRetries + 1} attempts:`,
          error.message
        );
        return null; // Coordinator handles graceful fallback
      }

      // Exponential backoff before retry
      const delay = RETRY_DELAY * Math.pow(2, attempt);
      console.warn(
        `Agent call attempt ${attempt + 1} failed, retrying in ${delay}ms:`,
        error.message
      );
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Try fallback model on retry if primary failed
      if (model === PRIMARY_MODEL) {
        options.model = FALLBACK_MODEL;
      }
    }
  }
}

export { PRIMARY_MODEL, FALLBACK_MODEL };
