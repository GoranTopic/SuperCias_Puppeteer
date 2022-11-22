import { createWorker } from 'tesseract.js';

let worker = null;
let isReady = null;

if(worker === null){
    worker = createWorker()
    isReady = false
    // Called as early as possible
    await worker.load()
    await worker.loadLanguage("eng")
    await worker.initialize("eng")
    await worker.setParameters({
        tessedit_char_whitelist: '0123456789',
        preserve_interword_spaces: 0,
        tessedit_pageseg_mode: 5,
    });
    isReady = true
}

const recognizeNumbers = async img  => {
    if(isReady){
        const {
            data: { text },
        } = await worker.recognize(img)
        return text.trim()
    }
}

const  terminateRecognizer = worker.terminate

export { recognizeNumbers, terminateRecognizer }
