# ## Extract the infromation from the pdfs fo the administradoes actuales y antiguos 
# #### Connect to mongodb and make sure we have access to the excel files

import pandas as pd
# print all the rows and the columns of a dataframe
pd.set_option('display.max_columns', None)
pd.set_option('display.max_rows', None)
from pymongo import MongoClient
# we run this so that we can access relative paths
import os, sys
parent_dir = os.path.abspath('..')
if parent_dir not in sys.path: sys.path.append(parent_dir)
from functions.GridFsFileOperations import GridFsFileOperations

endpoint = '10.0.10.5:27017'
#endpoint = '192.168.1.10:27017'
database = 'supercias'
collection_actuales = 'administradores_actuales'
collection_anterioes = 'administradores_anteriores'
path_actuales = '../../storage/administradores_actuales/'
path_anteriores = '../../storage/administradores_anteriores/'

# Connect to MongoDB
db = MongoClient('mongodb://'+endpoint)[database]
# Create instance of GridFsFileOperations
filesActuales = GridFsFileOperations(db, collection_actuales, path_actuales)
filesAnteriores = GridFsFileOperations(db, collection_anterioes, path_anteriores)

# upload collections
upload_collection_actuales = db[collection_actuales]
upload_collection_anteriores = db[collection_anterioes]

# Read download every file and parse data into mongodb
# First let's define the parser

from tabula.io import read_pdf
def parse_pdf(file_path):
    print(f'Parsing file: {file_path}')
    file_size = os.path.getsize(file_path)
    # Convert the size to a human-readable format (optional)
    print('File size in bytes:', file_size)
    if(file_size <= 100): return 
    # the ruc of the company is the name of the file
    ruc = file_path.split('/')[-1].split('.')[0]
    # Extraer tablas usando Tabula
    tables = read_pdf( file_path, 
                    pages='all', 
                    multiple_tables=True,
                    lattice=True)
    print(f"Se encontraron {len(tables)} tablas.")
    if len(tables) == 0: return
    # make first table into a dataframe
    df = pd.concat(tables)
    # drop columns with all NaN values
    df = df.dropna(how='all', axis=1)
    '''
        for some reason, the the pdf switches pages, 
        it splits the last row into two,
        the name of the title holder get spit where two of the names stay on the previous
        and on a almost empty row on the next page
        an find when this happens by looking in the index
        if has a single rows of NaNs it is a normal split
        it is has two, it is the continuation fo the previous name.
    '''
    # add indexes as a column
    df['index'] = df.index
    # reset the index
    df = df.reset_index(drop=True)
    # find the row where index is 1 and the IDENTIFICACION is NaN
    df_continuation =  df[(df['index'] == 1) & (df['IDENTIFICACIÓN'].isna())]
    # now for every row in df_continuation, we get the index it has
    for i  in df_continuation.index:
        # get the continuation name
        continue_name = df.iloc[i]['NOMBRE']
        # add it to 2 rows before it
        df.at[i-2, 'NOMBRE'] = str(df.at[i-2, 'NOMBRE']) + ' ' + continue_name
        # remove the row
        df = df.drop(i)
    # remove the index column
    df = df.drop(columns=['index'])
    # remove any row that has all NaN values
    df = df.dropna(how='all')
    # remov the accents from the columns
    df.columns = df.columns.str.normalize('NFKD').str.encode('ascii', errors='ignore').str.decode('utf-8')
    # remove th \r from the columns
    df.columns = df.columns.str.replace('\r', '')
    # remove the \r from the columns NOMBRE  CARGO  
    df['NOMBRE'] = df['NOMBRE'].str.replace('\r', '')
    df['CARGO'] = df['CARGO'].str.replace('\r', '')
    # conver IDENTIFICACION to an integer
    df['IDENTIFICACION'] = pd.to_numeric(df['IDENTIFICACION'], errors='coerce').astype('Int64')
    # convert the column to string
    df['IDENTIFICACION'] = df['IDENTIFICACION'].astype(str)
    # if the IDENTIFICACION has only 9 digits, we add a 0 at the beginning
    df['IDENTIFICACION'] = df['IDENTIFICACION'].apply(lambda x: '0' + x if len(x) == 9 else x)
    # add the ruc of the company
    df['RUC'] = ruc
    # remove return df
    return df


#file_test = '../../storage/administradores_actuales/1790016919001.pdf'
#file_test = '/home/terac/data-mining/supercias/storage/administradores_anteriores/0190003809001.pdf'
#file_test = "/home/terac/data-mining/supercias/storage/administradores_actuales/1791006356001.pdf"

#df = parse_pdf(file_test)
#df.head(df.shape[0])


def upload_rows(df, collection):
    collection.insert_many(df.to_dict('records'))

# get all files actuales
files_actuales = filesActuales.get_files_list()
print('found', len(files_actuales), 'files de administradores actuales')

for file in files_actuales:
    # download pdf file
    filesActuales.write_to_disk(file)
    # parse the pdf file
    try: 
        df = parse_pdf(path_actuales + file)
    except Exception as e:
        print('Error parsing file', file)
        print(e)
        os.remove(path_actuales + file)
        continue
    # if the df is None, we remove the file
    if(df is None): 
        os.remove(path_actuales + file)
        continue
    # upload to mongodb
    upload_rows(df, upload_collection_actuales)
    # remove the file
    os.remove(path_actuales + file)


# get all files anteriores
files_anteriores = filesAnteriores.get_files_list()
print('found', len(files_anteriores), 'files de administradores anteriores')
for file in files_anteriores:
    # download pdf file
    filesAnteriores.write_to_disk(file)
    # parse the pdf file
    try: 
        df = parse_pdf(path_anteriores + file)
    except Exception as e:
        print('Error parsing file', file)
        print(e)
        os.remove(path_actuales + file)
        continue
    # upload to mongodb
    upload_rows(df, upload_collection_anteriores)
    # remove the file
    os.remove(path_anteriores + file)


