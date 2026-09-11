const { syncFromGovernmentAPI } = require('../lib/apiSync');

async function main() {
  await syncFromGovernmentAPI();
}

main().catch(console.error);
