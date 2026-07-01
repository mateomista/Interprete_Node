import { Token } from '../token.js';

const Sigma = {
  NUMERO: 0,
  PUNTO: 1,
  OTRO: 2
};

const Q = {
  q0: 0,
  q2: 1,
  q4: 2,
  q6: 3,
  q7: 4,
  Err: 5
};

const EstadosFinales = [Q.q7];

function categoriaCaracter(c) {
  if (c >= '0' && c <= '9') return Sigma.NUMERO;
  if (c === '.') return Sigma.PUNTO;
  return Sigma.OTRO;
}

const Delta = [
  /* q0 */ [Q.q2, Q.Err, Q.Err],  // N, ., O
  /* q2 */ [Q.q2, Q.q4, Q.Err],
  /* q4 */ [Q.q6, Q.Err, Q.Err],
  /* q6 */ [Q.q6, Q.q7, Q.q7],
  /* q7 */ [Q.q7, Q.q7, Q.q7],
  /* Err*/ [Q.Err, Q.Err, Q.Err]
];


export function esConstanteReal(fuente, pos) {
    let estadoActual = Q.q0;
    let i = pos;
    let lexema = '';
    const longitud = fuente.length;

    let cat = categoriaCaracter(fuente[i]);
    estadoActual = Delta[estadoActual][cat];

    

    while (estadoActual !== Q.Err && i < longitud) {
        



        if (estadoActual === Q.q2 || estadoActual === Q.q4 || estadoActual === Q.q6) {
            lexema += fuente[i];
            i++;
            cat = categoriaCaracter(fuente[i]);
            estadoActual = Delta[estadoActual][cat];
            continue;

        } else if (estadoActual === Q.q7) {

            return {
                token: new Token('cteReal', lexema),
                nuevaPos: i
            };

        } else {
            // Estado de error
            return false; // No es una constante real válida
        }

        
    }
    return false; // No es una constante real válida
}

