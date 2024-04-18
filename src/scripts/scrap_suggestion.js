/* this script will take a cedula and return the suggestion of names that match this cedula */

const scrap_suggestions = async (browser, str) => {
    // get page
    let page = (await browser.pages())[0];
    let suggestions = await new Promise( async (resolve, reject) => {
        // set a timeout
        let timeout = setTimeout(() => {
            // remove listeners
            page.removeAllListeners('response');
            // reject the promise
            reject(false);
        } , 10000); // 10 seconds
        // add listerner
        page.on('response', async response => {
            //console.log('cedula response');
            let request = response.request();
            // if it is a post request
            if (request.method() === 'POST' && request.postData()) {
                // change this post data to json
                let postData = request.postData();
                postData = postData?.split('&').map( x => x.split('=') ).reduce( (acc, [key, value]) => {
                    acc[key] = decodeURIComponent(value);
                    return acc;
                }, {});
                // if this is the request we are looking for
                if( postData.cmd_0 === 'onChanging' ) {
                    //console.log('postData:', postData);
                    // get the text
                    let text = await response.text();
                    // parse this response
                    text = text.replace(/\\/g, '');
                    text = text.replace(/'/g, '"');
                    text = text.replace(/label:/g, '"label":');
                    text = text.replace(/\$\u/g, '"$u"');
                    let data = JSON.parse(text);
                    // get response
                    data = data.rs;
                    // filter by the frist element of the list of the list
                    data = data.filter( x => x[0] === 'addChd');
                    // if there is no data
                    if( data.length === 0 ) {
                        resolve({ str: str, suggestions: [] });
                        return;
                    }
                    // get inner array
                    data = data[0][1];
                    console.log('data:', data);
                    // remove first element
                    data.shift();
                    // map every label
                    data = data.map(([[,,{label}]]) => label);
                    // clean the data
                    data = data.map( x => x.split('|').map( x => x.trim()) ); 
                    // remove listeners
                    page.removeAllListeners('response');
                    // resolve the promise
                    resolve({ str: str, suggestions: data });
                    return;
                }
            }
        });
        console.log('scrapping str', str);
        debugger;
        // run this in browser
        await page.evaluate(async str => {
            // get combobox html element
            let [ combobox ] = zk.Widget.getElementsById('comboNombres')
            // get the id
            let id = combobox.id;
            // get the comboNombre wiget instance
            let w = zk.Widget.$(jq(`#${id}`));
            w.fire( // send request to server
                "onChanging", 
                { value: str, start: str.length }, 
                { ignorable: 1, rtags: { onChanging: 1 }}, 
                5 
            ); 
        }, str);
    });
    // return the suggestion
    if( suggestions === false )
        return new Error('cedula suggestion request timeout');
    return suggestions;
}


export default scrap_suggestions;
