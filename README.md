# Intérprete de Lenguaje Simplificado

Proyecto desarrollado para la materia **Sintaxis y Semántica de los Lenguajes**. Consiste en un Analizador Léxico, un Analizador Sintáctico y un Intérprete Semántico recursivo implementado en **Node.js**.

El proyecto procesa el código fuente del lenguaje definido en la gramática mediante tres etapas secuenciales bien definidas:

1. **Análisis Léxico (El Lexer):**  
   Lee el archivo de código fuente carácter por carácter y los agrupa en componentes significativos llamados **Tokens** (por ejemplo, palabras clave como `for` o `if`, identificadores de variables, números, operadores y símbolos especiales). En este paso también se eliminan los espacios en blanco y los comentarios.

2. **Análisis Sintáctico (El Parser y la TAS):**  
   Toma la lista de tokens generada por el lexer y, apoyándose en una Tabla de Análisis Sintáctico (TAS), verifica que el orden de las palabras y los símbolos cumpla estrictamente con la gramática formal del lenguaje. Si todo es correcto, construye un **Árbol de Derivación o Sintáctico (AST)** que estructura jerárquicamente las instrucciones (asignaciones, bucles, condiciones).

3. **Análisis Semántico e Intérprete:**  
   Recorre el Árbol Sintáctico nodo por nodo para darle significado a la estructura. Durante este proceso, valida los tipos de datos, gestiona la **Tabla de Símbolos** y ejecuta las acciones directamente sobre una **Tabla de Estado** en tiempo de ejecución (calculando cuentas, actualizando arreglos y resolviendo los saltos de los bucles `for`/`while` y las condiciones `if-then-else`).

---

## 🚀 Características Principales

* **Analizador Sintáctico Descendente Tabular (TAS):** Validación de la gramática mediante una matriz de análisis sintáctico predictivo.
* **Intérprete Semántico Dinámico:** Evaluación directa sobre un Árbol Sintáctico Abstracto (AST) que maneja memoria viva en tiempo de ejecución (Tabla de Estado).
* **Estructuras de Control Avanzadas:** Soporte completo para bucles `for`, `while` y condicionales anidados `if-then-else`.
* **Manejo de Arreglos y Tipos Mixtos:** Declaración y mutación dinámica de vectores por índices, además de soporte para operaciones con cadenas de texto (`strings`) y números reales (`real`).

---

## 📂 Estructura del Proyecto

```text
/
├── src/
│   ├── data/          # Gramática, programa fuente, automatas en JFlap
│   ├── lexer/         # Analizador léxico y generación de tokens
│   │   ├── automatas/        # Definición de automatas
│   ├── parser/        # Analizador sintáctico (TAS) y construcción del AST
│   ├── semantic/      # Intérprete semántico y gestión de la Tabla de Estado
│   └── main.js        # Punto de entrada principal de la aplicación
├── package.json       # Dependencias y configuración de Node.js
└── README.md          # Documentación del proyecto
```

## ⚙️ Requisitos Previos

* Tener instalado **Node.js** (versión 18 o superior recomendada).

---

## 🕹️ Instrucciones de Ejecución

1. Clonar el repositorio e instalar las dependencias:
   ```bash
   npm install
   ```
   
2. Colocar el código fuente a compilar dentro de un archivo de texto (por ejemplo, program.txt) o apuntar la ruta del intérprete al archivo de prueba deseado.

3. Ejecutar el proyecto con Node.js:
   ```bash
   node src/semantic/semanticAnalyzer.js
   ```

## 🧪 Casos de Prueba Incluidos
En la carpeta de pruebas se pueden encontrar ejemplos funcionales que validan distintas características del lenguaje:

  - Fibonacci (for + arreglos): Calcula la serie numérica de forma dinámica.
  
  - Validaciones lógicas (while + if-else): Pruebas de estrés para saltos de ejecución y bloques anidados.
  
  - Manipulación de textos: Concatenación y despliegue de mensajes combinados en la consola.
