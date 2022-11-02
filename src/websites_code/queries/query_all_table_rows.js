/**
 * this are the parameters extracted when the table of document asks for all 
 * the couments in the genral documenets 
 *
 * This code was grabed from the webite console, printed by a custom AB Function on nov 2, 2022
 **/

const get_all_table_rows = {
    ext: undefined,
    formId: undefined,
    source: "frmInformacionCompanias:tabViewDocumentacion:tblDocumentosGenerales",
    update: "frmInformacionCompanias:tabViewDocumentacion:tblDocumentosGenerales",
    proces: "frmInformacionCompanias:tabViewDocumentacion:tblDocumentosGenerales",
    oncomplete: function(g,e,f){
        c.paginator.cfg.page=d.page;
        if(f&&typeof f.totalRecords!=="undefined"){
            c.paginator.updateTotalRecords(f.totalRecords)
        }else{
            c.paginator.updateUI()}
    },
    onsuccess: function(g,e,f){
        PrimeFaces.ajax.Response.handle(g,e,f,{
            widget:c,
            handle: function(h){
                this.updateData(h);
                if(this.checkAllToggler){
                    this.updateHeaderCheckbox()
                }if(this.cfg.scrollable){
                    this.alignScrollBody()
                }if(this.cfg.clientCache){
                    this.cacheMap[d.first] = h
                }
            }
        });
        return true
    },
    params: [
        {
            "name": "frmInformacionCompanias:tabViewDocumentacion:tblDocumentosGenerales_pagination",
            "value": true
        },
        {
            "name": "frmInformacionCompanias:tabViewDocumentacion:tblDocumentosGenerales_first",
            "value": 0
        },
        {
            "name": "frmInformacionCompanias:tabViewDocumentacion:tblDocumentosGenerales_rows",
            "value": 122
        },
        {
            "name": "frmInformacionCompanias:tabViewDocumentacion:tblDocumentosGenerales_skipChildren",
            "value": true
        },
        {
            "name": "frmInformacionCompanias:tabViewDocumentacion:tblDocumentosGenerales_encodeFeature",
            "value": true
        }
    ]
}

export default get_all_table_rows
