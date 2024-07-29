import Checklist from 'checklist-js';
import send_request from '../../../reverse_engineer/send_request.js';
import query_documentos_online from '../../../reverse_engineer/queries/query_documentos_online.js';
import scrap_table from './scrap_documents_table.js';
import options from '../../../options.js';

// the nuber of pdf is ok not have
let error_threshold = options.pdf_missing_threshold;

/**
 * Scrap Documents
 *
 * @param {} page
 * @param {} company
 */
export default async (page, company) => {
    // tables to scrap
    let tables = [
        'DocumentosGenerales', 
        'DocumentosJuridicos',
        'DocumentosEconomicos' 
    ];

    console.log('querying documentos online', query_documentos_online)
    // query the documentos online
    console.log('sending query documentos request')
    let numberOfGeneralPdfs = await send_request(
        query_documentos_online, // paramter need to make the reuqe
        // the callback, this is goin to run in the browser,
        (response, status, i, C) =>  // the first table is general documentos
        window.extract_number_of_pdfs(response, 'DocumentosGenerales'),
        page, // puppetter page
        true, // followAlong to false so we don't rquest the captchan twice 
    );
    console.log(`numberOfGeneralPdfs: ${numberOfGeneralPdfs}`);
    console.log('query documents request finished')

    //await waitForNetworkIdle(page, 1000)
    /* *
     *  Here we will loop ove the three document tabs:
     *  DocumentosGenerales, DocumentosEconomicos, DocumentosJudiciales
     * */
    // store number of rows
    let rows = {};
    tables.forEach( table => {
        if(table === 'DocumentosGenerales')
            rows[table] = numberOfGeneralPdfs;
        else
            rows[table] = null;
    });

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

    // check how we did
    tables.forEach( table =>
        console.log(`For ${table} we got ${pdf_checklists[table].valuesDone()}/${rows[table]}`)
    );

    let data = { downloaded };
    // if everyt checklist has less than missing pdfs
    if( tbl_checklist.isDone() ){
        data['isDone'] = tbl_checklist.isDone();
        tbl_checklist.delete();
        console.log('scrap documents finished all documents tables')
    }else // did not pass
        console.log('scrap documents did not finish all documents tables')
    // return list of downloaded pdfs, and if we are done
    return data;
}
