import { mkdir } from '../../utils/files.js';
import sanitize from '../../utils/sanitizer.js';
import send_request from '../../../reverse_engineer/send_request.js';
import { query_table_change } from '../../../reverse_engineer/queries/query_table_change.js';
import scrap_pdf_row from './scrap_documents_pdf_row.js';



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
        //debugger
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

    // don't try to scrap if the are no documents
    if(rows[table] === 0) return true
    // let make update the path 
    mkdir(path);

    if(rows[table] > 10){
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
    }

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
        let outcome = await scrap_pdf_row(
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

export default scrap_table;
