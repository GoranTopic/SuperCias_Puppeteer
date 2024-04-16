/* this script will take a cedula and return the suggestion of names that match this cedula */
import parseToJSON from '../utils/parseToJson.js';

const scrap_cedula = async browser => {
    // get page
    let page = (await browser.pages())[0];
    // set function to scrap the tables
    let data = await page.evaluate( async () => {
        // set the function to get the paginator
        const getPaginator = (selector, t_index) => {
            // get current table element
            let table_el = $(selector).eq(t_index);
            // find if it has pagination
            let pagination_el = table_el.find('.z-paging')[0];
            // get the pagination element 
            let pagination = zk.Widget.$(pagination_el);
            //return paginator
            return pagination;
        }

        // set the function to wait for the table to change
        const forChange = (current_innertext, selector, t_index) => {
            return new Promise((resolve, reject) => {
                let interval = null;
                let timeout = null;
                // check function
                interval = setInterval(() => {
                    let new_innertext = $(selector).eq(t_index)['0'].innerText
                    if (current_innertext !== new_innertext) {
                        clearInterval(interval);
                        clearTimeout(timeout);
                        resolve(new_innertext);
                    }
                }, 100);
                // timeout function
                timeout = setTimeout(() => {
                    clearInterval(interval)
                    clearTimeout(timeout)
                    console.log('rejected! table change')
                    reject('timeout')
                }, 5000) // five se
            }) //.catch(e => e)
        }

        // set function to scrap the tables
        let scrap_table  = async (selector, t_index) => {
            // tables go here
            let data = [];
            // get current table element
            let table_el = $(selector).eq(t_index);
            // find if it has pagination
            let pagination_el = table_el.find('.z-paging')[0];
            // get number of pages
            let num_pages = parseInt(
                pagination_el
                .textContent
                .split('/')[1]
                .trim()
                .split(' ')[0]
            );
            // get the pagination element 
            let pagination = zk.Widget.$(pagination_el);
            // for the number of pages fire the next page
            let getting_tables = true;
            let current_page = 1;
            // get the fidt inner text
            let current_table = $(selector).eq(t_index)['0'].innerText
            data.push(current_table)
            while (getting_tables) {
                // if the current_page is smaller than the num_pages
                if (current_page < num_pages) {
                    //console.log('this table needs to change: ', current_table)
                    //console.log('firing for page', current_page)
                    //wait for a second
                    pagination = getPaginator(selector, t_index);
                    pagination.fire('onPaging', current_page);
                    // await until the page has changed
                    let res = await forChange(current_table, selector, t_index)
                    // console.log('result table:', res);
                    if (res) {
                        data.push(res)
                        current_table = res;
                    } else console.error('timeout!')
                    current_page++;
                } else {
                    getting_tables = false
                }
            }
            return data;
        }

        let administrador_actual = await scrap_table('.z-groupbox-3d', 0);
        //administrador_actual = administrador_actual
        //.map(t => parseToJSON(t, 12))
        //.reduce((a, c) => a.concat(c))
        let accionista_actual = await scrap_table('.z-groupbox-3d', 1);
        //accionista_actual = accionista_actual
        //.map(t => parseToJSON(t, 8))
        ///.reduce((a, c) => a.concat(c))
        // 2 it the index fo this table
        let administradores_anteriores = await scrap_table('.z-groupbox-3d', 2);
        //administradores_anteriores = administradores_anteriores
        //.map(a => parseToJSON(a, 12))
        //.reduce((a, c) => a.concat(c))
        let accionista_anteriores = await scrap_table('.z-groupbox-3d', 3);
        //accionista_anteriores = accionista_anteriores
        //.map(a => parseToJSON(a, 4))
        //.reduce((a, c) => a.concat(c))
        // skip 4th as it is a hidden field
        let accionista_extrajeras = await scrap_table('.z-groupbox-3d', 5);
        //accionista_extrajeras = accionista_extrajeras
        //.map(a => parseToJSON(a, 3))
        //.reduce((a, c) => a.concat(c))
        // return all 
        return { 
            administrador_actual,
            accionista_actual,
            administradores_anteriores,
            accionista_anteriores,
            accionista_extrajeras
        }
    })
    let { administrador_actual, 
        accionista_actual, 
        administradores_anteriores,
        accionista_anteriores,
        accionista_extrajeras } = data;

    console.log('accionista_anteriores', accionista_anteriores);

    // administrador_actual 
    administrador_actual = administrador_actual
        .map(t => parseToJSON(t, 12))
        .reduce((a, c) => a.concat(c))
    console.log('administrador_actual', administrador_actual);
    // accionista_actual
    accionista_actual = accionista_actual
        .map(t => parseToJSON(t, 8))
        .reduce((a, c) => a.concat(c))
    console.log('accionista_actual', accionista_actual);
    // administradores_anteriores
    administradores_anteriores = administradores_anteriores
        .map(a => parseToJSON(a, 12))
        .reduce((a, c) => a.concat(c))
    console.log('administradores_anteriores', administradores_anteriores);
    // accionista_anteriores
    accionista_anteriores = accionista_anteriores
        .map(a => parseToJSON(a, 4))
    console.log('accionista_anteriores1', accionista_anteriores);
    accionista_anteriores = accionista_anteriores
        .reduce((a, c) => a.concat(c))
    console.log('accionista_anteriores1', accionista_anteriores);
    // accionista_extrajeras
    accionista_extrajeras = accionista_extrajeras
        .map(a => parseToJSON(a, 3))
        .reduce((a, c) => a.concat(c))
    console.log('accionista_extrajeras', accionista_extrajeras);

    // return all
    return { 
        administrador_actual,
        accionista_actual,
        administradores_anteriores,
        accionista_actual,
        accionista_extrajeras 
    }
}

export default scrap_cedula;

