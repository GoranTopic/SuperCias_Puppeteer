import os
import shutil
from gridfs import GridFS
from functions.extract_text_from_pdf import extract_text_from_pdf
class PDFOperations:
    def __init__(self, db, collection, pdfs_path):
        self.db = db
        self.pdfs_path = pdfs_path
        # make path if it does not exist
        if not os.path.exists(self.pdfs_path):
            os.makedirs(self.pdfs_path)
        # make gridfs
        self.fs = GridFS(self.db, collection=collection)

    def write_to_disk(self, filename):
        # get pdf from GridFS
        pdf = self.fs.find({'filename': filename})
        try:
            pdf = next(pdf)
            # write file to disk
            with open(self.pdfs_path + filename, 'wb') as f:
                f.write(pdf.read())
                return f.name
        # catch error
        except Exception as e:
            #throw error
            print(e)

    def delete_from_disk(self, filename):
        try:
            os.remove(self.pdfs_path+filename)
            return True
        except Exception as e:
            print(e)

    def move(self, target_path):
        try:
            shutil.move(self.pdfs_path, target_path)
        except Exception as e:
            print(e)

    def extract_text(self, filename):
        # write file 
        self.write_to_disk(filename)
        # extract file 
        text = extract_text_from_pdf(self.pdfs_path + '/' + filename)
        # remove file 
        self.delete_from_disk(filename)
        return text
        
