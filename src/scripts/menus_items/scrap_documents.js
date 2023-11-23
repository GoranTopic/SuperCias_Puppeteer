import Checklist from 'checklist-js';
import send_request from '../../../reverse_engineer/send_request.js';
import query_documentos_online from '../../../reverse_engineer/queries/query_documentos_online.js';
import scrap_table from './scrap_documents_table.js';
import options from '../../options.json' assert { type: 'json' };

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

    // query the documentos online
    log('sending query documentos request')
    let numberOfGeneralPdfs = await send_request(
        query_documentos_online, // paramter need to make the reuqe
        // the callback, this is goin to run in the browser,
        (response, status, i, C) =>  // the first table is general documentos
        window.extract_number_of_pdfs(response, 'DocumentosGenerales'),
        page, // puppetter page
        log, // logger
        false, // followAlong to false so we don't rquest the captchan twice 
    );
    log(`numberOfGeneralPdfs: ${numberOfGeneralPdfs}`);
    log('query documents request finished')

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
    let tbl_checklist = new Checklist( 
        'checklist_tables',
        tables,
        path
    );

    // make checklists
    let pdf_checklists = {};
    tables.forEach( table =>
        pdf_checklists[table] = new Checklist(
            "checklist_pdf",
            null, // add file later
            path + '/' + table
        )
    );

    // let try to scrap every table =)
    for( let table of tables ){
        let tbl_path = path + '/' + table;
        if(!tbl_checklist.isCheckedOff(table)){
            await scrap_table(table, rows, pdf_checklists, page, tbl_path, log, company)
            if(pdf_checklists[table].missingLeft() <= error_threshold)
                tbl_checklist.check(table);
        }
    }

    // check how we did
    tables.forEach( table =>
        console.log(`For ${table} we got ${pdf_checklists[table].valuesDone()}/${rows[table]}`)
    );
    // if everyt checklist has less than missing pdfs
    if( tbl_checklist.isDone() ){
        console.log('scrap documents finished')
        return page
    }else{ // did not pass
        console.log('scrap documents did not finish')
        return false;
    }
}