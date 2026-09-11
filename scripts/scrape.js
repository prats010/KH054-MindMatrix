const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
const Groq = require('groq-sdk');

const SCHEMES_FILE = path.join(__dirname, '../data/schemes.json');

const SYSTEM_PROMPT = `You are a Data Extraction Engineer for JanSahayak, an Indian government scheme discovery portal.
Your job is to read unstructured, messy text scraped from a website and extract the details of the government scheme described within it.

You must output a SINGLE JSON OBJECT that strictly adheres to the following schema. If information is missing, use null.

{
  "id": "A unique ALL-CAPS identifier (e.g., PM-KVK)",
  "name": "Full official name of the scheme in English",
  "name_hi": "Name in Hindi (translate if necessary)",
  "name_mr": "Name in Marathi (translate if necessary)",
  "description": "A clear, 1-2 sentence description in English",
  "description_hi": "Description in Hindi",
  "description_mr": "Description in Marathi",
  "benefit_type": "One of: cash, subsidy, insurance, training, equipment, other",
  "benefit_value": "Short text of the benefit (e.g., '₹6000/year')",
  "eligibility_rules": {
    "is_farmer": true, false, or null,
    "min_age": integer or null,
    "max_income": integer or null,
    "gender": "Male", "Female", or null,
    "category": "General", "OBC", "SC", "ST", "EWS", or null,
    "occupation": string or null,
    "education": string or null,
    "is_disabled": true, false, or null,
    "states": ["State1", "State2"] or null (if all-India, use null)
  },
  "required_documents": ["Array of document names like 'Aadhaar', 'IncomeCert', 'BankAccount', 'LandProof', 'CasteCert', 'RationCard'"],
  "mutual_exclusions": ["Array of scheme IDs that cannot be held at the same time"],
  "source_url": "The URL provided in the text",
  "how_to_apply": "Short string explaining how to apply"
}

Output ONLY valid JSON. Do not include markdown formatting like \`\`\`json.`;

async function scrapeUrl(url) {
  console.log(`\nLaunching headless browser to scrape: ${url}`);
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Pretend to be a normal browser to avoid simple blocks
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
  
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Extract all visible text from the body
    const rawText = await page.evaluate(() => {
      // Remove scripts and styles before extracting text
      document.querySelectorAll('script, style').forEach(el => el.remove());
      return document.body.innerText;
    });
    
    console.log(`Successfully extracted ${rawText.length} characters of raw text.`);
    await browser.close();
    return rawText;
  } catch (error) {
    console.error("Scraping failed:", error.message);
    await browser.close();
    process.exit(1);
  }
}

async function extractSchemeData(rawText, sourceUrl) {
  console.log("Sending raw text to LLM (openai/gpt-oss-120b) for structured extraction...");
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  
  // We limit the text length to avoid token limits, usually 20,000 chars is plenty for one page
  const truncatedText = rawText.substring(0, 25000);
  
  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `SOURCE URL: ${sourceUrl}\n\nRAW TEXT TO PARSE:\n${truncatedText}` }
    ],
    model: 'openai/gpt-oss-120b',
    temperature: 0.1, // Low temperature for consistent JSON
  });

  const responseText = completion.choices[0].message.content.trim();
  
  try {
    // Clean up potential markdown blocks
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const schemeObj = JSON.parse(cleanJson);
    console.log(`LLM successfully extracted scheme: ${schemeObj.name}`);
    return schemeObj;
  } catch (error) {
    console.error("Failed to parse JSON from LLM response:");
    console.log(responseText);
    process.exit(1);
  }
}

function updateDatabase(newScheme) {
  let db = [];
  try {
    db = JSON.parse(fs.readFileSync(SCHEMES_FILE, 'utf-8'));
  } catch (e) {
    console.error("Could not read schemes.json", e);
  }

  const existingIndex = db.findIndex(s => s.id === newScheme.id);
  
  if (existingIndex >= 0) {
    console.log(`Updating existing scheme in database: ${newScheme.id}`);
    db[existingIndex] = { ...db[existingIndex], ...newScheme };
  } else {
    console.log(`Adding new scheme to database: ${newScheme.id}`);
    db.push(newScheme);
  }

  fs.writeFileSync(SCHEMES_FILE, JSON.stringify(db, null, 2));
  console.log("Database updated successfully.");
}

async function main() {
  const targetUrl = process.argv[2];
  if (!targetUrl) {
    console.error("Usage: node scripts/scrape.js <URL>");
    process.exit(1);
  }

  // 1. Scrape the page
  const rawText = await scrapeUrl(targetUrl);
  
  // 2. Extract structured JSON using AI
  const extractedData = await extractSchemeData(rawText, targetUrl);
  
  // 3. Update the database
  updateDatabase(extractedData);
}

main().catch(console.error);
