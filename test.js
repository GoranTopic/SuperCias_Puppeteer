import fs from 'fs';

// read pdf string 
const data = fs.readFileSync('./pdfString.pdf').toString();
// make into buffer
const buffer = Buffer.from(data, 'base64');
console.log(buffer);


