import sanitize from '../../utils/sanitizer.js';
import send_request from '../../../reverse_engineer/send_request.js';
import { query_table_change } from '../../../reverse_engineer/queries/query_table_change.js';
import scrap_pdf_row from './scrap_documents_pdf_row.js';
import waitForNetworkIdle from '../../utils/waitForNetworkIdle.js';
import options from '../../options.json' assert { type: 'json' };


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
const scrap_table = async (table, rows, checklists, page, company, console) => {
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
            page,
            console
        )
        // query rows from new table
        // getting number of rows
        rows[table] = await page.evaluate(table =>
            PrimeFaces.widgets['tbl' + table].cfg.paginator.rowCount,
            table
        );
    }
    console.log(`rows[${table}]: ${rows[table]}`);

    // add filters to the table
    console.log('adding filters table')
    await page.evaluate(({ table, filters }) => {
        // get filters values
        Object.values(filters).forEach((value, i) => {
            if (PrimeFaces.widgets['tbl' + table].sortableColumns[i])
                PrimeFaces.widgets['tbl' + table].sortableColumns[i].childNodes[3].value = value
        });
        PrimeFaces.widgets['tbl' + table].filter();
    }, { table, filters: options.documents[table].filters })

    // wait for table to load
    await waitForNetworkIdle(page, 1000);

    // don't try to scrap if the are no documents
    if(rows[table] === 0) return true
    // let make update the path 

    if (rows[table] > 10) {
        // get all rows
        console.log('sending query for rows all')
        await page.evaluate( ({ table, rows }) => { // paginator
                return PrimeFaces
                    .widgets['tbl' + table]
                    .paginator
                    .setRowsPerPage(rows)
            }, { table, rows: rows[table] }
        )
    }

    // wait for table to load
    await waitForNetworkIdle(page, 1000);

    // extract rows in table
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
    
    let downloaded = [];
    // loop over every pdf
    for (let { id, title } of pdfs_info) {
        // if we alread have it, skip it
        let pdf_filename = options.files_path + company.ruc + '_' + table + '_' + title + '.pdf';
        if (checklists[table].isChecked(id)) downloaded.push(pdf_filename);
        console.log(`Downloading pdf ${checklists[table].missingLeft()}/${rows[table]} of ${table} in ${company.name} title: ${title}`)
        let outcome = await scrap_pdf_row(
            id,
            page,
            pdf_filename,
            console
        );
        if (outcome) {
            checklists[table].check(id);
            downloaded.push(pdf_filename);
            console.log('Downloaded');
        } else 
            console.log('not downloaded');
        // wait for good luck
        await waitForNetworkIdle(page, 1000);
    }
    return downloaded;
}

export default scrap_table;
