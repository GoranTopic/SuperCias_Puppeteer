import os
from pdfminer.high_level import extract_pages
from pdfminer.layout import LTTextContainer 

def get_y_axis_lines(page_layout):
    # get all the elements that are on the same y0 position
    same_y_axis = {}
    for element in page_layout:
        if isinstance(element, LTTextContainer):
            if element.y0 not in same_y_axis:
                same_y_axis[element.y0] = []
            same_y_axis[element.y0].append(element)
    # get all values of the dict same_y_axis
    return list(same_y_axis.items())




def parse_pdf(pdf_path):
    data = {}
    try:
        lines = []
        for page_layout in extract_pages(pdf_path):
            # if this is the first page, we need to skip the first 3 elements
            # to check if it is a valid supercias report

            same_y_axis = get_y_axis_lines(page_layout)
            print(same_y_axis)
            return same_y_axis
            # concat the lines
            for y0, elements in same_y_axis.items():
                line = []
                for element in elements:
                    text = element.get_text()
                    # sanitize the text
                    text = text.replace('\n', ' ')
                    text = text.replace('\t', ' ')
                    text = text.strip()
                    line.append({ 'y': y0, 'text': text })
                lines.append(line)
        # parse the lines
        # filter only the ones that have 2 elements
        reachedEndOfHeader = False
        reachedStartOfFooter = False
        for line in lines:
            if not reachedEndOfHeader:
                if(len(line) == 1):
                    if('ESTADO DE SITUACIÓN FINANCIERA' in line[0]['text']):
                        reachedEndOfHeader = True
                else:
                    data[line[0]['text']] = line[1]['text']
            elif reachedEndOfHeader and not reachedStartOfFooter:
                if('ESTADO DE SITUACIÓN FINANCIERA' in line[0]['text']):
                    continue
                elif('CUENTA'in line[0]['text'] and 'CÓDIGO' in line[1]['text']):
                    continue
                else:
                    data[line[0]['text']] = {}
                    if(len(line) >= 2):
                        data[line[0]['text']]['codigo'] = line[1]['text']
                    if(len(line) == 3):
                        data[line[0]['text']]['descripcion'] = line[2]['text']
                if('REPRESENTANTE(S) LEGAL(ES)' in line[0]['text']):
                    reachedStartOfFooter = True
            elif reachedStartOfFooter:
                # need to implement later
                continue
    except Exception as e:
        print('Error:', e)
    return data

pdf_path = './storage/pdfs/0993382494001_DocumentosEconomicos_Estado de Flujos de Efectivo_2023-12-31.pdf'
data = parse_pdf(pdf_path)
print(data)