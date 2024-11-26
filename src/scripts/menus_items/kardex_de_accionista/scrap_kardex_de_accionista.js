//import Checklist from 'checklist-js';
import send_request from '../../../reverse_engineer/send_request.js';
import query_kardex_de_accionistas from '../../../reverse_engineer/queries/query_kardek_de_accionistas.js';
import query_button_link from '../../../reverse_engineer/queries/query_button_link.js';
import download_pdf from '../../../utils/download_pdf.js';
import selectWidgetIdByTextContent from '../../../utils/selectWidgetIdByTextContent.js';

/**
 * Scrap kardex de accionista
 *
 * @param {} page
 * @param {} company
 */
export default async (page, company) => {
    // query the documentos online
    console.log('sending query to change to karde de accionista');
    let number_of_rows = await send_request(
        query_kardex_de_accionistas, // the query
        // the callback, this is goin to run in the browser,
        (response, status, i, C) => 
        window.extract_number_of_kardek_rows(response),
        page, // puppetter page
        false, // followAlong to false so we don't rquest the captchan twice 
    );
    console.log('number of rows: ', number_of_rows);
    if(number_of_rows > 200000){
        console.log('too many rows, skipping');
        return 'too_many_rows'
    }else if(number_of_rows === 0){
        console.log('informacion no disponible')
        // get fieStore from page
        let fileStore = page['fileStore']; 
        // save pdf buffer 
        await fileStore.set(Buffer.from(""), {
            filename: company.ruc + '.xlsx',
            type: 'application/pdf', 
        });
        return 'informacion no displinble'
    }

    let button_id = 
        await selectWidgetIdByTextContent(page, 'Exportar a Excel');
    console.log('button id: ', button_id);
    // Download the execel kardex de accionista
    let excel_url = await send_request(
        query_button_link(button_id), // the query
        // the callback
        (response, status, i, C) => response['pfArgs']['rutaArchivoExcel'],
        page, // puppetter page
        false, 
    );
    console.log('excel url: ', excel_url);
    let excel_filename = company.ruc + '.xlsx';
// download the pdf
    let result = await download_pdf(
        excel_url, // the url to download from
        page,// the page to download with 
        excel_filename, // the filename to save as
    );
    return result;

}
