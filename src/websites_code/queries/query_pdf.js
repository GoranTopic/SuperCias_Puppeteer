/**
 * this are the parameters extracted when the website queries the backedn for the pdf link
 *
 * This code was grabed from the webite console, printed by a custom AB Function on nov 2, 2022
 **/



/**
 * query_pdf_link. 
 *  This function return the rquest which is send to the server to ask for the a link to the pdf
 *  the pdfs from a General, Economic or Judicial, are enumarated from 0 to the number of pdfs
 *
 * @param String tableName 
 *  this is the name of the table from which to query the pdf
 *  posible values include: 
 *      tblDocumentosGenerales
 *      tblDocumentosEconomicos
 *      tblDocumentosJudiciales
 * @param Number pdfNumber
 *  this is the pdf number which to query, 
 *  it can go from 0 to the number of pdfs in a table
 */
const query_pdf_link = (tableName='tblDocumentosGenerales', pdfNumber=0) => ({
    ext: undefined,
    oncomplete: function(xhr,status,args){
        handleMostrarDialogoCaptcha(xhr,status,args);
    },
    source: `frmInformacionCompanias:tabViewDocumentacion:${tableName}:${pdfNumber}:j_idt699`,
    update: "dlgPresentarDocumentoPdf panelPresentarDocumentoPdf dlgPresentarDocumentoPdfConFirmasElectronicas panelPresentarDocumentoPdfConFirmasElectronicas dlgCaptcha frmCaptcha:panelCaptcha",
})

export default  query_pdf_link
