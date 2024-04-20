import fire_command from '../reverse_engineering/fire_command.js';
import { jsonrepair } from 'jsonrepair'
import { consulta_personal } from '../urls.js';

/* this script will take a cedula and return the suggestion of names that match this cedula */
const select_cedula = async (browser, persona) => {
    // if the cedula is not defined, we will use the nombre
    let value = persona.cedula? persona.cedula : persona.nombre;
    console.log('select_cedula', value);

    // make the request to the server
    let res = await fire_command(browser, {
        zk_id: 'comboNombres',
        command: 'onChanging',
        input_1: { value, start: value.length }, 
        input_2: { ignorable: 1, rtags: { onChanging: 1 }}, 
        input_3: 5,
    });
    console.log('select_cedula', res);

    // something like this
(() => {
  let combo = new zul.inp.Combobox();

  combo._label = "0993288845001 | CARTOTUB S.A."

  let html_el = zk.Widget
    .getElementsById('comboNombres')[0]
  // get the widget element                  
  let widget_el = zk.Widget.$(html_el);
  // wiget
  widget_el.fire(
    "onSelect", {
      items: [ combo ],
      reference: combo,
    },
    null,
    null
  )
})()

}

export default select_cedula;
