import Slavery from 'slavery-js';
import Checklist from 'checklist-js';
import { getRucsToScrap, makeFileStorage } from './init.js';
import isValidPDF from './utils/isValidPDF.js';

const check_pdf = async pdf => {
    /* Check the pdf file */
    const filename = pdf.metadata.filename;
    console.log('Filename:', filename);
    // split the filename by '-'
    const [ ruc, table, title, date ] = filename.split('_');
    console.log('RUC:', ruc);
    console.log('table:', table);
    console.log('Title:', title);
    console.log('Date:', date);
    // make a checklist
    let checklist = new Checklist(null, {
        name: table + ' pdfs for ' + ruc,
        path: './storage/checklists',
    });
    // check if the title and date is in the checklist
    if(! title +'_'+ date  in checklist.getValues()){
        console.log('Adding to checklist:', title +'_'+ date);
        checklist.add(title +'_'+ date);
    }
    // check if it is a valid pdf
    const valid = await isValidPDF(pdf.buffer);
    // if valid check 
    if(valid){
        console.log('is valid PDF:', valid);
        checklist.check(title +'_'+ date);
    }else{ //if invalid 
        console.log('is not valid PDF:', valid);
        checklist.uncheck(title +'_'+ date);
    }
}

const fileStore = await makeFileStorage();

Slavery({
    host: 'localhost',
    port: 3000,
}).master(async master => {
    console.log('Error checking the file storage');
    console.log('Getting the rucs to scrap');
    //let rucs_to_scrap = await getRucsToScrap();
    
    // all pdfs files
    console.log('Getting all files');
    let files = await fileStore.getAll();
    console.log('Files:', files.length)
    console.log('making the checklist');
    // make a checklist
    let checklist = new Checklist(
        files, {
            name: 'valid_pdf_files',
            path: './storage/checklists',
            recalc_on_check: false,
            save_every_check: 1000,
        });
    // get first file
    let file = checklist.next();
    //console.log('first file:', file);
    while(file){
        // get idle slave
        let slave = await master.getIdle()
        // send the file to the slave
        slave.run({ file })
            .then(({ file, isValid }) => {
                console.log('checking: ' + file)
                checklist.check(file, isValid);
            })
        file = checklist.next();
    }
}).slave(async ({ file }) => {
    console.log('file on slave:', file)
    // get the pdf file
    const [ pdf ] = await fileStore.get({ filename: file });
    // check the pdf file
    let isValid = await check_pdf(pdf);
    // return the file and the result
    return { file, isValid };
});

// single case
/*
const [ file ] = await fileStore.get({
    filename: '1790016919001_DocumentosGenerales_Oficio Transferencia Acciones_1988-10-17.pdf'
})
console.log('File:', file)
await check_pdf(file);
*/



/*
for (let file of files) {
}
fileStore.close();
*/
