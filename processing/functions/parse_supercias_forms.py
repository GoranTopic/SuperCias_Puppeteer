import os
import pdfplumber

def clean (text):
# sanitize the text
    text = text.replace('\n', ' ')
    text = text.replace('\t', ' ')
    text = text.strip()
    return text

# get the text from the cell
def get_text(cell, page):
    return clean(page.crop(cell).extract_text())

def sort_by_y_axis(cells):
    # get all the elements that are on the same y0 position
    yi = 1 # the index on the tuple of the y axis value 
    same_y_axis = {}
    for cell in cells:
        if cell[yi] not in same_y_axis:
            same_y_axis[cell[yi]] = []
        same_y_axis[cell[yi]].append(cell)
    # make into a list
    same_y_axis = list(same_y_axis.values())
    # sort by the y value
    same_y_axis.sort(key=lambda x: x[0][yi])
    return same_y_axis

def parse_table(page):
    parsed_data = {}
    # get the first table
    tables = page.debug_tablefinder() # list of tables which pdfplumber identifies
    req_table = tables.tables[0] 
    # get the cells of the table byt the y position
    cells = req_table.cells
    cells = sort_by_y_axis(cells) 
    # get the value that only has one element in the y axis, this is the title
    title_line = [ (index, cell) for index, cell in enumerate(cells) if len(cell) == 1 ]
    # get the title cell and index
    if(len(title_line) > 1):
        (index, [title_cell]) = title_line[0]
    else:
        [(index, [title_cell])] = title_line
    # get the title
    title = get_text(title_cell, page)
    parsed_data['TITULO'] = title
    # if there is move infromation above the title, get it
    if index > 0:
        for cell in cells[0:index]:
            # we get them from the back to avoid getting a empty cell
            key = get_text(cell[-2], page)
            value = get_text(cell[-1], page)
            parsed_data[key] = value
    # for the rest of the document we get the values by the headers
    # the header is the line after the title
    headers = [ get_text(cell, page) for cell in cells[index + 1] ]
    # for each of the lines that are below the headers
    parsed_data[title] = []
    for cell_line in cells[index + 2:]:
        # get the values of the cells
        values = [ get_text(cell, page) for cell in cell_line ]
        # dont try to parse if the values are not the same length as the headers
        if(len(values) != len(headers)): continue
        # get the rest of the values as a dict
        parsed_data[title].append({ headers[i]: values[i] for i in range(0, len(headers)) })
    # print(parsed_data) 
    return parsed_data

def merge_dicts(dict1, dict2):
    # Iterate over keys and values of the second dictionary
    for key, value in dict2.items():
        if key in dict1:
            # If the value in both dictionaries is a list, append values
            if isinstance(dict1[key], list) and isinstance(value, list):
                dict1[key].extend(value)  # Appending the list elements from dict2 to dict1
            else:
                # Overwrite the value from dict1 with the one from dict2
                dict1[key] = value
        else:
            # If the key is not in dict1, just add it
            dict1[key] = value
    return dict1

def read_header(page):
    # the headers we are looking for are  
    headers = {}
    # read the first lines of the table
    tables = page.debug_tablefinder() # list of tables which pdfplumber identifies
    req_table = tables.tables[0] 
    # get the cells of the table byt the y position
    cells = req_table.cells
    cells = sort_by_y_axis(cells)
    # get the value that only has one element in the y axis, this is the title
    cell_texts = [[get_text(cell, page) for cell in cell_line if get_text(cell, page)] for cell_line in cells]
    # add every header to the dict
    for cell_line in cell_texts:
        if len(cell_line) >= 2: 
            headers[cell_line[0]] = cell_line[1]
    # return the hearders
    return headers

def are_keys_in_dict(keys, parsed_data):
    for key in keys:
        if key not in parsed_data:
            return False
    return True

def parse_form_csv_niff(pdf):
    # data buffer
    parsed_data = {}
    # for every page in the pdf
    for page in pdf.pages:
        # pare the data from the page
        parsed_page = parse_table(page) # parse the page
        # merge the data
        parsed_data = merge_dicts(parsed_data, parsed_page)
        # get representates legales - todo
    return parsed_data

# write to file log file
# open log file
log_file = open('log.txt', 'w')
encodings = {}
def parse_form_101(pdf):
    # parsing 101
    parsed_data = {}
    # for every page in the pdf, ge the page and the index
    for index, page in enumerate(pdf.pages):
        print('page', index)
        text = page.extract_text()
        for line in text.split('\n'):
            # for every word in the line
            # write to log file
            log_file.write(line + '\n')
            print(line)
            for word in line.split(' '):
                # if it is an integer
                if word.isdigit():
                    print(word)
                    log_file.write(word + '\n')

        # check if the line has all caps
            #if line.isupper():

        # pare the data from the page
        #parsed_page = parse_table(page)
        # get all the cells fro each page
        #cells = page.debug_tablefinder().tables[0].cells
        # sort cell by y axis
        #cell_lines = sort_by_y_axis(cells) 
        # get the value that have 3 elements on the y axis,
        #for cell_line in cell_lines:
            # get the values of the cells
            #values = [ get_text(cell, page) for cell in cell_line if get_text(cell, page) ]
            # print title
            #if( len(values) == 1):
            #    print(values)
            # print leaf
            #if( len(values) == 3):
                # get the rest of the values as a dict
            #    print(values)
    # get the first table
    #tables = page.debug_tablefinder() # list of tables which pdfplumber identifies
    #req_table = tables.tables[0] 
    # get the cells of the table byt the y position
    #cells = req_table.cells
    #cells = sort_by_y_axis(cells) 
    # get the value that have 3 elements on the y axis,
    #cells = [cell for cell in cells if len(cell) == 3]
    # for every line print the values
    #print(cells)
    

def parse_pdf(pdf_path):
    # this will parse the pdf and return the data
    pdf = pdfplumber.open(pdf_path)
    try:
        # get the first page
        first_page = pdf.pages[0]
        # let try to read the header of the document
        header = read_header(first_page)
        # check we have a header correclty
        # check if we have value for the keys:
        keys = ['RAZÓN SOCIAL', 'DIRECCIÓN', 'EXPEDIENTE', 'RUC', 'AÑO', 'FORMULARIO']
        if are_keys_in_dict(keys, header):
            parsed_data = parse_form_csv_niff(pdf)
        # else if
        elif 'FORMULARIO 101' in header:
            parsed_data = parse_form_101(pdf)
        # else we could not recognize the form
        else:
            print('Error: Formulario no reconocido')
            return None
        print('parsed data')
        # close the pdf
        pdf.close()
        # return
        return parsed_data
    except Exception as e:
        print(e)
        pdf.close()
        return None


#for every file in './storage/pdfs':
'''
print('parsing pdfs')
for root, dirs, files in os.walk('./storage/pdfs'):
    for file in files:
        if file.endswith('.pdf') and 'Balance  Estado de Situación Financiera' in file:
            res = parse_pdf(os.path.join(root, file))
            print(file)
            if res:
                print('parsed')
            else:
                print('not parsed')
'''

form_101_file = './storage/pdfs/1793173071001_DocumentosEconomicos_Balance  Estado de Situación Financiera_2021-12-31.pdf'
form_csv_niif_file = './storage/pdfs/1793173071001_DocumentosEconomicos_Balance  Estado de Situación Financiera_2022-01-26.pdf'
parse_pdf(form_101_file)



