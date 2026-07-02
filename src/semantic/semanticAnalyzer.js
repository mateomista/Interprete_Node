import { esIdentificador } from "../lexer/automatas/esIdentificador.js";
import { Arbol } from "../parser/arbol.js";
import { Parser } from "../parser/parser.js";
import { TokenSemantico } from "./tokenSemantico.js";
import { TablaDeSimbolosSemantica } from "./tablaDeSimbolosSemanticos.js";
import { TablaEstado } from "./tablaEstado.js";

export class AnalizadorSemantico {
    
    #arbol;
    
    constructor(arbol) {
        this.errores = [];
        this.#arbol = arbol;

        this.tablaSimbolos = new TablaDeSimbolosSemantica();
        this.tablaEstado = new TablaEstado(); 
    }

    analizarSemantica(nodo) {
        if (!nodo) return null;
        console.log(`[AnalizadorSemantico]: Analizando nodo -> ${nodo.simbolo}, valor ${nodo.token}`);

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
                return this.manejarVariable(nodo); // Retorna el valor evaluado
            case 'AccesoArreglo':
                return this.manejarAccesoArreglo(nodo); // Retorna { esAcceso, indice }
            case 'ExpArit':
                return this.manejarExpArit(nodo); // Retorna el valor numérico
            case "ExpArit'":
                // Nota: este método se suele invocar pasándole el acumulado, 
                // pero si cae aquí directo desde el switch se inicializa en 0
                return this.manejarExpAritPrima(nodo, 0); 
            case 'Termino':
                return this.manejarTermino(nodo);
            case "Termino'":
                return this.manejarTerminoPrima(nodo, 0);
            case 'Factor':
                return this.manejarFactor(nodo);
            case "Factor'":
                return this.manejarFactorPrima(nodo, 0);
            case 'Potencia':
                return this.manejarPotencia(nodo);
            case 'LiteralArray':
                return this.manejarLiteralArray(nodo); // Retorna un array de JS []
            case 'ListaElementos':
                return this.manejarListaElementos(nodo);
            case 'ListaElementosPrima':
                return this.manejarListaElementosPrima(nodo, []);
            case 'Leer':
                this.manejarLeer(nodo);
                break;
            case 'Escribir':
                this.manejarEscribir(nodo);
                break;
            case 'ListaEscritura':
                return this.manejarListaEscritura(nodo); // Retorna la cadena armada
            case 'ListaCadena':
                return this.manejarListaCadena(nodo, "");
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
                return this.manejarCondicion(nodo); // Retorna true/false
            case 'CondicionPrima':
                return this.manejarCondicionPrima(nodo, false);
            case 'TerminoLogico':
                return this.manejarTerminoLogico(nodo);
            case 'TerminoLogicoPrima':
                return this.manejarTerminoLogicoPrima(nodo, false);
            case 'FactorLogico':
                return this.manejarFactorLogico(nodo);
            default:
                // Recorrer hijos recursivamente si es un símbolo intermedio sin regla semántica directa
                if (nodo.hijos) {
                    for (const hijo of nodo.hijos) {
                        this.analizarSemantica(hijo);
                    }
                }
                break;
        }
    }

    // 1. case 'Programa':
    manejarPrograma(nodo) {
        // Gramática: Programa → “Program” “id” “;” <DeclaracionVar> “{“ <Secuencia> “}”
        // hijos: 0:"Program", 1:id, 2:";", 3:<DeclaracionVar>, 4:"{", 5:<Secuencia>, 6:"}"
        
        const nombrePrograma = nodo.hijos[1].token.valor;
        
        this.analizarSemantica(nodo.hijos[3]); 
        
        this.analizarSemantica(nodo.hijos[5]); 
        
    }

    // 2. case 'DeclaracionVar':
    manejarDeclaracionVar(nodo) {
        // Gramática: DeclaracionVar → <Declaracion> <DeclaracionVar> | ε
        if (!nodo.hijos || nodo.hijos.length === 0) return; // Caso base ε (no hace nada)

        // hijos: 0:<Declaracion>, 1:<DeclaracionVar>
        this.analizarSemantica(nodo.hijos[0]); // Procesa la declaración actual
        this.analizarSemantica(nodo.hijos[1]); // Continúa recursivamente con las siguientes
    }

    // 3. case 'Declaracion':
    manejarDeclaracion(nodo) {
        // Gramática: Declaracion → “id” “:” <Tipo> “;”
        // hijos: 0:id, 1:":", 2:<Tipo>, 3:";"
        const tokenVar = nodo.hijos[0].token; 
        console.log(`[Declaracion]: Declarando variable -> ${tokenVar.valor} valor token ${tokenVar.lexema}`);
        const nombreVar = tokenVar.valor;
        const nodoTipo = nodo.hijos[2];

        console.log(nombreVar);

        // Control semántico obligatorio: evitar re-declaraciones en el mismo ámbito
        if (this.tablaSimbolos.existe(nombreVar)) {
            this.errores.push(`Error Semántico: La variable '${nombreVar}' ya fue declarada previamente.`);
            return;
        }

        // Delegamos el análisis del No Terminal <Tipo> para saber si es escalar o array
        const resultadoTipo = this.manejarTipo(nodoTipo);
        console.log(resultadoTipo);

        if (resultadoTipo.esArreglo) {
            this.tablaSimbolos.agregar(nombreVar, 'Arreglo', resultadoTipo.tamano);
            this.tablaEstado.inicializarArreglo(nombreVar, resultadoTipo.tamano); 
        } else {
            this.tablaSimbolos.agregar(nombreVar, 'Real');
            this.tablaEstado.inicializarEscalar(nombreVar); 
        }

    }

    // 4. case 'Tipo':
    manejarTipo(nodo) {
        // Gramática: Tipo → “Real” <TipoArreglo>
        // hijos: 0:"Real", 1:<TipoArreglo>

        const nodoTipoArreglo = nodo.hijos[1];

        // Evaluamos el No Terminal <TipoArreglo>
        // Gramática: TipoArreglo → "[" "cteReal" "]" | ε
        if (nodoTipoArreglo && nodoTipoArreglo.hijos && nodoTipoArreglo.hijos.length > 0) {
            // hijos de TipoArreglo: 0:"[", 1:cteReal, 2:"]"
            const tokenTamano = nodoTipoArreglo.hijos[1].token;
            console.log(tokenTamano.toString());
            console.log(`--- [DEBUG SEMANTICO] ---`);
            console.log(`  > Intentando crear arreglo: ${tokenTamano.lexema}`);
            console.log(`  > Tipo de dato de 'tokenTamano':`, typeof tokenTamano.valor);
            console.log(`----------------------------`);
            const tamano = parseFloat(tokenTamano.valor);

            return {
                esArreglo: true,
                tamano: tamano
            };
        }

        // Si el arreglo derivó en ε, es un Real común y corriente
        return {
            esArreglo: false,
            tamano: 0
        };
    }

    // 5. case 'TipoArreglo':
    manejarTipoArreglo(nodo) {
        // Gramática: TipoArreglo → "[" "cteReal" "]" | ε
        if (!nodo.hijos || nodo.hijos.length === 0) {
            return { esArreglo: false, tamano: 0 };
        }

        // hijos: 0:"[", 1:cteReal, 2:"]"
        const tamano = parseFloat(nodo.hijos[1].token.valor);
        return {
            esArreglo: true,
            tamano: tamano
        };
    }

    // 6. case 'Secuencia':
    manejarSecuencia(nodo) {
        // Gramática: Secuencia → <Sentencia> <Secuencia> | ε
        if (!nodo.hijos || nodo.hijos.length === 0) return; // Caso base ε

        // hijos: 0:<Sentencia>, 1:<Secuencia>
        this.analizarSemantica(nodo.hijos[0]); // Ejecuta la sentencia actual
        this.analizarSemantica(nodo.hijos[1]); // Ejecuta el resto de la secuencia
    }

    // 7. case 'Sentencia':
    manejarSentencia(nodo) {
        // Gramática: Sentencia → <Asignacion> ";" | <Escribir> ";" | <Leer> ";" | <SiEntSino> ";" | <While> ";" | <For> ";"
        // hijos: 0:<OperacionFuerte>, 1:";"
        
        // Simplemente delegamos la ejecución al hijo correspondiente (Asignacion, While, etc.)
        if (nodo.hijos && nodo.hijos.length > 0) {
            this.analizarSemantica(nodo.hijos[0]);
        }
    }

    // 8. case 'Asignacion':
    manejarAsignacion(nodo) {
        // Gramática: Asignacion → <Variable> “:=” <ExpArit>
        // hijos: 0:<Variable>, 1:":=", 2:<ExpArit>
        const nodoVariable = nodo.hijos[0]; // Variable → id AccesoArreglo
        const nodoExpresion = nodo.hijos[2];

        // 1. Obtener los detalles de la variable a la izquierda
        const nombreVar = nodoVariable.hijos[0].token.valor;
        const nodoAcceso = nodoVariable.hijos[1]; // AccesoArreglo → “[” <ExpArit> “]” | ε

        // Validación estructural en la tabla de símbolos
        if (!this.tablaSimbolos.existe(nombreVar)) {
            this.errores.push(`Error Semántico: La variable '${nombreVar}' no ha sido declarada.`);
            return;
        }

        // 2. Evaluar el valor de la derecha (llamando a la cascada matemática)
        // El método evaluarExpresion resolverá el AST de ExpArit y devolverá un número real
        const valorCalculado = this.analizarSemantica(nodoExpresion);

        // 3. Verificar si es una asignación escalar o a una celda de un Arreglo
        const esAccesoArray = nodoAcceso && nodoAcceso.hijos && nodoAcceso.hijos.length > 0;

        if (esAccesoArray) {
            // Caso: id[<ExpArit>] := valor
            // Evaluamos la expresión de adentro de los corchetes para obtener el índice real
            const indice = Math.floor(this.analizarSemantica(nodoAcceso.hijos[1]));
            
            let arregloEnMemoria = this.tablaEstado.obtenerArreglo(nombreVar);

            // Control de límites del array en ejecución
            if (indice < 0 || indice >= arregloEnMemoria.length) {
                this.errores.push(`Error de Ejecución: Índice [${indice}] fuera de rango para el arreglo '${nombreVar}'.`);
                return;
            }

            // Impactamos el cambio en la celda correspondiente
            arregloEnMemoria[indice] = valorCalculado;
            this.tablaEstado.asignarLiteralArray(nombreVar, arregloEnMemoria);
            console.log(`[tablaEstado]: ${nombreVar}[${indice}] := ${valorCalculado}`);
        } else {
            // Caso básico: id := valor
            this.tablaEstado.asignarEscalar(nombreVar, valorCalculado);
            console.log(`[tablaEstado]: ${nombreVar} := ${valorCalculado}`);
        }
    }

    // 9. case 'Variable':
    manejarVariable(nodo) {
        // Gramática: Variable → “id” <AccesoArreglo>
        // hijos: 0:id, 1:<AccesoArreglo>
        const nombreVar = nodo.hijos[0].token.valor;
        const nodoAcceso = nodo.hijos[1];

        if (!this.tablaSimbolos.existe(nombreVar)) {
            this.errores.push(`Error Semántico: Variable '${nombreVar}' no declarada.`);
            return 0;
        }

        // Evaluamos si tiene un índice entre corchetes
        const resultadoAcceso = this.manejarAccesoArreglo(nodoAcceso);

        if (resultadoAcceso.esAcceso) {
            // Es un arreglo: buscamos la estructura completa en la tablaEstado
            const arreglo = this.tablaEstado.get(nombreVar);
            const indice = resultadoAcceso.indice;

            if (indice < 0 || indice >= arreglo.length) {
                this.errores.push(`Error de Ejecución: Índice [${indice}] fuera de rango para el arreglo '${nombreVar}'.`);
                return 0;
            }
            return arreglo[indice]; // Retornamos el valor real guardado en esa celda
        } else {
            // Es una variable escalar común: retornamos su valor vivo
            return this.tablaEstado.obtenerEscalar(nombreVar);
        }
    }

    // 10. case 'AccesoArreglo':
    manejarAccesoArreglo(nodo) {
        // Gramática: AccesoArreglo → “[” <ExpArit> “]” | ε
        if (!nodo.hijos || nodo.hijos.length === 0) {
            return { esAcceso: false, indice: 0 };
        }

        // hijos: 0:"[", 1:<ExpArit>, 2:"]"
        // Evaluamos recursivamente la expresión interna para conocer el número de índice
        const valorIndice = Math.floor(this.manejarExpArit(nodo.hijos[1]));
        return {
            esAcceso: true,
            indice: valorIndice
        };
    }

    // 11. case 'ExpArit':
    manejarExpArit(nodo) {
        // Gramática: ExpArit → <Termino> <ExpArit'>
        // hijos: 0:<Termino>, 1:<ExpArit'>
        
        // 1. Calculamos el valor del primer término izquierdo
        const valorTermino = this.manejarTermino(nodo.hijos[0]);

        // 2. Le pasamos ese valor al No Terminal prima para que sume/reste lo que quede a la derecha
        return this.manejarExpAritPrima(nodo.hijos[1], valorTermino);
    }

    // 12. case "ExpArit'":
    manejarExpAritPrima(nodo, acumulado) {
        // Gramática: ExpArit' → “+” <Termino> <ExpArit'> | “-” <Termino> <ExpArit'> | ε
        if (!nodo.hijos || nodo.hijos.length === 0) {
            return acumulado; // Caso base ε: no hay más sumas/restas, devolvemos lo acumulado
        }

        // hijos: 0: "+" o "-", 1:<Termino>, 2:<ExpArit'>
        const operador = nodo.hijos[0].token.valor;
        const valorSiguienteTermino = this.manejarTermino(nodo.hijos[1]);

        let nuevoAcumulado = acumulado;
        if (operador === '+') {
            nuevoAcumulado += valorSiguienteTermino;
        } else if (operador === '-') {
            nuevoAcumulado -= valorSiguienteTermino;
        }

        // Continuamos resolviendo de forma recursiva hacia la derecha
        return this.manejarExpAritPrima(nodo.hijos[2], nuevoAcumulado);
    }

    // 13. case 'Termino':
    manejarTermino(nodo) {
        // Gramática: Termino → <Factor> <Termino'>
        // hijos: 0:<Factor>, 1:<Termino'>
        
        // 1. Resolvemos el factor de la izquierda
        const valorFactor = this.manejarFactor(nodo.hijos[0]);

        // 2. Le arrastramos ese valor al No Terminal prima para multiplicar o dividir
        return this.manejarTerminoPrima(nodo.hijos[1], valorFactor);
    }

    // 14. case "Termino'":
    manejarTerminoPrima(nodo, acumulado) {
        // Gramática: Termino' → “*” <Factor> <Termino'> | “/” <Factor> <Termino'> | ε
        if (!nodo.hijos || nodo.hijos.length === 0) {
            return acumulado; // Caso base ε: devolvemos lo acumulado hasta el momento
        }

        // hijos: 0:"*" o "/", 1:<Factor>, 2:<Termino'>
        const operador = nodo.hijos[0].token.valor;
        const valorSiguienteFactor = this.manejarFactor(nodo.hijos[1]);

        let nuevoAcumulado = acumulado;
        if (operador === '*') {
            nuevoAcumulado *= valorSiguienteFactor;
        } else if (operador === '/') {
            if (valorSiguienteFactor === 0) {
                this.errores.push("Error de Ejecución: División por cero detectada.");
                return 0;
            }
            nuevoAcumulado /= valorSiguienteFactor;
        }

        // Continuamos la resolución recursiva hacia la derecha
        return this.manejarTerminoPrima(nodo.hijos[2], nuevoAcumulado);
    }

    // 15. case 'Factor':
    manejarFactor(nodo) {
        // Gramática: Factor → <Potencia> <Factor'>
        // hijos: 0:<Potencia>, 1:<Factor'>
        
        // 1. Resolvemos la base (Potencia)
        const valorPotencia = this.manejarPotencia(nodo.hijos[0]);

        // 2. Le pasamos la base al No Terminal prima para procesar el exponente si existe
        return this.manejarFactorPrima(nodo.hijos[1], valorPotencia);
    }

    // 16. case "Factor'":
    manejarFactorPrima(nodo, acumulado) {
        // Gramática: Factor' → “^” <Potencia> <Factor'> | ε
        if (!nodo.hijos || nodo.hijos.length === 0) {
            return acumulado; // Caso base ε: no hay exponente, devolvemos la base limpia
        }

        // hijos: 0:"^", 1:<Potencia>, 2:<Factor'>
        const valorExponente = this.manejarPotencia(nodo.hijos[1]);
        
        // Calculamos la potencia real en JavaScript (Math.pow o el operador **)
        const nuevoAcumulado = Math.pow(acumulado, valorExponente);

        // Continuamos evaluando de forma recursiva hacia la derecha
        return this.manejarFactorPrima(nodo.hijos[2], nuevoAcumulado);
    }

    // 17. case 'Potencia':
    manejarPotencia(nodo) {
        // Gramática: Potencia → "(" <ExpArit> ")" | <Variable> | "cteReal" | <LiteralArray> | "-" <Potencia>
        if (!nodo.hijos || nodo.hijos.length === 0) return 0;

        const primerHijo = nodo.hijos[0];

        // Caso 1: "(" <ExpArit> ")" -> hijos: 0:"(", 1:<ExpArit>, 2:")"
        if (primerHijo.simbolo === '(') {
            return this.manejarExpArit(nodo.hijos[1]);
        }

        // Caso 2: <Variable> -> hijos: 0:<Variable> (id con o sin AccesoArreglo)
        if (primerHijo.simbolo === 'Variable') {
            return this.manejarVariable(primerHijo);
        }

        // Caso 3: "cteReal" -> hijos: 0:cteReal (Hojo terminal constante numérica)
        if (primerHijo.simbolo === 'cteReal') {
            return parseFloat(primerHijo.token.valor);
        }

        // Caso 4: <LiteralArray> -> hijos: 0:<LiteralArray> (ej: [1.1, 2.2, 3.3])
        if (primerHijo.simbolo === 'LiteralArray') {
            return this.manejarLiteralArray(primerHijo);
        }

        // Caso 5: "-" <Potencia> -> hijos: 0:"-", 1:<Potencia> (Menos unario)
        if (primerHijo.simbolo === '-') {
            return -1 * this.manejarPotencia(nodo.hijos[1]);
        }

        return 0;
    }

    // 18. case 'LiteralArray':
    manejarLiteralArray(nodo) {
        // Gramática: LiteralArray → “[“ <ListaElementos> “]”
        // hijos: 0:"[", 1:<ListaElementos>, 2:"]"
        
        // Retorna un array nativo de JavaScript con los elementos evaluados
        return this.manejarListaElementos(nodo.hijos[1]);
    }

    // 19. case 'ListaElementos':
    manejarListaElementos(nodo) {
        // Gramática: ListaElementos → <ExpArit> <ListaElementosPrima>
        // hijos: 0:<ExpArit>, 1:<ListaElementosPrima>
        
        const primerElemento = this.manejarExpArit(nodo.hijos[0]);
        
        // Inicializamos una lista nativa y le pasamos los elementos siguientes
        const listaCompleta = [primerElemento];
        return this.manejarListaElementosPrima(nodo.hijos[1], listaCompleta);
    }

    // 20. case 'ListaElementosPrima':
    manejarListaElementosPrima(nodo, listaAcumulada) {
        // Gramática: ListaElementosPrima → “,” <ExpArit> <ListaElementosPrima> | ε
        if (!nodo.hijos || nodo.hijos.length === 0) {
            return listaAcumulada; // Caso base ε: devolvemos la lista nativa armada
        }

        // hijos: 0:",", 1:<ExpArit>, 2:<ListaElementosPrima>
        const siguienteElemento = this.manejarExpArit(nodo.hijos[1]);
        listaAcumulada.push(siguienteElemento);

        // Continuamos de manera recursiva arrastrando la lista hacia la derecha
        return this.manejarListaElementosPrima(nodo.hijos[2], listaAcumulada);
    }

    // 21. case 'Leer':
    manejarLeer(nodo) {
        // Gramática: Leer → “Read” “(“ <Variable> “)”
        // hijos: 0:"Read", 1:"(", 2:<Variable>, 3:")"
        const nodoVariable = nodo.hijos[2];
        const nombreVar = nodoVariable.hijos[0].token.valor;
        const nodoAcceso = nodoVariable.hijos[1]; // AccesoArreglo

        if (!this.tablaSimbolos.existe(nombreVar)) {
            this.errores.push(`Error Semántico: Variable '${nombreVar}' no declarada en la sentencia Read.`);
            return;
        }

        // Simulación de captura de datos por consola síncrona
        const valorIngresado = 10; 
        console.log(`[Read]: Ingresa valor para '${nombreVar}': (Simulado: ${valorIngresado})`);

        // Verificamos si se lee una celda de un Arreglo o una variable escalar común
        const esAccesoArray = nodoAcceso && nodoAcceso.hijos && nodoAcceso.hijos.length > 0;

        if (esAccesoArray) {
            const indice = Math.floor(this.manejarAccesoArreglo(nodoAcceso).indice);
            let arreglo = this.tablaEstado.get(nombreVar);
            
            if (indice < 0 || indice >= arreglo.length) {
                this.errores.push(`Error de Ejecución: Índice [${indice}] fuera de rango en Read para '${nombreVar}'.`);
                return;
            }
            arreglo[indice] = valorIngresado;
            this.tablaEstado.set(nombreVar, arreglo);
        } else {
            this.tablaEstado.set(nombreVar, valorIngresado);
        }
    }

    // 22. case 'Escribir':
    manejarEscribir(nodo) {
        // Gramática: Escribir → “Write” “(“ <ListaEscritura> “)”
        // hijos: 0:"Write", 1:"(", 2:<ListaEscritura>, 3:")"
        
        // El método manejarListaEscritura procesará recursivamente la lista y devolverá la cadena final armada
        const mensajeFinal = this.manejarListaEscritura(nodo.hijos[2]);
        
        console.log(`[ Write]: ${mensajeFinal}`);
    }

    // 23. case 'ListaEscritura':
    manejarListaEscritura(nodo) {
        // Gramática: ListaEscritura → "cteCadena" <ListaCadena> | <ExpArit> <ListaCadena>
        // hijos: 0: cteCadena o <ExpArit>, 1:<ListaCadena>
        const primerHijo = nodo.hijos[0];
        let textoActual = "";

        if (primerHijo.simbolo === 'cteCadena') {
            // Si es un string literal (ej: "El resultado es: ") le quitamos las comillas del lexema
            textoActual = primerHijo.token.valor.replace(/["']/g, "");
        } else {
            // Si es una expresión aritmética (<ExpArit>), la evaluamos contra la tablaEstado para obtener su número real
            textoActual = this.manejarExpArit(primerHijo).toString();
        }

        // Le pasamos el texto actual al No Terminal prima para que concatene lo que quede a la derecha
        return this.manejarListaCadena(nodo.hijos[1], textoActual);
    }

    // 24. case 'ListaCadena':
    manejarListaCadena(nodo, acumulado) {
        // Gramática: ListaCadena → “,” <ListaEscritura> | ε
        if (!nodo.hijos || nodo.hijos.length === 0) {
            return acumulado; // Caso base ε: no hay más elementos para escribir, devolvemos la cadena acumulada
        }

        // hijos: 0:",", 1:<ListaEscritura>
        // Continuamos resolviendo la lista de escritura recursivamente hacia la derecha
        const siguienteTexto = this.manejarListaEscritura(nodo.hijos[1]);
        
        // Devolvemos la concatenación limpia de los fragmentos separados por comas
        return acumulado + siguienteTexto;
    }

    // 25. case 'SiEntSino':
    manejarSiEntSino(nodo) {
        // Gramática: SiEntSino → “if” <Condicion> “then” “{“ <Secuencia> “}” <SiEntSino'>
        // hijos: 0:"if", 1:<Condicion>, 2:"then", 3:"{", 4:<Secuencia>, 5:"}", 6:<SiEntSino'>
        const nodoCondicion = nodo.hijos[1];
        const nodoSecuenciaIf = nodo.hijos[4];
        const nodoSinoPrima = nodo.hijos[6];

        // Evaluamos la condición lógica trayendo los valores de la tablaEstado
        // El método manejarCondicion resolverá las operaciones relacionales y devolverá true/false
        const condicionVerdadera = this.manejarCondicion(nodoCondicion);

        if (condicionVerdadera) {
            console.log("[🔄 Intérprete]: Condición IF evaluada como VERDADERA. Ejecutando bloque...");
            this.analizarSemantica(nodoSecuenciaIf);
        } else {
            // Si la condición es falsa, le delegamos al No Terminal Prima decidir si hay un bloque 'else'
            this.manejarSiEntSinoPrima(nodoSinoPrima);
        }
    }

    // 26. case "SiEntSino'":
    manejarSiEntSinoPrima(nodo) {
        // Gramática: SiEntSino' → “else” “{“ <Secuencia> “}” | ε
        if (!nodo.hijos || nodo.hijos.length === 0) {
            return; // Caso base ε: no hay bloque else que ejecutar
        }

        // hijos: 0:"else", 1:"{", 2:<Secuencia>, 3:"}"
        console.log("[Intérprete]: Condición IF evaluada como FALSA. Ejecutando bloque ELSE...");
        this.analizarSemantica(nodo.hijos[2]);
    }

    // 27. case 'While':
    manejarWhile(nodo) {
        // Gramática: While → “while” <Condicion> “do” “{“ <Secuencia> “}”
        // hijos: 0:"while", 1:<Condicion>, 2:"do", 3:"{", 4:<Secuencia>, 5:"}"
        const nodoCondicion = nodo.hijos[1];
        const nodoSecuencia = nodo.hijos[4];

        console.log("[🔄 Intérprete]: Entrando al bucle WHILE...");

        // Ejecución viva en bucle: re-evalúa la condición contra la tablaEstado en cada vuelta
        let vueltas = 0;
        while (this.manejarCondicion(nodoCondicion)) {
            this.analizarSemantica(nodoSecuencia);
            
            // Límite de seguridad opcional en desarrollo para evitar loops infinitos accidentales
            vueltas++;
            if (vueltas > 10000) {
                console.error(" Error en Ejecución: Bucle infinito detectado (más de 10k iteraciones).");
                break;
            }
        }
        console.log("[🔄 Intérprete]: Saliendo del bucle WHILE.");
    }

    // 28. case 'For':
    manejarFor(nodo) {
        // Gramática: For → “for” <Asignacion> “:” <ExpArit> “{“ <Secuencia> “}”
        // hijos: 0:"for", 1:<Asignacion>, 2:":", 3:<ExpArit>, 4:"{", 5:<Secuencia>, 6:"}"
        const nodoAsignacion = nodo.hijos[1];
        const nodoExpLimite = nodo.hijos[3];
        const nodoSecuencia = nodo.hijos[5];

        // 1. Conseguimos el nombre de la variable de control (ej: en 'i := 1', extraemos 'i')
        // Asignacion -> Variable := AsignacionDetalle -> Variable -> id AccesoArreglo
        const nombreVarControl = nodoAsignacion.hijos[0].hijos[0].token.valor;

        console.log(`[iterprete]: inicializando bucle FOR con variable '${nombreVarControl}'...`);

        // 2. Ejecutamos la asignación inicial (impacta el valor inicial en la tablaEstado)
        this.manejarAsignacion(nodoAsignacion);

        // 3. Evaluamos el límite superior de la expresión aritmética
        const valorLimite = this.manejarExpArit(nodoExpLimite);

        // 4. Corremos el ciclo iterando dinámicamente sobre la tablaEstado
        while (this.tablaEstado.get(nombreVarControl) <= valorLimite) {
            
            // Ejecutamos el cuerpo interno del bucle
            this.analizarSemantica(nodoSecuencia);

            // Incrementamos la variable de control directamente en la memoria 
            const valorActual = this.tablaEstado.get(nombreVarControl);
            this.tablaEstado.set(nombreVarControl, valorActual + 1);
        }
        
        console.log(`Bucle FOR finalizado. Variable '${nombreVarControl}' llegó a: ${this.tablaEstado.get(nombreVarControl)}`);
    }

    // 29. case 'Condicion':
    manejarCondicion(nodo) {
        // Gramática: Condicion → <TerminoLogico> <CondicionPrima>
        // hijos: 0:<TerminoLogico>, 1:<CondicionPrima>
        
        // 1. Evaluamos el término lógico de la izquierda (retorna true o false)
        const valorTermino = this.manejarTerminoLogico(nodo.hijos[0]);

        // 2. Le pasamos el booleano al No Terminal prima para evaluar los "OR" (|) a la derecha
        return this.manejarCondicionPrima(nodo.hijos[1], valorTermino);
    }

    // 30. case "CondicionPrima":
    manejarCondicionPrima(nodo, acumulado) {
        // Gramática: CondicionPrima → “|” <TerminoLogico> <CondicionPrima> | ε
        if (!nodo.hijos || nodo.hijos.length === 0) {
            return acumulado; // Caso base ε: devolvemos el estado lógico acumulado
        }

        // hijos: 0:"|", 1:<TerminoLogico>, 2:<CondicionPrima>
        const valorSiguienteTermino = this.manejarTerminoLogico(nodo.hijos[1]);
        
        // Operación lógica OR real en JavaScript
        const nuevoAcumulado = acumulado || valorSiguienteTermino;

        // Continuamos la evaluación recursiva por derecha
        return this.manejarCondicionPrima(nodo.hijos[2], nuevoAcumulado);
    }

    // 31. case 'TerminoLogico':
    manejarTerminoLogico(nodo) {
        // Gramática: TerminoLogico → <FactorLogico> <TerminoLogicoPrima>
        // hijos: 0:<FactorLogico>, 1:<TerminoLogicoPrima>
        
        // 1. Evaluamos el factor lógico base de la izquierda
        const valorFactor = this.manejarFactorLogico(nodo.hijos[0]);

        // 2. Le pasamos el booleano al No Terminal prima para evaluar los "AND" (&)
        return this.manejarTerminoLogicoPrima(nodo.hijos[1], valorFactor);
    }

    // 32. case "TerminoLogicoPrima":
    manejarTerminoLogicoPrima(nodo, acumulado) {
        // Gramática: TerminoLogicoPrima → “&” <FactorLogico> <TerminoLogicoPrima> | ε
        if (!nodo.hijos || nodo.hijos.length === 0) {
            return acumulado; // Caso base ε: no quedan más ANDs, devolvemos el acumulado
        }

        // hijos: 0:"&", 1:<FactorLogico>, 2:<TerminoLogicoPrima>
        const valorSiguienteFactor = this.manejarFactorLogico(nodo.hijos[1]);
        
        // Operación lógica AND real en JavaScript
        const nuevoAcumulado = acumulado && valorSiguienteFactor;

        // Continuamos la evaluación recursiva por derecha
        return this.manejarTerminoLogicoPrima(nodo.hijos[2], nuevoAcumulado);
    }

    // 33. case 'FactorLogico':
    manejarFactorLogico(nodo) {
        // Gramática: FactorLogico → "!" <FactorLogico> | "{" <Condicion> "}" | <ExpArit> "opRel" <ExpArit>
        if (!nodo.hijos || nodo.hijos.length === 0) return false;

        const primerHijo = nodo.hijos[0];

        // Caso 1: "!" <FactorLogico> -> hijos: 0:"!", 1:<FactorLogico> (Negación lógica unaria)
        if (primerHijo.simbolo === '!') {
            const valorInterno = this.manejarFactorLogico(nodo.hijos[1]);
            return !valorInterno; // Invierte el booleano en JavaScript
        }

        // Caso 2: "{" <Condicion> "}" -> hijos: 0:"{", 1:<Condicion>, 2:"}" (Paréntesis/Llaves de agrupación lógica)
        if (primerHijo.simbolo === '{') {
            return this.manejarCondicion(nodo.hijos[1]);
        }

        // Caso 3: <ExpArit> "opRel" <ExpArit> -> hijos: 0:<ExpArit>, 1:opRel, 2:<ExpArit> (Comparación relacional)
        // Este es el caso clave para bucles como: (i < var2) o (x opRel var2)
        if (primerHijo.simbolo === 'ExpArit') {
            // 1. Evaluamos matemáticamente el lado izquierdo contra la tablaEstado
            const valorIzquierdo = this.manejarExpArit(nodo.hijos[0]);

            // 2. Extraemos el operador relacional literal (ej: "<", ">", "<=", ">=", "==", "!=")
            const operador = nodo.hijos[1].token.valor;

            // 3. Evaluamos matemáticamente el lado derecho contra la tablaEstado
            const valorDerecho = this.manejarExpArit(nodo.hijos[2]);

            // 4. Resolvemos la comparación real en tiempo de ejecución
            switch (operador) {
                case '<':  return valorIzquierdo < valorDerecho;
                case '>':  return valorIzquierdo > valorDerecho;
                case '<=': return valorIzquierdo <= valorDerecho;
                case '>=': return valorIzquierdo >= valorDerecho;
                case '==': return valorIzquierdo === valorDerecho;
                case '!=': return valorIzquierdo !== valorDerecho;
                default:
                    this.errores.push(`Error de Ejecución: Operador relacional '${operador}' no reconocido.`);
                    return false;
            }
        }

        return false;
    }

    reportarErrores() {
        this.errores.forEach(e => console.error(e));
    }
}

const analizadorSintactico = new Parser();
const arbol = analizadorSintactico.parsear();
arbol.imprimirArbol(); // Imprime el AST generado por el Parser

// 1. Validamos que el Parser no haya fallado antes de avanzar al Semántico
if (arbol && arbol.root) {
    let analizadorSemantico = new AnalizadorSemantico(arbol);
    
    // Ejecuta el intérprete (Fase de carga de memoria y ejecución de bloques)
    analizadorSemantico.analizarSemantica(arbol.root);

    console.log("\n=========================================");
    console.log("📢  --- RESULTADOS DEL ANÁLISIS SEMÁNTICO ---");
    console.log("=========================================");

    analizadorSemantico.tablaSimbolos.imprimir(); 
    analizadorSemantico.tablaEstado.imprimir();
    
    if (analizadorSemantico.errores && analizadorSemantico.errores.length > 0) {
        // Si hubo variables duplicadas o índices fuera de rango, los reporta
        analizadorSemantico.reportarErrores();
    } else {
        console.log("¡Análisis semántico e intérprete ejecutados con éxito! Cero errores.");
        
        // 2. ¡Llamamos al método que creamos en tu TablaEstado para ver la memoria viva!
        analizadorSemantico.tablaEstado.imprimirEstado();
    }
} else {
    console.log("\n❌ [Parser]: El análisis sintáctico falló. No se pudo generar el AST para el evaluador semántico.");
}