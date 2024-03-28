import Checklist from 'checklist-js';
import send_request from '../../../reverse_engineer/send_request.js';
import query_administradores_anteriores from '../../../reverse_engineer/queries/query_administradores_anteriores.js';
import scrap_table from './scrap_doc_tables_opction.js';
import options from '../../options.json' assert { type: 'json' };

// the nuber of pdf is ok not have
let error_threshold = options.pdf_missing_threshold;

/**
 * Scrap Documents
 *
 * @param {} page
 * @param {} company
 */


export default async (page, company, console) => {
   // tables to scrap
   let tables = [
    'AdministradoresAnteriores'
    ];

    // query the documentos online
    console.log('sending query documentos request')
    let numberOfGeneralPdfs = await send_request(
        query_administradores_anteriores, // paramter need to make the reuqe
        // the callback, this is goin to run in the browser,
        (response, status, i, C) =>  // the first table is general documentos
        window.extract_number_of_pdfs(response, 'AdministradoresActuales',true),
        page, // puppetter page
        console, // logger
        false, // followAlong to false so we don't rquest the captchan twice 
    );
    console.log(`numberOfGeneralPdfs: ${numberOfGeneralPdfs}`);
    console.log('query documents request finished' + page);


    /* *
    *  Here we will loop ove the three document tabs:
    *  DocumentosGenerales, DocumentosEconomicos, DocumentosJudiciales
    * */
    // store number of rows
    let rows = {};
    tables.forEach( table => {
        if(table === 'AdministradoresAnteriores')
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
            downloaded[table] = await scrap_table(table, rows, pdf_checklists, page, company, console);
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
}
