/* this script initlizes the necesary value to start scrapping */
import {  mkdir } from 'files-js';
import ProxyRotator from 'proxy-rotator-js'
import Checklist from 'checklist-js';
import Storage from 'dstore-js';
import Suggestion_finder from './utils/suggestion_finder.js';

const init = async () => {
    // create a proxy rotator
    let proxies = new ProxyRotator('./storage/proxies/proxyscrape_premium_http_proxies.txt');
    // make data store
    let storage = new Storage({
        type: 'mongodb',
        url: 'mongodb://0.0.0.0:27017',
        database: 'supercias',
    });
    let store = await storage.open('consultas_personal_suggestion')
    // make a path finder object
    const spanish_alpha_numeric = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'ñ', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ' '];
    let digits = ['0','1','2','3','4','5','6','7','8','9'];
    // add numeric and digits
    spanish_alpha_numeric.push(...digits);
    let suggestions = new Suggestion_finder({
        options: spanish_alpha_numeric,
    });
    // return values
    return {
        suggestions,
        store,
        proxies,
    }
}

export default init;
