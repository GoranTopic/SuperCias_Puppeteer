import sanitize from '../../utils/sanitizer.js';
import send_request from '../../../reverse_engineer/send_request.js';
import { query_table_change } from '../../../reverse_engineer/queries/query_table_change.js';
import scrap_pdf_row from './scrap_documents_pdf_row.js';
import waitForNetworkIdle from '../../utils/waitForNetworkIdle.js';

/**
 * scrap_table.
 * this is the piece of the strip that script that handle scraping a table o rows
 *
 * @param {} table
 * @param {} rows
 * @param {} checklists
 * @param {} page
 * @param {} company
 */
const scrap_table = async (table, rows, checklists, page, company) => {
    // switch table tab let's change the tab and get the total number of rows, 
    // except if it is the general row, in which case it is 
    console.log(`scraping ${table} Table`);
    if (rows[table] !== 'DocumentosGenerales') {
        //debugger
        let result = await send_request(
            query_table_change(table), // paramter need to make the request
            // the callback, this is going to run in the browser,
            (response, status, i, C) => response, 
            // the page
            page
        )
        // query rows from new table
        // getting number of rows
        rows[table] = await page.evaluate(table =>
            PrimeFaces.widgets['tbl' + table].cfg.paginator.rowCount,
            table
        );
    }
    console.log(`rows[${table}]: ${rows[table]}`);

    // don't try to scrap if the are no documents
    if(rows[table] === 0) return true
    // let make update the path 

    if(rows[table] > 10){
        // get all rows
        console.log('sending query for rows all')
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
        await waitForNetworkIdle(page, 1000);

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
    checklists[table].add(
        pdfs_info.map(pdf => pdf.id),
    );

    // loop over every pdf
    for(let { id, title } of pdfs_info){
        // if we alread have it, skip it
        if(checklists[table].isChecked(id)) continue;
        console.log(`Downloading pdf ${checklists[table].missingLeft()}/${rows[table]} of ${table} in ${company.name} title: ${title}`)
        let outcome = await scrap_pdf_row( id, title, page,);
        if(outcome) {
            checklists[table].check(id);
            console.log('Downloaded');
        }else{
            console.log('not downloaded');
        }
        // wait for goot luck
        await waitForNetworkIdle(page, 1000);
    }
}

export default scrap_table;
