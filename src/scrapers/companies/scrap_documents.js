import waitUntilRequestDone from '../../utils/waitForNetworkIdle.js';
import { write_json, mkdir, fileExists } from '../../utils/files.js';
import sanitize from '../../utils/sanitizer.js';
import download_pdf from '../../utils/download_pdf.js';
import imprint2Function from '../../utils/imprint2Function.js';
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
    // tables to scrap
    let tables = [
        'DocumentosGenerales', 
        //'DocumentosEconomicos', 
        //'DocumentosJudiciales'
    ];
    // wait for page to load
    await waitUntilRequestDone(page, 500);
    // query the documentos online
    debugger;
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
    log('numberOfGeneralPdfs: ', numberOfGeneralPdfs);
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
    
    // make checklists 
    let checklists = {};
    tables.forEach( table => 
        checklists[table] = new Checklist(
            "pdfs_" + table + '_' + company.name
        )
    );

    // let try to scrap every table =)
    for( let table of tables ){
        // check number doucments in table.
        if(table !== 'DocumentosGenerales'){
            // request tab change
            // get number of documents for the table
        }

        log(`scraping ${table} Table`);
        // let make update the path 
        let tbl_path = path + '/' + table;
        log(`making path: ${tbl_path}`);
        mkdir(tbl_path);

        if(table !== 'DocumentosGenerales'){
            // switch table tab
        }

        debugger;
        // get all rows
        log('sending query for rows all')
        let response = await page.evaluate(
            ({table, rows}) => { // paginator
                return PrimeFaces.widgets['tbl' + table]
                    .paginator
                    .setRowsPerPage(rows)            
            }, {table, rows: rows[table]}
        )

        // wait for table to load
        await waitUntilRequestDone(page, 1000);
        

        // extract rows in table
        debugger;
        let pdfs_info = await page.evaluate( table =>
            // let get a list of all pdf documents
            // note: here the value is tab + table
            // instead of the ususal tbl + table
            window.parse_table_html('tab' + table),
            table
        );

        // sanitize values
        debugger;
        pdfs_info = pdfs_info.map( pdf => ({ 
            title: sanitize(pdf.title),
            id: pdf.id, // don't sanitize id
        }))

        // add pdfs documents to the checklist
        checklists[table].addList( 
            pdfs_info.map(pdf => pdf.id),
            false // do not overwite
        );

        // loop over every pdf
        for(let { id, title } of pdfs_info){ 
            // if we alread have it, skip it
            if(checklists[table].isCheckedOff(id)) continue
            log('id: ', id);
            log('tite: ', title);
            log(`Downloading pdf ${checklists[table].missingLeft()}/${rows[tables]} of ${table} table`)
            // requestin pdf link
            debugger;
            let src = await send_request(
                query_pdf(id),
                (response, status, i, C) => { 
                    // return the src of the pdf
                    return window.parse_pdf_src(response);
                },
                page,
                log,
                false, // don't followAlong so we don't download the pdf twice
            );
            // downloading pdf
            log('pdf src:', src);
            debugger;
            let result = await download_pdf(
                src, 
                page, 
                tbl_path + '/' + title,
            );
            log('result', result);
            if(result){
                log('pdf downloaded');
                checklists[table].check(id);
            }
        }
    }
    
    // check how we did
    debugger;
    // if everyt checklist has less than 5 missing pdfs
    if( tables.every( table => checklists[table].missingLeft() < 4)){
        log('scrap documents finished')
        return page
    }else{ // did not pass
        log('scrap documents did not finish')
        return false;
    }
}
