import fire_command from '../reverse_engineering/fire_command.js';
import { jsonrepair } from 'jsonrepair'
import { consulta_personal } from '../urls.js';

/* this script will take a cedula and return the suggestion of names that match this cedula */
const select_cedula = async (browser, persona) => {
    // get the page
    let page = (await browser.pages())[0];
    // if the cedula is not defined, we will use the nombre
    let value = persona.cedula? persona.cedula : persona.nombre;

    // make the suggestion for the request
    let res = await fire_command(browser, {
        zk_id: 'comboNombres',
        command: 'onChanging',
        input_1: { value, start: value.length }, 
        input_2: { ignorable: 1, rtags: { onChanging: 1 }}, 
        input_3: 5,
    });
    // clean the response
    res = jsonrepair(res);
    res= JSON.parse(res);
    res = res['rs'].filter( x => x[0] === 'addChd')[0][1];
    res = res[1][0];
    // get the uuid and label of the suggestion
    let uuid =  res[1];
    let label = res[2].label;

    // select the cedula, this will change the page
    await page.evaluate(({uuid, label}) => {
        let html_el = zk.Widget
            .getElementsById('comboNombres')[0]
        // get the widget element                       
        let widget_el = zk.Widget.$(html_el);
        // create the combobox
        let combo = new zul.inp.Combobox();
        // add values
        combo._label = label;
        combo._nodeSolved = true;
        combo.desktop = zk.Desktop;
        combo.parent = widget_el;
        combo.uuid = uuid;
        // fire select command
        widget_el.fire(
            "onSelect", {
                items: [combo],
                reference: combo,
            },
            null,
            null
        )
    }, {uuid, label});
    // wait for the page to load
    await page.waitForNavigation({waitUntil: 'networkidle0'});
    // return result
    return page;
}

export default select_cedula;
