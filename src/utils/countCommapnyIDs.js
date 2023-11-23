import { read_json } from '../utils/files.js';

let file = './data/mined/names/company_ids.json';

let names = read_json(file);


console.log( `found ${names.length} unique ids in name file`)

//for(let key of Object.keys(names)) 
//    console.log(names[key])
