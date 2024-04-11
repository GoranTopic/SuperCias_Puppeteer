// this is a high level function that retuen a filter for a specific url match
const makeFilter = filters => {
    let { 
        urlRegex,
        headers,
        method,
        status,
        body,
        bodyRegex,
        bodyContains,
        bodyText,
    } = filters;
    // filter by url regex
    if (urlRegex) {
        // input for this functino is a function 
        // we return a function that runs this function if, it passes the filter
        // make me regex tha matches the url that has the string 'api' in it
        //let regexThatMatchesApi = /api/;
        if (typeof urlRegex === 'string') urlRegex = [ urlRegex ];
        urlRegex = urlRegex.map(regex => new RegExp(regex));
        return callback => 
            async response => // if it matches at least one of the regexes
            urlRegex.some(regex => regex.test(response.request().url()))?
                await callback(response) : (response) => null;
    };
}

export default makeFilter;
