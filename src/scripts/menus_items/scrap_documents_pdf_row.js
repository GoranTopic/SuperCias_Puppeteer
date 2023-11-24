import download_pdf from '../../utils/download_pdf.js';
import send_request from '../../../reverse_engineer/send_request.js';
import query_pdf from '../../../reverse_engineer/queries/submit_company_search_captchan.js';

const scrap_row = async (id, title, page,) =>
    // set a time out for 4 minutes, to proces the pdf
    await new Promise(async (resolve, reject) => {
        let time_out = setTimeout(() => {
            log('pdf request timed out');
            reject(false);
        }, 60 * 1000 * 4) // set timed out to 4 minutes
        // requestin pdf link
        let src = await send_request(
            query_pdf(id),
            (response, status, i, C) => {
                // return the src of the pdf
                return window.parse_pdf_src(response);
            },
            page,
            false, // don't followAlong so we don't download the pdf twice
        );
        log(`src: ${src}`);
        // downloading pdf
        let pdf_str = await download_pdf(
            src,
            page,
            title,
        );
        clearTimeout(time_out);
        resolve(pdf_str);
    });

export default scrap_row;
