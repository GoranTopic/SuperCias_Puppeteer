import { read_json, mkdir, fileExists, write_json } from '../utils/files.js';
import options from '../options.js'
import { readdirSync, renameSync, existsSync } from 'fs'

const getDirectories = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

// get the data directory
let data_directory = options.host_data_dir;
// get the path where the cmpanies are 
let companies_directory = data_directory + '/mined/companies';


// get all of the directories of every company
let compDirs = getDirectories( companies_directory );

// get the genral infomation 
for(let compDir of compDirs){
    // read json file
    let generalInfoPath = 
        companies_directory + '/' + compDir + '/information_general/information_general.json';
    // read the general info json
    let informacino_general = 
        read_json(generalInfoPath);
    // thro error if we coudl not read it
    if(! informacino_general )
        throw new Error(`informacion general for ${generalInfoPath} gave a nullish value`);
    //lets add the to the general info
    informacino_general['Nombre'] = compDir;
    // save the name to general infomation
    write_json( informacino_general, generalInfoPath)
    // get eh ruc
    let ruc = informacino_general['R.U.C.:'];
    if(! ruc ){
        console.error(`could not get ruc for ${generalInfoPath}, leaving with existing directory`);
        continue;
    }
    // check if there are any colalitions
    if(existsSync(companies_directory + '/' + ruc)){
        console.error(`there is already a dir in ${companies_directory + '/' + ruc}`);
        continue;
    }else{ // rename the folder to ruc
        console.log(`${companies_directory + '/' + compDir}, -> 
            ${companies_directory + '/' + ruc}`);
        // renaming dir to ruc
        renameSync( 
            companies_directory + '/' + compDir, // old path
            companies_directory + '/' + ruc
        );
    }
}

