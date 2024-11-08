/**
 * this are the parameters extracted when the website queries the backedn for the pdf link
 *
 * This code was grabed from the webite console, printed by a custom AB Function on nov 2, 2022
 **/
/**
 *  Query the excel link for the table
 *  This function is called when the user clicks the download excel button
 *  it might just work with any table 
 *
 */
const query_excel_link = () => ({
    ext: undefined,
    oncomplete: function(xhr,status,args){
        handleMostrarDialogoCaptcha(xhr,status,args);
    },
    partialSubmit: true,
    process : "frmInformacionCompanias:j_idt660",
    source : "frmInformacionCompanias:j_idt660",
    update : "dlgCaptcha frmCaptcha:panelCaptcha",
})

export default  query_excel_link;
