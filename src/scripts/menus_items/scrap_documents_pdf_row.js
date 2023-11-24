import { mkdir } from 'files-js';
import download_pdf from '../../utils/download_pdf.js';
import send_request from '../../../reverse_engineer/send_request.js';
import query_pdf from '../../../reverse_engineer/queries/query_pdf_link.js';
import options from '../../options.json' assert { type: 'json' };

const scrap_row = async (id, page, path) =>
    // set a time out for 4 minutes, to proces the pdf
    await new Promise(async (resolve, reject) => {
        let time_out = setTimeout(() => {
            console.log('pdf request timed out');
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
        console.log(`src: ${src}`);
        // downloading pdf
        let pdf_str = await download_pdf(
            src, // where to download
            page,// the page to download with 
            path // where to save
        );
        clearTimeout(time_out);
        resolve(pdf_str);
    });

export default scrap_row;
