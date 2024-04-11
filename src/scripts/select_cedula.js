/* this script will take a cedula and return the suggestion of names that match this cedula */

const scrap_cedula = async (browser, cedula) => {
    // get page
    let page = (await browser.pages())[0];
    let cedula_suggestion = await new Promise( async (resolve, reject) => {
        // add listerner
        page.on('response', async response => {
            //console.log('cedula response');
            let request = response.request();
            // if it is a post request
            if (request.method() === 'POST') {
                // change this post data to json
                let postData = request.postData();
                postData = postData.split('&').map( x => x.split('=') ).reduce( (acc, [key, value]) => {
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
                    // if there is no data
                    if( data.length === 0 ) {
                        resolve({ cedula: cedula, suggestion: [] });
                        return;
                    }
                    // get inner array
                    data = data[0][1];
                    // remove first element
                    data.shift();
                    // map every label
                    data = data.map(([[,,{label}]]) => label);
                    // clean the data
                    data = data.map( x => x.split('|').map( x => x.trim()) ); 
                    // remove listeners
                    page.removeAllListeners('response');
                    // resolve the promise
                    resolve({ cedula: cedula, suggestion: data });
                    return;
                }
            }
        });
        // run this in browser
        await page.evaluate(async cedula => {
            // get combobox html element
            let [ combobox ] = zk.Widget.getElementsById('comboNombres')
            // get the id
            let id = combobox.id;
            // get the comboNombre wiget instance
            let w = zk.Widget.$(jq(`#${id}`));
            w.fire( // send request to server
                "onChanging", 
                { value: cedula, start: cedula.length }, 
                { ignorable :1, rtags: { onChanging: 1 }}, 
                5 
            ); 
        }, cedula);
    });
    // return the suggestion
    return cedula_suggestion;
}


export default scrap_cedula;
