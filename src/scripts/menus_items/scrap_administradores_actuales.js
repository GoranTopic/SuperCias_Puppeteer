import { write_json, mkdir, fileExists } from '../../utils/files.js';
import download_pdf from '../../utils/download_pdf.js';
import { Checklist, DiskList } from '../../progress.js';
import options from '../../options.js';
import send_request from '../../websites_code/send_request.js';
import { query_table_parameters } from '../../websites_code/queries/ABParameters.js';

export default async page => {
    // let's make our dir
    let menu_name = 'Administradores Actuales'
    // let get the paramter need to make the call the server
    let parameters = query_table_parameters(menu_name);
    console.log('parameters:', parameters)
    // let fetch the table
    let fetched_table = await send_request(
        parameters, // paramter need to make the reuqe
        // the callback, this is goin to run in the browser,
        (response, status, i, C) => {
            return response.responseText;
        },
        page,
        log
    )

    console.log('fetched_table:', fetched_table);

    /*
    fetched_table.forEach(
        table => table.cells.forEach(
            cell => {
                if(isLink( cell )) download_pdf(pdf)
            }
        )
    )
    */

    // retunr for debuggin porposes
    return false;
}
