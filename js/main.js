const productos = document.getElementById('producto');
const tarjetaProducto = document.getElementById('tarjetaProducto').content; //Template para cada tarjeta de los productos
const tabla = document.getElementById('tabla');
const checkout = document.getElementById('checkout');
const vacCarro = document.getElementById('btnTabla');
const fragment = document.createDocumentFragment(); //Nodo offscreen para ir cargando las tarjetas
let listaFiltro = {};

//Bases de datos desde archivo json
document.addEventListener('DOMContentLoaded', () => {
    cargarJSON();
});

//Traigo la base de datos desde JSON
async function cargarJSON() {
    fetch('./js/bd.json')
        .then(function(res) {
            return res.json();
        })
        .then(function(baseDatos) {
            listaProd = baseDatos.listaProd;
            envios = baseDatos.envios;
            seleccionTodo()
        });
}

//Acción cuando seleccionan categoría de productos en dropdown
dropCategoria.addEventListener('change', () => {
    seleccionCat(dropCategoria.value);
});

//Acción cuando hacen click en botón "Agregar"
productos.addEventListener('click', e => {
    if (e.target.classList.contains('btnAdd')) {
        sumarProductoALista(e.target.parentElement.parentElement);
    } else if (e.target.classList.contains('btnRemover')) {
        removerProductoDeLista(e.target.parentElement.parentElement);
    };
    vaciarTabla();
    armarTabla();
});

//Acción cuando hacen click en botón "Checkout"
checkout.addEventListener('click', e => {
    alert('En breve este botón estará funcional.')
});

//Acción cuando hacen click en botón "Vaciar lista"
vacCarro.addEventListener('click', e => {
    if (confirm('¿Está seguro de que desea vaciar el carrito?\nSu compra no estará disponible si ingresa nuevamente al sitio.')) {
        vaciarCarro();
    }
});

//Muestra todos los productos del catálogo, llamando a las tarjetas en pantalla.
function seleccionTodo() {
    listaFiltro = listaProd
    tarjetasEnPantalla();
}

//Filtro productos según input dropdown, y llamo a crear las tarjetas según categoría.
function seleccionCat(e) {
    if (e === 'Todas') {
        seleccionTodo()
    } else {
        listaFiltro = listaProd.filter(cat => cat.categoria === e);
        tarjetasEnPantalla();
    }
}

//Esta función elimina los children del div id="producto", para reemplazarlos después con el nuevo filtro
function vaciarTarjetero() {
    while (productos.firstChild) {
        productos.removeChild(productos.firstChild);
    }
}

//Display tarjetas según array productos
let tarjetasEnPantalla = () => {
    Object.values(listaFiltro).forEach(elemento => {
        tarjetaProducto.querySelector('.nombreProducto').textContent = elemento.nombre;
        tarjetaProducto.querySelector('.descripcion').textContent = elemento.descripcion;
        tarjetaProducto.querySelector('.importe').textContent = parseInt(elemento.precioUn);
        //Clono la tarjeta
        const tarj = tarjetaProducto.cloneNode(true);
        fragment.appendChild(tarj);
    });
    //Invoco la fórmula para limpiar el tarjetero
    vaciarTarjetero()
    //Lleno el tarjetero con las tarjetas filtradas
    productos.appendChild(fragment);
};

//Productos seleccionados
class ProductoSel {
    constructor(nombre, cantidad, precioUn) {
        this.nombreEl = nombre;
        this.cantidadEl = cantidad;
        this.precioUnEl = +precioUn;
    }
}

//Creo el array del carrito, con los productos seleccionados
let arrayCarro = [];

function sumarProductoALista(e) {
    var nombreEl = e.querySelector('.nombreProducto').textContent;
    cantidadEl = 1 //Ver cómo sumo 1 con cada click, unificando producto
    var precioUnEl = e.querySelector('.importe').textContent;
    arrayCarro.push(new ProductoSel(nombreEl, cantidadEl, precioUnEl));
    localStorage.setItem('carro', JSON.stringify(arrayCarro)); //Envio el carro a local storage para levantarlo en checkout
    precioProductosCarro(); //Llamo a la función para sumar los importes de todos los productos
}

//Función para remover productos cuando el usuario cliquea en "remover"
function removerProductoDeLista(e) {
    var nomItem = e.querySelector('.nombreProducto').textContent; //Levanto el nombre del producto a partir del nodo
    var indice = arrayCarro.findIndex(ProductoSel => ProductoSel.nombreEl === nomItem); //Comparo con el array
    if (indice != -1) { //Ignora los productos que no estén en el arrayCarro
        arrayCarro.splice(indice, 1); //Remuevo si hay coincidencia
        localStorage.clear(); //Limpio el storage anterior
        localStorage.setItem('carro', JSON.stringify(arrayCarro)); //Actualizo el storage
        precioProductosCarro(); //Actualizo la sumatoria de los precios
    }
}

//Precio total del carrito: Sumo el subtotal de los distintos productos entre sí
function precioProductosCarro() {
    precioTot = arrayCarro.reduce((acc, val) => acc + val.precioUnEl, 0);
    //Display del precio total de los productos en HTML
    document.getElementById('sumaProd').innerHTML = ('$' + precioTot);
}

//Armo la tabla a partir del array que levanto del local storage
function armarTabla(e) {
    let carroLS = localStorage.getItem('carro'); //Llamo al carro desde el local storage
    let carro = JSON.parse(carroLS); //Parseo el string con el array de los productos seleccionados
    for(var i = 0; i < carro.length; i++) {
        var fila = `<tr>
                        <td>${carro[i].nombreEl}</td>
                        <td class="text-center">${carro[i].cantidadEl}</td> 
                        <td class="text-end">$${carro[i].precioUnEl}</td>
                    </tr>`;
        tabla.innerHTML += fila
    }
};

//"Vaciar tabla" lo uso para reiniciar lo que muestra la tabla, sin resetear el local storage (para que no se me multipliquen los items de la tabla indefinidamente)
function vaciarTabla() {
    while (tabla.firstChild) {
        tabla.removeChild(tabla.firstChild);
    }
}

//Si el usuario quiere borrar toda la compra, incluso del local storage
function vaciarCarro() {
    vaciarTabla();
    arrayCarro.length = 0;
    localStorage.clear(); //Vació el local storage (elimino carrito)
    precioTot = '';
    document.getElementById('sumaProd').innerHTML = (precioTot);
}

//Traigo elementos del código anterior para completar después
/* document.getElementById('ingBrut').innerHTML = ('$' + ingBrutTot);
document.getElementById('zonaEnvio').innerHTML = zonaEnvio;
document.getElementById('costoEnvio').innerHTML = ('$' + costoEnvio);
document.getElementById('precioFinal').innerHTML = ('$' + precioFinal); */