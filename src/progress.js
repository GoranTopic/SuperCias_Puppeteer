import { read_json, write_json, delete_json, mkdir } from './utils/files.js'

/* this class make a list that is saved disk, and or read from */
class DiskList{
    constructor(name, values = null, path = null){
        this.dir_path = path? path : '../data/resources/list/';
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

/* this class is similar to the disklist, but it remove any repeated values */
class DiskSet{
    constructor(name, values = null, path){
        this.dir_path = path?? '../data/resources/list/';
        this.name = name + ".json";
        this.set = new Set();
        this.array = [];
        // try to read already saved values
        if(!values)
            values = read_json( this.dir_path + this.name) ?? [];
        // check uniquenes
        for (var value of values) this._add(value);
        // after done checking save to memeory
        this._save();
    }

    // save value
    _save = () => write_json( this.array, this.dir_path + this.name );

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


/* this class makes a checklist for value that need to be check,
 * it takes a check function whihc goes throught the values. */
class Checklist{
    /* this function takes list of name name to check and */
    constructor(name, values, path){
        // only for script
        this.dir_path =  path ?? './data/resources/checklists/';
        this.name = name + ".json";
        this.filename = this.dir_path + this.name
        this.checklist = read_json( this.filename );
        this.values = values ?? [];
        this.missing_values = [];
        // make chekilist
        if(!this.checklist){
            this.checklist = {};
            for(let value of this.values){
                if(this._isObject(value))
                    value = JSON.stringify(value)
                this.checklist[value] = false
            }
        }
        this._calcMissing();
        // save new checklist
        write_json(this.checklist, this.filename);
    }

    _isObject = (objValue) =>
        ( objValue &&
            typeof objValue === 'object' &&
            objValue.constructor === Object );

    _calcMissing = () => {
        this.missing_values = [];
        this.values.forEach( value  => {
            if(this._isObject(value))
                value = JSON.stringify(value)
            if(! this.checklist[value] )
                this.missing_values.push(value)
        })
    }

    getMissingValues = () =>
        this.missing_values;

    missingLeft = () =>
        this.missing_values.length

    nextMissing = () =>
        this.missing_values.shift();

    check = (value, mark = true) => {
        /* checks a value on the list as done */
        if(this._isObject(value))
            value = JSON.stringify(value)
        this.checklist[value] = mark;
        this._calcMissing();
        return write_json(this.checklist, this.dir_path + this.name);
    }

    add = (value, overwrite = true) => {
        /* add a value as not done to the list
         * if overwrite is true, it writes over any truety value */
        if(this._isObject(value)) value = JSON.stringify(value)
        // if it is not in the list, or overwrite is true
        if(!this.checklist[value] || overwrite)
            this.checklist[value] = false;
        this._calcMissing();
        return write_json(this.checklist, this.dir_path + this.name);
    }

    addList = (values, overwrite=true) => {
        /* adds a list of values as not done to the list */
        for( let value of values)
            this.add(value, overwrite);
        return true;
    }

    isCheckedOff = value => {
        /* Checks if all value has been already been checked off */
        if(this._isObject(value))
            value = JSON.stringify(value)
        return this.checklist[value]
    }

    // returns all key values
    getAllValues = () => Object.keys(this.values)

    isDone = () =>
        /* checks if all the value on the checklist are done */
        Object.values(this.checklist).every(v => v)

    remove = value => {
        // remvoes the value from the list
        if(this._isObject(value)) value = JSON.stringify(value)
        delete this.values[value];

    }

    delete = () =>  {
        /* delete the checklist from disk*/
        this.values = []
        this.checklist = []
        delete_json(this.dir_path + this.name)
    }


}

export { Checklist, DiskList, DiskSet }
