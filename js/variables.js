const
    portada = document.getElementById('paginaPortada'),
    shop = document.getElementById('paginaShop'),
    buscar = document.getElementById('buscar'),
    btnCrema = document.getElementById('btnCrema'),
    btnHome = document.getElementById('btnHome'),
    productos = document.getElementById('producto'),
    tarjetero = document.getElementById('tarjetero'),
    carrito = document.getElementById('carrito'),
    tarjetaProducto = document.getElementById('tarjetaProducto').content, //Template para cada tarjeta de los productos
    tabla = document.getElementById('tabla'),
    btnCart = document.getElementById('btnCart'),
    vuelveCompra = document.getElementById('vuelveCompra'),
    vacCarro = document.getElementById('btnTabla'),
    enCarrito = document.getElementById('enCarrito'),
    sumaCant = document.getElementById('sumaCant'),
    sumaCant2 = document.getElementById('sumaCant2'),
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
    arrayCarro = [],
    listaFiltro = {},
    listaprod = {},
    precioSubtot = 0,
    envios = {},
    counterPromo = 0,
    intervalID = 0;