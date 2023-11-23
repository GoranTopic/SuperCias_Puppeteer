import imprint2Obj from '../../utils/imprint2Obj.js';

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

const get_all_table_rows = (table='tblDocumentosGenerales', documentCount = 10000) => 
    imprint2Obj('${table}', table, {
        ext: undefined,
        formId: undefined,
        oncomplete: function(g,e,f){
            // I added the defintion of becasue,
            // it seems to be glabal variable defined on th eviroment this function is run on
            let c = window.PrimeFaces.widgets[`${table}`]
            // but I don't have it where i run this function, thus here it is
            console.log('printing from oncomplete query_all_table');
            console.log('g:', g);
            console.log('e:', e);
            console.log('f:', f);
            console.log('c:', c);
            console.log('PrimeFaces.widgets[`${table}`]:', window.PrimeFaces.widgets[`${table}`])
            console.log('window:', window);
            c.paginator.cfg.page = d.page;
            console.log('d:', d);
            if(f&&typeof f.totalRecords!=="undefined"){
                c.paginator.updateTotalRecords(f.totalRecords)
            }else{
                c.paginator.updateUI()
            }
        },
        onsuccess: function(g,e,f){
            PrimeFaces.ajax.Response.handle(g,e,f,{
                // original -> widget: c
                widget: PrimeFaces.widgets[`${table}`],
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
            {name: `frmInformacionCompanias:tabViewDocumentacion:${table}_pagination`, value: true},
            {name: `frmInformacionCompanias:tabViewDocumentacion:${table}_first`, value: 0},
            // this parameter specifies the number of rows
            {name: `frmInformacionCompanias:tabViewDocumentacion:${table}_rows`, value: documentCount},
            {name: `frmInformacionCompanias:tabViewDocumentacion:${table}_skipChildren`, value: true},
            {name: `frmInformacionCompanias:tabViewDocumentacion:${table}_encodeFeature`, value: true},
        ],
        process: `frmInformacionCompanias:tabViewDocumentacion:${table}`,
        source: `frmInformacionCompanias:tabViewDocumentacion:${table}`,
        update: `frmInformacionCompanias:tabViewDocumentacion:${table}`,
    });

export default get_all_table_rows
