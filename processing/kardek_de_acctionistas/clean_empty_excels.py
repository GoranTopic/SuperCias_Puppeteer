from pymongo import MongoClient
import gridfs

# Connect to the local MongoDB instance
client = MongoClient('mongodb://localhost:27017/')

# Access the 'supercias' database
db = client['supercias']

# Access the 'kradek_de_accioniestas' collection
collection = db['kradek_de_accioniestas']

# Access the GridFS for 'kradek_de_accioniestas.files'
fs = gridfs.GridFS(db, collection='kradek_de_accioniestas')

# Get all files in the 'kradek_de_accioniestas.files' collection
files_collection = db['kradek_de_accioniestas.files']

# Iterate over each file in the collection
for file in files_collection.find():
    if file['length'] <= 1000:
        file_id = file['_id']
        try:
            # Remove the file from the GridFS collection
            fs.delete(file_id)
            # Remove the corresponding document from the 'kradek_de_accioniestas' collection
            collection.delete_one({'_id': file_id})
            print(f"Deleted file with _id: {file_id}")
        except gridfs.errors.NoFile:
            print(f"No file found for _id: {file_id}")

# for every file in the collection
for file in collection.find():
    ruc = file['ruc']
    count = files_collection.count_documents({ 'filename': ruc + '.xlsx' })
    if(count < 1):
        collection.delete_one({'ruc': ruc})
        print(f"Deleted file with ruc: {ruc})")
    




print("Cleanup complete.")
