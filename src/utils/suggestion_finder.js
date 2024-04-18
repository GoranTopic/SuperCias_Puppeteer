// prompt the user for the input
import readline from 'readline';


const spanish_alpha_numeric = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'ñ', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ' '];
const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

class Suggestion_finder {
    constructor({ options=spanish_alpha_numeric, initial_queue=null }) {
        // Initialize the queue
        initial_queue = initial_queue || options;
        this.options = [ ...options ];
        // make a queue with the initial suggestions
        this.suggestions = [ ...initial_queue ];
    }

    check(string, exploreMore) {
        // Check if the suggestions are valid
        if(exploreMore) // add to the queue more suggestions
            this.options.forEach(option => this.suggestions.push( string + option));
    }

    next() {
        // Return the next suggestion
        return this.suggestions.shift();
    }
}

export default Suggestion_finder;

/* test suggestion_finder.js */
/*
console.log('testing suggestion_finder.js');
// Create an interface for input and output
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
// Wrap rl.question in a function that returns a Promise
function questionAsync(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, (answer) => {
            resolve(answer);
        });
    });
}

let suggestion_finder = new Suggestion_finder({ options: digits });
let suggestion = suggestion_finder.next();
let awser = '';
while (suggestion) {
    console.log(suggestion_finder.suggestions);
    suggestion = suggestion_finder.next();
    awser = await questionAsync('get more suggestions? (y/n):');
    suggestion_finder.check(suggestion, awser === 'y');
}
*/
