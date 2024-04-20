import fire_command from '../reverse_engineering/fire_command.js';
import { jsonrepair } from 'jsonrepair'

/* this script will take a cedula and return the suggestion of names that match this cedula */
const scrap_suggestions = async (browser, str) => {
    // get the suggestions
    let res = await fire_command(browser, {
        zk_id: 'comboNombres',
        command: 'onChanging',
        input_1: { value: str, start: str.length }, 
        input_2: { ignorable: 1, rtags: { onChanging: 1 }}, 
        input_3: 5,
    });
    // repair the json
    res = jsonrepair(res);
    // parse this response
    let data = JSON.parse(res);
    // filter by the frist element of the list of the list
    data = data['rs'].filter( x => x[0] === 'addChd');
    // if there is no data
    if( data.length === 0 ) return [];
    // get inner array
    data = data[0][1];
    //console.log('data:', data);
    // remove first element
    data.shift();
    // map every label
    data = data.map(([[,,{label}]]) => label);
    // clean the data
    data = data.map( x => x.split('|').map( x => x.trim()) );
    // if array has two elements then the first is a cedula
    // the second is a nombre, else if it only has one,
    // the first is a nombre
    data = data.map( d => 
        d.length === 2? 
        { cedula: d[0], nombre: d[1] }:
        { cedula: '', nombre: d[0] }
    );
    // return the data
    return data;
}

export default scrap_suggestions;
