import Checklist from './progress/Checklist.js'
import { read_json, mkdir, fileExists } from './utils/files.js';
import options from './options.js'
import { readdirSync } from 'fs'
import fs from 'fs'

fs.readFile('file.txt', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  const lines = data.split('\n');
  lines.forEach((line) => {
    console.log(line);
  });
});

const getDirectories = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

/*
// get the data directory
let data_directory = options.host_data_dir;

let ids = read_json( data_directory + '/mined/ids/company_ids.json')

let checklist = new Checklist('companies', ids, null,
    { recalc_on_check: false });

let directories = getDirectories( data_directory  + '/mined/companies' );
console.log(directories);

let count = 0

ids.forEach( id => 
	directories.forEach( dir => {
		if( id.name === dir ){
			console.log(`MATCH ${id.name} - ${dir}`);
			count++
			checklist.check(id.name);
		}
	})
)


console.log('count:', count);
console.log('directories:', directories.length);

//console.log(getDirectories( data_directory  + '/mined/companies' ));
*/


