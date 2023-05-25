const puppeteer = require('puppeteer');
const fs = require('fs');
const proj4 = require('proj4');

// Define delay function
function delay(time) {
    return new Promise(function(resolve) {
        setTimeout(resolve, time);
    });
}

// Define projection strings for D48/GK and WGS84
const D48 = "+proj=tmerc +lat_0=0 +lon_0=15 +k=0.9999 +x_0=500000 +y_0=-5000000 +ellps=bessel +towgs84=682,-203,480,0,0,0,0 +units=m +no_defs";
const WGS84 = "+proj=longlat +datum=WGS84 +no_defs";

(async () => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();

    // Set user agent and enable JavaScript
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36');
    await page.setJavaScriptEnabled(true);

    await page.goto('http://portal.drsc.si/traffic/main_si.htm', {waitUntil: 'networkidle2'});

    const data = await page.evaluate(() => {
        const tables = Array.from(document.querySelectorAll('body #content table'));
        return tables.map((table, tableIdx) => {
            const rows = Array.from(table.querySelectorAll('tr')).filter(row => row.querySelector('a') !== null); // Only consider rows with a link
            return rows.map((row, rowIdx) => {
                const cells = Array.from(row.querySelectorAll('td, th')).slice(0, 3); // Only process the first three cells
                return cells.map((cell, cellIdx) => {
                    const aTag = cell.querySelector('a');
                    let cellText = cell.innerText.trim();
                    if (aTag) {
                        const href = aTag.getAttribute('href');
                        cellText += ` [${href}]`;
                    }
                    return {tableIdx, rowIdx, cellIdx, cellText, href: aTag ? aTag.getAttribute('href') : null};
                });
            });
        });
    });

    
    outer: for (let table of data) {
        for (let row of table) {
            for (let cell of row) {
                if (cell.href) {  // Only process the first three rows with a link
                    
                    await page.goto(cell.href, {waitUntil: 'networkidle2'});
                    await delay(2000); // Wait for the URL to change

                    const url = page.url();
                    const coords = url.match(/x(\d+)_y(\d+)/);
                    if (coords) {
                        let x = parseFloat(coords[1]);
                        let y = parseFloat(coords[2]);

                        // Convert D48/GK coordinates to WGS84
                        let [lon, lat] = proj4(D48, WGS84, [x, y]);
                        cell.cellText += ` [X=${x}, Y=${y}, Lat=${lat}, Lon=${lon}]`;
                    }
                }
                
            }
        }
    }

    let textFileContent = '';
    data.forEach((tableData, i) => {
        tableData.forEach(rowData => {
            const rowText = rowData.map(cell => cell.cellText).join(';');
            textFileContent += rowText + '\n';
        });
        textFileContent += '\n';
    });

    fs.writeFileSync('coords.txt', textFileContent);

    await browser.close();
})();
