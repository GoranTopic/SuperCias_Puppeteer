import fs from 'fs'

async function readAllRucs(filePath) {
    try {
        // Read the entire file as a single string
        const data = await fs.readFileSync(filePath, { encoding: 'utf8' });

        // Split the string into an array of lines
        let lines = data.split(/\r?\n/);

	    // split lines
	    // Split the string into an array of lines
	    lines = lines
		    .map( l => l.split(',')[1] )
		    .map( l => l?.trim() )

        // Process each line (example: log to console)
	return lines;
    } catch (error) {
        console.error('Error reading file:', error);
    }
}


export default readAllRucs;
// Example usage
//let rucs = await readAllRucs('../storage/rucs/rucs.csv');
//console.log(rucs);

