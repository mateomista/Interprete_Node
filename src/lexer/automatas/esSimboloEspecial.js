import { Token } from '../token.js';

export function esSimboloEspecial(fuente, pos) {
    let i = pos;
    const longitud = fuente.length;
    let lexema = '';

    if (i >= longitud) {
        return false; // No hay caracteres para procesar
    }

    switch (fuente[i]) {
        case '+':
            lexema += fuente[i];
            i++;
            return {
                token: new Token('+', lexema),
                nuevaPos: i
            };
        case '^':
            lexema += fuente[i];
            i++;
            return {
                token: new Token('^', lexema),
                nuevaPos: i
            };
        case '-':
            lexema += fuente[i];
            i++;
            return {
                token: new Token('-', lexema),
                nuevaPos: i
            };
        case '*':
            lexema += fuente[i];
            i++;
            return {
                token: new Token('*', lexema),
                nuevaPos: i
            };
        case ':':
            lexema += fuente[i];
            i++;
            if (i < longitud && fuente[i] === '=') {
                lexema += fuente[i];
                i++;
                return { token: new Token(':=', lexema), nuevaPos: i }; // Operador asignación
            } else {
                return { token: new Token(':', lexema), nuevaPos: i };  // Separador de tipos
            }
                
        case '!':
            lexema += fuente[i];
            i++;
            if (i < longitud && fuente[i] === '=') {
                lexema += fuente[i];
                i++;
                return { token: new Token('!=', lexema), nuevaPos: i }; // Operador relacional de distinto (!=)
            } else {
                return { token: new Token('!', lexema), nuevaPos: i };     // Símbolo NOT lógico solo
            }
            
        case '&':
            lexema += fuente[i];
            i++;
            return {
                token: new Token('&',lexema),
                nuevaPos: i
            }
        case '|':
            lexema += fuente[i];
            i++;
            return {
                token: new Token('|', lexema),
                nuevaPos: i
            };
        case '/':
            lexema += fuente[i];
            i++;
            return {
                token: new Token('/', lexema),
                nuevaPos: i
            };
        case ';':
            lexema += fuente[i];
            i++;
            return {
                token: new Token(';', lexema), // sE para simbolo especial
                nuevaPos: i
            };
        case ',':
            lexema += fuente[i];
            i++;
            return {
                token: new Token(',', lexema),
                nuevaPos: i
            };
        case '(':
            lexema += fuente[i];
            i++;
            return {
                token: new Token('(', lexema),
                nuevaPos: i
            };
        case ')':
            lexema += fuente[i];
            i++;
            return {
                token: new Token(')', lexema),
                nuevaPos: i
            };
        case '{':
            lexema += fuente[i];
            i++;
            return { token: new Token('{', lexema), nuevaPos: i };

        case '}':
            lexema += fuente[i];
            i++;
            return { token: new Token('}', lexema), nuevaPos: i };
        case '[':
            lexema += fuente[i];
            i++;
            return { token: new Token('[', lexema), nuevaPos: i };

        case ']':
            lexema += fuente[i];
            i++;
            return { token: new Token(']', lexema), nuevaPos: i };

        default:
            return false; // No es un símbolo especial reconocido
    }
}