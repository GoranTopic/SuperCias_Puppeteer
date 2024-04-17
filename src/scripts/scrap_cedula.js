/* this script will take a cedula and return the suggestion of names that match this cedula */
import parseToJSON from '../utils/parseToJson.js';

const scrap_cedula = async browser => {
    // get page
    let page = (await browser.pages())[0];
    // set function to scrap the tables
    let data = await page.evaluate( async () => {
        // the second paramete is the table index
        // 0 is the index of this table is the administrador actual
        let administrador_actual = await window.scrap_table('.z-groupbox-3d', 0);
        // 1 is the index of this table is the accionista actual
        let accionista_actual = await window.scrap_table('.z-groupbox-3d', 1);
        // 2 it the index fo this table is the administradores anteriores
        let administradores_anteriores = await window.scrap_table('.z-groupbox-3d', 2);
        // 3 is the index of this table is the accionista anteriores
        let accionista_anteriores = await window.scrap_table('.z-groupbox-3d', 3);
        // skip 4th as it is a hidden field
        //  5 is the index of this table is the accionista extranjeras
        let accionista_extrajeras = await window.scrap_table('.z-groupbox-3d', 5);
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

    console.log('administrador_actual', administrador_actual)
    console.log('data', data)
    // administrador_actual 
    administrador_actual = administrador_actual
        .map(t => parseToJSON(t, 12))
        .reduce((a, c) => a.concat(c))
    // accionista_actual
    accionista_actual = accionista_actual
        .map(t => parseToJSON(t, 8))
        .reduce((a, c) => a.concat(c))
    // administradores_anteriores
    administradores_anteriores = administradores_anteriores
        .map(a => parseToJSON(a, 12))
        .reduce((a, c) => a.concat(c))
    // accionista_anteriores
    accionista_anteriores = accionista_anteriores
        .map(a => parseToJSON(a, 4))
        .reduce((a, c) => a.concat(c))
    // accionista_extrajeras
    accionista_extrajeras = accionista_extrajeras
        .map(a => parseToJSON(a, 3))
        .reduce((a, c) => a.concat(c))
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

