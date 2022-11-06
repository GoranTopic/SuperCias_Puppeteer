import waitUntilRequestDone from '../../utils/waitForNetworkIdle.js';
import { write_json, mkdir, fileExists } from '../../utils/files.js';
import sanitize from '../../utils/sanitizer.js';
import download_pdf from '../../utils/download_pdf.js';
import { Checklist } from '../../progress.js';
import send_request from '../../websites_code/send_request.js';
import query_documentos_online from '../../websites_code/queries/query_documentos_online.js';
import query_all_table_rows from '../../websites_code/queries/query_all_table_rows.js'
import query_pdf from '../../websites_code/queries/query_pdf_link.js'
import options from '../../options.js';

export default async (page, path, log=console.log, company) => {
    // let's make our dir
    let menu_name = 'Documentacion';
    path = path + '/' + menu_name;
    mkdir(path);

    // wait for page to load
    await waitUntilRequestDone(page, 500);
    debugger;
    // query the documentos online
    log('sending query documentos request')
    let outcome = await send_request(
        query_documentos_online, // paramter need to make the reuqe
        (response, status, i, C) => { // the callback, this is goin to run in the browser,
            return response
        },
        page, // puppetter page
        log, // logger
        false, // followAlong to false so we don't rquest the captchan twice 
    );
    log('query documents request finished')
    

    /* *
     *  Here we will loop ove the three document tabs:
     *  DocumentosGenerales, DocumentosEconomicos, DocumentosJudiciales
     * */
    let tables = ['DocumentosGenerales', 'DocumentosEconomicos', 'DocumentosJudiciales' ];
    // make checklists 
    let checklists = {};
    if( tables.every( table => 
        checklists[table] = new Checklist(
            "pdfs_" + table + '_' + company.name
        )
    ))

    // let try to scrap every table =)
    for( let table of tables ){
        log(`scraping ${table} Table`);
        // let make update the path 
        let path = path + '/' + table;
        log(`making path: ${path}`);
        mkdir(path);

        debugger;
        // query for all the rows in the general documents table
        log('sending query rows request')
        let pdfs_info = await send_request(
            query_all_table_rows('tlb' + table, 10000),
            (response, status, i, C) => { 
                log('query all rows callback ran' );
                // let get a list of all pdf documents
                // note: here the value is tab + table
                // instead of the ususal tbl + table
                return window.parse_table_html('tab' + table);
            },
            page,
            log
        );
        debugger;
        // sanitize values
        pdfs_info = pdfs_info.map( pdf => ({ 
            title: sanitize(pdf.title),
            id: pdf.id, // don't sanitize id
        }))
        log('pdfs_info[4]: ', pdfs_info[4]);
        log('query rows request finished');

        // add pdfs documents to the checklist
        checklists[table].addList( 
            pdfs_info.map(pdf => pdf.id),
            false // do not overwite
        );

        // loop over every pdf
        for(let pdf_info of pdfs_info){ 
            let pdf_id = pdf_info.id;
            let pdf_title = pdf_info.title;
            // if we alread have it, skip it
            if(checklists[table].isCheckedOff) continue
            debugger;
            // requestin pdf link
            let pdf_src = await send_request(
                query_pdf(pdf_id),
                (response, status, i, C) => { 
                    // return the src of the pdf
                    return window.parse_pdf_src(response);
                },
                page,
                log,
                false, // don't followAlong so we don't download the pdf twice
            );
            debugger;
            // downloading pdf
            let result = await download_pdf(
                pdf_src, 
                page, 
                path + '/' + pdf_title,
            );
            if(result){
                log('downloaded pdf:', pdf_src);
                checklists[table].check(pdf_id);
            }
        }
    }
    
    // check how we did
    // if everyt checklist has less than 5 missing pdfs
    if( tables.every( table => checklists[table].missingLeft() < 4)){
        log('scrap documents finished')
        return true
    }else{ // did not pass
        log('scrap documents did not finish')
        return false;
    }
}
