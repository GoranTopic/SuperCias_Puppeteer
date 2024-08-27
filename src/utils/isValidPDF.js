import { PDFDocument } from 'pdf-lib';

async function isValidPDF(buffer) {
    try {
        // get the size of the buffer
        const size = buffer.length;
        console.log('Size:', size);
        if (size <= 68) {
            // If the buffer is empty, it is not a valid PDF
            return false;
        }
        const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true } );
        // If the PDF loads without throwing an error, it is likely a valid PDF
        return true;
    } catch (error) {
        console.error('Error checking the file storage:', error);
        // If an error is thrown during loading, it is not a valid PDF
        return false;
    }
}

export default isValidPDF;