import fitz  # PyMuPDF
import pytesseract
from pdf2image import convert_from_path
from PIL import Image
import io

def extract_text_from_pdf(pdf_filename):
    # Open the PDF file
    pdf_document = fitz.open( pdf_filename )
    text = ""

    for page_num in range(pdf_document.page_count):
        page = pdf_document[page_num]
        
        # Extract images from the page
        image_list = page.get_images(full=True)
        
        # If there are images, use OCR to extract text
        if image_list:
            for image_index, img in enumerate(page.get_images(full=True)):
                xref = img[0]
                base_image = pdf_document.extract_image(xref)
                image_bytes = base_image["image"]

                # Convert to a PIL Image
                image = Image.open(io.BytesIO(image_bytes))
                
                # Use pytesseract to do OCR on the image on spanish 
                text += pytesseract.image_to_string(image, lang='spa')
        else:
            # If no images, extract text as usual
            text += page.get_text()

    return text