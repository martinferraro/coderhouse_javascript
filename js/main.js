const productos = document.getElementById('producto');
const tarjetaProducto = document.getElementById('tarjetaProducto').content; //Template para cada tarjeta de los productos
const tabla = document.getElementById('tabla');
const checkout = document.getElementById('checkout');
const vacCarro = document.getElementById('btnTabla');
const enCarrito = document.getElementById('enCarrito');
const fragment = document.createDocumentFragment(); //Nodo offscreen para ir cargando las tarjetas
let cant = 1
let counterPromo = 0;
let listaFiltro = {};

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
    let tarjSel = e.target.parentElement.parentElement;
    if (e.target.classList.contains('btnAdd')) {
        sumarProductoALista(tarjSel);
        checkEnCarrito(tarjSel);
        notificaSumaProd(tarjSel);
    } else if (e.target.classList.contains('btnRemover')) {
        removerProductoDeLista(tarjSel);
        checkFueraCarrito(tarjSel);
        notificaRemueveProd(tarjSel);
    };
    vaciarTabla();
    armarTabla();
});

//Acción cuando hacen click en botón "Checkout"
checkout.addEventListener('click', e => {
    if (precioTot > 10000) {
        promocion();
        Swal.fire({
            text: 'Accediste a la promoción! Agregamos un producto gratis a tu carrito (Igual todavía no desarrollé la página de checkout)',
            icon: 'info',
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true,
        });
    } else {
        promocion();
        Swal.fire({
            text: 'En breve este botón estará funcional.  Probá sumando más de $10.000 para acceder a la promoción!',
            icon: 'info',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
        })
    }
});

//Acción cuando hacen click en botón "Vaciar lista"
vacCarro.addEventListener('click', e => {
    !arrayCarro.length ?
    Swal.fire({
        text: 'El carrito se encuentra vacío',
        icon: 'info',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
    }) : vaciarCarro();
});

//Filtro productos según input dropdown, y llamo a crear las tarjetas según categoría.
function seleccionCat(e) {
    e === 'Todas' ? seleccionTodo() : listaFiltro = listaProd.filter(cat => cat.categoria === e);
    tarjetasEnPantalla();
}

//Muestra todos los productos del catálogo, llamando a las tarjetas en pantalla.
function seleccionTodo() {
    listaFiltro = listaProd
    tarjetasEnPantalla();
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
        let {nombre:nom, descripcion:desc, precioUn:prec} = elemento; //Desestructuro el objeto y armo unos alias
        let resultado;
        tarjetaProducto.querySelector('.nombreProducto').textContent = nom;
        tarjetaProducto.querySelector('.descripcion').textContent = desc;
        tarjetaProducto.querySelector('.importe').textContent = '$' + parseInt(prec);
        tarjetaProducto.querySelector('.cantidad').textContent = 0

        //Esto reintegra los "checks" y las cantidades de las tarjetas que ya están en el carrito (porque el cambio de filtro las destruye)
        if (arrayCarro.length != 0) {
            resultado = arrayCarro.find(item => item.nombreEl === nom); //Busca si la tarjeta que se va a crear ya estaba agregada al carrito
            if (resultado != undefined) {
                tarjetaProducto.querySelector('.cantidad').textContent = resultado.cantidadEl; //Levanta la cantidad del carrito y la vuelca a la tarjeta
            };
        };

        let tarj = tarjetaProducto.cloneNode(true); //Clono la tarjeta
        resultado != undefined && checkEnCarrito(tarj);
        fragment.appendChild(tarj); //Agrego la tarjeta al fragment
    });
    vaciarTarjetero(); //Invoco la fórmula para limpiar el tarjetero
    productos.appendChild(fragment); //Lleno el tarjetero con las tarjetas filtradas
};

function comparaFiltroConCarro(e) {
    let nom = e;
    let resultado = arrayCarro.find(item => item.nombreEl === nom);
    resultado != undefined && checkEnCarrito(tarj);

};

//Productos seleccionados
class ProductoSel {
    constructor(nombre, cantidad, precioUn, precioSubtot) {
        this.nombreEl = nombre;
        this.cantidadEl = cantidad;
        this.precioUnEl = +precioUn;
        this.precioSubtotEl = +precioSubtot;
    }
}

//Creo el array del carrito, con los productos seleccionados
let arrayCarro = [];

//Si el producto no existe en el carrito, lo agrega. Si ya existe, suma una unidad y modifica el subtotal del producto.
function sumarProductoALista(e) {
    item = buscaItem(e);
    indice = item[2];
    if (indice == -1) { //Si el item no está en el array del carrito, lo suma
        let nombreEl = e.querySelector('.nombreProducto').textContent;
        let cantidadEl = 1
        let precioUnEl =  e.querySelector('.importe').textContent.slice(1); //El slice es para sacarle el símbolo '$' que se agrega en la tarjeta
        let precioSubtotEl = precioUnEl;
        arrayCarro.push(new ProductoSel(nombreEl, cantidadEl, precioUnEl, precioSubtotEl));
        localStorage.setItem('carro', JSON.stringify(arrayCarro)); //Envio el carro a local storage para levantarlo en checkout
        e.querySelector('.cantidad').textContent = cantidadEl //Cantidad en tarjeta
        precioProductosCarro(); //Llamo a la función para sumar los importes de todos los productos
    } else { //Si el item ya está, llama a sumar 1 unidad a la cantidad, y actualiza el precio total
        sumaCantItem(e);
        precioProductosCarro();
    }
};

function variacionCant(e) {
    globalThis.precioSubtot;
    item = buscaItem(e);
    indice = item[2];
    prod = arrayCarro[indice];
}

function buscaItem(e) {
    let nomItem = e.querySelector('.nombreProducto').textContent; //Levanto el nombre del producto a partir del nodo
    let coincidencias = arrayCarro.filter(ProductoSel => ProductoSel.nombreEl === nomItem).length;
    let indice = arrayCarro.findIndex(ProductoSel => ProductoSel.nombreEl === nomItem);
    return [nomItem, coincidencias, indice];
}

//Incrementa la cantidad del item
function sumaCantItem(e) {
    variacionCant(e);
    cantidad = prod.cantidadEl += 1;
    precioSubtot = prod.precioUnEl * cantidad;
    prod.precioSubtotEl = precioSubtot;
    e.querySelector('.cantidad').textContent = cantidad; //Display cant en tarjeta
    localStorage.setItem('carro', JSON.stringify(arrayCarro));
}

//Añade el ícono "check" al producto
function checkEnCarrito(e) {
    let check = e.querySelector('#enCarrito');
    let checkCont = `<i class="bi bi-check-circle-fill p-3"></i>`;
    check.innerHTML = checkCont;
}

//Toast notificación producto añadido al carrito
function notificaSumaProd(e) {
    item = buscaItem(e);
    nomItem = item[0];
    Toast.fire({
        icon: 'success',
        title: `${nomItem} en carrito`
    });
};

//Función para remover productos cuando el usuario cliquea en "remover"
function removerProductoDeLista(e) {
    variacionCant(e);
    if (cantidad == 1) {
        arrayCarro.splice(indice, 1), //Remuevo
        localStorage.clear(), //Limpio el storage
        localStorage.setItem('carro', JSON.stringify(arrayCarro)), //Actualizo el storage
        e.querySelector('.cantidad').textContent = 0
        precioProductosCarro(); //Actualizo la sumatoria de los precios */
    } else if (cantidad > 1) {
        restaCantItem(e);
        precioProductosCarro();
    };
};

function restaCantItem(e) { //VER COMO LO INTEGRO
    variacionCant(e);
    cantidad = prod.cantidadEl -= 1;
    precioSubtot = prod.precioUnEl * cantidad;
    prod.precioSubtotEl = precioSubtot
    e.querySelector('.cantidad').textContent = cantidad
    localStorage.setItem('carro', JSON.stringify(arrayCarro));
}

//Quita "check" al producto
function checkFueraCarrito(e) {
    item = buscaItem(e);
    coincidencias = item[1]
    if (coincidencias < 1) {
        let check = e.querySelector('#enCarrito');
        let checkCont = '';
        check.innerHTML = checkCont;
    };
}

//Toast notificación producto removido del carrito
function notificaRemueveProd(e) {
    item = buscaItem(e);
    indice = item[2];
    nomItem = item[0];
    indice != -1 &&
        Toast.fire({
            icon: 'error',
            title: `${nomItem} fuera del carrito`
        });
};

//Precio total del carrito: Sumo el subtotal de los distintos productos entre sí
function precioProductosCarro() {
    precioTot = arrayCarro.reduce((acc, val) => acc + val.precioSubtotEl, 0);
    document.getElementById('sumaProd').innerHTML = ('$' + precioTot); //Display del precio total de los productos en HTML
}

//Si la compra supera los $10.000, levanta el producto más barato, y lo agrega al carrito gratis
function promocion() {
    if (precioTot > 10000 && counterPromo < 1) {
        prodPromo = listaProd.reduce(function(ant, act) {
            return ant.precioUn < act.precioUn ? ant : act;
        });
        let nombreEl = prodPromo.nombre;
        let precioUnEl = prodPromo.precioUn;
        let cantidadEl = 1
        let precioSubtotEl = 0
        arrayPromo = []
        arrayPromo.push(new ProductoSel(nombreEl, cantidadEl, precioUnEl, precioSubtotEl));
        arrayCarro = [...arrayCarro, ...arrayPromo];
        localStorage.setItem('carro', JSON.stringify(arrayCarro));
        vaciarTabla();
        armarTabla();
        counterPromo = counterPromo + 1
    } else if (precioTot < 10000 && counterPromo != 0) {
        counterPromo = 0;
        let indice = arrayCarro.findIndex(prodPromo => prodPromo.nombreEl === arrayPromo[0].nombreEl);
        arrayCarro.splice(indice, 1), //Remuevo
        localStorage.clear(), //Limpio el storage
        localStorage.setItem('carro', JSON.stringify(arrayCarro));
        vaciarTabla();
        armarTabla();
    }
};

//Armo la tabla a partir del array que levanto del local storage
function armarTabla() {
    let carroLS = localStorage.getItem('carro'); //Llamo al carro desde el local storage
    let carro = JSON.parse(carroLS); //Parseo el string con el array de los productos seleccionados
    for(let i = 0; i < carro.length; i++) {
        let fila = `<tr>
                        <td>${carro[i].nombreEl}</td>
                        <td class="text-center">$${carro[i].precioUnEl}</td>
                        <td class="text-center">${carro[i].cantidadEl}</td>
                        <td class="text-end">$${carro[i].precioSubtotEl}</td>
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
    Swal.fire({
        text: '¿Está seguro de que desea vaciar el carrito? Su compra ya no estará disponible.',
        icon: 'warning',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Vaciar carrito',
    }).then((result) => {
        if (result.isConfirmed) {
            vaciarTabla();
            counterPromo = 0;
            arrayCarro.length = 0;
            localStorage.clear(); //Vació el local storage (elimino carrito)
            precioTot = '';
            document.getElementById('sumaProd').innerHTML = (precioTot);
            tarjetasEnPantalla(); //Llamo a esta función para remover todos los "check" de las tarjetas
        }
    });
}

//Traigo elementos del código anterior para completar después
/* document.getElementById('ingBrut').innerHTML = ('$' + ingBrutTot);
document.getElementById('zonaEnvio').innerHTML = zonaEnvio;
document.getElementById('costoEnvio').innerHTML = ('$' + costoEnvio);
document.getElementById('precioFinal').innerHTML = ('$' + precioFinal); */