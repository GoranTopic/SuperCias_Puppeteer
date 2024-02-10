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


/* use the console on the chrome browser to ask fo the suggestion of every ruc value */
const query_names_script = async ( browser, ruc ) => {
    // for page to load
    let [ page ] = await browser.pages();
    // set the timeout
    let timeout = 1;
    // go to the page
    let suggestion = await page.evaluate(query_ruc, {ruc, timeout});
    // retunr rhe suggestion
    return suggestion;
}

export default query_names_script;
