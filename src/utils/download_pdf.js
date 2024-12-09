import fs from 'fs';
import options from '../../src/options.js';

let debugging = options.debugging;

const download_pdf = async (url, page, path, store) => {
    if(url === undefined || url === null || url === '')
        throw new Error('url is not defined');
    let pdfString = await page.evaluate( async url => 
        new Promise( async (resolve, reject) => {
            let timeout = setTimeout(() => // 5 minutes
                reject("pdf fetch timeout"),
                5 * 1000 * 60);
            const reader = new FileReader();
            //console.log('created reader')
            const response = await window.fetch(url);
            //console.log('response')
            const data = await response.blob();
            //console.log('made data')
            reader.onload = () => { 
                //console.log('promised resolved'); 
                resolve(reader.result)
            };
            reader.onerror = () => { 
                //console.log('promised rejected'); 
                reject('Error occurred while reading binary string')    
            };
            reader.readAsBinaryString(data);
        }), url
    );
    console.log('path:', path)
    // save pdf binary string 
    const pdfData = Buffer.from(pdfString, 'binary');
    debugger;
    // if a store has been passed
    if(store){
        // save to store
        await store.set(Buffer.from(pdfData), {
            filename: path, 
            type: 'application/pdf',
        });
        console.log(`downloaded in store: ${path}`);
    } else { 
        // if the store is not passed write to the file system
        // write to fs
        fs.writeFileSync(path , pdfData);
        console.log(`downloaded in fs: ${path}`);
    }
    return true;
}

export default download_pdf
