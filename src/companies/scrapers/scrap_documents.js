import waitUntilRequestDone from '../../utils/waitForNetworkIdle.js';
import { write_json, mkdir, fileExists } from '../../utils/files.js';
import sanitize from '../../utils/sanitizer.js';
import download_pdf from '../../utils/download_pdf.js';
import { Checklist } from '../../progress.js';
import send_request from '../../websites_code/send_request.js';
import query_documentos_online from '../../websites_code/queries/query_documentos_online.js';
import query_pdf from '../../websites_code/queries/query_pdf_link.js'
import { query_table_change } from '../../websites_code/queries/query_table_change.js'
import options from '../../options.js';

let error_threshold = 2;

const scrap_row = async(id, title, table, rows, page, path, log ) => {
    // set a time out for 3 minutes, to proces the pdf
    let timeout;
    try{
        timeout = setTimeout(() => { 
            throw Error('scrap_row timed out');
        }, 1 * 1000 * 60);
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
        log('src:', src);
        // downloading pdf
        debugger;
        let pdf_str = await download_pdf(
            src, 
            page, 
            path + '/' + title,
        );
        clearTimeout(timeout);
        return pdf_str;
    }catch(e){
        console.error(e);
        clearTimeout(timeout);
        return false;
    }
}

/**
 * scrap_table.
 * this is the piece of the strip that script that handle scraping a table o rows
 *
 * @param {} table
 * @param {} rows
 * @param {} checklists
 * @param {} page
 * @param {} path
 * @param {} log
 * @param {} company
 */
const scrap_table = async (table, rows, checklists, page, path, log, company) => { 
    // switch table tab let's change the tab and get the total number of rows, 
    // except if it is the general row, in which case it is 
    log(`scraping ${table} Table`);
    if(rows[table] !== 'DocumentosGenerales'){
        debugger
        let result = await send_request(
            query_table_change(table),
            (response, status, i, C) => response,
            page,
            log,
        )
        // query rows from new table
    
        // getting number of rows
        rows[table] = await page.evaluate( table => 
            PrimeFaces.widgets['tbl'+table].cfg.paginator.rowCount, 
            table
        );
    }
    log(`rows[${table}]: ${rows[table]}`);

    // let make update the path 
    mkdir(path);

    //debugger;
    // get all rows
    log('sending query for rows all')
    let response = await page.evaluate(
        ({table, rows}) => { // paginator
            return PrimeFaces
                .widgets['tbl' + table]
                .paginator
                .setRowsPerPage(rows)            
        }, {table, rows: rows[table]}
    )

    // wait for table to load
    await waitUntilRequestDone(page, 1500);

    // extract rows in table
    ///debugger;
    let pdfs_info = await page.evaluate( table =>
        // let get a list of all pdf documents
        // note: here the value is tab + table
        // instead of the ususal tbl + table
        window.parse_table_html('tab' + table),
        table
    );

    // sanitize values
    //debugger;
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
        if(checklists[table].isCheckedOff(id)) continue;
        debugger
        log(`Downloading pdf ${checklists[table].missingLeft()}/${rows[table]} of ${table} in ${company.name} title: ${title}`)
        let outcome = await scrap_row(
            id, title, table, rows, page, path, log, 
        );
        if(outcome) {
            checklists[table].check(id);
            log('Downloaded');
        }else{
            log('not downloaded');
        }
        // wait for goot luck
        await waitUntilRequestDone(page, 1000);
    }

}

/**
 * Scrap Documents
 *
 * @param {} page
 * @param {} path
 * @param {} log
 * @param {} company
 */
export default async (page, path, log=console.log, company) => {
    // let's make our dir
    let menu_name = 'Documentacion';
    path = path + '/' + menu_name;
    mkdir(path);
    // tables to scrap
    let tables = [
        'DocumentosGenerales', 
        'DocumentosJuridicos',
        'DocumentosEconomicos' 
    ];
    // wait for page to load
    await waitUntilRequestDone(page, 2000);

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

    // checklist tables
    let tbl_checklist = new Checklist( 
        'tables_' + company.name,
        tables
    );
    
   // make checklists 
    let pdf_checklists = {};
    tables.forEach( table => 
        pdf_checklists[table] = new Checklist(
            "pdfs_" + table + '_' + company.name
        )
    );

    // let try to scrap every table =)
    for( let table of tables ){
        debugger;
        let tbl_path = path + '/' + table;
        if(!tbl_checklist.isCheckedOff(table)){
            let missing =
                await scrap_table(table, rows, pdf_checklists, page, tbl_path, log, company)
            if(missing < error_threshold) 
                tbl_checklist.check(table);
        }
    }
    
    // check how we did
    debugger;
    tables.forEach( table => 
        log(`For ${table} we got ${pdf_checklists[table].valuesDone()}/${rows[table]}`)
    );
    // if everyt checklist has less than 5 missing pdfs
    if( tables.every( table => pdf_checklists[table].missingLeft() <= error_threshold)){
        log('scrap documents finished')
        return false//page
    }else{ // did not pass
        log('scrap documents did not finish')
        return false;
    }
}
