import fitz  # PyMuPDF
import pytesseract
from pdf2image import convert_from_path
from PIL import Image
import os
import io

def extract_text_from_pdf(pdf_filename):
    # print current working direcotry
    # Open the PDF file
    pdf_document = fitz.open( pdf_filename )
    text = ""
    # Loop through each page in the PDF
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
                byteImageIO = io.BytesIO(image_bytes)
                image = Image.open(byteImageIO)
                
                # Use pytesseract to do OCR on the image on spanish 
                text += pytesseract.image_to_string(image, lang='spa')
        else:
            # If no images, extract text as usual
            text += page.get_text()

    return text

# Example usage
pdf_filename = "./storage/pdfs/1790721450001_DocumentosGenerales_Oficio Nombramiento Administradores_2020-09-04_ALVERNIA DE CHACON IMELDA_PRESIDENTE.pdf"

text = extract_text_from_pdf(pdf_filename)

print(text)