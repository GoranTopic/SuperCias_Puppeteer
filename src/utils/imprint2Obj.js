import JSONfn from 'json-fn';

/**
 * imprint2JSON. 
 * this is a hack, you have be admonished
 * this function simply 'imprints'
 *  a text value into a obj, 
 *  and returns it;
 *
 * @param {} replace
 * @param {} value
 * @param {} json
 */
function imprint2Obj(replace, value, obj){
    // make it into a string perseving the functions
    let stringy = JSONfn.stringify(obj); 
    // imprint values into the string
    stringy = stringy.replace(replace, value);
    // parse back into json and return
    return JSONfn.parse(stringy);
}

export default imprint2Obj;

