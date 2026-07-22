export class TablaDeSimbolosSemantica {
  #simbolos;

  constructor() {
    this.#simbolos = new Map();
  }

  /**
   * Agrega una variable a la tabla de control de tipos y declaraciones.
   * @param {string} nombre - El lexema identificador (ej: 'var1')
   * @param {string} tipo - El tipo estructural ('Real' o 'Arreglo')
   * @param {number} [tamano=0] - El tamaño si es un arreglo estático
   */
  agregar(nombre, tipo, tamano = 0) {
    if (this.existe(nombre)) {
        throw new Error(`La variable '${nombre}' ya fue declarada anteriormente.`);
    }
    
    this.#simbolos.set(nombre, {
        nombre: nombre,
        tipo: tipo,
        tamano: tamano
    });
  }

  /**
   * Obtiene la información de declaración de una variable.
   */
  obtener(nombre) {
    return this.#simbolos.get(nombre) || null;
  }

  /**
   * Comprueba si la variable ya fue declarada (Fase de Chequeo Estático).
   */
  existe(nombre) {
    return this.#simbolos.has(nombre);
  }

  /**
   * Devuelve todos los símbolos para depuración.
   */
  get simbolos() {
    return Array.from(this.#simbolos.values());
  }

  /**
   * Limpia las declaraciones de la tabla.
   */
  limpiar() {
    this.#simbolos.clear();
  }

  imprimir() {
        console.log("\n=============================================");
        console.log("📋   TABLA DE SÍMBOLOS SEMÁNTICA");
        console.log("=============================================");
        if (this.tabla && this.tabla.size === 0) {
            console.log("  (Vacía - No hay variables registradas)");
        } else if (this.tabla) {
            console.table(Array.from(this.tabla.entries()).map(([nombre, info]) => ({
                "Variable": nombre,
                "Tipo": info.tipo,
                "Tamaño/Detalle": info.tamano || 'Escalar'
            })));
        } else {
            // Por si usás un objeto plano {} en vez de un Map
            console.log(this.tabla || this);
        }
        console.log("=============================================\n");
    }
    
}