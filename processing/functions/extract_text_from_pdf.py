import pytesseract
from pdf2image import convert_from_path 
import os
import io

os.environ['TESSDATA_PREFIX'] = '/usr/share/tesseract/tessdata'

def extract_text_from_pdf(pdf_filename):
    # print current working direcotry
    # Open the PDF file
    text = ""
    images = convert_from_path(pdf_filename)
    for i, image in enumerate(images):
        # rotate if needed
        osd = pytesseract.image_to_osd(image)
        angle = int(osd.split('\n')[2].split(': ')[1])
        image = image.rotate(angle, expand=True)
        # use tessaract to extract text
        text += pytesseract.image_to_string(image, lang='spa')
    return text

# Example usage for testing purposes
pdf_filename = "./storage/pdfs/1790721450001_DocumentosGenerales_Oficio Nombramiento Administradores_2020-09-04_ALVERNIA DE CHACON IMELDA_PRESIDENTE.pdf"
text = extract_text_from_pdf(pdf_filename)
print(text)