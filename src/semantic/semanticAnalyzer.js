import { esIdentificador } from "../lexer/automatas/esIdentificador.js";
import { Arbol } from "../parser/arbol.js";
import { Parser } from "../parser/parser.js";
import { TokenSemantico } from "./tokenSemantico.js";
import { TablaDeSimbolos } from "../lexer/tablaDeSimbolos.js";
import { TablaDeSimbolosSemantica } from "./tablaDeSimbolosSemanticos.js";

export class AnalizadorSemantico {
    
    #tablaDeSimbolos;
    #errores;
    #arbol;
    
    constructor(arbol) {
        this.#tablaDeSimbolos = new TablaDeSimbolos();
        this.#errores = [];
        this.#arbol = arbol;
    }

    analizar() {

        let nodo = arbol.root;
        //if (!nodo) return;
        if (!nodo) return;

            switch (nodo.simbolo) {
                case 'Programa':
                    this.manejarPrograma(nodo);
                    break;
                case 'DeclaracionVar':
                    this.manejarDeclaracionVar(nodo);
                    break;
                case 'Declaracion':
                    this.manejarDeclaracion(nodo);
                    break;
                case 'Tipo':
                    this.manejarTipo(nodo);
                    break;
                case 'TipoArreglo':
                    this.manejarTipoArreglo(nodo);
                    break;
                case 'Secuencia':
                    this.manejarSecuencia(nodo);
                    break;
                case 'Sentencia':
                    this.manejarSentencia(nodo);
                    break;
                case 'Asignacion':
                    this.manejarAsignacion(nodo);
                    break;
                case 'Variable':
                    this.manejarVariable(nodo);
                    break;
                case 'AccesoArreglo':
                    this.manejarAccesoArreglo(nodo);
                    break;
                case 'ExpArit':
                    this.manejarExpArit(nodo);
                    break;
                case "ExpArit'":
                    this.manejarExpAritPrima(nodo);
                    break;
                case 'Termino':
                    this.manejarTermino(nodo);
                    break;
                case "Termino'":
                    this.manejarTerminoPrima(nodo);
                    break;
                case 'Factor':
                    this.manejarFactor(nodo);
                    break;
                case "Factor'":
                    this.manejarFactorPrima(nodo);
                    break;
                case 'Potencia':
                    this.manejarPotencia(nodo);
                    break;
                case 'LiteralArray':
                    this.manejarLiteralArray(nodo);
                    break;
                case 'ListaElementos':
                    this.manejarListaElementos(nodo);
                    break;
                case 'ListaElementosPrima':
                    this.manejarListaElementosPrima(nodo);
                    break;
                case 'Leer':
                    this.manejarLeer(nodo);
                    break;
                case 'Escribir':
                    this.manejarEscribir(nodo);
                    break;
                case 'ListaEscritura':
                    this.manejarListaEscritura(nodo);
                    break;
                case 'ListaCadena':
                    this.manejarListaCadena(nodo);
                    break;
                case 'SiEntSino':
                    this.manejarSiEntSino(nodo);
                    break;
                case "SiEntSino'":
                    this.manejarSiEntSinoPrima(nodo);
                    break;
                case 'While':
                    this.manejarWhile(nodo);
                    break;
                case 'For':
                    this.manejarFor(nodo);
                    break;
                case 'Condicion':
                    this.manejarCondicion(nodo);
                    break;
                case 'CondicionPrima':
                    this.manejarCondicionPrima(nodo);
                    break;
                case 'TerminoLogico':
                    this.manejarTerminoLogico(nodo);
                    break;
                case 'TerminoLogicoPrima':
                    this.manejarTerminoLogicoPrima(nodo);
                    break;
                case 'FactorLogico':
                    this.manejarFactorLogico(nodo);
                    break;
                default:
                    // Recorrer hijos si no hay método específico
                    for (const hijo of nodo.hijos) {
                        this.analizarSemantica(hijo);
                    }
                    break;
        }

    }

    // Programa → “Program” “id” “;” DeclaracionVar “{“ Cuerpo “}” ACTUALIZAR
    manejarPrograma(nodo){
        this.#tablaDeSimbolos.agregar(new TokenSemantico('id', nodo.hijos[1].token.lexema, nodo.hijos[1].token.lexema, null, false));
        this.manejarDeclaracionVar(nodo.hijos[3]);
        this.manejarSecuencia(nodo.hijos[5]); 
    }

    // DeclaracionVar → Declaracion DeclaracionVar | ε
    manejarDeclaracionVar(nodo) {
        
            if (!nodo.hijos || nodo.hijos.length === 0) return;
            this.manejarDeclaracion(nodo.hijos[0]);
            if (nodo.hijos[1]) this.manejarDeclaracionVar(nodo.hijos[1]);
        

    }

    // Declaracion → “id” “:” Tipo “;”
    manejarDeclaracion(nodo) {

        this.manejarTipo(nodo.hijos[2])
        const tipoDato = nodo.hijos[2].token.tipoDeclarado;
        const esArray = nodo.hijos[2].hijos[1] !== undefined && nodo.hijos[2].hijos[1] !== null;

        try {
            const token = new TokenSemantico('var', nodo.hijos[0].token.lexema, null, tipoDato, esArray)
            this.#tablaDeSimbolos.agregar(token);
        } catch (e) {
            this.#errores.push(e.message);
        }

    }
    
   
    // Tipo → "Real" <TipoArreglo>
    manejarTipo(nodo) {
        nodo.token.tipoDeclarado = 'Real';
        
        // Si tiene un hijo en la posición 1, procesamos el TipoArreglo
        if (nodo.hijos && nodo.hijos[1]) {
            this.manejarTipoArreglo(nodo.hijos[1]);
        }
    }


    // Secuencia → Sentencia Secuencia | ε    ACTUALIZARRR
    manejarSecuencia(nodo){
        if (!nodo.hijos || nodo.hijos.length === 0) return;
        this.manejarSentencia(nodo.hijos[0]);
        if (nodo.hijos[1]) this.manejarSecuencia(nodo.hijos[1]); // Cambiado a manejarSecuencia
    }

    // Sentencia → Asignacion “;” | Escribir “;”  | SiEntSino “;”  | While “;” | For “;”
    manejarSentencia(nodo){

        const sentencia = nodo.hijos[0].simbolo;
        // const nodo = nodo.hijos[0];

        switch(sentencia) {
            case 'Asignacion':
                this.manejarAsignacion(nodo);
                break;
            case 'Escribir':
                this.manejarEscribir(nodo);
                break;
            case 'SiEntSino':
                this.manejarSiEntSino(nodo);
                break;
            case 'While':
                this.manejarWhile(nodo);
                break;
            case 'For':
                this.manejarFor(nodo);
                break;
            default:
                return;
        }

    }

    // Asignacion → Variable “:=” AsignacionDetalle
    manejarAsignacion(nodo) {
        const tokenTS = this.#tablaDeSimbolos.obtener(nodo.hijos[0].token.lexema);
        if (!tokenTS) {
            this.#errores.push(`Error. Variable ${nodo.hijos[0].token.lexema} no declarada`);
            return;
        }

        this.manejarExpArit(nodo.hijos[2]); // Va directo a ExpArit

        if (tokenTS.tipoDato !== nodo.hijos[2].token.tipoDato){
            this.#errores.push(`Error. Tipos incompatibles.`);
        }
    }

    // ExpArit → Termino ExpArit'
    manejarExpArit(nodo){

        this.manejarTermino(nodo.hijos[0]);
        this.manejarExpAritPrima(nodo.hijos[1]);

        
    }

    // ExpArit' → “+” Termino ExpArit' | “-” Termino ExpArit' | ε
    manejarExpAritPrima(nodo){
        if (nodo.hijos.length === 0) return;
        this.manejarTermino(nodo.hijos[1]);
        if (nodo.hijos[2]) {
            this.manejarExpAritPrima(nodo.hijos[2]);
        }
        nodo.token.tipoDato = 'Real'; 
    }

    manejarTerminoPrima(nodo){

    }

    // Termino → Factor Termino'
    manejarTermino(nodo){
        this.manejarFactor(nodo.hijos[0]);
        this.manejarTerminoLogicoPrima(nodo.hijos[1])
    }

    // Factor → Potencia Factor'
    manejarFactor(nodo) {
        this.manejarPotencia(nodo.hijos[0]);
        this.manejarFactorPrima(nodo.hijos[1]);
    }

    // Potencia → “(“ ExpArit “)” | Variable | Real | LiteralArray | “-” Potencia 
    manejarPotencia(nodo) {
        let produccion = nodo.hijos[0].simbolo;
        switch(produccion) {
            case 'Variable': 
                this.manejarVariable(nodo.hijos[0]);
                nodo.token.tipoDato = nodo.hijos[0].token.tipoDato;
                break;
            case 'cteReal': // Actualizado con el nuevo token de constante
                nodo.hijos[0].token.valor = Number(nodo.hijos[0].token.lexema);
                nodo.token.valor = nodo.hijos[0].token.valor;
                nodo.token.tipoDato = 'Real';
                break;
            case 'LiteralArray':
                this.manejarLiteralArray(nodo.hijos[0]);
                nodo.token.tipoDato = nodo.hijos[0].token.tipoDato;
                break;
        }
    }

    // LiteralArray → “[“ ListaElementos “]”
    manejarLiteralArray(nodo) {
     
        if (nodo.hijos[1]) {
            this.manejarListaElementos(nodo.hijos[1]);
            nodo.token.tipoDato = nodo.hijos[1].token.tipoDato;
        } else {
            nodo.token.tipoDato = 'Array';
        }

    }

    // ListaElementos → ExpArit ListaElementosPrima
    manejarListaElementos(nodo) {

        this.manejarExpArit(nodo.hijos[0]);
        nodo.token.tipoDato = nodo.hijos[0].token.tipoDato;

        if (nodo.hijos[1]) {
            this.manejarListaElementosPrima(nodo.hijos[1]);
        } else {
            return;
        }

        if (nodo.token.tipoDato !== nodo.hijos[1].token.tipoDato) {
            this.#errores.push(`Error. Los tipos de los elementos del array deben ser iguales.`);
        }

    }

    // ListaElementosPrima → “,” ExpArit ListaElementosPrima | ε 
    manejarListaElementosPrima(nodo) {
        if (nodo.hijos.length === 0) return;

        this.manejarExpArit(nodo.hijos[1]);
        nodo.token.tipoDato = nodo.hijos[1].token.tipoDato;

        if (nodo.hijos[2]) {
            this.manejarListaElementosPrima(nodo.hijos[2]);
        } else {
            return;
        }

        if (nodo.token.tipoDato !== nodo.hijos[2].token.tipoDato) {
            this.#errores.push(`Error. Los tipos de los elementos del array deben ser iguales.`);
        }
    }

    // Variable → “id” AccesoArreglo
   manejarVariable(nodo) {
        const lexema = nodo.hijos[0].token.lexema;
        
        const tokenTS = this.#tablaDeSimbolos.obtener(lexema);
        
        if (tokenTS) {

            nodo.token.tipoDato = tokenTS.tipoDato;    
            nodo.token.tipo = 'var';                    

        } else {
            this.#errores.push(`Error. Variable '${lexema}' no declarada`);
            return;
        } 

        if (nodo.hijos[1]) {
            this.manejarAccesoArreglo(nodo.hijos[1]);
        }
    }

    // AccesoArreglo → “[” ExpArit “]” | ε       
    manejarAccesoArreglo(nodo) {
        if (nodo.hijos[1]) {
            this.manejarExpArit(nodo.hijos[1])
        } else {
            return;
        }

        const valorIndice = nodo.hijos[1].token.valor;

        if (typeof valorIndice !== 'number' || !Number.isInteger(valorIndice)) {
           this.#errores.push(`Error. El acceso al array debe ser entero.`) 
        }

    }

    manejarLeer(nodo) {
        // nodo.hijos[0] es "Read", nodo.hijos[2] es <Variable>
        this.manejarVariable(nodo.hijos[2]);
    }

    // TipoArreglo → "[" "cteReal" "]" | ε
    manejarTipoArreglo(nodo) {
        if (!nodo.hijos || nodo.hijos.length === 0) {
            nodo.token.esArray = false;
            return;
        }
        // hijo 0 es "[", hijo 1 es "cteReal", hijo 2 es "]"
        nodo.token.esArray = true;
        nodo.token.tamanoArreglo = Number(nodo.hijos[1].token.lexema);
    }

    // AsignacionDetalle → <ExpArit>
    manejarAsignacionDetalle(nodo) {
        this.manejarExpArit(nodo.hijos[0]);
        // Propagamos el tipo de dato que resolvió la expresión aritmética
        nodo.token.tipoDato = nodo.hijos[0].token.tipoDato;
    }

    // Termino' → “*” <Factor> <Termino'> | “/” <Factor> <Termino'> | ε
    manejarTerminoPrima(nodo) {
        if (!nodo.hijos || nodo.hijos.length === 0) return;

        // hijo 0 es el operador ("*" o "/"), hijo 1 es <Factor>
        this.manejarFactor(nodo.hijos[1]);

        if (nodo.hijos[2]) {
            this.manejarTerminoPrima(nodo.hijos[2]);
        }

        // Como solo manejamos tipo Real, el resultado de la operación siempre es Real
        nodo.token.tipoDato = 'Real';
    }

    // Factor' → “^” <Potencia> <Factor'> | ε
    manejarFactorPrima(nodo) {
        if (!nodo.hijos || nodo.hijos.length === 0) return;

        // hijo 0 es "^", hijo 1 es <Potencia>
        this.manejarPotencia(nodo.hijos[1]);

        if (nodo.hijos[2]) {
            this.manejarFactorPrima(nodo.hijos[2]);
        }

        nodo.token.tipoDato = 'Real';
    }

    // Escribir → “Write” “(“ <ListaEscritura> “)”
    manejarEscribir(nodo) {
        // hijo 0: "Write", hijo 1: "(", hijo 2: <ListaEscritura>, hijo 3: ")"
        this.manejarListaEscritura(nodo.hijos[2]);
    }

    // ListaEscritura → "cteCadena" <ListaCadena> | <ExpArit> <ListaCadena>
    manejarListaEscritura(nodo) {
        if (nodo.hijos[0].simbolo === 'cteCadena') {
            nodo.token.tipoDato = 'String'; 
        } else {
            // Caso <ExpArit>: Validamos que la expresión matemática sea correcta
            this.manejarExpArit(nodo.hijos[0]);
            nodo.token.tipoDato = nodo.hijos[0].token.tipoDato;
        }

        // Si hay más elementos para escribir separados por coma, los procesamos
        if (nodo.hijos[1]) {
            this.manejarListaCadena(nodo.hijos[1]);
        }
    }

    // ListaCadena → “,” <ListaEscritura> | ε
    manejarListaCadena(nodo) {
        if (!nodo.hijos || nodo.hijos.length === 0) return; // Caso ε

        // hijo 0: ",", hijo 1: <ListaEscritura>
        this.manejarListaEscritura(nodo.hijos[1]);
    }

    // SiEntSino → “if” <Condicion> “then” “{“ <Secuencia> “}” <SiEntSino'>
    manejarSiEntSino(nodo) {
        // hijo 0: "if", hijo 1: <Condicion>, hijo 2: "then", hijo 3: "{", hijo 4: <Secuencia>, hijo 5: "}", hijo 6: <SiEntSino'>
        this.manejarCondicion(nodo.hijos[1]);
        this.manejarSecuencia(nodo.hijos[4]);
        
        // Si existe el bloque else (hijo 6), lo manejamos
        if (nodo.hijos[6]) {
            this.manejarSiEntSinoPrima(nodo.hijos[6]);
        }
    }

    // SiEntSino' → “else” “{“ <Secuencia> “}” | ε
    manejarSiEntSinoPrima(nodo) {
        if (!nodo.hijos || nodo.hijos.length === 0) return; // Caso ε

        // hijo 0: "else", hijo 1: "{", hijo 2: <Secuencia>, hijo 3: "}"
        this.manejarSecuencia(nodo.hijos[2]);
    }

    // While → “while” <Condicion> “do” “{“ <Secuencia> “}”
    manejarWhile(nodo) {
        // hijo 0: "while", hijo 1: <Condicion>, hijo 2: "do", hijo 3: "{", hijo 4: <Secuencia>, hijo 5: "}"
        this.manejarCondicion(nodo.hijos[1]);
        this.manejarSecuencia(nodo.hijos[4]);
    }

    // For → “for” “(“ <Asignacion> “;” <Condicion> “)” “{“ <Secuencia> “}”
    manejarFor(nodo) {
        // hijo 0: "for", hijo 1: "(", hijo 2: <Asignacion>, hijo 3: ";", hijo 4: <Condicion>, hijo 5: ")", hijo 6: "{", hijo 7: <Secuencia>, hijo 8: "}"
        this.manejarAsignacion(nodo.hijos[2]);
        this.manejarCondicion(nodo.hijos[4]);
        this.manejarSecuencia(nodo.hijos[7]);
    }

    // Condicion → <TerminoLogico> <CondicionPrima>
    manejarCondicion(nodo) {
        // hijo 0: <TerminoLogico>, hijo 1: <CondicionPrima>
        this.manejarTerminoLogico(nodo.hijos[0]);
        this.manejarCondicionPrima(nodo.hijos[1]);
    }

    // CondicionPrima → “|” <TerminoLogico> <CondicionPrima> | ε
    manejarCondicionPrima(nodo) {
        if (!nodo.hijos || nodo.hijos.length === 0) return; // Caso ε

        // hijo 0: "|", hijo 1: <TerminoLogico>, hijo 2: <CondicionPrima>
        this.manejarTerminoLogico(nodo.hijos[1]);
        this.manejarCondicionPrima(nodo.hijos[2]);
    }

    // TerminoLogico → <FactorLogico> <TerminoLogicoPrima>
    manejarTerminoLogico(nodo) {
        // hijo 0: <FactorLogico>, hijo 1: <TerminoLogicoPrima>
        this.manejarFactorLogico(nodo.hijos[0]);
        this.manejarTerminoLogicoPrima(nodo.hijos[1]);
    }

    // TerminoLogicoPrima → “&” <FactorLogico> <TerminoLogicoPrima> | ε
    manejarTerminoLogicoPrima(nodo) {
        if (!nodo.hijos || nodo.hijos.length === 0) return; // Caso ε

        // hijo 0: "&", hijo 1: <FactorLogico>, hijo 2: <TerminoLogicoPrima>
        this.manejarFactorLogico(nodo.hijos[1]);
        this.manejarTerminoLogicoPrima(nodo.hijos[2]);
    }

    // FactorLogico → "!" <FactorLogico> | "{" <Condicion> "}" | <ExpArit> "opRel" <ExpArit>
    manejarFactorLogico(nodo) {
        let primeraProduccion = nodo.hijos[0].simbolo;

        if (primeraProduccion === '!') {
            // Caso negación: descendemos recursivamente al siguiente factor
            this.manejarFactorLogico(nodo.hijos[1]);
        } else if (primeraProduccion === '{') {
            // Caso llaves de agrupamiento: hijo 0 es "{", hijo 1 es <Condicion>, hijo 2 es "}"
            this.manejarCondicion(nodo.hijos[1]);
        } else {
            // Caso relacional: <ExpArit> "opRel" <ExpArit>
            // hijo 0: <ExpArit> (izq), hijo 1: "opRel", hijo 2: <ExpArit> (der)
            this.manejarExpArit(nodo.hijos[0]);
            this.manejarExpArit(nodo.hijos[2]);

        }
    }

    reportarErrores() {
        this.errores.forEach(e => console.error(e));
    }
}

let analizadorSintactico = new Parser();
const arbol = analizadorSintactico.parsear();

let analizadorSemantico = new AnalizadorSemantico(arbol);
analizadorSemantico.analizar();

console.log("--- RESULTADOS DEL ANÁLISIS SEMÁNTICO ---");
if (analizadorSemantico.errores && analizadorSemantico.errores.length > 0) {
    analizadorSemantico.reportarErrores();
} else {
    console.log("¡Análisis semántico exitoso! Cero errores detectados.");
}