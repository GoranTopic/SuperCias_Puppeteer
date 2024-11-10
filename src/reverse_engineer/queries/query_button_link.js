/**
 * this are the parameters extracted when the website queries the backedn for the pdf link
 *
 * This code was grabed from the webite console, printed by a custom AB Function on nov 2, 2022
 **/
/**
 *  Query the button link for the table
 *  This function is called when the user clicks on a download button
 *  it might just work with any table 
 *
 */
const query_button_link = button_id => ({
    ext: undefined,
    oncomplete: function(xhr,status,args){
        handleMostrarDialogoCaptcha(xhr,status,args);
    },
    partialSubmit: true,
    process : `frmInformacionCompanias:${button_id}`,
    source : `frmInformacionCompanias:${button_id}`,
    update : "dlgCaptcha frmCaptcha:panelCaptcha",
})

export default query_button_link;
