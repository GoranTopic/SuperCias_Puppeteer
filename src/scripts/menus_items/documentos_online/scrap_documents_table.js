import Checklist from 'checklist-js';
import sanitize from '../../../utils/sanitizer.js';
import waitForNetworkIdle from '../../../utils/waitForNetworkIdle.js';
import send_request from '../../../reverse_engineer/send_request.js';
import { query_table_change } from '../../../reverse_engineer/queries/query_table_change.js';
import scrap_pdf_row from './scrap_documents_pdf_row.js';
import options from '../../../options.js';

/**
 * scrap_table.
 * this script will scrap a table of pdfs
 *
 * @param {} table
 * @param {} checklists
 * @param {} page
 * @param {} company
 */
const scrap_table = async (table, checklists, page, company) => {
    // switch table tab let's change the tab and get the total number of rows, 
    // except if it is the general row, in which case it is 
    console.log(`scraping ${table} Table`);


    if (table !== 'DocumentosGenerales') {
        // If it is not the general table, we need to change the table
        // and get the total number of rows
        //debugger
        let result = await send_request(
            query_table_change(table), // paramter need to make the request
            // the callback, this is going to run in the browser,
            (response, status, i, C) => response,
            // the page
            page,
            console
        )
        // number of results
        console.log(`number of rows for ${table}: ${result}`)
    }
    // query rows from new table
    // getting number of rows
    let rows = await page.evaluate(table =>
        PrimeFaces.widgets['tbl' + table].cfg.paginator.rowCount,
        table
    );
    console.log(`rows: ${rows}`);

    // add filters to the table
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
    if(rows === 0) return true
    // let make update the path 


    let pdfs_rows_info = [];
    // if there are more than 10 pdfs, we need to query for all of them
    if (rows > 10) { 
        // extract all of the rows in table
        pdfs_rows_info = await page.evaluate(async ({ table, rows }) =>
            // wait until the rows are loaded and the row we got in the html 
            // are the same as the rows in the paginator
            await window.query_all_pdfs({ table, rows }),
            { table, rows }
        );
    } else { 
        // if there are less then 10 pdfs, we can just extract the rows
        pdfs_rows_info = await page.evaluate( ({ table }) =>
            window.parse_table_html('tab' + table),
            { table }
        )
    }

    // make the checklist for the pdfs rows
    // for every table we will have a checklist of pdfs
    checklists[table] = new Checklist( pdfs_rows_info, {
        name: table + ' pdfs for ' + company.ruc,
        path: './storage/checklists',
    })
    
    // the number of rows
    console.log('pdfs_info:', pdfs_rows_info.length);

    // sanitize the rows title and ids of the pdfs
    pdfs_rows_info = pdfs_rows_info.map( pdf => ({
        title: sanitize(pdf.title),
        id: pdf.id, // don't sanitize id
    }))
    
    let downloaded = [];
    // loop over every pdf
    for (let pdf_row of pdfs_rows_info) {
        let id = pdf_row.id;
        let title = pdf_row.title;
        // if we alread have it, skip it
        let pdf_filename = company.ruc + '_' + table + '_' + title + '.pdf';
        if (checklists[table].isChecked(id)) downloaded.push(pdf_filename);
        console.log(`Downloading pdf ${checklists[table].missingLeft()}/${rows} of ${table} in ${company.name} title: ${title}`)
        let outcome = await scrap_pdf_row(
            id,
            page,
            pdf_filename,
            console
        );
        if (outcome) {
            checklists[table].check(pdf_row);
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
