import send_request from '../../../reverse_engineer/send_request.js';
import query_administradores_anteriores from '../../../reverse_engineer/queries/query_administradores_anteriores.js';
import query_button_link from '../../../reverse_engineer/queries/query_button_link.js';
import download_pdf from '../../../utils/download_pdf.js';
import selectWidgetIdByTextContent from '../../../utils/selectWidgetIdByTextContent.js';

/**
 * Scrap administradores anteriores
 *
 * @param {} page
 * @param {} company
 */
export default async (page, company) => {
    // query the page pf the administradores anteriores
    console.log('sending query to change to administradores anteriores');
    let number_of_rows = await send_request(
        query_administradores_anteriores,
        // the callback, this is goin to run in the browser,
        (response, status, i, C) => 
            window.number_of_rows_administradores_anteriores(response),
        page, // puppetter page
        false, // followAlong to false so we don't rquest the captchan twice 
    );
    console.log('number of rows: ', number_of_rows);
    if(number_of_rows > 400000){
        console.log('too many rows, skipping');
        return 'too_many_rows'
    }else if(number_of_rows === 0){
        console.log('informacion no disponible')
        // get fieStore from page
        let fileStore = page['admin_anterior_store'];
        // save pdf buffer 
        await fileStore.set(Buffer.from(""), {
            filename: company.ruc + '.pdf',
            type: 'application/pdf', 
        });
        return 'informacion no disponible';
    }

    let button_id = 
        await selectWidgetIdByTextContent(page, 'Imprimir certificado');
    console.log('button id: ', button_id);
    // Download the pdf of the administradores actuales
    let pdf_url = await send_request(
        query_button_link(button_id), // the query
        // the callback
        (response, status, i, C) => {
            console.log('response: ', response);
            return response['pfArgs']['urlDocumentoPdf'];
        },
        page, // puppetter page
        false, 
    );
    console.log('pdf url: ', pdf_url);
    let pdf_filename = company.ruc + '.pdf';
    // get the file store
    let fileStore = page['admin_anterior_store'];
    // download the pdf
    let result = await download_pdf(
        pdf_url, // the url to download from
        page,// the page to download with 
        pdf_filename, // the filename to save as
        fileStore, // the file store to save the file
    );
    return result;
}
