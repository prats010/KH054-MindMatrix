const fs = require('fs');
const path = require('path');

// We use dynamic import for transformers since it's ESM/CJS compatible but sometimes behaves better
async function main() {
  console.log("Loading embedding model (this may take a moment on first run)...");
  
  const { pipeline } = await import('@xenova/transformers');
  
  // Initialize the feature extraction pipeline
  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

  const guidelinesDir = path.join(__dirname, '../data/guidelines');
  const files = fs.readdirSync(guidelinesDir).filter(f => f.endsWith('.md'));

  const vectorStore = {
    documents: [],
    embeddings: []
  };

  for (const file of files) {
    const schemeId = file.replace('.md', '');
    console.log(`Processing ${schemeId}...`);
    
    const content = fs.readFileSync(path.join(guidelinesDir, file), 'utf-8');
    
    // Simple chunking by heading (split by "## ")
    const chunks = content.split('## ').filter(c => c.trim().length > 0);
    
    for (let i = 0; i < chunks.length; i++) {
      // Re-add "## " unless it's the very first part which was split at the beginning
      let textChunk = chunks[i];
      if (!textChunk.startsWith('# Official') && !textChunk.startsWith('# Ayushman') && !textChunk.startsWith('# Pradhan')) {
        textChunk = '## ' + textChunk;
      }
      
      textChunk = textChunk.trim();
      
      if (textChunk.length > 20) {
        // Generate embedding
        const output = await extractor(textChunk, { pooling: 'mean', normalize: true });
        const embedding = Array.from(output.data);
        
        vectorStore.documents.push({
          id: `${schemeId}-chunk-${i}`,
          schemeId: schemeId,
          text: textChunk
        });
        
        vectorStore.embeddings.push(embedding);
      }
    }
  }

  const outputPath = path.join(__dirname, '../data/vector_store.json');
  fs.writeFileSync(outputPath, JSON.stringify(vectorStore));
  console.log(`Successfully ingested ${vectorStore.documents.length} chunks into the vector store.`);
}

main().catch(console.error);
