/* this function will fire a command on a widget element
 *  - browser: puppeteer browser object
 *  - selector: the selector of the widget element
 *  - command: the command to fire  
 *  - input_1: the first input to the command
 *  - input_2: the second input to the command
 *  - input_3: the third input to the command
 *  - updateDOM: if we need to update the DOM
 *  - return: the result of the command
 *  - error: if there is an error
 *  - example:
 *    let result = await fire_command(browser, {
 *    selector: '#widget_id',
 *    command: 'onCheck',
 *    input_1: 'input_1',
 *    input_2: 'input_2',
 *    input_3: 'input_3',
 *    updateDOM: false
 *    });
 *  if you are getting timout checn that you have the right uui for the element which is resiving the command
 * For som reason some wiget dont't get th right object with the selector, thus you can also use the zk_id
 * this is the case for suggestions
 */

const fire_command = async (browser, {
    selector,
    zk_id,
    command, 
    input_1,
    input_2,
    input_3,
    updateDOM=false,
    timeout=10000 // 10 seconds
}) => {

    // get page
    let page = (await browser.pages())[0];

    // make a promise to resturn the result
    let result = await new Promise( async (resolve, reject) => {
        // set a timeout
        let timeout_timer = setTimeout(() => {
            // remove listeners
            page.removeAllListeners('response');
            debugger;
            // reject the promise
            reject(new Error('fire_command timeout'));
        } , timeout);

        // get the uuid of the widget element
        let uuid = await page.evaluate(({ selector, zk_id }) => {
            let uuid, html_el, widget_el;
            // if zk id is passed
            if( zk_id ) {
                // get the widget element
                html_el = zk.Widget
                    .getElementsById(zk_id)[0]
                // get the widget element
                widget_el = zk.Widget.$(html_el);
                uuid = widget_el.uuid;
            } else if(selector) {
                // get the html element
                html_el = $(selector)
                widget_el = zk.Widget.$(html_el);
                uuid = widget_el.uuid
            } else 
                return new Error('selector or zk_id not provided');
            return uuid;
        }, { selector, zk_id });
        // if the uuid is not found
        if( !uuid ) {
            clearTimeout(timeout_timer);
            reject(new Error('uuid not found'));
            return;
        }
        
        // add listerner filter by the uuid
        page.on('response', async response => {
            let request = response.request();
            // if it is a post request
            if (request.method() === 'POST' && request.postData()) {
                // change this post data to json
                let postData = request.postData();
                postData = postData
                    ?.split('&')
                    .map( x => x.split('=') )
                    .reduce( (acc, [key, value]) => {
                        acc[key] = decodeURIComponent(value);
                        return acc;
                    }, {});
                //console.log('postData:', postData);
                // if this is the request we are looking for
                if( postData['uuid_0'] === uuid || 
                    postData['uuid_1'] === uuid || 
                    postData['uuid_2'] === uuid ) {
                    //console.log('postData:', postData);
                    // get the text
                    let text = await response.text();
                    //console.log('text:', text);
                    // remove listeners
                    page.removeAllListeners('response');
                    // resolve the promise
                    clearTimeout(timeout_timer);
                    // resolve the promise
                    resolve(text);
                    return;
                }
            }
        });

        // run this in browser
        await page.evaluate(async ({
            selector,
            zk_id,
            command,
            input_1,
            input_2,
            input_3 }) => {
                let html_el, widget_el;
                // if zk id is passed
                if( zk_id ) {
                    // get the widget element
                    html_el = zk.Widget
                        .getElementsById(zk_id)[0]
                    // get the widget element
                    widget_el = zk.Widget.$(html_el);
                } else if(selector) {
                    // get the html element
                    html_el = $(selector)
                    // get the widget element
                    widget_el = zk.Widget.$(html_el);
                }else 
                    // error
                    return new Error('selector or zk_id not provided');

                // fire the command
                widget_el.fire(command, input_1, input_2, input_3);
                // if we need to update the DOM
                return;
            }, {
                selector,
                zk_id,
                command,
                input_1,
                input_2,
                input_3
            });
    });
    return result;
}


export default fire_command;
