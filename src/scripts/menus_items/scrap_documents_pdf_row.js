import download_pdf from '../../utils/download_pdf.js';
import send_request from '../../../reverse_engineer/send_request.js';
import query_pdf from '../../../reverse_engineer/queries/submit_company_search_captchan.js';

const scrap_row = async (id, title, table, rows, page, path, log ) =>
    // set a time out for 4 minutes, to proces the pdf
    await new Promise( async (resolve, reject) => {
        let time_out = setTimeout(() => {
            log('pdf request timed out');
            reject(false);
        }, 60 * 1000 * 4) // set timed out to 4 minutes
        // requestin pdf link
        //debugger;
        //try{
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
        log(`src: ${src}`);
        // downloading pdf
        //debugger;
        let pdf_str = await download_pdf(
            src,
            page,
            path + '/' + title,
        );
        clearTimeout(time_out);
        resolve(pdf_str);
        /*
         * }catch(e){
            console.error(e);
            clearTimeout(time_out);
            reject(false);
    }
    */
    });

export default scrap_row;
