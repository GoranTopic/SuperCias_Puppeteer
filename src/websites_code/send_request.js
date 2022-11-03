import recognizeCaptchan from '../utils/recognizeNumberCaptchan.js';
import str_to_binary from '../utils/strToBinary.js';
import { check_first_captchan_parameters, check_captchan_parameters } from './queries/ABParameters.js';


// followAlong placeholder
let error_count = 0;
let error_max = 0;
let followAlong = true;

/**
 * send_request. 
 * this function handles the messangin to the serve
 * sometimes the server will as for a captchan, this function handles everytime the server
 * asks for it.
 *
 * @param {} parameters this are the paramenter that are asked to to the backend
 * @param {} callback, this is the function that after the opertations has been successfull
 *  (response, status, i, C) => { return "return me" }
 * @param {} page, this is the page of the pupeteer browser
 * @param {} log, this is the log object
 */
let send_request = async (parameters, callback, page, log) => {
    // let's get the parameters of the function, the call back and the, page
    let isCaptchan = false;
    let isFirstCaptchan = false;
    let original_oncomplete_str = parameters.oncomplete?.toString();
    let onsuccess_str = parameters.onsuccess?.toString();
    let callback_str = callback.toString();
    //console.log('callback_str:', callback_str);
    //console.log('original_oncomplete_str:', original_oncomplete_str);
    let response = await page.evaluate(
        async ({parameters, callback_str, followAlong,
            original_oncomplete_str, onsuccess_str}) =>
        // let's make a new promise
        await new Promise(( resolve, reject ) => {
            // let's combine the two callbacks
            // set a time out for 5 minutes, closes the browser
            //setTimeout( () => reject(new Error('evaluation timed out')), 1000 * 60 * 5);
            PrimeFaces.ab({
                ...parameters,
                oncomplete: async (response, status, i, C) => {
                    if(status !== "success"){ reject(status); return; }
                    // let's parse the result html repsose
                    let html = window.parse_html_str(response.responseText);
                    // check extension to see if there is capthacn
                    let extension = html.getElementsByTagName('extension');
                    if(extension.length){ // if go captchan
                        extension = extension[0].innerText;
                        window.isCaptchan = JSON.parse(extension).presentarPopupCaptcha;
                    }

                    window.isFirstCaptchan = html.getElementById('frmBusquedaCompanias:captcha')
                    console.log('isFirstCaptchan:', window.isFirstCaptchan);
                    console.log('isCaptchan:', window.isCaptchan);
                    console.log(window.isCaptchan || window.isFirstCaptchan);

                    if(window.isCaptchan || window.isFirstCaptchan){ // if we get capthacan
                        console.log("got captchan");
                        // get captchan url
                        let captchan_src = window.get_captchan_src(html);
                        console.log("captchan_src:", captchan_src);
                        // fetch captchan
                        let captchan_img = await window.fetch(captchan_src);
                        // now that we have the captchan src, let's fetch the image
                        console.log("captchan_img:", captchan_img);
                        //
                        let bin_str = await window.to_binary_string( captchan_img );
                        resolve({ // on success
                            isCaptchan: (window.isCaptchan)? true : false,
                            isFirstCaptchan: (window.isFirstCaptchan)? true : false,
                            bin_str
                        });
                    }else{
                        resolve(
                            eval("await ("+callback_str+")(response, status, i, C)")
                        );
                    }
                    if(followAlong){
                        eval("("+original_oncomplete_str+")(response, status, i, C)");
                        eval("("+onsuccess_str+")(response, status, i, C)");
                    }
                }
            })
        }), {parameters, callback_str, followAlong,
            original_oncomplete_str, onsuccess_str} // passed to browser
    );
    //log("response:",response)

    // if we have response that is capthan
    if(response.isCaptchan || response.isFirstCaptchan){
        log("Captchan Recived");
        let binary_string = response.bin_str;
        // if we have a captahcn we need to converte form to binay from a binary string
        // let't rever back the from str to binary
        let captchan_bin = str_to_binary(binary_string);
        // recognize the bytes image
        let captchan_text = await recognizeCaptchan(captchan_bin);
        log("captchan regonized as:", captchan_text);
        // now let's test wether the capthacn was correct
        // we change the parameters depending on whether this is the first of a normal captchan
        let parameters_cptch;
        if(response.isFirstCaptchan) parameters_cptch = check_first_captchan_parameters
        if(response.isCaptchan) parameters_cptch = check_captchan_parameters
        // get the callback, which runs after the captchan is send
        let original_oncomplete_str_cptch = parameters_cptch.oncomplete?.toString();
        let onsuccess_str_cptch = parameters_cptch.onsuccess?.toString();
        // send the captachn back to the browser
        //console.log(response)
        response = await page.evaluate(
            async ({ parameters_cptch, captchan_text, callback_str,
                followAlong, original_oncomplete_str_cptch, 
                onsuccess_str_cptch }) =>
            await new Promise(( resolve, reject ) => {
                setTimeout( () => reject(new Error('evaluation timed out')), 1000 * 60 * 5);
                // set captchan
                ($('#frmCaptcha\\:captcha').length)? // check is we have that captchan input
                    $('#frmCaptcha\\:captcha')[0].value = captchan_text : null;
                // if we have the captchan in the companyy search
                (document.getElementById('frmBusquedaCompanias:captcha'))?
                    document.getElementById('frmBusquedaCompanias:captcha').value = captchan_text :
                    null;
                // send request
                PrimeFaces.ab({
                    ...parameters_cptch,
                    oncomplete: async (response, status, i, C) => {
                        if(status !== "success"){ reject(status); return; }
                        // let's check if the captachan was accepted
                        // let's parse the result html repsose
                        let html = window.parse_html_str(response.responseText);
                        console.log("html:", html);
                        let extension = JSON.parse(
                            html.getElementsByTagName('extension')[0].innerText
                        );
                        console.log("extension:", extension);
                        let isCaptchanCorrect = extension.captchaCorrecto ||
                            extension.procesamientoCorrecto
                        console.log("isCaptchanCorrect:", isCaptchanCorrect)
                        // if captachan is correct, run callback
                        if(isCaptchanCorrect){
                            let return_value = eval("("+callback_str+")(response, status, i, C)");
                            resolve( { isCaptchanCorrect, return_value } );
                            if(followAlong){ // if follow with browser, run original callback
                                eval("("+original_oncomplete_str_cptch+")(response, status, i, C)");
                                eval("("+onsuccess_str_cptch+")(response, status, i, C)");
                            }
                        }else
                            resolve(  { isCaptchanCorrect } );
                    },
                })
            }), { parameters_cptch, captchan_text, callback_str,
                followAlong, original_oncomplete_str_cptch,
                onsuccess_str_cptch,
            }
        )
        if(response.isCaptchanCorrect){ 
            log("captchan was accepted");
            return response.return_value;
        }else{
            error_count++;
            log("captchan was not accepted");
        }
        // lets return the resilt of the callback,
        // if captchan was accepted
    }
}


export default send_request
