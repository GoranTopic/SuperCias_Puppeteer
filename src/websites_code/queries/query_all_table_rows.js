/**
 * this are the parameters extracted when the table of document asks for all 
 * the couments in the genral documenets 
 *
 * This code was grabed from the webite console, printed by a custom AB Function on nov 2, 2022
 **/

/**
 * get_all_table_rows. 
 *  this function takes two optional paramters and returns 
 *  the command needed to query all the rows of document table
 *  to the server.
 *
 * @param String tableName, optionl
 *  this is the name of the table we want to query all rows from 
 *  tblDocumentosGenerales
 *  tblDocumentosEconomicos
 *  tblDocumentosJudiciales
 * @param String documentCount
 *  this is the name of the table we want to query all rows from 
 *  if undefined, it send a really big number
 */
const get_all_table_rows = (tableName='tblDocumentosGenerales', documentCount = 10000) => ({
    ext: undefined,
    formId: undefined,
    oncomplete: function(g,e,f){
        console.log('printing from oncomplete query_all_table');
        console.log('g:', g);
        console.log('e:', e);
        console.log('f:', f);
        c.paginator.cfg.page = d.page;
        if(f&&typeof f.totalRecords!=="undefined"){
            c.paginator.updateTotalRecords(f.totalRecords)
        }else{
            c.paginator.updateUI()
        }
    },
    onsuccess: function(g,e,f){
        PrimeFaces.ajax.Response.handle(g,e,f,{
            widget: c,
            handle: function(h){
                this.updateData(h);
                if(this.checkAllToggler){
                    this.updateHeaderCheckbox()
                }
                if(this.cfg.scrollable){
                    this.alignScrollBody()
                }
                if(this.cfg.clientCache){
                    this.cacheMap[d.first]=h
                }
            }
        });
        return true
    },
    params: [
        {name: `frmInformacionCompanias:tabViewDocumentacion:${tableName}_pagination`, value: true},
        {name: `frmInformacionCompanias:tabViewDocumentacion:${tableName}_first`, value: 0},
        // this parameter specifies the number of rows
        {name: `frmInformacionCompanias:tabViewDocumentacion:${tableName}_rows`, value: documentCount},
        {name: `frmInformacionCompanias:tabViewDocumentacion:${tableName}_skipChildren`, value: true},
        {name: `frmInformacionCompanias:tabViewDocumentacion:${tableName}_encodeFeature`, value: true},
    ],
    process: `frmInformacionCompanias:tabViewDocumentacion:${tableName}`,
    source: `frmInformacionCompanias:tabViewDocumentacion:${tableName}`,
    update: `frmInformacionCompanias:tabViewDocumentacion:${tableName}`,
})

export default get_all_table_rows
