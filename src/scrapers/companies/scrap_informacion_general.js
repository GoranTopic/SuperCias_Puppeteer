import waitUntilRequestDone from '../../utils/waitForNetworkIdle.js';
import { write_json, mkdir, fileExists } from '../..//utils/files.js';
import download_pdf from '../../utils/download_pdf.js';
import { Checklist, DiskList } from '../../progress.js';
import getText from '../../utils/getText.js';
import options from '../../options.js';

export default async (page, path, log) => {
    // first, lets make a diretory for our info
    let menu_name = "/information_general";
    path += menu_name;
    mkdir(path);

    // let's parse the general information
    // information container
    let information_general = {};
    // get table
    let [ table_list ] = await page.$x('//div[@role="tablist"]')
    // get all labels
    let labels = await getText( await table_list.$x('.//label') )
    // get all input elements
    let input_el = await table_list.$x('.//input | .//textarea')
    // get text values from inputs
    let values = await Promise.all( 
        input_el.map( async el => await page.evaluate( el => el.value, el ) )
    )
    // match labels and values
    labels.forEach( (l, i) => information_general[l] = values[i].trim() )
    // write_file
    write_json(information_general, path + `/${menu_name}.json`)

    // let's get the pdf
    // get the iframe src for the pdf
    let coded_src = await page.evaluate( () =>
        document.getElementById('frmPresentarDocumentoPdf\:j_idt1075').src
    );
    // decode src of the pdf
    let src = decodeURIComponent(coded_src.split('file=')[1])
    // download pdf
    let didDownload = await download_pdf(src, page, path + menu_name)
    if(didDownload) console.log(`Downloaded: ${menu_name + ".pdf"}`)

    // if we got to here withou errors, we did it!
    log("General Infomation Scraped");
    return true
}
