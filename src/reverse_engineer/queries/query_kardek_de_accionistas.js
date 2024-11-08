/**
 * This object is the command sent ot server to query the Accionistas tab,
 * it equivalant at clicking the tab with the mouse 
 * This code was grabed from the webite console, printed by a custom AB Function on nov 2, 2022
 **/

const query_kardek_de_accionistas = {
    ext: undefined,
    formId: "frmMenu",
    oncomplete: function(xhr,status,args){
        handleMostrarDialogoCaptcha(xhr,status,args);
        if (PF('Accionistas') != null) 
            PF('Accionistas').clearFilters();       
        return true;
    },
    source: "frmMenu:menuKardexAccionistas",
    update: "frmInformacionCompanias:panelGroupInformacionCompanias frmCaptcha:panelCaptcha",
}


export default query_kardek_de_accionistas;
