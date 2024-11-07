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
        try:
            osd = pytesseract.image_to_osd(image)
            angle = int(osd.split('\n')[2].split(': ')[1])
            image = image.rotate(angle, expand=True)
        except pytesseract.pytesseract.TesseractError:
            pass
        # use tessaract to extract text
        text += pytesseract.image_to_string(image, lang='spa')
    return text
