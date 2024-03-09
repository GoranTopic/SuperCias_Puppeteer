import { read_json, mkdir } from 'files-js';

// Read the file
let company_ids = read_json('./storage/ids/company_ids.json')

function hasAlpha(s) {
    // Regular expression that matches any alphabetic character
    const regex = /[a-zA-Z]/;
    return regex.test(s);
}


for( let company of company_ids ){
	if(hasAlpha(company.ruc))
		console.log(company)
}

// Example usage:
//const testString = "123abc";
//const result = hasAlpha(testString);
//console.log(`Does '${testString}' contain alphabetic characters? ${result}`);


