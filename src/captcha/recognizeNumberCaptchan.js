import { createWorker } from 'tesseract.js';

let worker = null;
let isReady = null;

const createRecognizer = async () => {
    if (worker === null) {
        worker = await createWorker('eng', {
            tessedit_char_whitelist: '0123456789',
            preserve_interword_spaces: 0,
            tessedit_pageseg_mode: 5,
        })
        isReady = true
    }
    return true
}

const recognizeCaptchan = async img => {
    if (isReady) {
        const { data: { text }, } = await worker.recognize(img);
        return text.trim()
    } else {
        throw new Error('Tesseract.js is not ready')
    }
}

const  terminateRecognizer = async () => {
    if (isReady) {
        await worker.terminate();
        isReady = false;
    }
}

export { createRecognizer, recognizeCaptchan , terminateRecognizer }
