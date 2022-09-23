//ARRAYS
let productosOferta = [];

//Funciones
window.onload=()=>{
obtenerValorDolar();
}

//Asignacion condicional en carrito
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let dolarVenta = localStorage.getItem("dolarVenta");

//CARDS DE SECCION NOVEDADES Y OFERTAS
const cartasNovedades=document.getElementById("cartaNovedades");
//ASIGNACIONES CONTENDOR CARRITO
const contenedorCarrito=document.getElementById("tablabody");
const contenedorFooterCarrito=document.getElementById("tablafooter");

//DIBUJAR CARD
function renderizarProductos() {
    for(const producto of productosOferta){
        let cartaNov=document.createElement("div");
        cartaNov.className="col-md-2  align-items-center";
        cartaNov.innerHTML=`
        <div class="card" style="width: 15rem;">
        <img class="card-img-top" src="${producto.imagen}" alt="${producto.nombre}">
        <div class="card-body">
        <h5 class="card-title">${producto.nombre}</h5>
        <p class="card-text"><strong>$${(producto.precio*dolarVenta)}</strong></p>
        <button id="btnCompra-${producto.id}" class="btn btn-dark">COMPRAR</button>
        </div>
        </div>
        `;
        cartasNovedades.append(cartaNov);   
    }
    productosOferta.forEach(producto=> {
        //Evento para cada boton
        document.getElementById(`btnCompra-${producto.id}`).onclick= function() {
           agregarAlCarrito(producto);
       };
   });
}

//AGREGAR PRODUCTOS AL CARRITO
function agregarAlCarrito(productoNuevo) {
    let encontrado = carrito.find(p => p.id == productoNuevo.id);
    console.log(encontrado);
    if (encontrado == undefined) {
        let prodACarrito = {
            ...productoNuevo,
            cantidad:1
        };
        carrito.push(prodACarrito);
        Toastify({
            text:"Agregaste: "+productoNuevo.nombre ,
            duration:1500,
            gravity:"top",
            position:"right",
            style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
            }            
        }).showToast();
        contenedorCarrito.innerHTML+=(`
            <tr id='fila${prodACarrito.id}'>
            <td> ${prodACarrito.id} </td>
            <td> ${prodACarrito.nombre}</td>
            <td id='cantidad-producto-${prodACarrito.id}' type="number"> ${prodACarrito.cantidad}</td>
            <td> ${prodACarrito.precio*dolarVenta}</td>
            <td> <button id="btnEliminarProducto-${prodACarrito.id}" class="btn btn-danger btn-sm"><i class="fa fa-trash"></i></button></td`);
        dibujarCarrito();
    } else {
        Toastify({
            text:"Agregaste: "+productoNuevo.nombre ,
            duration:1500,
            gravity:"top",
            position:"right",
            style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
            }            
        }).showToast();
        let posicion = carrito.findIndex(p => p.id == productoNuevo.id);
        carrito[posicion].cantidad += 1;
        document.getElementById(`cantidad-producto-${productoNuevo.id}`).innerHTML=carrito[posicion].cantidad;
        dibujarCarrito();
    }
    localStorage.setItem("carrito",JSON.stringify(carrito));
}

//FUNCIION DIBUJAR CARRITO
function dibujarCarrito(){
    let sumaCarrito = 0;
    contenedorCarrito.innerHTML="";
    // MAQUETADO DEL CARRITO
    carrito.forEach(
        (elemento) => {
            let renglonCarrito= document.createElement("tr");
            renglonCarrito.innerHTML=`
            <td>${elemento.id}</td>
            <td>${elemento.nombre}</td>
            <td><input id="cantidad-producto-${elemento.id}" value="${elemento.cantidad}" type="number" min="1" max="999" step="1" class="w-75"></td>
            <td>$${(elemento.precio*dolarVenta)*elemento.cantidad}</td>
            <td><button id="btnEliminarProducto-${elemento.id}" class="btn btn-danger btn-sm"><i class="fa fa-trash"></i></button></td>
            `;
            contenedorCarrito.append(renglonCarrito);
           
            // ELIMINAR PRODUCTO DEL CARRITO
            const eliminarProducto = document.getElementById(`btnEliminarProducto-${elemento.id}`);
            eliminarProducto.addEventListener("click", function(){
                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: elemento.nombre+" "+'eliminado!',
                    showConfirmButton: false,
                    timer: 2500,
                    toast : true
                  })
            eliminarDelCarrito(elemento.id)
            }); 

            // ACTUALIZAR SUMA DE CARRITO
            sumaCarrito+=elemento.cantidad*(elemento.precio*dolarVenta);
            // ACTUALIZAR CANTIDAD DE PRODUCTOS ELEGIDOS
            let cantidadProductos = document.getElementById(`cantidad-producto-${elemento.id}`);
            
            cantidadProductos.addEventListener("change", (e) => {
                let nuevaCantidad = e.target.value;
                elemento.cantidad = nuevaCantidad;
                dibujarCarrito();
                localStorage.setItem("carrito",JSON.stringify(carrito));
            });
        }
    )

    // MODIFICAR LEYENDA CARRITO + SUMA CARRITO
    if(carrito.length == 0) {
        contenedorFooterCarrito.innerHTML = `
            <th scope="row" colspan="5">Su carrito se encuentra vacío</th>
        `;
    } else {
        contenedorFooterCarrito.innerHTML = `
            <th scope="row" colspan="5">Total de la compra: $${sumaCarrito}</th>
        `;
    }
}

// MOSTRAR CARRITO AL TOCAR ICONO
let mostrarCarrito=document.getElementById("mostrarCarrito");
mostrarCarrito=dibujarCarrito();

//BOTON VACIAR CARRITO
let btnVaciarCarrito=document.getElementById("btnVaciarCarrito");
btnVaciarCarrito.onclick = (e) => {
    carrito= [];
    contenedorCarrito.innerHTML="";
    contenedorFooterCarrito.innerHTML = `
    <th scope="row" colspan="5">Su carrito se encuentra vacío</th>
    `;
    localStorage.setItem("carrito",JSON.stringify(carrito));
}

// BOTON FINALIZAR COMPRA
let btnFinalizarCompra=document.getElementById("btnFinalizarCompra");
 btnFinalizarCompra.onclick = (e) => {
         if(carrito.length === 0){
             Swal.fire('¡Debes seleccionar almenos un producto!');
        }else{formularioCompra();
     }
}


async function obtenerJSON() {
    const URLJSON="productos.json"
    const resp=await fetch(URLJSON)
    const data= await resp.json()
    productosOferta = data.ofertas;
    //ya tengo el dolar y los productos, renderizo las cartas
    renderizarProductos();
}

//function para obtener el valor del dolar blue en tiempo real
async function obtenerValorDolar() {
    const URLDOLAR = "https://api-dolar-argentina.herokuapp.com/api/dolarblue";
    const resp=await fetch(URLDOLAR)
    const data=await resp.json()
    dolarVenta = data.venta;
    localStorage.setItem("dolarVenta",dolarVenta);
    //ya tengo los datos del dolar, llamo al json
    obtenerJSON();
}


//ELIMINAR PRODUCTOS
const eliminarDelCarrito = (prodId) => {
    let item = carrito.find((elemento) => elemento.id == prodId);
    const indice = carrito.indexOf(item);
    carrito.splice(indice, 1);
    dibujarCarrito();
    localStorage.setItem("carrito",JSON.stringify(carrito));
}


//Formulario para confirmar compra
function formularioCompra(){
    Swal.fire({
        title: "Por favor completa los siguientes datos para finalizar tu compra",
        html: `<form action="" class="formCompra">
        <input type="text" class="swal2-input" id="nombre" placeholder="Nombre Completo">
        <input type="email" class="swal2-input" id="email" placeholder="Email">
        <input type="tel" class="swal2-input" id="telefono" placeholder="Teléfono">
        <input type="text" class="swal2-input" id="direccion" placeholder="Dirección">
        <input type="number" class="swal2-input" id="codigo" placeholder="Codigo Postal">
        <input type="text" class="swal2-input" id="ciudad" placeholder="Ciudad">
        </form>`,
        color: "#000",
        confirmButtonText: "Confirmar Datos",
        confirmButtonColor: "#777",
        customClass: "compra",
        focusConfirm: false,
        background: "#fff",
        preConfirm: (e) => {
            const nombre = Swal.getPopup().querySelector("#nombre").value;
            const email = Swal.getPopup().querySelector("#email").value;
            const telefono = Swal.getPopup().querySelector("#telefono").value;
            const direccion = Swal.getPopup().querySelector("#direccion").value;
            const codigo = Swal.getPopup().querySelector("#codigo").value;
            const ciudad = Swal.getPopup().querySelector("#ciudad").value;
            !isNaN(ciudad)? Swal.showValidationMessage('La ciudad no puede estar compuesta por números'): '';
            !ciudad? Swal.showValidationMessage('Ciudad obligatoria'): '';
            isNaN(codigo)? Swal.showValidationMessage('El Código Postal debe estar compuesto por números'): '';
            !codigo? Swal.showValidationMessage('Código Postal obligatorio'): '';
            !direccion? Swal.showValidationMessage('Dirección obligatoria'): '';
            isNaN(telefono)?Swal.showValidationMessage('El Teléfono debe estar compuesto por números'): '';
            !telefono? Swal.showValidationMessage('Teléfono obligatorio'): '';
            const validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            !email.match(validRegex)? Swal.showValidationMessage('Email invalido'): '';
            !email? Swal.showValidationMessage('Email obligatorio'): '';
            !isNaN(nombre)? Swal.showValidationMessage('El nombre no puede estar compuesto por números'): '';
            !nombre? Swal.showValidationMessage('Nombre obligatorio'): '';


            return { nombre: nombre, email: email, telefono: telefono, direccion: direccion, codigo: codigo, ciudad: ciudad}
        } 
    }).then((resultado) => {
        Swal.fire({
            html: `
            <p>Nombre completo: ${resultado.value.nombre}</p>
            <p>Email: ${resultado.value.email}</p>
            <p>Teléfono: ${resultado.value.telefono}</p>
            <p>Dirección: ${resultado.value.direccion}</p>
            <p>Código Postal: ${resultado.value.codigo}</p>
            <p>Ciudad: ${resultado.value.ciudad}</p>
            `,
            confirmButtonText: "Ir a medios de pago",
        }).then(() => {
            Swal.fire({
                title: "¡Felicitaiones tu compra fue realizada con exito!",
                text: '¡Muchas Gracias!',
                icon: 'success',
                timer: 3000,
                showConfirmButton: false,
            });
            carrito= [];
            contenedorCarrito.innerHTML="";
            contenedorFooterCarrito.innerHTML = `
            <th scope="row" colspan="5">Su carrito se encuentra vacío</th>
            `;
            localStorage.setItem("carrito",JSON.stringify(carrito));
            dibujarCarrito();
        })
    })
}
