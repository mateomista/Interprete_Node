export class TablaEstado {
    constructor() {
        // El mapa que actúa como la memoria RAM viva del intérprete (id -> valor)
        this.memoria = new Map();
    }

    /**
     * Inicializa una variable escalar en la memoria viva con un valor por defecto (0).
     * @param {string} nombre - Nombre de la variable (id).
     */
    inicializarEscalar(nombre) {
        this.memoria.set(nombre, 0);
    }

    /**
     * Obtiene la estructura completa del arreglo desde la memoria.
     * @param {string} nombre - Nombre del arreglo.
     * @returns {Array<number>}
     */
    obtenerArreglo(nombre) {
        return this.memoria.get(nombre);
    }

    /**
     * Inicializa un arreglo estático en la memoria viva lleno de ceros.
     * @param {string} nombre - Nombre del arreglo (id).
     * @param {number} tamano - Tamaño del arreglo.
     */
    inicializarArreglo(nombre, tamano) {
        console.log(`--- [DEBUG TABLA ESTADO] ---`);
        console.log(`  > Intentando crear arreglo: ${nombre}`);
        console.log(`  > Valor recibido en 'tamano':`, tamano);
        console.log(`  > Tipo de dato de 'tamano':`, typeof tamano);
        console.log(`----------------------------`);
        this.memoria.set(nombre, new Array(tamano).fill(0));
    }

    /**
     * Asigna un valor a una variable escalar.
     * @param {string} nombre - Nombre de la variable.
     * @param {number} valor - Valor numérico a guardar.
     */
    asignarEscalar(nombre, valor) {
        this.memoria.set(nombre, valor);
    }

    /**
     * Asigna un valor completo (como un LiteralArray nativo de JS) a un identificador.
     * @param {string} nombre - Nombre de la variable.
     * @param {Array<number>} arrayNativo - Arreglo de JS.
     */
    asignarLiteralArray(nombre, arrayNativo) {
        this.memoria.set(nombre, arrayNativo);
    }

    /**
     * Asigna un valor a una celda específica de un arreglo.
     * @param {string} nombre - Nombre del arreglo.
     * @param {number} indice - Posición dentro del arreglo.
     * @param {number} valor - Valor numérico a guardar.
     * @returns {boolean} - true si se pudo asignar, false si hubo desbordamiento de rango.
     */
    asignarEnArreglo(nombre, indice, valor) {
        const arreglo = this.memoria.get(nombre);
        if (!arreglo || indice < 0 || indice >= arreglo.length) {
            return false; // Error de índice fuera de rango
        }
        arreglo[indice] = valor;
        this.memoria.set(nombre, arreglo);
        return true;
    }

    /**
     * Obtiene el valor de una variable escalar.
     * @param {string} nombre - Nombre de la variable.
     * @returns {number} - El valor actual.
     */
    obtenerEscalar(nombre) {
        return this.memoria.get(nombre);
    }

    /**
     * Obtiene el valor de una celda específica de un arreglo.
     * @param {string} nombre - Nombre del arreglo.
     * @param {number} indice - Posición a consultar.
     * @returns {number|null} - El valor de la celda o null si está fuera de rango.
     */
    obtenerDesdeArreglo(nombre, indice) {
        const arreglo = this.memoria.get(nombre);
        if (!arreglo || indice < 0 || indice >= arreglo.length) {
            return null;
        }
        return arreglo[indice];
    }

    /**
     * Verifica si una variable ya tiene espacio reservado en el estado actual.
     * @param {string} nombre 
     * @returns {boolean}
     */
    existe(nombre) {
        return this.memoria.has(nombre);
    }

    /**
     * Devuelve el tamaño de un arreglo almacenado en el estado.
     * @param {string} nombre 
     * @returns {number}
     */
    obtenerTamanoArreglo(nombre) {
        const estructura = this.memoria.get(nombre);
        return Array.isArray(estructura) ? estructura.length : 0;
    }

    /**
     * Vuelca por consola el estado actual de toda la memoria (para depuración).
     */
    imprimirEstado() {
        console.log("\n=========================================");
        console.log("📊 [TABLA DE ESTADO] Memoria Viva Final:");
        console.log("=========================================");
        for (let [id, valor] of this.memoria.entries()) {
            if (Array.isArray(valor)) {
                console.log(`  🔹 ${id} (Arreglo) -> [ ${valor.join(", ")} ]`);
            } else {
                console.log(`  🔹 ${id} (Escalar) -> ${valor}`);
            }
        }
        console.log("=========================================\n");
    }

    imprimir() {
        console.log("\n=============================================");
        console.log("   TABLA DE ESTADO ");
        console.log("=============================================");
        if (!this.memoria || this.memoria.size === 0) {
            console.log("  (Vacía - Memoria sin inicializar)");
        } else {
            console.table(Array.from(this.memoria.entries()).map(([nombre, valor]) => ({
                "Posición/Variable": nombre,
                "Valor Actual": Array.isArray(valor) ? `[ ${valor.join(', ')} ]` : valor
            })));
        }
        console.log("=============================================\n");
    }
}