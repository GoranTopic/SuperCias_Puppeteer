import Checklist from '../progress/Checklist.js';
import DiskList from '../progress/DiskList.js';
import options from '../options.js';
import prompt_sync from 'prompt-sync';
import prompt_history from 'prompt-sync-history';

// initiate prompt
const prompt = prompt_sync({ history: prompt_history() })

// get the data directory
let data_directory = options.host_data_dir;

// get companies checklist
let checklist = new Checklist(
	'companies', null,
	data_directory + '/resources/checklists',
	{ recalc_on_check: false }
);

// get companies errored disklist
let errored = new DiskList(
	'errored_companies', null,
	data_directory + '/resources/list'
);


console.log(`there are ${errored.valuesCount()} errored companies out of ${checklist.valuesCount()} companies`)

let input = prompt('Do you want to unerror them? [y/n] ');

if(input === 'y'){
	for( let company of [ ...errored.getValues() ] )
		if(checklist.isCheckedOff(company)){
			checklist.uncheck(company)
			errored.remove(company);
			console.log(`${company.name} unerrored`);
		}
}

