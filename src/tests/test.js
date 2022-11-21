import fs from 'fs';
import { createScheduler, createWorker } from 'tesseract.js';
import { Image } from 'image-js';
/*
 * this scirpt trtesth perfomace of the capthcans solver based on all
 * the capthancs we have gathered in data/mined/captchan
 *
 */


async function execute() {
  let image = await Image.load('cat.jpg');
  let grey = image
    .grey() // convert the image to greyscale.
  return grey.save('cat.png');
}

const workers_num = 18;
let isReady = false

const scheduler = createScheduler();

await Promise.all( 
    Array(workers_num).fill(null).map( async () =>{
        const worker = createWorker();
        // Called as early as possible
        await worker.load();
        await worker.loadLanguage("eng");
        await worker.initialize("eng");
        await worker.setParameters({
            tessedit_char_whitelist: '0123456789',
            preserve_interword_spaces: 0,
            tessedit_pageseg_mode: 5,
        });
        scheduler.addWorker(worker);
    }))
isReady = true


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
        const { data: { text }, } = await scheduler.addJob('recognize', captchan)
        let isCorrect = (text.trim() === solution)
        console.log(`text: ${text}solution: ${solution} - ${isCorrect}`);
        return isCorrect;
    }
}

const captchan_folder = './data/mined/captchans';

const dir = fs.opendirSync(captchan_folder);
let captchans = [];
let errored_captchans = [];

let file = ''
while ((file = dir.readSync()) !== null) {
    let { name } = file 
    if(name.startsWith("error")) 
        errored_captchans.push({
            path: `${captchan_folder}/${name}`,
            solution: name.split('error')[1].split('.png')[0],
        });
    else
        captchans.push({
            path: `${captchan_folder}/${name}`,
            solution: name.split('.png')[0],
        });
}

captchans = await Promise.all( 
    captchans.map( async cpt => ({
        ...cpt,
        recognized: await test_captchan(cpt.path, cpt.solution)
    }))
);


// sum all true values
let correct_count = 0;
for(let cpt of captchans) 
    (cpt.recognized) && correct_count++; 

let error_count = captchans.length - correct_count;
let percent = (error_count / captchans.length) * 100;
console.log(`Out of ${captchans.length} captchans, tesseract recognized ${correct_count}
${error_count} where wrong, that is a %${percent} error` );


await scheduler.terminate();
dir.closeSync()
