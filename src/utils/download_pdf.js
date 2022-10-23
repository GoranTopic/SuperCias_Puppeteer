import fs from 'fs';
import options from '../options.js';

let debugging = options.debugging;

const download_pdf = async (url, page, path) => {
    let pdfString = await page.evaluate( async url => 
        new Promise(async (resolve, reject) => {
            const reader = new FileReader();
            const response = await window.fetch(url);
            const data = await response.blob();
            reader.readAsBinaryString(data);
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject('Error occurred while reading binary string');
        }), url
    );
    // save pdf binary string 
    const pdfData = Buffer.from(pdfString, 'binary');
    let filename = path + ".pdf"
    try{ 
        fs.writeFileSync( filename , pdfData);
        //if(debugging) console.log(`downloaded pdf: ${filename}`);
        return true;
    }catch(e){
        // did it downloaded
        console.error(`could not downloaded pdf: ${filename}`, e);
        return false
    }
}

export default download_pdf
