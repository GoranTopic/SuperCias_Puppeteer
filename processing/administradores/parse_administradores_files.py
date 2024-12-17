import pandas as pd
import unicodedata
from pymongo import MongoClient
from gridfs import GridFS
from concurrent.futures import ThreadPoolExecutor
# we run this so that we can access relative paths
import os, sys
import warnings
warnings.filterwarnings("ignore", category=UserWarning, module="openpyxl")

parent_dir = os.path.abspath('..')
if parent_dir not in sys.path: sys.path.append(parent_dir)
from functions.GridFsFileOperations import GridFsFileOperations

endpoint = '10.0.10.5:27017'
#endpoint = '192.168.1.10:27017'
database = 'supercias'
collection = 'kardek_de_accionistas'
path = '../storage/kardek_de_accionistas/'


def parse_excel(file_path):
    file_size = os.path.getsize(file_path)
    # Convert the size to a human-readable format (optional)
    print('File size in bytes:', file_size)
    if(file_size <= 100): return 
    df = pd.read_excel(file_path)
    # get the ruc from the filename
    ruc = file_path.split('.')[-2].split('/')[-1]
    # get the comapny name
    name = df.iloc[0,0]
    df.columns = df.iloc[3]
    # Remove accents from column names
    df.columns = [ unicodedata.normalize('NFKD', col).encode('ascii', 'ignore').decode('utf-8') for col in df.columns ]
    df = df[3:].reset_index(drop=True) 
    # remove the first column
    df = df.drop(df.columns[0], axis=1)  
    df = df.dropna(subset=["IDENTIFICACION"])
    # add the rows for NOMBRE COMPANIA and RUC
    df['RUC'] = ruc
    df['NOMBRE DE COMPANIA'] = name
    print('ruc:', ruc, 'nombre', name)
    return df

def upload_rows(df, collection):
    collection.insert_many(df.to_dict('records'))


# Connect to MongoDB
db = MongoClient('mongodb://'+endpoint)[database]
# output the collections
upload_collection = db["kardex_de_accionistas"] 
# Create instance of GridFsFileOperations
filesOps = GridFsFileOperations(db, collection, path)

# get all files
files = filesOps.get_files_list()

for file in files:
    # write the file to disk
    filesOps.write_to_disk(file)
    # read execl fil into pd dataframe
    df = parse_excel(path + file)
    if(df is None): continue
    else:
        upload_rows(df, upload_collection)
        # remove the file from the storage
        os.remove(path + file)
        print (f"Uploaded {file}")