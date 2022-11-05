import send_request from '../../websites_code/send_request.js'
import select_autocomplete_company from '../../websites_code/queries/select_autocomplete_suggestion.js'
import recognizeCaptchan from '../../utils/recognizeNumberCaptchan.js';
import str_to_binary from '../../utils/strToBinary.js';
import submit_captchan from '../../websites_code/queries/submit_company_search_captchan.js';
import { write_binary_file, mkdir } from '../../utils/files.js';

/**
 * handle_company_search.
 * this script handles the inteatcion between the browser and the server 
 * in the first part of thr website where, the client selects a company 
 * and the sserver asks fro a capthcan solution
 * at the end of this script the broweer should be in the company 
 * infomration page
 *
 * @param {} page 
 *  this is the puppeteer page
 * @param {} company, 
 *  this is the company objec which is to be selected 
 * @param {} log
 *  this is the logger which has to be used
 */
const handle_company_search =  async (page, company, log=console.log) => {
    // let sent the request to select the company and get the captchan
    let captchan_src = await send_request(
        select_autocomplete_company(company), // parameters
        (response, status, i, C) => { 
            // we knwo the server is going to awnser with a captchan
            // let parse the response html send by the server
            let html = window.parse_html_str(response.responseText);
            // get captchan url
            let captchan_src = window.get_captchan_src(html);
            // return captchan src
            console.log("captchan_src:", captchan_src);
            return captchan_src
        },
        page,
        log,
        // followAlong false so that we query the server for captchan only once
        //false,
    );
    console.log('captchan_src: ', captchan_src);

    // now let's fetch the url captchan image
    let bin_str = await page.evaluate( 
        async ( captchan_src ) => {
            // fetch from browser
            let captchan_img = await window.fetch(captchan_src);
            console.log("captchan_img:", captchan_img);
            // convert to binary image string
            let bin_str = await window.to_binary_string( captchan_img );
            // binary string 
            return bin_str
        }, 
        captchan_src
    )
    console.log('bin_str: ', bin_str);
    // let convert imgae back to binary
    let captchan_bin = str_to_binary(bin_str);
    // recognize the bytes image
    let captchan_solution = await recognizeCaptchan(captchan_bin);
    log("captchan regonized as:", captchan_solution);


    // send the capthcan and hope that it is right
    let was_captchan_accepted = await page.evaluate(
        async ({ captchan_solution, submit_captchan }) => {
            // we run everything inside a promise so that we can retun
            // the otucome of the cpatchan
            return await new Promise(( resolve, reject ) => {
                // let's write the captchan in the  
                document.getElementById('frmBusquedaCompanias:captcha').value = captchan_solution;
                // send captachn
                PrimeFaces.ab({
                    ...submit_captchan,
                    oncomplete: async (response, status, i, C) => {
                        try { 
                            // parse response
                            let html = window.parse_html_str(response.responseText);
                            // get extesnion
                            let extension = JSON.parse(html.getElementsByTagName('extension')[0].innerText);
                            console.log("extension:", extension);
                            //  check is captchan is corrent
                            let isCaptchanCorrect = extension.captchaCorrecto || extension.procesamientoCorrecto
                            console.log("isCaptchanCorrect:", isCaptchanCorrect)
                            resolve(isCaptchanCorrect);
                            // run load new page
                            handleMostrarPaginaInformacionCompania(response, status, i );
                        }catch{
                            reject(status);
                            return;
                        }
                    }
                });
            });
        }, { captchan_solution, submit_captchan} 
    );

    debugger;
    // if the captchan was accapted we was to save it 
    if(was_captchan_accepted){
        let cptn_path = './data/mined/captchans/';
        mkdir(cptn_path);
        write_binary_file( captchan_bin, 
            // change to matching image extencion
            cptn_path + captchan_solution + ".png" 
        );
    }

}

export default handle_company_search;
