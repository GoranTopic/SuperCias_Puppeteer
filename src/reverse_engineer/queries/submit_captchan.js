/**
 * this are the parameters extracted when the website.
 * this is the obj that is sent to the AB function 
 * when a captchan is submited 
 *
 * This code was grabed from the browser nov 3 2022
 **/



/**
 * submit_captchan. 
 * this is the object that is passed to the AB function which
 * handles the cheking of the captchan
 * Note that the captcha resolved number is not in this object
 * this is because the AB function extacts the number direcly from the
 * textInput of the captchan widget, it is easier to
 * place the solution of the captchan direcly in the textInput and 
 * pass this obj to the ABfunction
 */
const submit_captchan = {
    ext: undefined,
    source: "frmCaptcha:btnPresentarContenido", 
    process: "frmCaptcha",
    update: "frmInformacionCompanias:panelGroupInformacionCompanias frmCaptcha:msgCaptcha frmCaptcha:captchaImage dlgPresentarDocumentoPdf panelPresentarDocumentoPdf dlgPresentarDocumentoPdfConFirmasElectronicas panelPresentarDocumentoPdfConFirmasElectronicas dlgDetalleActoJuridico dlgInformacionPersona panelInformacionPersona",
    onstart: function(cfg){
        PF('dlgProcesando').show();;
    },
    oncomplete: function(xhr,status,args){
        handleVerificarCaptcha(xhr,status,args); 
        return false;;
    }
};

export default submit_captchan;
