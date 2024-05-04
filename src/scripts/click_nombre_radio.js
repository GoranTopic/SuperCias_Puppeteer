import fire_command from '../reverse_engineering/fire_command.js';
import { jsonrepair } from 'jsonrepair'
/* click on nombre radio button */
const click_nombre_radio = async browser => {
    // get page
    let res = await fire_command(browser, {
        selector: '.z-radiogroup > span:nth-child(2) > input',
        command: 'onCheck',
        input_1: true,
        input_2: { toServer: undefined },
        input_3: undefined,
    });
    // repair json
    res = jsonrepair(res);
    let data = JSON.parse(res);
    data = data.rs[0][0]
    if(data === 'focus'){
        return browser;
    } else {
        throw new Error('Error click_nombre_radio');
        return browser;
    }
}


export default click_nombre_radio;
