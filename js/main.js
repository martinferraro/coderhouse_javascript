document.addEventListener('DOMContentLoaded', () => {
    cargarJSON(); //Bases de datos desde archivo json
    productos.addEventListener('click', addRemover); //Acción cuando hacen click en botón "Agregar" o "Remover" de las tarjetas
    navMenu.addEventListener("click", e => { filtroMenu(e); miCarritoOut(); });
    checkout.addEventListener('click', miCarritoIn);
    vuelveCompra.addEventListener('click', e => { filtroMenu(e); miCarritoOut(); });
    vuelveCompraFoot.addEventListener('click', e => { filtroMenu(e); miCarritoOut(); });
    tabla.addEventListener('click', addRemoverItemTabla); //Acción cuando hacen click en botón "Agregar" o "Remover" del carrito
    vacCarro.addEventListener('click', notificaCarroVacio); //Acción cuando hacen click en botón "Vaciar lista"
    buscar.addEventListener('keyup', busqueda);
});

//Traigo la base de datos desde JSON
async function cargarJSON() {
    fetch('./js/bd.json')
        .then((response) => response.json())
        .then(function(baseDatos) {
            listaProd = baseDatos.listaProd;
            envios = baseDatos.envios;
            seleccionTodo()
        });
}

//Fade in tarjetero
function miCarritoOut() {
    let opacity = 0;
    tarjetero.style.opacity = opacity;
    tarjetero.style.display = 'block';
    carrito.style.display = 'none';
    let intervalID = setInterval(function() {
        if (opacity < 1) {
            opacity = opacity + 0.1
            tarjetero.style.opacity = opacity;
        } else {
            clearInterval(intervalID);
        }
    }, 50);
}

//Ocultar / Mostrar tarjetero o carrito
miCarritoIn = () => {
    if (arrayCarro.length == 0) {
        notificaCarroVacio();
    } else {
        let opacity = 0;
        tarjetero.style.display = 'none';
        carrito.style.opacity = opacity;
        carrito.style.display = 'block';
        let intervalID = setInterval(function() {
            if (opacity < 1) {
                opacity = opacity + 0.1
                carrito.style.opacity = opacity;
            } else {
                clearInterval(intervalID);
        }}, 50);
    };
};

function notificaCarroVacio() {
    !arrayCarro.length ?
        Swal.fire({
            text: 'El carrito se encuentra vacío',
            icon: 'info',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
        }) : vaciarCarro();
};

function filtroMenu(e) {
    let botonClick = e.target;
    if(botonClick.tagName == 'BUTTON'){
        seleccionCat(botonClick.value)
    }
}

function addRemover(e) {
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
}

/* //Función de búsqueda
function busqueda() {
    const input = buscar.value.toUpperCase();
    console.log(tarjetero);

    const tarjeta = tarjetero.getElementsByClassName('tarjProd');
    console.log(tarjeta);

} */

//Filtro productos según selección en menu, y llamo a crear las tarjetas según categoría.
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
        let {nombre:nom, precioUn:prec, imagen:img} = elemento; //Desestructuro el objeto y armo unos alias
        let resultado;
        tarjetaProducto.querySelector('.imgTarj').setAttribute('src', img);
        tarjetaProducto.querySelector('.nombreProducto').textContent = nom;
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

//Productos seleccionados
class ProductoSel {
    constructor(nombre, cantidad, precioUn, precioSubtot) {
        this.nombreEl = nombre;
        this.cantidadEl = cantidad;
        this.precioUnEl = +precioUn;
        this.precioSubtotEl = +precioSubtot;
    }
}

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
        cantidadProductosCarro(); //Idem para cantidad total
    } else { //Si el item ya está, llama a sumar 1 unidad a la cantidad, y actualiza el precio total
        sumaCantItem(e);
        precioProductosCarro();
        cantidadProductosCarro();
    };
    promocion();
};

function variacionCant(e) {
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
    cantidad = e.querySelector('.cantidad').textContent
    cantidad == 1 && 
        Toast.fire({
            icon: 'success',
            title: `${nomItem} en carrito`,
            position: 'top-end'
        });
    if (precioTot > 10000 && counterPromo == 1) {
        accedistePromo();
    }
};

//Función para remover productos cuando el usuario cliquea en "remover"
function removerProductoDeLista(e) {
    item = buscaItem(e);
    indice = item[2];
    cantidad = e.querySelector('.cantidad').textContent;
    if (cantidad == 1) {
        arrayCarro.splice(indice, 1), //Remuevo
        localStorage.clear(), //Limpio el storage
        localStorage.setItem('carro', JSON.stringify(arrayCarro)), //Actualizo el storage
        e.querySelector('.cantidad').textContent = 0
        precioProductosCarro(); //Actualizo la sumatoria de los precios */
        cantidadProductosCarro();
    } else if (cantidad > 1) {
        restaCantItem(e);
        precioProductosCarro();
        cantidadProductosCarro();
    };
    promocion();
};

function restaCantItem(e) {
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
    nomItem = item[0];
    cantidad = e.querySelector('.cantidad').textContent;
    cantidad == 0 &&
        Toast.fire({
            icon: 'error',
            title: `${nomItem} fuera del carrito`,
            position: 'top-end'
        });
};

//Armo la tabla a partir del array que levanto del local storage
function armarTabla() {
    let carroLS = localStorage.getItem('carro'); //Llamo al carro desde el local storage
    let carro = JSON.parse(carroLS); //Parseo el string con el array de los productos seleccionados
    for(let i = 0; i < carro.length; i++) {
        let fila = `<tr>
                        <td class="nombreProducto align-middle">${carro[i].nombreEl}</td>
                        <td class="text-center align-middle">$${carro[i].precioUnEl}</td>
                        <td class="text-center align-middle d-flex justify-content-between align-items-center"><button class="btnRemover btn btn-secondary btn-sm bi-dash-circle me-2"></button>${carro[i].cantidadEl}<button class="btnAdd btn btn-secondary btn-sm bi-plus-circle ms-2"></button></td>
                        <td class="text-end align-middle">$${carro[i].precioSubtotEl}</td>
                    </tr>`;
        tabla.innerHTML += fila
    };
};

function addRemoverItemTabla(e) {
    seleccionCat('Todas'); //Cargo todas las tarjetas, porque desde la tabla tiene que referir a ellas para actualizar sus cantidades
    let prodSel = e.target.parentElement.parentElement; //Obtengo el nombre del producto a partir del click en la línea de la tabla
    let nom = prodSel.querySelector('.nombreProducto').textContent; //Busco la tarjeta con el nombre del producto, así ejecuto el agregar/remover
    let xpath = "//*[text() = '"+nom+"']/parent::node()/parent::node()/parent::node()";
    let tarjSel = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (e.target.classList.contains('btnAdd')) { //Según el botón cliqueado, agrego o remuevo cantidades y productos
        let boton = tarjSel.querySelector('.btnAdd'); //Ubico el botón, y ejecuto click
        boton.click();
    } else if (e.target.classList.contains('btnRemover')) {
        let boton = tarjSel.querySelector('.btnRemover'); //Ubico el botón, y ejecuto click
        boton.click();
    };
}

//Precio total del carrito: Sumo el subtotal de los distintos productos entre sí
function precioProductosCarro() {
    precioTot = arrayCarro.reduce((acc, val) => acc + val.precioSubtotEl, 0);
    sumaProd.innerHTML = ('$' + precioTot); //Display del precio total de los productos en HTML
    sumaProd2.innerHTML = ('$' + precioTot);
};

function cantidadProductosCarro() {
    cantTot = arrayCarro.reduce((acc, val) => acc + val.cantidadEl, 0);
    sumaCant.innerHTML = (cantTot);
    sumaCant2.innerHTML = (cantTot); //Display de cantidad total de productos en HTML
};

//"Vaciar tabla" lo uso para reiniciar lo que muestra la tabla, sin resetear el local storage (para que no se me multipliquen los items de la tabla indefinidamente)
function vaciarTabla() {
    while (tabla.firstChild) {
        tabla.removeChild(tabla.firstChild);
    };
};

//Si el usuario quiere borrar toda la compra, incluso del local storage
function vaciarCarro() {
    Swal.fire({
        text: '¿Querés vaciar tu carrito? La compra ya no estará disponible.',
        icon: 'warning',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Vaciar carrito',
        buttonStyling: false,
        customClass: {
            confirmButton: '.swal2-confirm.swal2-styled',
            cancelButton: '.swal2-cancel.swal2-styled',
        }
    }).then((result) => {
        if (result.isConfirmed) {
            vaciarTabla();
            arrayCarro.length = 0;
            localStorage.clear(); //Vació el local storage (elimino carrito)
            precioTot = '';
            cantTot = '';
            document.getElementById('sumaProd').innerHTML = precioTot;
            document.getElementById('sumaProd2').innerHTML = precioTot;
            document.getElementById('sumaCant').innerHTML = cantTot;
            document.getElementById('sumaCant2').innerHTML = cantTot;
            tarjetasEnPantalla(); //Llamo a esta función para remover todos los "check" de las tarjetas
            miCarritoOut(); //Vuelvo al catálogo
        };
    });
};

function promocion() {
    if (precioTot > 10000 && counterPromo == 0) {
        prodPromo = listaProd.reduce(function(ant, act) { //busco el producto más barato del catálogo
            return ant.precioUn < act.precioUn ? ant : act;
        });
        let nombreEl = prodPromo.nombre;
        let precioUnEl = prodPromo.precioUn;
        let cantidadEl = 1;
        let precioSubtotEl = 0;
        arrayPromo = [];
        arrayPromo.push(new ProductoSel(nombreEl, cantidadEl, precioUnEl, precioSubtotEl));
        arrayCarro = [...arrayCarro, ...arrayPromo]; //Sumo al array del carro mediante un spread
        localStorage.setItem('carro', JSON.stringify(arrayCarro));
        vaciarTabla();
        armarTabla();
        cantidadProductosCarro();
        counterPromo++; //Evito que se repita la promo si siguen agregando productos
    } else if (precioTot > 10000) {
        counterPromo++;
    } else if (precioTot < 10000 && counterPromo != 0) {
        counterPromo = 0;
        let indice = arrayCarro.findIndex(prodPromo => prodPromo.nombreEl === arrayPromo[0].nombreEl);
        arrayCarro.splice(indice, 1), //Remuevo
        localStorage.clear(), //Limpio el storage
        localStorage.setItem('carro', JSON.stringify(arrayCarro));
        vaciarTabla();
        armarTabla();
        cantidadProductosCarro();
    };
};

function accedistePromo() {
    Swal.fire({
        title: '¡Felicitaciones!',
        text: '¡Accediste a la promoción! Agregamos un item gratis a tu carrito.',
        icon: 'info',
        showConfirmButton: false,
        timer: 3500,
        timerProgressBar: true,
    });
}