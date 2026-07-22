export class Arbol {
    #root;
    constructor() {
        this.#root = new NodoArbol('Programa'); // Nodo raíz del árbol
    }

    get root() {
        return this.#root;
    }

    imprimirArbol(nodo = this.#root, indent = '') {
        if (!nodo) return;
        console.log(indent + nodo.simbolo);
        if (nodo.hijos && nodo.hijos.length > 0) {
            for (const hijo of nodo.hijos) {
                this.imprimirArbol(hijo, indent + '  '); // Llamada recursiva con this
            }
        }
    }
}

export class NodoArbol {
    #simbolo;
    #hijos;
    #esTerminal;
    #token

    // para decoraciones semánticas
    #tipo;
    #referenciaTS;
    #rol;
    #valor;
    #errorSemantico;

    constructor(simbolo, esTerminal = false, token = null) {
        this.#simbolo = simbolo;
        this.#hijos = [];
        this.#esTerminal = esTerminal; 
        this.#token = token;
        // Inicializar decoraciones en null
        this.#tipo = null;
        this.#referenciaTS = null;
        this.#valor = null;
        this.#rol = null;
        this.#errorSemantico = null;
    }

    agregarHijo(nodoHijo) {
        this.#hijos.push(nodoHijo);
        return this; 
    }

    // Getters originales
    get simbolo() {
        return this.#simbolo;
    }

    get hijos() {
        return this.#hijos;
    }

    get esTerminal() {
        return this.#esTerminal;
    }
    
    // Getters y setters para decoraciones

    get tipo() {
        return this.#tipo;
    }

    set tipo(valor) {
        this.#tipo = valor;
    }

    
    get referenciaTS() {
        return this.#referenciaTS;
    }

    set referenciaTS(valor) {
        this.#referenciaTS = valor;
    }

    get valor() {
        return this.#valor;
    }

    set valor(valor) {
        this.#valor = valor;
    }

    get rol() {
        return this.#rol;
    }

    set rol(valor) {
        this.#rol = valor;
    }

    get errorSemantico() {
        return this.#errorSemantico;
    }

    set errorSemantico(valor) {
        this.#errorSemantico = valor;
    }

    get token() {
        return this.#token;
    }

    set token(valor) {
        this.#token = valor;
    }

    imprimirArbol(nivel = 0) {
    const indent = '  '.repeat(nivel);

    let extras = [];
    if (this.#tipo !== null) extras.push(`Tipo: ${this.#tipo}`);
    if (this.#rol !== null) extras.push(`Rol: ${this.#rol}`);
    if (this.#errorSemantico !== null) extras.push(`Error: ${this.#errorSemantico}`);

    console.log(`${indent}- ${this.#simbolo} ${this.#esTerminal ? '(Terminal)' : '(No Terminal)'} ${extras.join(' | ')} ${this.#token}`);

    for (const hijo of this.#hijos) {
        hijo.imprimirArbol(nivel + 1);
    }
}

}
