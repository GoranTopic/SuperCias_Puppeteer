export default () => {
    /* this is the place where we define some usefull function to have in the browser side */   

    window.parser = new DOMParser();

    window.parse_html_str = html_str =>
        window.parser.parseFromString(html_str, 'text/html');

    window.get_captchan_src = htmlDoc => {
        console.log('htmlDoc:', htmlDoc);
        window.htmlDoc = htmlDoc;
        let src = htmlDoc.getElementById('frmCaptcha:captchaImage')?.src;
        if(!src) src = htmlDoc.getElementById('frmBusquedaCompanias:captchaImage')?.src;
        if(!src) console.log("Could not get captchan src")
        return src;
    }

    window.readFileAsync = file =>
        new Promise( async (resolve, reject) => {
            let reader = new FileReader();
            reader.onload = () => { resolve(reader.result); };
            reader.onerror = reject;
            reader.readAsBinaryString(file);
        })

    /**
     * window.to_binary_string.
     * converts an image to a binary string, so that it can be send to puppetter
     *
     * @param {binary obj} image, 
     */
    window.to_binary_string = async image => {
        const data = await image.blob();
        console.log("data:", data)
        // let change this function to be mote clear
        let result = await window.readFileAsync(data);
        console.log("result:", result)
        return result;
    }

    window.run_str_func = async func_str =>
        new Promise((resolve, reject) => {
            eval("("+func_str+")(response, status, i, C)");
        })

    /**
     * window.parse_table. 
     * this function read from the tables in the window, 
     * returns the tables 
     *
     * @param String table_id,
     * It is the key of how the table is stored in PrimeFaces.widgets obj
     *
     * for Example: 
     *  PrimeFaces.widgets['tblDocumentosGenerales'].rows
     *
     * Posible values:
     *  'tblDocumentosGenerales'
     *  'tblDocumentosEconomicos'
     *  'tblDocumentosJuridicos'
     *
     *  then it, parses the html to the id and the title of the pdf document
     *
     *  returns an array with the id of the pdf and the title
     */
    window.parse_table = table_id => {
        let rows = PrimeFaces.widgets[table_id].rows; 
        let table = [];
        for(let row of rows){
            let doc = {title:"", id:""};
            for(let cell of row.cells){
                if(cell.innerText) 
                    doc.title += cell.innerText + "_";
                else if(cell.children[0]?.children[0]?.id)
                    doc.id = cell.children[0].children[0].id; 
            }
            table.push(doc)
        }
        return table;
    }


    /**
     * extract_number_of_pdfs
     * from a response, looks for the tags and extracts the number of rows a pdf has 
     * it relies on a span tag in the paginator
     *
     * @param {} response
     * @param {} table
     */
    /**
     * window.extract_number_of_pdfs.
     *
     * @param {} response
     * @param {} table
     */
    window.extract_number_of_pdfs = (response, table, validar = false) => {
        let nameTabla = !validar ? ':tabViewDocumentacion' : '';
        // let's parse the html respose
        let html = window.parse_html_str(response.responseText);
        // let get the update from the table's 
        let paginator_el = html
            .getElementById(`frmInformacionCompanias${nameTabla}:tbl${table}_paginator_bottom`);
        // check
        if(!paginator_el) {
            console.error(`Could not extract number of pdfs from table: ${table}`)
            return null;
        }
        // get the number of rows
        let rows_span = paginator_el
            .getElementsByTagName('span')[0]
            .innerHTML
            .split(' ')[2]
        // parse the number
        let rows_int = Number.parseInt(rows_span);
        // success
        return rows_int;
    }

    window.parse_table_html = table_id => {
        // get the table
        let table = document.getElementById( `frmInformacionCompanias:${table_id}`);
        if(table === undefined) return false
        // get all the rows
        let rows = document.evaluate(
            './/tr[@class="ui-widget-content ui-datatable-even"] | .//tr[@class="ui-widget-content ui-datatable-odd"]', 
            table
        );
        let parsed_rows = [];
        // let get the title and id
        let row = rows.iterateNext();
        while(row){
            // complicated code for gettin the last cell of the pdf row, the one with the link
            let id = row.children[row.children.length -1].children[0].children[0].id;
            let title = '';
            let date = '';
            for( let cell of row.children )
            {
                let strCell = cell.innerText.trim();
                let dateRecord = strCell.length > 5 ? new Date(strCell) : '';
                if (dateRecord instanceof Date && !isNaN(dateRecord) && date == '') {
                    date = strCell;
                } 
                title += ('_' + strCell)
            }
                
            title = title
                .replace(/^_+/, '')
                .replace(/_+$/, '')
                .trim()
            parsed_rows.push({ title, id, date});
            row = rows.iterateNext();
        }
        return parsed_rows;
    }

    /**
     * window.check_for_captchan.
     *
     * @param {} html
     */
    window.check_for_captchan = html => {
        let extension = html.getElementsByTagName('extension')
        if(extension.length){ // if got captchan
            extension = extension[0].innerText;
            // did we ger capthan?
            if(JSON.parse(extension).presentarPopupCaptcha) return true
        }
        return false;
    }


    /**
     * window.parse_pdf_src.
     *  this function take the response from the server when query_pdf_link is send, 
     *  it parses the response and return only the pointing to the pdf.
     *
     * @param {String} response
     * Response obj from the server
     */
    window.parse_pdf_src = response => {
        let pdf_url = null;
        //let check the extension for the pdf src
        let html = window.parse_html_str(response.responseText);
        // get extesnion
        let extension = JSON.parse(
            html.getElementsByTagName('extension')[0].innerText
        );
        pdf_url = extension.urlDocumentoPdf
        if(pdf_url) 
            return pdf_url;
        // other aproach
        let extension_tag = response.responseText
            .split('<extension ln="primefaces" type="args">')[1]
            .split('</extension>')[0];
        let extension_obj = JSON.parse(extension_tag);
        if(extension_obj.urlDocumentoPdf) 
            return extension_obj.urlDocumentoPdf
        else
            console.error('Could not find the document url from the extension');
        // todo: write more code in case the url was not there 
        return null;
    }

}
