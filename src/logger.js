import chalk from 'chalk';
import moment from 'moment';

const colors = [
    'green',
    'yellow',
    'blue',
    'magenta',
    'red',
    'cyan',
    'gray',
    'greenBright',
    'yellowBright',
    'blueBright',
    'magentaBright',
    'redBright',
    'cyanBright',
]

let index = 0

const get_next_color = () => {
    if(index >= colors.length) index = 0;
    return colors[index++];
}

const log = console.log;

const make_logger = (prefix='', addTimeStamp=false, color=null) => {
    //chose color, in not specified
    if(color === null) color = get_next_color();
    // return logger function
    return (...args) => {
        let timeStamp = addTimeStamp? `[${moment().format('DD-MM-YY H:m:s')}]` : '';
        let string = [ ...args ].map( obj => JSON.stringify(obj) ).join('');
        log( chalk[color]( timeStamp + ' ' + prefix + " " + string ) );
    }
}

export { make_logger, get_next_color }
