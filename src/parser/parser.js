import { AnalizadorLexico } from "../lexer/lexer.js";
import { TAS } from "./tas.js";
import { NodoArbol, Arbol } from "./arbol.js";
import { Token } from "../lexer/token.js";
import { TokenPila, Pila } from "./pila.js";
import { TokenSemantico } from "../semantic/tokenSemantico.js";

const analizadorLexico = new AnalizadorLexico();
const tas = new TAS();
const arbol = new NodoArbol('Programa');

function obtenerNoTerminales(tas) {
  const primeraColumna = tas.getColumn('__EMPTY');
  
  const noTerminales = [...new Set(
    primeraColumna
      .toArray()
      .map(v => (typeof v === 'string' ? v.trim() : v))  // Eliminar espacios en blanco
      .filter(v => v !== null && v !== undefined && v !== '')
  )];

  return noTerminales;

}

// let noTerminales = obtenerNoTerminales(tas);

// console.log('No terminales:', noTerminales);

export class Parser {
    #analizadorLexico;
    #tas;
    #arbol;
    #noTerminales;
    #pila;
    #pilaNodos;

    constructor() {
        this.#analizadorLexico = new AnalizadorLexico();
        this.#tas = new TAS();
        this.#arbol = new Arbol(); // Simbolo inicial
        this.#noTerminales = obtenerNoTerminales(this.#tas);
        this.#pila = new Pila();
        this.#pilaNodos = new Pila();
    }

    parsear() {
        
        const nodoRaiz = this.#arbol.root;
        this.#pila.push(new TokenPila('$', '$', true))
        this.#pila.push(new TokenPila('Programa', 'Programa', false));
        this.#pilaNodos.push(new NodoArbol('$', true)); // Nodo terminal '$'
        this.#pilaNodos.push(nodoRaiz);                // Nodo raíz del árbol

        let siguienteCompLexico = this.#analizadorLexico.siguienteToken();
        let error = false;
        let estado = 'en proceso';
        let topePila;
        let topePilaNodos;

        while(estado === 'en proceso') {


            topePila = this.#pila.pop();
            topePilaNodos = this.#pilaNodos.pop();
            
            if (topePila.tipo === '$' && siguienteCompLexico.tipo === '$') {
                estado = 'exito';
            }

             else if (topePila.esTerminal) {
                console.log("Haciendo match de terminal:", topePila.tipo);

                    if (topePila.tipo === siguienteCompLexico.tipo) { 

                        if (topePilaNodos) {
                            topePilaNodos.token = siguienteCompLexico; 
                        }

                        siguienteCompLexico = this.#analizadorLexico.siguienteToken();
                    } else {
                        console.log(`1 Error, se esperaba ${topePila.tipo}, se encontro ${siguienteCompLexico.tipo}`)
                        estado = 'error';
                    }
                }               else {
                let produccion
                console.log('Tope de la pila de simbolos: ',topePila.tipo);
                console.log('Tipo Tope de la pila de simbolos: ',topePila.tipo);
                console.log('Siguiente comp lexico: ', siguienteCompLexico.tipo)
                console.log('Tipo componente lex ', siguienteCompLexico.tipo)

                produccion = this.#tas.getValueAt('__EMPTY', topePila.tipo, siguienteCompLexico.tipo);
                
                console.log(`Producción para (${topePila.tipo}, ${siguienteCompLexico.tipo}):`, produccion);
                if (!produccion) {
                    console.error(`Error, ${siguienteCompLexico.tipo}, no es alcanzable desde ${topePila.tipo}`)
                    estado = 'error';
                   
                } else if (produccion.trim() !== 'ε') {
                    console.log('apilando')
                    
                    const nodosHijos = [];
                    const simbolos = produccion.trim().split(/\s+/);
                    
                    for (const simbolo of simbolos) {
                        const esTerminal = !this.#noTerminales.includes(simbolo);
                        const nodoHijo = new NodoArbol(simbolo, esTerminal, null);
                        
                        topePilaNodos.agregarHijo(nodoHijo);
                        nodosHijos.push(nodoHijo);
                    }
                    
                    // El resto de los for de apilamiento se quedan exactamente igual...
                    for (let i = simbolos.length - 1; i >= 0; i--) {
                        const palabra = simbolos[i];
                        const esTerminal = !this.#noTerminales.includes(palabra);
                        const tokenPila = new TokenPila(palabra, palabra, esTerminal);
                        this.#pila.push(tokenPila);
                    }
                    for (let i = nodosHijos.length - 1; i >= 0; i--) {
                        this.#pilaNodos.push(nodosHijos[i]);
                    }
                }
            }
        }

        if (estado === 'exito') {
            console.log('Análisis exitoso');
            return this.#arbol;
        } else if (estado === 'error') {
            console.log('Análisis con errores');
            return null;
        }
    }

}

let arbolSintactico = new Parser().parsear();
let nodoRaiz = new NodoArbol();
nodoRaiz = arbolSintactico.root;

nodoRaiz.imprimirArbol();
//console.log('El arbol de derivacion resultante es: ')
//arbolSintactico.imprimirArbol();
