import fs from 'fs';

// Read the file
let rawdata = fs.readFileSync('../storage/ids/company_ids.json');

// Parse the data
let data = JSON.parse(rawdata);


// Print the data
console.log(data);