import { esConstanteCadena, esConstanteEntera, esConstanteReal, esIdentificador, esOperadorRelacional, esSimboloEspecial} from './automatas/index.js';
import { TablaDeSimbolos } from './tablaDeSimbolos.js';
import { Token } from './token.js';
import { esEspacioOControl } from './utils.js';
import fs from 'node:fs';

const filePath = '../data/program.txt';

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
export class AnalizadorLexico {
  #indice = 0;           
  #tablaDeSimbolos = []; 
  #fuente = ' ';          

  constructor(fuente) {
    this.#fuente = cargarFuente();
    this.#tablaDeSimbolos = new TablaDeSimbolos();
    this.#indice = 0;
    this.analizarFuente();
  }

  analizarFuente() {
    let i = 0;
    const longitud = this.#fuente.length;

    while (i < longitud) {
      while (i < longitud && esEspacioOControl(this.#fuente[i])) {
        i++;
      }
      if (i >= longitud) break;

      let resultado = false;

      if ((resultado = esIdentificador(this.#fuente, i)) !== false) {
        this.#tablaDeSimbolos.agregar(resultado.token);
        i = resultado.nuevaPos;
      } else if ((resultado = esConstanteCadena(this.#fuente, i)) !== false) {
        this.#tablaDeSimbolos.agregar(resultado.token);
        i = resultado.nuevaPos;
      } else if ((resultado = esConstanteReal(this.#fuente, i)) !== false) {
        this.#tablaDeSimbolos.agregar(resultado.token);
        i = resultado.nuevaPos;
      } else if ((resultado = esConstanteEntera(this.#fuente, i)) !== false) {
        this.#tablaDeSimbolos.agregar(resultado.token);
        i = resultado.nuevaPos;
      } else if ((resultado = esOperadorRelacional(this.#fuente, i)) !== false) {
        this.#tablaDeSimbolos.agregar(resultado.token);
        i = resultado.nuevaPos;
      } else if ((resultado = esSimboloEspecial(this.#fuente, i)) !== false) {
        this.#tablaDeSimbolos.agregar(resultado.token);
        i = resultado.nuevaPos;
      } else {
        throw new Error(`Error léxico en la posición ${i}: '${this.#fuente[i]}' no es un token válido.`);
      }
    }

    // Token fin de archivo
    this.#tablaDeSimbolos.agregar(new Token('$', 'fin de archivo'));
  }

  primerToken() {
    return this.#tablaDeSimbolos.length > 0 ? this.#tablaDeSimbolos[0] : null;
  }

  siguienteToken() {
    // Devuelve y elimina el primer token
    const token = this.#tablaDeSimbolos.simbolos.shift();
    return token;


  }


  getTablaDeSimbolos() {
    return this.#tablaDeSimbolos;
  }
}



const analizador = new AnalizadorLexico(fuente);

const tabla = analizador.getTablaDeSimbolos();

const siguientetoken = analizador.siguienteToken();



while (true) {
  const token = analizador.siguienteToken();
  if (!token) break; // Si no hay más tokens, salimos del bucle
  console.log(token);
} 