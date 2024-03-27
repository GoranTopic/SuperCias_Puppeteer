let miFechaHora = '2014';

// Intenta crear una instancia de Date a partir de la cadena de texto
let fechaConvertida = new Date(miFechaHora);

if (fechaConvertida instanceof Date && !isNaN(fechaConvertida)) {
    console.log('La variable es una fecha y hora válida:', fechaConvertida);
} else {
    console.log('La variable no es una fecha y hora válida.');
}