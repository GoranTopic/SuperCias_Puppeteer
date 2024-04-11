import { correlateResponse, correlateRequestFinished } from './correlate.js';
import logResponse from './logResponse.js';
import makefilter from './filterResponse.js';

// a regex filter to to macth the url with 'api' in it
let filterRegex = makefilter({ urlRegex: ['/api/recommend/item_list/'] });
// file only set up the listeners for the page
let setListener = async page => {
    // Listen for all responses.   
    await page.on('response', filterRegex(correlateResponse));
    //await page.on('requestfinished', correlateRequestFinished); 
    // let check out service workers
    //page.on('websocket', data => console.log('websocket', data));
    // let print when there is a worker
    //page.on('worker', data => console.log('worker', data));
}

export default setListener;
