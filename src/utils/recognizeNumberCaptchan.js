import { createWorker } from 'tesseract.js';

const worker = createWorker()

let isReady = false
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

// Do other stuffs

const recognizeNumbers = async img  => {
		if(isReady){
				const {
						data: { text },
				} = await worker.recognize(img)
				return text.trim()
		}
}

export default recognizeNumbers
