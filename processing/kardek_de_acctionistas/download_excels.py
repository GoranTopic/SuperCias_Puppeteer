import os
import gridfs
from pymongo import MongoClient


def save_files_from_gridfs(db_name, collection_name, output_folder, query):
    # Establish a connection to MongoDB
    client = MongoClient('mongodb://10.0.10.5:27017/')
    db = client[db_name]
    fs = gridfs.GridFS(db, collection=collection_name)

    # Create the output folder if it doesn't exist
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    # Read files from GridFS and save them locally
    for grid_out in fs.find(query): 
        file_name = grid_out.filename
        file_path = os.path.join(output_folder, file_name)
        
        # Save the file to the output folder
        with open(file_path, 'wb') as f:
            f.write(grid_out.read())
        print(f"Saved: {file_name}")

if __name__ == "__main__":
    database = 'supercias'
    collection = 'kardek_de_accionistas'
    output_folder = "../../storage/kradek_de_accioniestas"  # Replace with your desired output folder path
    save_files_from_gridfs(database, collection, output_folder, {
        # 'filename': { '$regex': "^0991475532001" } 

    })
    print("All files have been saved successfully!")
