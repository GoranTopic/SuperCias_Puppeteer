import { read_json } from './files.js'
/**
 * get_company_by_id.
 * this function takes a id and read from the company ids files 
 * which is a list of id objs.
 * it returns the company obj.
 * this is useful for when can't pass the whole function
 *
 * @param {} id
 */
const get_company_by_id = id => {
    let companies = read_json('./data/mined/ids/company_ids.json')
    return companies.find( companie => companie.id === id );
}

export default get_company_by_id;
