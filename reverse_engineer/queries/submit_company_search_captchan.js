/**
 * this are the parameters extracted when the website.
 * this is the obj that is sent to the AB function
 * when a captchan is submited 
 *
 * This code was grabed from the browser nov 3 2022
 **/

/**
 * enter_captchan. 
 * this is the object that is passed to the AB function which
 * handles the checking of the first captchan we submit when 
 * we query a company
 * Note that, as the other captchans, the captcha solution number is not in this object
 * this is because the AB function extacts the number direcly from the
 * textInput of the captchan widget, it is easier to
 * place the solution of the captchan direcly in the textInput and 
 * pass this obj to the ABfunction
 **/
const query_company_captchan = {
    ext: undefined,
    source: "frmBusquedaCompanias:btnConsultarCompania", 
    process: "frmBusquedaCompanias",
    onstart: function(cfg){
        PF('dlgProcesando').show();;
    },
    oncomplete: function(xhr,status,args){
        PF('dlgProcesando').hide(); 
        handleMostrarPaginaInformacionCompania(xhr,status,args);
    }
}

export default query_company_captchan;
