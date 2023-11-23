/**
 * This object is the command sent ot server to query qhen we want to change the tab in the table
 * it equivalant at clicking the tab with the mouse 
 * This code was grabed from the webite console, printed by a custom AB Function on nov 2, 2022
 **/
const table_tabindex_map = { 
        'DocumentosGenerales': 0,
        'DocumentosJuridicos': 1,
        'DocumentosEconomicos': 2,
    }


const query_table_change = table => ({
    event: 'tabChange',
    ext: {
        params: [ 
            {
                name: "frmInformacionCompanias:tabViewDocumentacion_newTab",
                value: `frmInformacionCompanias:tabViewDocumentacion:tab${table}`
            }, 
            {
                name: "frmInformacionCompanias:tabViewDocumentacion_tabindex",
                value: table_tabindex_map[table],
            }
        ]
    },
    oncomplete: function(xhr,status,args){
        handleMostrarDialogoCaptcha(xhr,status,args);
        if (PF('tblDocumentosGenerales') != null)
            PF('tblDocumentosGenerales').clearFilters();         
        if (PF('tblDocumentosJuridicos') != null) 
            PF('tblDocumentosJuridicos').clearFilters();         
        if (PF('tblDocumentosEconomicos') != null) 
            PF('tblDocumentosEconomicos').clearFilters();;
    },
    process: 'frmInformacionCompanias:tabViewDocumentacion',
    source: 'frmInformacionCompanias:tabViewDocumentacion',
    update: 'frmInformacionCompanias:tabViewDocumentacion dlgCaptcha frmCaptcha:panelCaptcha',
})


export { query_table_change, table_tabindex_map };

