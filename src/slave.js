import scrap_company from './scripts/scrap_company.js';
import Slaver from 'slavery-js';
import 

Slaver({
    host: 'localhost',
    port: 3000,
    numberOfSlaves: 1,
}).slave({
    'setup': async (slave) => {
    },
    'scrap': async (params, slave) => {
        let { company, proxy } = params;
        let data = await scrap_company({ company, proxy: null });
        return data;
    },
    'cleanup': async (slave) => {
        
    }
});

