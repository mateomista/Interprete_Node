import { Token } from './token.js';

const palabrasReservadas = [
  "Program",
  "end",
  "Read",
  "Write",
  "if",
  "then",
  "else",
  "while",
  "do",
  "for",
  "Real",
  "Int",
  "String"
];

export class TablaDeSimbolos {
  constructor() {
    this.simbolos = [];
}

agregar(token) {
    if (palabrasReservadas.includes(token.valor)) {
      this.simbolos.push(new Token(token.valor, token.valor));
    } else {
      this.simbolos.push(token);
    }
}

  obtener(lexema) {
    return this.simbolos.find(t => t.valor === lexema) || null;
  }

  contiene(lexema) {
    return this.simbolos.some(t => t.valor === lexema);
  }

  contieneFinDeArchivo() {
    return this.simbolos.some(t => t.tipo === '$');
  }

  limpiar() {
    this.simbolos = [];
  }

}
