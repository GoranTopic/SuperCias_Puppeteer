import fs from 'fs';
import { createWorker } from 'tesseract.js';


const worker = createWorker()

let isReady = false
// Called as early as possible
await worker.load()
await worker.loadLanguage("eng")
await worker.initialize("eng")
isReady = true

// Do other stuffs


/**
 * test_captchan.
 *
 * this function takes a image path and tries to recognize it,
 * if it matches the passed solution it returns true, else false
 *
 * @param {} captchan image path
 * @param {} solution 
 */
const test_captchan = async (captchan, solution) => {
    if(isReady){
        const {
            data: { text },
        } = await worker.recognize(captchan)
        console.log('text: ', text);
        return (text.trim() === solution)
    }
}

const captchan_folder = './data/mined/captchans';

const dir = fs.opendirSync(captchan_folder);
let capthans = [];
let errored_capthans = [];

let file = ''
while ((file = dir.readSync()) !== null) {
    let { name } = file 
    debugger;
    if(name.startsWith("error")) 
        errored_capthans.push({
            path: `${captchan_folder}/${name}`,
            solution: name.split('error')[1].split('.png')[0],
        });
    else
        capthans.push({
            path: `${captchan_folder}/${name}`,
            solution: name.split('.png')[0],
        });
}

/*
capthans = await Promise.all( 
    capthans.map( async cpt => ({
        ...cpt,
        recognized: await test_captchan(cpt.path, cpt.solution)
    }))
);
*/
for(let cpt of capthans){
    cpt['recognized'] = 
        await test_captchan(cpt.path, cpt.solution);
}

//console.log(capthans);
// sum all true values
let correct_count = capthans.reduce((t, cpt) => cpt.recognized? t + 1 : 0, 0);
console.log(`Our of ${capthans.length} we have ${correct_count}`);




dir.closeSync()
