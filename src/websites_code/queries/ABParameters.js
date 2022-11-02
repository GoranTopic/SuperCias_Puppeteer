const check_first_captchan_parameters = {
    ext: undefined,
    oncomplete: (xhr,status,args) => {
        handleMostrarPaginaInformacionCompania(xhr, status, args);
    },
    process: "frmBusquedaCompanias",
    source: "frmBusquedaCompanias:btnConsultarCompania",
}

const check_captchan_parameters ={
    ext: undefined,
    process: "frmCaptcha",
    oncomplete:  () => {},
    source: "frmCaptcha:btnPresentarContenido",
    update: "frmInformacionCompanias:panelGroupInformacionCompanias frmCaptcha:msgCaptcha frmCaptcha:captchaImage dlgPresentarDocumentoPdf panelPresentarDocumentoPdf dlgPresentarDocumentoPdfConFirmasElectronicas panelPresentarDocumentoPdfConFirmasElectronicas dlgDetalleActoJuridico dlgInformacionPersona panelInformacionPersona",
}


const select_item_parameter = {
    event: "itemSelect",
    ext:{},
    params: [{
        name: "frmBusquedaCompanias:parametroBusqueda_itemSelect",
        value: "",
    }],
    oncomplete: function(xhr,status,args){
        PF('dlgProcesando').hide();
        document.getElementById('frmBusquedaCompanias:captcha').focus();
    },
    process: "frmBusquedaCompanias:parametroBusqueda",
    source: "frmBusquedaCompanias:parametroBusqueda",
    update: "frmBusquedaCompanias:parametroBusqueda frmBusquedaCompanias:panelCompaniaSeleccionada frmBusquedaCompanias:panelCaptcha frmBusquedaCompanias:btnConsultarCompania",
}


const get_all_document_tables = async (table, page) => {
    // let get the number of document that ther are 
    let row_count = await page.evaluate(
        table => PrimeFaces.widgets[table].cfg.paginator.rows, table
    )
    // return thr paramters
    return {
        ext: undefined,
        formId: undefined,
        oncomplete: function (g,e,f){
            c.paginator.cfg.page=d.page;
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
            {name: 'frmInformacionCompanias:j_idt673:tblDocumentosGenerales_pagination', value: true},
            {name: 'frmInformacionCompanias:j_idt673:tblDocumentosGenerales_first', value: 0},
            {name: 'frmInformacionCompanias:j_idt673:tblDocumentosGenerales_rows', value: row_count},
            {name: 'frmInformacionCompanias:j_idt673:tblDocumentosGenerales_skipChildren', value: true},
            {name: 'frmInformacionCompanias:j_idt673:tblDocumentosGenerales_encodeFeature', value: true} 
        ],
        process: "frmInformacionCompanias:j_idt673:tblDocumentosGenerales",
        source: "frmInformacionCompanias:j_idt673:tblDocumentosGenerales",
        update: "frmInformacionCompanias:j_idt673:tblDocumentosGenerales",
    }
}

const change_tab = () => ({})

const query_table_parameters = table => ({
    ext: undefined,
    formId: "frmMenu",
    oncomplete: function(xhr,status,args){
        handleMostrarDialogoCaptcha(xhr,status,args);
    },
    params: [
        {name: `frmInformacionCompanias:tbl${table}_pagination`, value: true},
        {name: `frmInformacionCompanias:tbl${table}_first`, value: 0},
        {name: `frmInformacionCompanias:tbl${table}_rows`, value: 1000000},//high number
        {name: `frmInformacionCompanias:tbl${table}_skipChildren`, value: true},
        {name: `frmInformacionCompanias:tbl${table}_encodeFeature`, value: true},
    ],
    source: `frmMenu:menu${table}`,
    update: "frmInformacionCompanias:panelGroupInformacionCompanias frmCaptcha:panelCaptcha"
})


/**
 * this are the parameters extracted when the table of document asks for all 
 * the couments in the genral documenets 
 * */
const get_all_docs_table = {
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


export { get_all_document_tables, check_first_captchan_parameters, check_captchan_parameters, query_table_parameters, select_item_parameter }
