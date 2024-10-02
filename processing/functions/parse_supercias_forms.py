import os
import json
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

def flatten_json(nested_json, parent_key=''):
    items = {}
    for k, v in nested_json.items():
        new_key = f'{parent_key} > {k}' if parent_key else k
        if isinstance(v, dict):
            items.update(flatten_json(v, new_key))
        else:
            items[v] = new_key
    return items

def are_keys_in_dict(keys, parsed_data):
    for key in keys:
        if key not in parsed_data:
            return False
    return True

# Function to check if a string is a number
def replace_codes(line):
    code_map_path = './processing/functions/formulario csv niff code map.json'
    with open(code_map_path, 'r', encoding='utf-8') as json_file:
        code_map = json.load(json_file)
    # for word in line
    accumulator = ''
    new_line = ''
    for word in line.split(' > '):
        if word.isdigit():
            # add to the accumulator
            accumulator += word
            new_line += ' > ' + code_map[accumulator]
        else:
            new_line += ' > ' + word
    # remove the first ' > '
    new_line = new_line[3:]
    return new_line

def parse_form_csv_niff(pdf):
    # data buffer
    parsed_data = {}
    format_map_path = './processing/functions/formulario csv niff map.json'
    # flatten the json
    with open(format_map_path, 'r', encoding='utf-8') as json_file:
        form_map = flatten_json(json.load(json_file))
    # replace the keys in the form_map with the values in the code_map
    for key, values in form_map.items():
        form_map[key] = replace_codes(values)
    # for every page in the pdf
    for index, page in enumerate(pdf.pages):
        text = page.extract_text()
        for line in text.split('\n'):
            # for every word in the line
            words = line.split(' ')
            for index, word in enumerate(words):
                if word in form_map:
                    value = words[index + 1] if index + 1 < len(words) else '0.00'
                    keys = form_map[word].split(' > ')
                    add_to_parse_data(parsed_data, keys, value)
        # get representates legales - todo
    return parsed_data


def add_to_parse_data(parsed_data, keys_path, value):
    sub_keys = keys_path
    current_data = parsed_data
    current_data = parsed_data
    for index, sub_key in enumerate(sub_keys):
        if type(current_data) == str:
            continue
        if index == len(sub_keys) - 1: # reached the end
            current_data[sub_key] = value
        else:
            if sub_key not in current_data:
                current_data[sub_key] = {}
        current_data = current_data[sub_key]

# write to file log file
# open log file
def parse_form_101(pdf):
    parsed_data = {}
    # parsing 101
    format_map_path = './processing/functions/formulario 101 map.json'
    # read map of the form 
    with open(format_map_path, 'r', encoding='utf-8') as json_file:
        form_map = flatten_json(json.load(json_file))
    # for every page in the pdf, ge the page and the index
    for index, page in enumerate(pdf.pages):
        text = page.extract_text()
        for line in text.split('\n'):
            # for every word in the line
            words = line.split(' ')
            for index, word in enumerate(words):
                if word in form_map:
                # if it is an interger is in the form
                    value = words[index + 1] if index + 1 < len(words) else '0.00'
                    keys = form_map[word].split(' > ')
                    add_to_parse_data(parsed_data, keys, value)
    # return the parsed data
    return parsed_data

def parse_pdf(pdf_path):
    # this will parse the pdf and return the data
    pdf = pdfplumber.open(pdf_path)
    # get the first page
    first_page = pdf.pages[0]
    # let try to read the header of the document
    header = read_header(first_page)
    # check we have a header correclty
    # check if we have value for the keys:
    keys = ['RAZÓN SOCIAL', 'DIRECCIÓN', 'EXPEDIENTE', 'RUC', 'AÑO', 'FORMULARIO']
    if are_keys_in_dict(keys, header):
        parsed_data = parse_form_csv_niff(pdf)
        # add the header to the parsed data
        parsed_data = merge_dicts(header, parsed_data)
    # else if
    elif 'FORMULARIO 101' in header:
        parsed_data = parse_form_101(pdf)
    # else we could not recognize the form
    else:
        print('Error: Formulario no reconocido')
        return None
    print(parsed_data)
    print('parsed data')
    # close the pdf
    pdf.close()
    # return
    return parsed_data


#form_101_file = './storage/pdfs/1793173071001_DocumentosEconomicos_Balance  Estado de Situación Financiera_2021-12-31.pdf'
#form_csv_niif_file = './storage/pdfs/1793173071001_DocumentosEconomicos_Balance  Estado de Situación Financiera_2022-01-26.pdf'
#parse_pdf(form_csv_niif_file)



