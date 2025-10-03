const fs = require('fs');
const path = require('path');

class JsonLoader {
  static async loadJsonData(filePath) {
    try {
      console.log(`📄 Loading JSON data from: ${filePath}`);
      
      if (!fs.existsSync(filePath)) {
        throw new Error('JSON file not found');
      }

      const jsonData = fs.readFileSync(filePath, 'utf8');
      
      try {
        const data = JSON.parse(jsonData);
        console.log(`✅ Loaded ${data.length} records from JSON file`);
        return data;
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError.message);
        
        if (parseError.message.includes('position')) {
          const positionMatch = parseError.message.match(/position (\d+)/);
          if (positionMatch) {
            const position = parseInt(positionMatch[1]);
            const lines = jsonData.split('\n');
            let currentPosition = 0;
            let problematicLine = 1;
            
            for (let i = 0; i < lines.length; i++) {
              if (currentPosition + lines[i].length >= position) {
                problematicLine = i + 1;
                break;
              }
              currentPosition += lines[i].length + 1; // +1 for newline
            }
            
            console.error(`❌ Problematic line: ${problematicLine}`);
            console.error(`❌ Line content: ${lines[problematicLine - 1]}`);
            
            const start = Math.max(0, problematicLine - 3);
            const end = Math.min(lines.length, problematicLine + 2);
            console.error(`❌ Context (lines ${start + 1}-${end}):`);
            for (let i = start; i < end; i++) {
              const marker = i === problematicLine - 1 ? '>>> ' : '    ';
              console.error(`${marker}${i + 1}: ${lines[i]}`);
            }
          }
        }
        throw parseError;
      }
    } catch (error) {
      console.error('❌ Error loading JSON data:', error.message);
      throw error;
    }
  }
}

module.exports = JsonLoader;
