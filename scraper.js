const fs = require('fs');
const puppeteer = require('puppeteer');

function scrape() {
  setInterval(() => {
    console.log("Starting scrape");
    (async () => {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
    
      const searchString = 'agg'; // Change this to the string you want to match
    
      page.on('response', async response => {
        if (
          response.url().toLowerCase().includes(searchString.toLowerCase())
        ) {
          const buffer = await response.buffer();
          const utf8String = buffer.toString('utf8');
    
          const lines = utf8String.split('\n');
    
          const outputLines = [];
          for (let i = 1; i < lines.length; i++) {
            if (lines[i].includes("Hitrost")) {
              outputLines.push(lines[i-1]);
              outputLines.push(lines[i]);
              //outputLines.push(lines[i].replace(/[^a-zA-Z0-9 ]/g, ''));
              //https://www.promet.si/dc/agg
              //https://www.promet.si/dc/dt.routing.multiple?loc=46.48493084600708,15.734422086328202%3B46.50722915674878,15.697859750599742
            }
          }
    
          const output = outputLines.join('\n');
    
          // Write buffer data to files
          fs.writeFileSync('trafficCounter.txt', output);
          
          console.log('Traffic counter data downloaded.');
        }
      });
    
      await page.goto('https://www.promet.si/sl/stevci-prometa', { waitUntil: 'networkidle2' });
    
      await browser.close();
    })();
  }, 5 * 60 * 1000); // Run every 5 minutes (5 * 60 seconds * 1000 milliseconds)
}

module.exports = { scrape };
