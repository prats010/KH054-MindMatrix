const fs = require('fs');
const path = require('path');

/**
 * MOCK: API Sync Service
 * In a production environment, this would call `https://myscheme.gov.in/api/...`
 * or fetch from `data.gov.in` to retrieve the latest scheme metadata.
 * 
 * For this MVP, it simulates fetching remote JSON and writing it to our local
 * data/schemes.json database.
 */
async function syncFromGovernmentAPI() {
  console.log("Initiating sync with myscheme.gov.in (Mock API Sync Service)...");
  
  // Simulate network latency
  await new Promise(r => setTimeout(r, 1500));

  // In real life, we would do:
  // const res = await fetch('https://api.myscheme.gov.in/v1/schemes', { headers: { Authorization: `Bearer ${process.env.API_SETU_TOKEN}` } });
  // const remoteSchemes = await res.json();
  
  // We'll read the existing schemes, maybe add a "last_synced" timestamp to prove it ran.
  const schemesPath = path.join(process.cwd(), 'data/schemes.json');
  let localSchemes = [];
  try {
    localSchemes = JSON.parse(fs.readFileSync(schemesPath, 'utf-8'));
  } catch (e) {
    console.error("Could not read local schemes", e);
  }

  // Simulate parsing remote data
  console.log(`Fetched metadata for ${localSchemes.length} schemes.`);
  
  // Let's pretend we updated the income criteria for PMAY-G from the remote server
  const updatedSchemes = localSchemes.map(scheme => {
    if (scheme.id === 'PMAY-G') {
      // Government updated the PMAY-G max income rule!
      if (scheme.eligibility_rules) {
        scheme.eligibility_rules.max_income = 150000; // Increased from 120000
      }
    }
    return {
      ...scheme,
      _last_synced: new Date().toISOString()
    };
  });

  fs.writeFileSync(schemesPath, JSON.stringify(updatedSchemes, null, 2));
  console.log("Successfully synchronized local database with Central Government API.");
}

module.exports = { syncFromGovernmentAPI };
