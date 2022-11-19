// let parse the binary string back in to bytes
const str_to_binary = str => {
    var bytes = new Uint8Array( str.length );
    for(var i=0; i< str.length; i++)
        bytes[i] = str.charCodeAt(i);
    return bytes;
}

export default str_to_binary;
