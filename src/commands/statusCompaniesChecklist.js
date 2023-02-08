import Checklist from '../progress/Checklist.js'
import options from '../options.js'
import DiskList from '../progress/DiskList.js'



// get the data directory
let data_directory = options.host_data_dir;

// get companies checklist
let checklist = new Checklist(
	'companies', null,
	data_directory + '/resources/checklists',
	{ recalc_on_check: false }
);

let errored = new DiskList(
	'errored_companies', null,
	data_directory + '/resources/list'
);


console.log('checked companies:     ', checklist.valuesDone())
console.log('number of companies:   ', checklist.valuesCount())
console.log('get missing companies: ', checklist.missingLeft())
console.log('errored comanies:       ', errored.valuesCount())
