/* this script initlizes the necesary value to start scrapping */
import Storage from 'dstore-js';

const make_fileStore = async () => {
    // Create a file storage
    let fileStorage = new Storage({
        type: 'mongoFiles',
        url: 'mongodb://0.0.0.0:27017',
        database: 'supercias',
    });
    // Create a file
    let fileStore = await fileStorage.open('companies');
    // return filestore
    return fileStore;
}

export default make_fileStore;

