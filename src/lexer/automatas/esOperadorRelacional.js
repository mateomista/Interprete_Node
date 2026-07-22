import { Token } from '../token.js';

export function esOperadorRelacional(fuente, pos) {
    let i = pos;
    const longitud = fuente.length;
    let lexema = '';

    if (i >= longitud) {
        return false; // No hay caracteres para procesar
    }

    if (fuente[i] === '<') {
        lexema += fuente[i];
        i++;

        if (i < longitud && fuente[i] === '=') {
            lexema += fuente[i];
            i++;
            return {
                token: new Token('opRel', lexema),
                nuevaPos: i
            }; // es un operador menor o igual
        }

        if (i < longitud && fuente[i] === '>') {
            lexema += fuente[i];
            i++;
            return {
                token: new Token('opRel', lexema),
                nuevaPos: i
            }; // es un operador diferente
        }

        return {
            token: new Token('opRel', lexema),
            nuevaPos: i
        }; // es un operador menor
    }

    if (fuente[i] === '>') {
        lexema += fuente[i];
        i++;

        if (i < longitud && fuente[i] === '=') {
            lexema += fuente[i];
            i++;
            return {
                token: new Token('opRel', lexema),
                nuevaPos: i
            }; // es un operador mayor o igual
        }

        return {
            token: new Token('opRel', lexema),
            nuevaPos: i
        }; // es un operador mayor
    }

    if (fuente[i] === '=') {
        lexema += fuente[i];
        i++;
        return {
            token: new Token('opRel', lexema),
            nuevaPos: i
        }; // es un operador de igualdad
    }

    return false; // No es un operador relacional

}