import os
import traceback
import shutil
from gridfs import GridFS
from functions.extract_text_from_pdf import extract_text_from_pdf
class PDFOperations:
    def __init__(self, db, collection, pdfs_path):
        self.db = db
        self.pdfs_path = pdfs_path
        # make path if it does not exist
        if not os.path.exists(self.pdfs_path):
            os.make
        # make gridfs
        self.fs = GridFS(self.db, collection=collection)

    def exists(self, filename):
        does_exist = self.fs.exists({'filename': filename})
        return does_exist

    def write_to_disk(self, filename=None, ruc=None, type=None, title=None, year=None):
        if(filename):
            # get pdfs from GridFS
            pdfs = self.fs.find({'filename': filename})
        elif(ruc or type or title or year):
            # Retrieve all files from GridFS collection that have in the filen ethe substring 'Balance  Estado de Situación'
            pdfs = self.fs.find({'filename': {'$regex': '.*'+ruc+'.*'+type+'.*'+title+'.*'+year+'.*'}})
        else:
            # throw error
            raise Exception('No filename or ruc, type, title, year provided')
        count = 0
        # get first pdf
        for pdf in pdfs: 
            # write file to disk
            with open(self.pdfs_path + pdf.filename, 'wb') as f:
                f.write(pdf.read())
                count += 1
        return count
        

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
        text = None
        try:
            # write file 
            written_count = self.write_to_disk(filename)
            if(written_count == 0):
                print('No file found')
                return None
            # extract file 
            text = extract_text_from_pdf(self.pdfs_path + filename)
        except Exception as e:
            print(e)
            # print traceback
            print(traceback.print_exc())
        finally:
            self.delete_from_disk(filename)
            return text