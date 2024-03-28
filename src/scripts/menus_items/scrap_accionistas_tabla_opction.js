import sanitize from '../../utils/sanitizer.js';
import send_request from '../../../reverse_engineer/send_request.js';
import { query_table_change } from '../../../reverse_engineer/queries/query_tables_change_general.js';
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
    
    console.log(`rows[${table}]: ${rows[table]}`);

    // add filters to the table
    console.log('adding filters table')
    await page.evaluate(({ table, filters }) => {
        // get filters values
        console.log(filters);
    
        const widget = PrimeFaces.widgets['tbl' + table];
        if (widget && widget.sortableColumns) {
            Object.values(filters).forEach((value, i) => {
                if (widget.sortableColumns[i]) {
                    widget.sortableColumns[i].childNodes[3].value = value;
                }
            });
            widget.filter();
        } else {
            console.log('El widget o las columnas ordenables no están definidos correctamente.');
        }
    }, { table, filters: options.documents[table].filters });

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
    let dataTable = options.documents[table].filters;
    // extract rows in table
    let pdfs_info = [];
    pdfs_info = await page.evaluate( (table,dataTable) =>
        // let get a list of all pdf documents
        // note: here the value is tab + table
        // instead of the ususal tbl + table
        window.data_extract_table_html('tbl' + table, dataTable),
        table,
        dataTable
    );

    return pdfs_info;
}

export default scrap_table;
