const productos = document.getElementById('producto');
const tarjetaProducto = document.getElementById('tarjetaProducto').content; //Template para cada tarjeta de los productos
const tabla = document.getElementById('tabla');
const checkout = document.getElementById('checkout');
const vacCarro = document.getElementById('btnTabla');
const enCarrito = document.getElementById('enCarrito');
const sumaProd = document.getElementById('sumaProd');
const fragment = document.createDocumentFragment(); //Nodo offscreen para ir cargando las tarjetas

let listaFiltro = {};
let listaprod = {};
let precioSubtot = 0;
let envios = {};
//let cant = 1
let counterPromo = 0;

const Toast = Swal.mixin({
    toast: true,
    position: 'bottom-end',
    showConfirmButton: false,
    timer: 1800,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
})