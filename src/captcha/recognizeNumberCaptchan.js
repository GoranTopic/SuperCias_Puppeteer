import { createWorker } from 'tesseract.js';

let worker = null;

const createRecognizer = async () => {
    worker = await createWorker('eng', {
        tessedit_char_whitelist: '0123456789',
        preserve_interword_spaces: 0,
        tessedit_pageseg_mode: 5,
    })
    return true
}

const recognizeCaptchan = async img => {
    if (worker === null) {
        worker = await createWorker('eng', {
            tessedit_char_whitelist: '0123456789',
            preserve_interword_spaces: 0,
            tessedit_pageseg_mode: 5,
        })
        const { data: { text }, } = await worker.recognize(img);
        return text.trim()
    } else {
        const { data: { text }, } = await worker.recognize(img);
        return text.trim()
    }
}

const  terminateRecognizer = async () => {
    if (worker){
        await worker.terminate();
    }
}

export { createRecognizer, recognizeCaptchan , terminateRecognizer }
