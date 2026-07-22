export class TokenSemantico {
    #tipo;
    #lexema;
    #valor;
    #tipoDato;
    #array;
    
    constructor(tipo = null, lexema = null, valor = null, tipoDato = null, array = false) {
        this.#tipo = tipo;
        this.#lexema = lexema;
        this.#valor = valor;
        this.#tipoDato = tipoDato;
        this.#array = array;       
    }

    get tipo() {
        return this.#tipo;
    }
    set tipo(nuevoTipo) {
        this.#tipo = nuevoTipo;
    }

    get lexema() {
        return this.#lexema;
    }
    set lexema(nuevoLexema) {
        this.#lexema = nuevoLexema;
    }

    get valor() {
        return this.#valor;
    }
    set valor(nuevoValor) {
        this.#valor = nuevoValor;
    }

    get tipoDato() {
        return this.#tipoDato;
    }

    set tipoDato(value) {
        this.#tipoDato = value;
    }

    get array() {
        return this.#array;
    }

    set array(value) {
        this.#array = value;
    }

    toString() {
        return `Token(Tipo: ${this.#tipo}, Lexema: ${this.#lexema}, Valor: ${this.#valor}, TipoDeclarado: ${this.#tipoDato})`;
    }
}
