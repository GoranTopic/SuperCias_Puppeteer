import imprint2Obj from '../../utils/imprint2Obj.js';

/**
 * this are the parameters extracted when the table of document asks for all 
 * the couments in the genral documenets 
 *
 * This code was grabed from the webite console, printed by a custom AB Function on nov 2, 2022
 **/

/**
 * get_table_rows. 
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

const query_rows = table => ({
    ext: undefined,
    formId: undefined,
    oncomplete: function(h,d,f){
        var j=c.getPaginator();
        if(f&&typeof f.totalRecords!=="undefined"){
            c.cfg.scrollLimit=f.totalRecords;
            if(j){
                j.setTotalRecords(f.totalRecords)
            }
        }
        if(c.cfg.clientCache){
            c.clearCacheMap()
        }
        if(c.cfg.virtualScroll){
            var g=c.bodyTable.children("tbody").children("tr.ui-widget-content");
            if(g){
                var e=g.eq(0).hasClass("ui-datatable-empty-message"),
                    i=c.cfg.scrollLimit;
                if(e){i=1}c.bodyTable.css("top","0px");
                c.scrollBody.scrollTop(0);
                c.clearScrollState();
                c.rowHeight=g.outerHeight();
                c.scrollBody.children("div").css({
                    height:parseFloat((i*c.rowHeight+1)+"px")
                })
            }
        }else{
            if(c.cfg.liveScroll){
                c.scrollOffset=0;
                c.liveScrollActive=false;
                c.shouldLiveScroll=true;
                c.loadingLiveScroll=false;
                c.allLoadedLiveScroll=c.cfg.scrollStep >= c.cfg.scrollLimit;
            }
        }
        c.updateHiddenHeaders()
    },
    onsuccess: function(f,d,e){
        PrimeFaces.ajax.Response.handle(f,d,e, {
            widget: c,
            handle:function(g){
                this.updateData(g);
                if(this.cfg.scrollable){
                    this.alignScrollBody()
                }
                if(this.isCheckboxSelectionEnabled()){
                    this.updateHeaderCheckbox()
                }
            }
        });
        return true
    },
    params: [ {
        name: "frmInformacionCompanias:tabViewDocumentacion:tblDocumentosEconomicos_filtering",
        value: true,
    }, {
        name: "frmInformacionCompanias:tabViewDocumentacion:tblDocumentosEconomicos_encodeFeature",
        value: true, 
    } ],
    process: "frmInformacionCompanias:tabViewDocumentacion:tblDocumentosEconomicos",
    source: "frmInformacionCompanias:tabViewDocumentacion:tblDocumentosEconomicos",
    update: "frmInformacionCompanias:tabViewDocumentacion:tblDocumentosEconomicos",
});

export default query_rows
