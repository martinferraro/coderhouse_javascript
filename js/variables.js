const
    productos = document.getElementById('producto'),
    tarjetero = document.getElementById('tarjetero'),
    carrito = document.getElementById('carrito'),
    tarjetaProducto = document.getElementById('tarjetaProducto').content, //Template para cada tarjeta de los productos
    tabla = document.getElementById('tabla'),
    contCompra = document.getElementById('contCompra'),
    checkout = document.getElementById('checkout'),
    vacCarro = document.getElementById('btnTabla'),
    enCarrito = document.getElementById('enCarrito'),
    sumaProd = document.getElementById('sumaProd'),
    navMenu = document.getElementById('navMenu'),
    fragment = document.createDocumentFragment(), //Nodo offscreen para ir cargando las tarjetas
    Toast = Swal.mixin({
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 1800,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    });

let
    listaFiltro = {},
    listaprod = {},
    precioSubtot = 0,
    envios = {},
    counterPromo = 0;