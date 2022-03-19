const productos = document.getElementById('producto');
//Template para cada tarjeta de los productos
const tarjetaProducto = document.getElementById('tarjetaProducto').content;
const vacTabla = document.getElementById('btnTabla');
//Nodo offscreen para ir cargando las tarjetas
const fragment = document.createDocumentFragment();
const tabla = document.getElementById("listaCarrito");

let listaFiltro = {};
let listaCompra = {}; //Para volcar selecciones a tabla

//Catalogo completo en el inicio
window.onload = seleccionTodo;

//Acción cuando seleccionan categoría de productos en dropdown
dropCategoria.addEventListener('change', () => {
    seleccionCat(dropCategoria.value);
});

//Acción cuando hacen click en botón "Agregar a compra"
productos.addEventListener('click', e => {
    if (e.target.classList.contains('btn')) {
        sumarProductoALista(e.target.parentElement);
        armarTabla(e.target.parentElement);
    }
});

//Acción cuando hacen click en botón "Vaciar lista"
vacTabla.addEventListener('click', e => {
    vaciarTabla();
});

//Array productos
const listaProd = [
    {nombre: 'Crema Facial Uso Diario 275ml', descripcion: 'Descripción', categoria: 'Cuidados de la piel', precioUn: 3200, cod: 1},
    {nombre: 'Crema Facial Uso Diario 125ml', descripcion: 'Descripción', categoria: 'Cuidados de la piel', precioUn: 2200, cod: 2},
    {nombre: 'Crema Facial Rejuvenecedora 125ml', descripcion: 'Descripción', categoria: 'Cuidados de la piel', precioUn: 2900, cod: 3},
    {nombre: 'Crema Corporal Hidratante 320ml', descripcion: 'Descripción', categoria: 'Cuidados de la piel', precioUn: 2800, cod: 4},
    {nombre: 'Crema Corporal Urea 275ml', descripcion: 'Descripción', categoria: 'Cuidados de la piel', precioUn: 3100, cod: 5},
    {nombre: 'Protector Solar FPS30 175ml', descripcion: 'Descripción', categoria: 'Protectores solares', precioUn: 1750, cod: 6},
    {nombre: 'Protector Solar FPS20 175ml', descripcion: 'Descripción', categoria: 'Protectores solares', precioUn: 1750, cod: 7},
    {nombre: 'Protector Solar - Pantalla FPS60 175ml', descripcion: 'Descripción', categoria: 'Protectores solares', precioUn: 1750, cod: 8},
    {nombre: 'Base Maquillaje 35g', descripcion: 'Descripción', categoria: 'Maquillaje', precioUn: 1250, cod: 9},
    {nombre: 'Base Maquillaje 60g', descripcion: 'Descripción', categoria: 'Maquillaje', precioUn: 2000, cod: 10},
    {nombre: 'Rimmel Profesional 80cc', descripcion: 'Descripción', categoria: 'Maquillaje', precioUn: 2750, cod: 11},
    {nombre: 'Rimmel Profesional 40cc', descripcion: 'Descripción', categoria: 'Maquillaje', precioUn: 1900, cod: 12},
    {nombre: 'Rouge Rojo Pasión', descripcion: 'Descripción', categoria: 'Maquillaje', precioUn: 2100, cod: 13},
    {nombre: 'Rouge Verde Esmeralda', descripcion: 'Descripción', categoria: 'Maquillaje', precioUn: 2100, cod: 14},
    {nombre: 'Rouge Rojo Carmesí', descripcion: 'Descripción', categoria: 'Maquillaje', precioUn: 2250, cod: 15},
    {nombre: 'Rouge Rosa Eighties', descripcion: 'Descripción', categoria: 'Maquillaje', precioUn: 2000, cod: 16},
    {nombre: 'Rouge Rosa Suave', descripcion: 'Descripción', categoria: 'Maquillaje', precioUn: 2100, cod: 17},
    {nombre: 'Shampoo + Acondicionador 175ml', descripcion: 'Descripción', categoria: 'Cuidados del cabello', precioUn: 900, cod: 18},
    {nombre: 'Shampoo anticaspa 220ml', descripcion: 'Descripción', categoria: 'Cuidados del cabello', precioUn: 650, cod: 19},
    {nombre: 'Crema de enjuague 220ml', descripcion: 'Descripción', categoria: 'Cuidados del cabello', precioUn: 1550, cod: 20},
    {nombre: 'Aceite masajeador capilar 75ml', descripcion: 'Descripción', categoria: 'Cuidados del cabello', precioUn: 1100, cod: 21},
];

//Array zonas de envío
const envios = [
    {nombre: 'CABA', envio: 250},
    {nombre: 'GBA Norte', envio: 400},
    {nombre: 'GBA Sur', envio: 600},
    {nombre: 'GBA Oeste', envio: 500},
    {nombre: 'Resto del país', envio: 1500}
];

//Muestra todos los productos del catálogo, llamando a las tarjetas en pantalla.
function seleccionTodo() {
    listaFiltro = listaProd;
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

//Esta función elimina los children del div id="producto", para reemplazarlos después con el nuevo filtro.
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
    //Llamo a la función para sumar los importes de todos los productos
    precioProductosCarro();
    //Display del total productos en HTML
    document.getElementById('sumaProd').innerHTML = ('$' + precioTot);
}

//Precio total del carrito: Sumo el subtotal de los distintos productos entre sí
function precioProductosCarro() {
    return precioTot = arrayCarro.reduce((acc, val) => acc + val.precioUnEl,0);
}

function armarTabla(e) {
    var fila = `<tr>
                    <td>${e.querySelector('.nombreProducto').textContent}</td>
                    <td class="text-center">${1}</td>
                    <td class="text-end">${'$' + e.querySelector('.importe').textContent}</td>
                <tr>`
    tabla.innerHTML += fila
};

function vaciarTabla() {
    while (tabla.firstChild) {
        tabla.removeChild(tabla.firstChild);
    }
    arrayCarro.length = 0;
    precioTot = '';
    document.getElementById('sumaProd').innerHTML = (precioTot);
}

//Traigo elementos del código anterior para completar después
/* document.getElementById('ingBrut').innerHTML = ('$' + ingBrutTot);
document.getElementById('zonaEnvio').innerHTML = zonaEnvio;
document.getElementById('costoEnvio').innerHTML = ('$' + costoEnvio);
document.getElementById('precioFinal').innerHTML = ('$' + precioFinal); */