import make_state from '../makeState.js';
import { busqueda_de_companias } from '../../urls.js';
import options from '../../options.js';
import Checklist from '../../progress/Checklist.js';
import promptSync from 'prompt-sync';
const prompt = promptSync();
// this state queries the companies with given names

// set debugging
let debugging = options.debugging;
let timeout = options.minutesToTimeout;

// condition for entering input name state
const query_names_condition = async browser =>
    // if it dow not have a page yet, and the page is at consulta principal
    ( ( await browser.pages() ).length === 1 &&
        (( await browser.pages() )[0].url() === busqueda_de_companias )
    )

/* use the console on the chrome browser to ask fo the suggestion of every ruc value */
const query_names_script = async (browser, rucs, log) => {
    log(`Starting to query for rucs...`)
    // for page to load
    let [ page ] = await browser.pages();

    // get the radion
    let [ radio_el ] = await page.$x('//*[text()="R.U.C."]/..');

    // click on the name radio
    if(radio_el) await radio_el.click();
    else throw new Error('Could not get ruc radio selector element');

    // send name suggestion query  function
    const query_ruc = async ({ruc, timeout}) => {
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
                            //suggestions.forEach( s => { if(s.ruc === s.name) delete s.ruc } )
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
                        value: ruc,
                    }
                ],
                process: "frmBusquedaCompanias:parametroBusqueda",
                source: "frmBusquedaCompanias:parametroBusqueda",
                update: "frmBusquedaCompanias:parametroBusqueda",
            })
        })
    }

    // make a permenant set to tsave the scrapped names
    let ruc_set = new DiskSet('company_rucs', null, 'data/mined/rucs/');

    // make a checklis to keep track of all the rucs we have alrady checked
    let rucs_checklist = new Checklist('rucs', rucs)

    // for every ruc value
    for(let ruc of rucs){
        console.log('quering ruc: ', ruc);
        // if we have not already checked that ruc
        if(rucs_checklist.isCheckedOff(ruc)) continue;
        // query for the ruc
        let suggestion = await page.evaluate(query_ruc, {ruc, timeout});
        console.log('got: ', suggestion)
        /*
        if(suggestions){
            // add it to the set
            ruc_set.add(company);
            // cross if off out checklist
            rucs_checklist.check(ruc);
        }
        */
    }

}

// make state
export default make_state(
    query_names_condition,
    query_names_script
)
