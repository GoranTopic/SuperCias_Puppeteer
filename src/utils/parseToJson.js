function parseToJSON(inputText, numberOfColumns) {
    // Split the input text by newline characters
    let entries = []
    // Split the input text by newline characters
    let lines = inputText.split('\t').map(line => line.trim());
    // remove the last lines if there is a paginator
    if (lines[lines.length - 1].match(/\[*\]/))
        lines.splice(-16);
    // get the title without the : at the end
    let title = lines.shift().slice(0, -1);
    // separate the keys with the values
    let currentColumn = numberOfColumns;
    while (currentColumn < lines.length) {
        let split_line = lines[currentColumn - 1];
        // find the position of the last \n character
        let pos = split_line.lastIndexOf('\n');
        // split the line in two parts on pos
        lines[currentColumn - 1] = split_line.slice(0, pos);
        lines.splice(currentColumn, 0, split_line.slice(pos + 1));
        // go to next column
        currentColumn += numberOfColumns;
    }
    // replace all other \n characters with spaces
    lines = lines.map(line => line.replace(/\n/g, ' ').trim());
    // get the keys
    const keys = lines.splice(0, numberOfColumns);
    //console.log('keys', keys)
    //console.log('lines', lines)
    //check if the lines and keys match
    if (lines.length % keys.length !== 0)
        throw new Error(`the lines ${lines.length} are not divisible by the keys: ${keys.length}`)
    // get the values
    let entry = {}
    for (let i = 0, j = 0; i < lines.length; i++) {
        //console.log('j:', j, 'i', i)
        //console.log('key:', keys[j], 'line:', lines[i])
        entry[keys[j]] = lines[i];
        if (j >= keys.length - 1) {
            entries.push(entry)
            entry = {};
            j = 0;
        } else j++;
    }
    //console.log('data: ', data)
    return entries
}

export default parseToJSON
