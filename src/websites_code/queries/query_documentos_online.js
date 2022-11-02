/**
 * This object is the command sent ot server to query the Documentos Online tab,
 * it equivalant at clicking the tab with the mouse 
 * This code was grabed from the webite console, printed by a custom AB Function on nov 2, 2022
 **/

const query_documentos_online = {
    ext: undefined,
    formId: "frmMenu",
    oncomplete: function(xhr,status,args){
        handleMostrarDialogoCaptcha(xhr,status,args);
        if (PF('tblDocumentosGenerales') != null) 
            PF('tblDocumentosGenerales').clearFilters();           
        if (PF('tblDocumentosJuridicos') != null) 
            PF('tblDocumentosJuridicos').clearFilters();           
        if (PF('tblDocumentosEconomicos') != null) 
            PF('tblDocumentosEconomicos').clearFilters();
    },
    source: "frmMenu:menuDocumentacion",
    update: "frmInformacionCompanias:panelGroupInformacionCompanias frmCaptcha:panelCaptcha",
}

export default query_documentos_online
