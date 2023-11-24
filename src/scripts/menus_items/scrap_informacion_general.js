import getText from '../../utils/getText.js';

export default async (page) => {
    // first, lets make a diretory for our info
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
    // return information
    return information_general;
}
