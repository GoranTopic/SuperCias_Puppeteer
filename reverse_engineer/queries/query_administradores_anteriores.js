/**
 * This object is the command sent ot server to query the AdministradoresActuales pagados tab,
 * it equivalant at clicking the tab with the mouse 
 * This code was grabed from the webite console, printed by a custom AB Function on nov 2, 2022
 **/

const query_valores_pagados = {
    ext: undefined,
    formId: "frmMenu",
    oncomplete: function(xhr,status,args){
        handleMostrarDialogoCaptcha(xhr,status,args);
        if (PF('AdministradoresAnteriores') != null) 
            PF('AdministradoresAnteriores').clearFilters();       
        return true;
    },
    source: "frmMenu:menuAdministradoresAnteriores",
    update: "frmInformacionCompanias:panelGroupInformacionCompanias frmCaptcha:panelCaptcha",
}

export default query_valores_pagados
