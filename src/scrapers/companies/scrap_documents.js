import waitUntilRequestDone from '../../utils/waitForNetworkIdle.js';
import { write_json, mkdir, fileExists } from '../../utils/files.js';
import download_pdf from '../../utils/download_pdf.js';
import { Checklist, DiskList } from '../../progress.js';
import options from '../../options.js';
import send_request from '../../websites_code/send_request.js';
import query_documentos_online from '../../websites_code/queries/query_documentos_online.js';
import query_all_table_rows from '../../websites_code/queries/query_all_table_rows.js'

export default async (page, path, log) => {
    // let's make our dir
    let menu_name = 'Documentacion';
    path =+ '/' + menu_name;
    mkdir(path);

    console.log('scrap documents ran')

    // wait for page to load
    await waitUntilRequestDone(page, 500);

    debugger;
    // query the documentos online
    console.log('sending query documentos request')
    let tables = await send_request(
        query_documentos_online, // paramter need to make the reuqe
        (response, status, i, C) => { // the callback, this is goin to run in the browser,
            //return window.parse_table();
            return true
        },
        page, // puppetter page
        log // logger
    );
    console.log('query documents request finished')

    debugger;
    // query for all the rows in the general documents table
    console.log('sending query documentos rows request')
    let rows = await send_request(
        query_all_table_rows(), // paramter need to make the reuqe
        (response, status, i, C) => { 
            console.log('query all rows callback ran' );
            return true
        }, // callback
        page, // puppetter page
        log // logger
    );
    console.log('query documentos rows request finished')


    /*
    // let get the paramter need to make the call the server
    let parameters = query_table_parameters(menu_name);
    console.log('parameters:', parameters)
    // let fetch the table
    let gotTable = await send_request(
        parameters, // paramter need to make the reuqe
        // the callback, this is goin to run in the browser,
        (response, status, i, C) => {
            //return window.parse_table();
            return true
        },
        page,
        log
    );
    // 
    if(!gotTable) log('could not get table generales:');
    */

    /*
    // this are the paramter to query all the posible rows in a tha table
    debugger
    parameters = await get_all_document_tables(generales_table_id, page);
    console.log('paramter:', parameters)

    let all_rows = await send_request(
        parameters, // paramter need to make the reuqe
        (response, status, i, C) => {
            return window.parse_table(
                'widget_frmInformacionCompanias_j_idt673_tblDocumentosGenerales'
            );
        },
        page,
        log
    );
    console.log(all_rows)
    */

    /* // this is pseudo code for downloading the pdfs
    fetched_table.forEach(
        table => table.cells.forEach(
            cell => {
                if(isLink( cell )) download_pdf(pdf)
            }
        )
    )
    */

    // retunr for debuggin porposes
    console.log('scrap documents finished')
    return false;
}
