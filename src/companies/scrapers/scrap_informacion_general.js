import { write_json, mkdir, fileExists } from '../../utils/files.js';
import getText from '../../utils/getText.js';
import download_pdf from '../../utils/download_pdf.js';
import send_request from '../../websites_code/send_request.js'
import waitUntilRequestDone from '../../utils/waitForNetworkIdle.js';
import options from '../../options.js';

export default async (page, path, log, company) => {
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


    /*
     * the following code is to download the pdf of the general informatoin
     * curredlt not working
     
    // let's get the pdf from the general infromatino
    // get the iframe src for the pdf
    let coded_src = await page.evaluate( 
        () => document.getElementById('frmInformacionCompanias\:j_idt84').src
    );

    // let sent the request to select the company and get the captchan
    let result = await send_request( 
        { 
            s:"frmInformacionCompanias:j_idt84",
            u:"dlgPresentarDocumentoPdf panelPresentarDocumentoPdf dlgCaptcha frmCaptcha:panelCaptcha",
        },
        (response, status, i, C) => {
            console.log("document callback ran");
            return "return me";
        },
        page,
        log
    )


    // decode src of the pdf
    
    let src = decodeURIComponent(coded_src.split('file=')[1])
    // download pdf
    let didDownload = await download_pdf(src, page, path + menu_name)
    if(didDownload) console.log(`Downloaded: ${menu_name + ".pdf"}`)
    */

    // if we got to here withou errors, we did it!
    debugger
    log("General Infomation Scraped");
    return page
}
