//import Checklist from 'checklist-js';
import send_request from '../../../reverse_engineer/send_request.js';
import query_kardex_de_accionistas from '../../../reverse_engineer/queries/query_kardek_de_accionistas.js';
import query_excel_link from '../../../reverse_engineer/queries/query_excel_link.js';
import download_pdf from '../../../utils/download_pdf.js';

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
    }

    let excel_filename = company.ruc + '.pdf';
    // Download the execel kardex de accionista
    let excel_url = await send_request(
        query_excel_link(), 
        // the callback
        (response, status, i, C) => response['pfArgs']['rutaArchivoExcel'],
        page, // puppetter page
        false, 
    );
    // download the pdf
    let result = await download_pdf(
        excel_url, // the url to download from
        page,// the page to download with 
        excel_filename, // the filename to save as
    );
    return result;

    /*
    // store number of rows
    let rows = {};
    tables.forEach( table => {
        if(table === 'AdministradoresActuales')
            rows[table] = numberOfGeneralPdfs;
        else
            rows[table] = null;
    });
    console.log(company);
    // checklist tables
    let tbl_checklist = new Checklist(tables, {
        name: `document tables for ${company.ruc}`,
        path: './storage/checklists'
    });

    // make checklists
    let pdf_checklists = {};
    tables.forEach(table =>
        pdf_checklists[table] = new Checklist(null, {
                name: table + ' pdfs for ' + company.ruc,
                path: './storage/checklists',
            })
    );

    let downloaded = {};
    // let try to scrap every table =)
    for( let table of tables ){
        if(!tbl_checklist.isChecked(table)){
            downloaded[table] = await scrap_table(table, rows, pdf_checklists, page, company);
            if(pdf_checklists[table].missingLeft() <= error_threshold){
                // if there are less pdfs left than the threshold, 
                // mark as done
                tbl_checklist.check(table);
                pdf_checklists[table].delete();
            }
        }
    }
    console.log('downloaded')
    console.log(downloaded)
    // check how we did
    tables.forEach( table =>
        console.log(`For ${table} we got ${pdf_checklists[table].valuesDone()}/${rows[table]}`)
    );
    // if everyt checklist has less than missing pdfs
    if( tbl_checklist.isDone() ){
        tbl_checklist.delete();
        console.log('scrap documents finished')
    }else // did not pass
        console.log('scrap documents did not finish')
    // return list of downloaded pdfs
    return downloaded;
    */
}
