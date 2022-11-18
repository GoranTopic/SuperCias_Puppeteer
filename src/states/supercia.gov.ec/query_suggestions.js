import make_state from '../makeState.js';
import waitUntilRequestDone from '../../utils/waitForNetworkIdle.js';
import { write_json, read_json } from '../../utils/files.js';
import recognizeCaptchan from '../../utils/recognizeNumberCaptchan.js';
import { busqueda_de_companias } from '../../urls.js';
import options from '../../options.js';
import alphabet from '../../../data/resources/spanish_alphabet.js';
import { Checklist, DiskSet} from '../../progress.js';
import promptSync from 'prompt-sync';
const prompt = promptSync();
// this state queries the companies with given names

// set debugging
let debugging = options.debugging;
let timeout = options.nameQueryTimeout;

// condition for entering input name state
const query_names_condition = async browser =>
    // if it dow not have a page yet, and the page is at consulta principal
    ( ( await browser.pages() ).length === 1 &&
        (( await browser.pages() )[0].url() === busqueda_de_companias )
    )

/* use the console on the chrome browser to ask fo the suggestion of every name */
const query_names_script = async (browser, names, log) => {
    log(`Starting to query for names...`)
    // for page to load
    let [ page ] = await browser.pages();

    // get the radion
    let [ radio_el ] = await page.$x('//*[text()="Nombre"]/..');

    // click on the name radio
    if(radio_el) await radio_el.click();
    else throw new Error('Could not get name radion selector element');

    // send name suggestion query  function
    const query_name = async ({name, timeout}) => {
        /* This is a parameter example for the function PrimeFace.ajax.Request.handle(  ) */
        return await new Promise( (resolve, reject) => {
            let suggestions = null;
            // lets set a timeout timer fo the quest of 5 minuts
            setTimeout(() => {
                reject(new Error('Ajax request timed out'));
            }, 1000 * 60 * timeout); // set to n minutes
            // let's make the request
            PrimeFaces.ajax.AjaxRequest( {
                onsuccess: function(g,e,f) {
                    let parser = new DOMParser();
                    let innerHtml, content;
                    if(e === 'success'){ // if we got a successfull response
                        //console.log('we got response')
                        let id = 'frmBusquedaCompanias:parametroBusqueda';
                        if(g.getElementById(id)){
                            //console.log("got parametros de busquesda");
                            content = g.getElementById(id).textContent;
                            //console.log('content: ', content);
                            innerHtml = parser.parseFromString(content, "text/html");
                            //console.log(innerHtml)
                            suggestions = 
                                Object.values(innerHtml.getElementsByTagName("li"))
                                .map(il => il.innerText.split("-"))
                            suggestions =
                                Object.values(suggestions)
                                .map( a =>{
                                    return {
                                        id: a[0].trim(),
                                        name: a[a.length-1].trim(),
                                        ruc: a[1].trim(),
                                    }
                                } )
                            // if the name is the same as the ruc, there is no ruc
                            suggestions.forEach( s => { if(s.ruc === s.name) delete s.ruc } )
                            resolve(suggestions)
                        }else{ // if we got soemthing else
                            if( g.getElementById('javax.faces.ViewRoot') ){
                                // if we got an error
                                content = g.getElementById('javax.faces.ViewRoot').textContent
                                innerHtml = parser.parseFromString(content, "text/html");
                                reject( new Error( innerHtml ) )
                            }else if( g.getElementById('javax.faces.ViewState') ){
                                // if we got an error
                                content = g.getElementById('javax.faces.ViewState').textContent
                                innerHtml = parser.parseFromString(content, "text/html");
                                reject( new Error( innerHtml ) )
                            }else{
                                reject( new Error("Could not get parametros de busquesda") );
                            }
                        }
                    }else{
                        reject( new Error(e) );
                    }
                },
                "async": false,
                params: [
                    {
                        name: "frmBusquedaCompanias:parametroBusqueda_query",
                        value: name,
                    }
                ],
                process: "frmBusquedaCompanias:parametroBusqueda",
                source: "frmBusquedaCompanias:parametroBusqueda",
                update: "frmBusquedaCompanias:parametroBusqueda",
            })
        })
    }

    // make a permenant set to tsave the scrapped names
    let names_set = new DiskSet('new_company_names', null, 'data/mined/names/');

    // make a check lis tot keep track of all t he stings we have alrady checked
    let str_checklist = new Checklist('checked_str_for_name_suggestions')

    // depth first search function definiton
    const dfs_name_suggestions = async (str='') => {
        // if the string has not already been check
        if(! str_checklist.isCheckedOff(str)){
            for(let letter of alphabet){
                // if the str with the new letter has not been checked yet
                //console.log('checking if it is checked off...');
                if(! str_checklist.isCheckedOff(str + letter)){
                    log(`waiting for ${str+letter} query...`);
                    // query the back end for the string and letter
                    let suggestions = await page.evaluate(query_name, {name: str+letter, timeout});
                    // if we got a error, Abort mission!
                    if( suggestions instanceof Error ) throw suggestions
                    if(suggestions.length > 0) console.log('suggestions:', suggestions)
                    // we can assume something whent wrong if we don't get any suggestion 
                    // with a short query string
                    if(suggestions.length === 0 && (str+letter).length < 3 ){
                        console.log(suggestions);
                        const user_input = prompt(`Got not queries of ${str+letter}. skip it? y/n `);
                        if(user_input === "y") continue;
                        else throw Error("No Suggestion");
                    }
                    // if we got some suggestions
                    // if there are 15 suggestion we can assume it it not worth exploing
                    if(suggestions.length > 14){
                        // add every suggestion to the set
                        suggestions.forEach(s => names_set.add(s));
                        // continue recursion
                        await dfs_name_suggestions(str + letter);
                    }else{
                        log(str+letter, 'checked off');
                        // let check it in the checklist
                        str_checklist.check(str + letter, true);
                        // let clean the checklist from previous entries
                        str_checklist
                            .getAllValues()
                            .forEach( v => {
                                if(v.startsWith(str + letter)) str_checklist.remove(v)
                            })
                    }
                }
            }
            // check it comes out of the recursion, it must have checke the letter
            log('checking off: ', str);
            str_checklist.check(str, true);
        }
    }

    // starting recursion
    await dfs_name_suggestions();
    log('Reached End of Recursion')
}

// make state
export default make_state(
    query_names_condition,
    query_names_script
)
