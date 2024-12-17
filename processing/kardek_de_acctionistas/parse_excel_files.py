# %% [markdown]
# ## Extract the kardex de accionistas execl file from mongodb and parse into a json fin another colletion
# #### Connect to mongodb and make sure we have access to the excel files

from pymongo import MongoClient
from gridfs import GridFS
from concurrent.futures import ThreadPoolExecutor
# we run this so that we can access relative paths
import os, sys
parent_dir = os.path.abspath('..')
if parent_dir not in sys.path: sys.path.append(parent_dir)
from functions.GridFsFileOperations import GridFsFileOperations

endpoint = '10.0.10.5:27017'
#endpoint = '192.168.1.10:27017'
database = 'supercias'
collection = 'kardek_de_accionistas'
path = '../../storage/kardek_de_accionistas/'
# make sure the path exists
if not os.path.exists(path): os.makedirs(path)

# Connect to MongoDB
db = MongoClient('mongodb://'+endpoint)[database]
# Create instance of GridFsFileOperations
filesOps = GridFsFileOperations(db, collection, path)

# %% [markdown]
# Read download every file and parse data into mongodb

# %% [markdown]
# First let's define the parser

# %%
import pandas as pd
import unicodedata
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
    # remove the frist row
    df = df[1:]
    return df

# %%
def upload_rows(df, collection):
    collection.insert_many(df.to_dict('records'))


# %%
import warnings
warnings.filterwarnings("ignore", category=UserWarning, module="openpyxl")
import os

# where to upload the parsed data
upload_collection = db[collection]
# get all files
files = filesOps.get_files_list(
    #filename='1791924037001.xlsx'
    #filename='1790371506001.xlsx'
)
print('number of files found:', len(files))
for file in files:
    # download the file
    filesOps.write_to_disk(file)
    # parse the file
    df = parse_excel(path + file)
    # if the file is empty, continue
    if(df is None): continue
    else:
        upload_rows(df, upload_collection)
        print (f"Uploaded {file}")
        # remove the file
        filesOps.delete_from_disk(file)

df.head()


