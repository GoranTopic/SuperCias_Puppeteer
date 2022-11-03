/**
 * this are the parameters extracted when the website.
 * It is used to send to the website that a auto suggestion has been selected
 *
 * This code was grabed from the browser around mid-2022
 **/



/**
 * select_autocomplete_suggestion. 
 *  
 */
/**
 * select_autocomplete_suggestion.
 *  this is the object that is send to the server 
 *  to let it know that we are after information about this company
 *  the server responds by sending a captach 
 *
 * @param {} company
 *  it takes an object which has the id, ruc, and name of the company
 *
 *  return the query to selecte the company
 */
const select_autocomplete_suggestion = company => ({
    event: "itemSelect",
    ext: {},
    params: [{
        name: "frmBusquedaCompanias:parametroBusqueda_itemSelect",
        value: `${company.id} - ${company.ruc} - ${company.name}`,
    }],
    oncomplete: function(xhr,status,args){
        PF('dlgProcesando').hide();
        document.getElementById('frmBusquedaCompanias:captcha').focus();
    },
    process: "frmBusquedaCompanias:parametroBusqueda",
    source: "frmBusquedaCompanias:parametroBusqueda",
    update: "frmBusquedaCompanias:parametroBusqueda frmBusquedaCompanias:panelCompaniaSeleccionada frmBusquedaCompanias:panelCaptcha frmBusquedaCompanias:btnConsultarCompania",
})

export default select_autocomplete_suggestion;
