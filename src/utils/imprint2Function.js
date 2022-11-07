/**
 * imprint2Function.
 * I know, eval is evil..
 *
 * @param {} replace
 * @param {} value
 * @param {} fun
 */
function imprint2Function(replace, value, fun){
    // make it into a string perseving the functions
    let stringy = fun.toString();
    // imprint values into the string
    stringy = stringy.replaceAll(replace, value);
    // parse back into json and return
    return eval(stringy);
}

export default imprint2Function;


