const
    productos = document.getElementById('producto'),
    tarjetero = document.getElementById('tarjetero'),
    carrito = document.getElementById('carrito'),
    tarjetaProducto = document.getElementById('tarjetaProducto').content, //Template para cada tarjeta de los productos
    tabla = document.getElementById('tabla'),
    checkout = document.getElementById('checkout'),
    vuelveCompra = document.getElementById('vuelveCompra'),
    vuelveCompraFoot = document.getElementById('vuelveCompraFoot'),
    vacCarro = document.getElementById('btnTabla'),
    enCarrito = document.getElementById('enCarrito'),
    sumaCant = document.getElementById('sumaCant'),
    sumaProd = document.getElementById('sumaProd'),
    sumaProd2 = document.getElementById('sumaProd2'),
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