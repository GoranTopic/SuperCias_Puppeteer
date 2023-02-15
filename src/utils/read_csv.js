import fs from 'fs'
import csv from 'csv-parser';

const read_csv = async csv_file => 
    await new Promise( (res, rej) => {
        const results = [];
        fs.createReadStream(csv_file)
            .pipe(csv())
            .on('data', (data) => {
                results.push(data);
            })
            .on('end', () => {
                res(results);
            });
    });
