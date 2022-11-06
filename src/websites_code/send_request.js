import recognizeCaptchan from '../utils/recognizeNumberCaptchan.js';
import str_to_binary from '../utils/strToBinary.js';
import submit_captchan from './queries/submit_captchan.js';
import { mkdir, write_binary_file } from '../utils/files.js';

// followAlong placeholder
let error_count = 0;
let error_max = 0;

/**
 * send_request. 
 * Welcome, this might be the most complex function in the scrapper.
 * this function handles the messangin to the serve, and uses the AB function from the website's 
 * code the to handle all the server client interaction. 
 *
 * Sometimes the server will ask for a captchan, 
 * the interation is as follows:
 *
 *      Client       |      Server
 *  send a query ----->
 *              <-----  sends captchan html Update
 *  sends solved capthan ----->
 *              <-----  sends query's response html Update
 *
 *
 * Whe this function does is basically it calls 
 * the AB function in the browser with the passed paramters 
 * It highjacks the oncomplete function of the AB function to 
 * run the callback  passed as the second arguemnt and the original 
 * oncomplete, and onsuccess function found in the paramters
 *
 * if the srver's responce is with captchan it handles the captcha, 
 * tries to solve it and sends the solution the server, 
 * then it will run the passed callback
 *
 * to be ablet to send the function to the browser, I had to convert them to strings.
 * Then run them with the eval. (I know eval is evil...) It cannot handle the 'await' key word, 
 * thus the passed callback cannot be an asycn fucntion.
 *
 * Only running the callback, passed in the second paramters 
 * once the soluction to the captchan has been accepted
 *
 * @param {} parameters this are the paramenter that are asked to to the backend
 * @param {} callback, this is the function that after the opertations has been successfull
 *  (response, status, i, C) => { return "return me" }
 * @param {} page, this is the page of the pupeteer browser
 * @param {} log, this is the log object
 * 
 * return whaever the return of the passed callback is 
 */
let send_request = async (parameters, callback, page, log, followAlong=true) => {
    // let's get the parameters of the function, the call back and the, page
    let isCaptchan = false;
    // make the functinos into string so that they can be passed to the browser
    let original_oncomplete_str = parameters.oncomplete?.toString();
    let onsuccess_str = parameters.onsuccess?.toString();
    let callback_str = callback?.toString();
    //console.log('callback_str:', callback_str);
    //console.log('original_oncomplete_str:', original_oncomplete_str);
    
    let response = await page.evaluate(
        async ({parameters, callback_str, followAlong,
            original_oncomplete_str, onsuccess_str}) =>
        // let's make a new promise, 
        await new Promise(( resolve, reject ) => {
            // set a time out for 5 minutes, closes the browser
            //setTimeout( () => reject(new Error('evaluation timed out')), 1000 * 60 * 5);
            // lets sent he request to the server
            PrimeFaces.ab({
                ...parameters,
                oncomplete: async (response, status, i, C) => {
                    // is respose successfull?
                    if(status !== "success"){ reject(status); return; }
                    // let's parse the result html repsose
                    let html = window.parse_html_str(response.responseText);
                    // check extension to see if there is capthacn
                    let extension = html.getElementsByTagName('extension')
                    if(extension.length){ // if got captchan
                        extension = extension[0].innerText;
                        console.log('extension:', extension);
                        // did we ger capthan?
                        if(JSON.parse(extension).presentarPopupCaptcha) {
                            console.log("got captchan");
                            // get captchan url
                            let captchan_src = window.get_captchan_src(html);
                            console.log("captchan_src:", captchan_src);
                            // fetch captchan
                            let captchan_img = await window.fetch(captchan_src);
                            // now that we have the captchan src, let's fetch the image
                            //console.log("captchan_img:", captchan_img);
                            let bin_str = await window.to_binary_string( captchan_img );
                            resolve({ // on success
                                isCaptchan: true,
                                bin_str
                            });
                            return;
                        }
                    }
                    // if we did not get captchan
                    console.log("did not captchan");
                    let return_value = eval("("+callback_str+")(response, status, i, C)");
                    resolve({
                        isCaptchan: false,
                        return_value,
                    });
                    // run the callbacks which normaly run with the query
                    if(followAlong){ 
                        eval("("+original_oncomplete_str+")(response, status, i)");
                        eval("("+onsuccess_str+")(response, status, i)");
                    }
                }
            })
        }), {parameters, callback_str, followAlong,
            original_oncomplete_str, onsuccess_str} // passed to browser
    );
    debugger
    // we just got the response from the query
    log("response:", response)
    // if we did not get a capthan
    if(response.isCaptchan === false) 
        // return the return of the callback
        return response.return_value;
    else{ // if we have response that is capthan
        log("Captchan Recived");
        debugger;
        // let's reconized that captchan
        let binary_string = response.bin_str;
        // if we have a captahcn we need to converte form to binay from a binary string
        // let't rever back the from str to binary
        let captchan_bin = str_to_binary(binary_string);
        // recognize the bytes image
        let captchan_solution = await recognizeCaptchan(captchan_bin);
        log("captchan regonized as:", captchan_solution);
        let submit_captchan_callback_str = submit_captchan
            .oncomplete
            .toString()
        debugger;
        // now let's test if the capthacn was correct
        response = await page.evaluate(
            async ({ captchan_solution, callback_str, submit_captchan,
                submit_captchan_callback_str, followAlong }) =>
            await new Promise(( resolve, reject ) => {
                setTimeout( () => reject(new Error('evaluation timed out')), 1000 * 60 * 5);
                // set captchan
                // write the captchan solution in the input
                document.getElementById('frmCaptcha:captcha').value = captchan_solution;
                // send captachn
                PrimeFaces.ab({
                    ...submit_captchan,
                    // quen the server responseds
                    oncomplete: async (response, status, i, C) => {
                        if(status !== "success"){ reject(status); return; }
                        // let's check if the captachan was accepted
                        // let's parse the result html repsose
                        let html = window.parse_html_str(response.responseText);
                        console.log("html: ", html);
                        let extension = JSON.parse(
                            html.getElementsByTagName('extension')[0]
                            .innerText
                        );
                        console.log("extension:", extension);
                        let isCaptchanCorrect = extension.captchaCorrecto ||
                            extension.procesamientoCorrecto
                        console.log("isCaptchanCorrect:", isCaptchanCorrect)
                        // if captachan is correct, run callback
                        if(isCaptchanCorrect){
                            let return_value = eval("("+callback_str+")(response, status, i, C)");
                            resolve( { isCaptchanCorrect, return_value, response } );
                            if(followAlong){ // if follow with browser, run original callback
                                eval("("+submit_captchan_callback_str+")(response, status, i, C)");
                            }
                        }else
                            resolve(  { isCaptchanCorrect } );
                    },
                })
            }), { captchan_solution, callback_str, submit_captchan,
                submit_captchan_callback_str, followAlong }
        )

        // save captchan if correct
        if(response.isCaptchanCorrect){ 
            log("captchan was accepted");
            //let save the captchan
            let cptn_path = './data/mined/captchans/';
            mkdir(cptn_path);
            write_binary_file( captchan_bin, 
                // change to matching image extencion
                cptn_path + captchan_solution + ".png" 
            );
            // return the retur value form the callback
            return response.return_value;
        }else{
            log("captchan was not accepted");
            throw Error('Captchan failed');
        }
    }
}


export default send_request
