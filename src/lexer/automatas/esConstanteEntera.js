import { Token } from '../token.js';
import { esDigito } from './utils.js';

const Q = { q0: 0, q2: 1, q3: 2, q4: 3 };
const EstadosFinales = [Q.q3];

const Delta = [
    //       NUMERO, OTRO
    /* q0 */ [Q.q2, Q.q4],
    /* q2 */ [Q.q2, Q.q3],
    /* q3 */ [Q.q3, Q.q3], // ACEPTACION
    /* q4 */ [Q.q4, Q.q4] // error
];

const Sigma = {   // '-'
    NUMERO: 0,  // dígitos 0-9
    OTRO: 1     // cualquier otro carácter
};

/* function categoriaCaracter(c) {
    if (c === '-') return Sigma.MENOS;
    if (/[0-9]/.test(c)) return Sigma.NUMERO;
    return Sigma.OTRO;
} */

export function esConstanteEntera(fuente, pos) {
    let estadoActual = Q.q0;
    let i = pos;
    let lexema = '';
    const longitud = fuente.length;

    while (estadoActual !== Q.q4 && i < longitud) {
        
        if (esDigito(fuente[i])) {
            estadoActual = Delta[estadoActual][Sigma.NUMERO];
        } else {
            estadoActual = Delta[estadoActual][Sigma.OTRO];
        }
        

        if (estadoActual === Q.q2) {
            lexema += fuente[i];
            i++;
        } else if (estadoActual === Q.q3) {
            // Estado de aceptación
            return {
                token: new Token('cteReal', lexema),
                nuevaPos: i
            };
        } else {
            // Estado de error
            return false; // No es una constante entera válida
        }
    }

    return false; // No es una constante entera válida
    
}