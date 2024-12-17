import os
import traceback
import shutil
from gridfs import GridFS
from functions.extract_text_from_pdf import extract_text_from_pdf

'''
This is a wrapper class for GridFS operations which facilitates some common functions 
such as downloading files from GridFS, writing them to disk, extracting text from them, 
etc.
'''

class GridFsFileOperations:
    def __init__(self, db, collection, pdfs_path):
        """
        Initializes the GridFsFileOperations class.
        
        Parameters:
        - db: MongoDB database connection object.
        - collection: Name of the GridFS collection to use.
        - pdfs_path: Local directory path to temporarily store PDF files.
        """
        self.db = db
        self.pdfs_path = pdfs_path
        
        # Ensure the PDF storage path exists; create it if it doesn't
        if not os.path.exists(self.pdfs_path):
            os.makedirs(self.pdfs_path)
        
        # Initialize GridFS with the given database and collection
        self.fs = GridFS(self.db, collection=collection)

    def exists(self, filename):
        """
        Checks if a file exists in the GridFS collection.
        
        Parameters:
        - filename (str): The name of the file to check.
        
        Returns:
        - bool: True if the file exists, False otherwise.
        """
        does_exist = self.fs.exists({'filename': filename})
        return does_exist

    def write_to_disk(self, filename=None):
        """
        Writes files from GridFS to the local disk based on search criteria.
        
        Parameters:
        - filename (str, optional): Exact name of the file.
        
        Returns:
        - int: The count of files successfully written to disk.
        
        Raises:
        - Exception: If neither `filename` nor filtering criteria are provided.
        """
        query = {} if filename is None else {'filename': filename}
        # Retrieve files matching the exact filename from GridFS
        pdfs = self.fs.find(query)
        
        count = 0
        # Iterate through the files and write them to disk
        for pdf in pdfs:
            with open(self.pdfs_path + pdf.filename, 'wb') as f:
                f.write(pdf.read())  # Write file content to disk
                count += 1
        return count

    def get_files_list(self, filename=None):
        """
        Returns a list of all files in the GridFS collection.
        
        Returns:
        - list: List of filenames in the GridFS collection.
        """
        query = {} if filename is None else {'filename': filename}
        files = self.fs.find(query)
        return [file.filename for file in files]


    def delete_from_disk(self, filename):
        """
        Deletes a file from the local disk.
        
        Parameters:
        - filename (str): The name of the file to delete.
        
        Returns:
        - bool: True if the file was deleted successfully, False otherwise.
        """
        try:
            os.remove(self.pdfs_path + filename)
            return True
        except Exception as e:
            print(f"Error deleting file {filename}: {e}")
            return False

    def move(self, target_path):
        """
        Moves the PDF storage directory to a new location.
        
        Parameters:
        - target_path (str): The destination directory path.
        """
        try:
            shutil.move(self.pdfs_path, target_path)  # Move the directory
        except Exception as e:
            print(f"Error moving directory to {target_path}: {e}")

    def extract_text(self, filename):
        """
        Extracts text from a PDF file stored in GridFS.
        
        Parameters:
        - filename (str): The name of the file to extract text from.
        
        Returns:
        - str: The extracted text, or None if an error occurs.
        """
        text = None
        try:
            # Write the file to disk
            written_count = self.write_to_disk(filename)
            if written_count == 0:
                print(f"No file found with filename: {filename}")
                return None
            
            # Extract text from the PDF
            text = extract_text_from_pdf(self.pdfs_path + filename)
        except Exception as e:
            print(f"Error extracting text from file {filename}: {e}")
            # Print the full traceback for debugging
            traceback.print_exc()
        finally:
            # Delete the file from disk after processing
            self.delete_from_disk(filename)
            return text
