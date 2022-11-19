import download_pdf from '../../utils/download_pdf.js';
import send_request from '../../websites_code/send_request.js';
import query_pdf from '../../websites_code/queries/query_pdf_link.js'

const scrap_row = async (id, title, table, rows, page, path, log ) => {
    // set a time out for 5 minutes, to proces the pdf
    try{
        // requestin pdf link
        //debugger;
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
        return pdf_str;
    }catch(e){
        console.error(e);
        return false;
    }
}

export default scrap_row;
