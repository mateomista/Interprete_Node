import { AnalizadorLexico } from './lexer.js';
import { TablaDeSimbolos } from './tablaDeSimbolos.js';
import fs from 'node:fs';

const filePath = './data/program.txt';

function cargarFuente() {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return data;
    } catch (err) {
        console.error(`Error al leer el archivo: ${err}`);
        return '';
    }
}

const fuente = cargarFuente();
const lexer = new AnalizadorLexico(fuente);

let pos = 0;
let contiene = false;

export function proximoComponenteLexico (pos) {

    let tablaDeSimbolos = new TablaDeSimbolos();

    if (tablaDeSimbolos.simbolos.length === 0) {

        while (!contiene) {

            let resultado = lexer(fuente, tablaDeSimbolos, pos);
            pos = resultado.nuevaPos;
           
            contiene = tablaDeSimbolos.contieneFinDeArchivo('$');

        } 

        console.log(tablaDeSimbolos.simbolos);
    }
    tablaDeSimbolos = lexer(fuente, tablaDeSimbolos, pos);
}

proximoComponenteLexico(pos);

/*
while (!contiene) {
    let resultado = lexer(fuente, tablaDeSimbolos, pos);
    pos = resultado.nuevaPos;

    console.log(tablaDeSimbolos.simbolos);
    contiene = tablaDeSimbolos.contieneFinDeArchivo('$');
} */