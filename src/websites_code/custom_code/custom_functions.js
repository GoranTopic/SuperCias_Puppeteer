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
     * parses tables, of online documents
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
     *  then it
     *
     *  returns a table object
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

}
