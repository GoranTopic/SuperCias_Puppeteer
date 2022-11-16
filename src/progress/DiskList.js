import { read_json, write_json, mkdir } from './utils/files.js'

/* this class make a list that is saved disk, and or read from */
class DiskList{
    constructor(name, values = null, path = null){
        this.dir_path = path? path : '../data/resources/list/';
        mkdir(this.dir_path);
        this.name = name + ".json";
        // try to read already saved values 
        if(values){ // if values have be passed
            this.values = values;
            write_json(this.values, this.dir_path + this.name);
        }else // try to read from disk
            this.values = read_json( this.dir_path + this.name) ?? [];
    }
    // save value
    add = value => {
        this.values.push(value);
        return write_json(this.values, this.dir_path + this.name);
    }
}

export default DiskList;

