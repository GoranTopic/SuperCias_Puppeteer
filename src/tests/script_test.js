import { make_logger } from '../logger.js';
import get_company_by_id from '../utils/get_company_by_id.js';


/**
 * script. 
 * this is test scrip that for a random amount of time 
 * and may or may not throw an error
 *
 * @param {} company_id
 * @param {} proxy
 * @param {} log_color
 */
const script = async (company_id, proxy, log_color) => { 

    // get company from company id
    let company = get_company_by_id(company_id);
    // make logger
    let log = make_logger(
        proxy? `[${proxy.split(':')[0]}]`: "", 
        true,
        log_color
    );

    log(`scrapping ${company.name} through ${proxy}`)
    let isError = await new Promise( resolve => {
        setTimeout( // Returns a random integer from 0 to 10 is less than 5:
            () => resolve((Math.floor(Math.random() * 11) >= 5)), 
            100 * (Math.floor(Math.random() * 11)) 
        );
    });

    if(isError)
        throw new Error('it is an Error');
    else
        log('reached the end of the script');
}

// run with npm company $id $proxy $logger_color
const params = process.argv.slice(2);
let [ company_id, proxy, log_color ] = params;
await script(company_id, proxy, log_color);

