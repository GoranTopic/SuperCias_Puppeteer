/* This is a parameter example for the function PrimeFace.ajax.Request.handle(  ) */
let suggestions = null;
await PrimeFaces.ajax.AjaxRequest( {
    onsuccess: function(g,e,f) {
        let parser = new DOMParser();
        let innerHtml, content;
        if(e === 'success'){ // if we got a successfull response
            console.log('we got response')
            let id = 'frmBusquedaCompanias:parametroBusqueda';
            if(g.getElementById(id)){
                console.log("got parametros de busquesda");
                content = g.getElementById(id).textContent;
                //console.log('content: ', content);
                innerHtml = parser.parseFromString(content, "text/html");
                //console.log(innerHtml)
                suggestions = Object.values(innerHtml.getElementsByTagName("li"))
                    .map(il => il.innerText.split("-"))
                suggestions = Object.values(suggestions)
                    .map( a =>{
                        return {
                            id: a[0].trim(), 
                            name: a[a.length-1].trim(),
                            ruc: a[1].trim(),
                        }
                    } )
                console.log('suggestion:', suggestions)
            }else{ // if we got soemthing else
                console.log("could not get parametros de busquesda")
                if( g.getElementById('javax.faces.ViewRoot') ){
                    content = g.getElementById('javax.faces.ViewRoot').textContent
                    console.log('content: ', content);
                    innerHtml = parser.parseFromString(content, "text/html");
                    console.log(innerHtml)
                }else if( g.getElementById('javax.faces.ViewState') ){
                    content = g.getElementById('javax.faces.ViewState').textContent
                    console.log('content: ', content);
                    innerHtml = parser.parseFromString(content, "text/html");
                    console.log(innerHtml)
                }
            }
        }else{
            console.log('status:', e);
        }
    },
    "async": false,
    params: [
        {
            name: "frmBusquedaCompanias:parametroBusqueda_query",
            value: "t",
        }
    ],
    process: "frmBusquedaCompanias:parametroBusqueda",
    source: "frmBusquedaCompanias:parametroBusqueda",
    update: "frmBusquedaCompanias:parametroBusqueda",
})
