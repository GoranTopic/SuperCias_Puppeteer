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


    // if we are scrapping the general table, we need to change into the documents tab
    console.log('querying documentos online', query_documentos_online)
    // query to change into the documentos tab
    console.log('sending query documentos request')
    await send_request(
        query_documentos_online, // paramter need to make the reuqe
        // the callback, this is goin to run in the browser,
        (response, status, i, C) =>  // the first table is general documentos
            window.extract_number_of_pdfs(response, 'DocumentosGenerales'),
        page, // puppetter page
        true, // followAlong to false so we don't rquest the captchan twice 
    );
    
    /* *
     *  Here we will loop ove the three document tabs:
     *  DocumentosGenerales, DocumentosEconomicos, DocumentosJudiciales
     * */

    // checklistfor every table, documentos generales, economicos, judiciales
    let tbl_checklist = new Checklist(tables, {
        name: `document tables for ${company.ruc}`,
        path: './storage/checklists'
    });

    // for every table we will have a checklist of pdfs
    let pdf_checklists = {};

    let downloaded = {};
    // let try to scrap every table =)
    for (let table of tables) {
        let { pdf_downloaded, checklist } = await scrap_table(table, page, company);
        pdf_checklists[table] = checklist;
        downloaded[table] = pdf_downloaded
        if (pdf_checklists[table].missingLeft() <= error_threshold) {
            // if there are less pdfs left than the threshold, 
            // mark as done
            tbl_checklist.check(table);
            //pdf_checklists[table].delete();
        }
    }

    // check how we did
    tables.forEach(table => {
        console.log(`For ${table} we got ${pdf_checklists[table].valuesDone()}/${pdf_checklists[table].valuesCount()} pdfs`)
    }
    );

    let data = { downloaded };
    // if everyt checklist has less than missing pdfs
    if( tbl_checklist.isDone() ){
        //tbl_checklist.delete();
        console.log('scrap documents finished all documents tables')
    }else // did not pass
        console.log('scrap documents did not finish all documents tables')
    // return list of downloaded pdfs, and if we are done
    return data;
}
