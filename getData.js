const puppeteer = require('puppeteer');
const fs = require('fs');

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
                const cells = Array.from(row.querySelectorAll('td, th')); // Process all cells
                return cells.map((cell, cellIdx) => {
                    let cellText = cell.innerText.trim();
                    return {tableIdx, rowIdx, cellIdx, cellText};
                });
            });
        });
    });

    let textFileContent = '';
    data.forEach((tableData, i) => {
        tableData.forEach(rowData => {
            const rowText = rowData.map(cell => cell.cellText).join(';');
            textFileContent += rowText + '\n';
        });
        textFileContent += '\n';
    });

    fs.writeFileSync('data.txt', textFileContent);

    await browser.close();
})();
