import { read_json, write_json, mkdir } from './utils/files.js'

/* this class is similar to the disklist, but it remove any repeated values */
class DiskSet{
    constructor(name, values = null, path){
        this.dir_path = path?? '../data/resources/list';
        mkdir(this.dir_path);
        this.name = name + ".json";
        this.set = new Set();
        this.filename = this.dir_path + '/' + this.name
        this.array = [];
        // try to read already saved values
        if(!values)
            values = read_json( this.filename ) ?? [];
        // check uniquenes
        for (var value of values) this._add(value);
        // after done checking save to memeory
        this._save();
    }

    // save value
    _save = () => write_json( this.array, this.filename );

    // add value to set, in unique it add it to array
    _add = value => {
        if( this.set.has(JSON.stringify(value)) )
            return false;
        else{ // if it not in the set
            this.set.add(JSON.stringify(value));
            this.array.push(value);
            return true;
        }
    }

    // add and saves value
    add = value => (this._add(value))? this._save() : false ;
}

export default DiskSet

