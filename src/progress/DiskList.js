import { read_json, write_json, mkdir } from '../utils/files.js'
import options from '../options.js'

// get data directory
let data_directory =  options.data_dir;

/* this class make a list that is saved disk, and or read from */
class DiskList{
    constructor(name, values = null, path = null){
        this.dir_path = path? path : data_directory + '/resources/list';
        mkdir(this.dir_path);
        this.name = name + ".json";
        this.filename = this.dir_path + '/' + this.name
        // try to read already saved values 
        if(values){ // if values have be passed
            this.values = values;
            write_json(this.values, this.filename);
        }else // try to read from disk
            this.values = read_json( this.filename) ?? [];
    }
    // save value
    add = value => {
        this.values.push(value);
        return write_json(this.values, this.filename);
    }
}

export default DiskList;

