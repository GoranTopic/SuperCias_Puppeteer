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
     * this function read from the tables in the windows, 
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


    window.parse_table_html = table_id => {
        // get the table
        let table = document.getElementById(
            `frmInformacionCompanias:tabViewDocumentacion:${table_id}`
        );
        // get all the rows
        let rows = document.evaluate(
            './/tr[@class="ui-widget-content ui-datatable-even"] | .//tr[@class="ui-widget-content ui-datatable-odd"]', 
            table
        );
        let parsed_rows = [];
        // let get the title and id 
        let row = rows.iterateNext();
        while(row){
            // complicated code for gettin the last cell of the pdf row, the one with the button
            let id = row.children[row.children.length -1].children[0].children[0].id; 
            let title = '';
            for( let cell of row.children ) 
                title += ('_' + cell.innerText)
            title = title
                .replace(/^_+/, '')
                .replace(/_+$/, '')
                .trim()
            parsed_rows.push({ title, id });
            row = rows.iterateNext();
        }
        return parsed_rows;
    }


    /**
     * windows.parse_pdf_src.
     *  this function take the response from the server when query_pdf_link is send, 
     *  it parses the response and return only the pointing to the pdf.
     *
     * @param {String} response
     * Response obj from the server
     */
    window.parse_pdf_src = response => {
        let response_html_str = response.responseText;
        let html = window.parse_html_str(response.responseText);

        let extension_tag = response_html_str.responseText
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
