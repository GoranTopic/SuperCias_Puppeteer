import os
import gridfs
from pymongo import MongoClient
import pandas as pd


def parse_excel_file(buffer):
    """
    Parses an Excel file from a buffer and returns the data as a dictionary of DataFrames.

    Parameters:
        buffer: file-like object (e.g., BytesIO or uploaded file)

    Returns:
        A dictionary where each key is a sheet name and each value is a DataFrame containing the sheet's data.
    """
    try:
        # Read the Excel file from the buffer
        excel_data = pd.ExcelFile(buffer)

        # Parse all sheets into a dictionary of DataFrames
        data = {sheet_name: excel_data.parse(sheet_name) for sheet_name in excel_data.sheet_names}

        return data

    except Exception as e:
        print(f"Error parsing Excel file: {e}")
        return None

def parse_files_from_gridfs(db_name, collection_name, output_folder):
    # Establish a connection to MongoDB
    client = MongoClient('mongodb://10.0.10.5:27017/')
    db = client[db_name]
    fs = gridfs.GridFS(db, collection=collection_name)

    # Create the output folder if it doesn't exist
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)


    # Read files from GridFS and save them locally
    for grid_out in fs.find({}): # {'filename': { '$regex': "^0991475532001" } }
        file_name = grid_out.filename
        file_path = os.path.join(output_folder, file_name)

        excel_file = grid_out.read()
        print(f"parseing: {file_name}")   
        data = parse_excel_file(excel_file)
        print(data)
        

if __name__ == "__main__":
    db_name = "supercias"  # Replace with your database name
    collection_name = "kradek_de_accioniestas"
    output_collection = "kradek_de_accioniestas"

    parse_files_from_gridfs(db_name, collection_name, output_collection)
    print("All files have been saved successfully!")
