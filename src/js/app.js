let paso = 1;
const pasoInicial = 1
const pasoFinal = 3

const cita = {
    id: '',
    nombre: '',
    fecha: '',
    hora: '',
    servicios: []
,}


document.addEventListener('DOMContentLoaded', function() {
    iniciarApp();
})

function iniciarApp() {
    mostrarSeccion() // Muestra y oculta las secciones
    tabs() // cambia la sección al pulsar en los botones tab 
    botonesPaginador() // Agrega o quita los botones del paginador
    paginaSiguiente()
    paginaAnterior()

    consultarAPI() // Consulta la API en el backend de PHP

    idCliente() // 
    nombreCliente() // consultar el cliente y añdirlo al objecto de cita
    seleccionarFecha() // Añade la fecha al objeto
    seleccionarHora() // Añade la hora a la cita en el objeto

    mostrarResumen() // lee el objeto cita y lo pfresneta en pnatlla

}

function mostrarSeccion() {

    // Ocultar la sección que tenga la clase de mostar
    const seccionAnterior = document.querySelector('.mostrar')
    if(seccionAnterior){
        seccionAnterior.classList.remove('mostrar')
    }
    

    // Seleccoionar la sección con el paso
    const seccion = document.querySelector(`#paso-${paso}`)
    seccion.classList.add('mostrar')

    // Quita la clase de actual al tab anterior
    const tabAnterior = document.querySelector('.actual')
    if(tabAnterior) {
        tabAnterior.classList.remove('actual')
    }

    // Resalta el tab actual
    const tab = document.querySelector(`[data-paso = "${paso}"]`)
    tab.classList.add('actual')
}

function tabs() {
    const botones = document.querySelectorAll('.tabs button')

    botones.forEach( boton => {
        boton.addEventListener('click', function(e) {
            paso = parseInt(e.target.dataset.paso)

            mostrarSeccion()
            botonesPaginador()
        })
    })
}

function botonesPaginador() {

    const paginaAnterior = document.querySelector('#anterior')
    const paginaSiguiente = document.querySelector('#siguiente')

    if(paso === 1 ) {
        paginaAnterior.classList.add('ocultar')
        paginaSiguiente.classList.remove('ocultar')
    } else if (paso === 3) {
        paginaAnterior.classList.remove('ocultar')
        paginaSiguiente.classList.add('ocultar')
        mostrarResumen()
    } else {
        paginaAnterior.classList.remove('ocultar')
        paginaSiguiente.classList.remove('ocultar')
    }

    mostrarSeccion()
   
}

function paginaAnterior() {
    const paginaAnterior = document.querySelector('#anterior')
    paginaAnterior.addEventListener('click' , function() {
       if(paso <= pasoInicial) return
        paso--

      botonesPaginador()

    })
}

function paginaSiguiente() {
   
        const paginaSiguiente = document.querySelector('#siguiente')
        paginaSiguiente.addEventListener('click' , function() {
           if(paso >= pasoFinal) return
            paso++
    
          botonesPaginador()
    
        })
    }


async function consultarAPI() {

    try {
        const url = '/api/servicios'
        const resultado = await fetch(url)
        const servicios = await resultado.json()
        mostrarServicios(servicios)
    } catch (error) {
        console.log(error)
    }

}

function mostrarServicios(servicios) {
    servicios.forEach(servicio => {
        const {id, nombre, precio} = servicio

        const nombreServicio = document.createElement('P')
        nombreServicio.classList.add('nombre-servicio')
        nombreServicio.textContent = nombre

        const precioServicio = document.createElement('P')
        precioServicio.classList.add('precio-servicio')
        precioServicio.textContent = `$${precio}`

        const servicioDiv = document.createElement('DIV')
        servicioDiv.classList.add('servicio')
        servicioDiv.dataset.idServicio = id

        // llama a una función al dar cñlick en el div de servicio
        servicioDiv.onclick = function() {
            selecionarServicio(servicio)
        }

        servicioDiv.appendChild(nombreServicio)
        servicioDiv.appendChild(precioServicio)

        document.querySelector('#servicios').appendChild(servicioDiv)
    } )
}

function selecionarServicio(servicio){
    const { id } = servicio // extrae el id del servicio
    //Extraer solo los servicios del objeto cita
    const {servicios } = cita


    // identificar el elmento al que se le da click
    const divServicio = document.querySelector(`[data-id-servicio="${id}"]`)

    // Comprobar si un servicio ya fue agregado o quitarlo
    if(servicios.some(agregado => agregado.id === id)) {
        // eliminarlo
        cita.servicios = servicios.filter( agregado =>  agregado.id !== id )
        divServicio.classList.remove('seleccionado')
    } else {
       // agregarlo
       // Tomo una copia de servicios con los tres puntos ... y le agrego el nuevo servicio
    cita.servicios = [...servicios, servicio]  
    divServicio.classList.add('seleccionado')
    }  
}

function nombreCliente() {
    cita.nombre = document.querySelector('#nombre').value
  
}

function idCliente() {
    cita.id = document.querySelector('#id').value
}

function seleccionarFecha() {
    const inputFecha = document.querySelector('#fecha')
    inputFecha.addEventListener('input', function(e) {
        const dia = new Date(e.target.value).getUTCDay()

        if([6,0].includes(dia)) {
            e.target.value = ''
            mostrarAlerta('Los Fines de semana no abrimos', 'error', '.formulario')
        } else {
            cita.fecha = e.target.value
        }
    })        
}

function seleccionarHora() {
    const inputHora = document.querySelector('#hora')
    inputHora.addEventListener('input', function(e) {
        const horaCita = e.target.value
        const hora = horaCita.split(":")[0]

        if(hora < 10 || hora > 18) {
            e.target.value = ''
            mostrarAlerta('Hora no válida , horario de 10 a 18', 'error', '.formulario')
        } else {
            cita.hora = e.target.value
        }
    })   
}

function mostrarResumen() {
    const resumen = document.querySelector('.contenido-resumen')

    
    // Limpiar Resumen
    while(resumen.firstChild) {
        resumen.removeChild(resumen.firstChild)
    }

    if(Object.values(cita).includes('') || cita.servicios.length === 0 ) {
        mostrarAlerta('Faltan datos de Servicios, Fecha u Hora o vaya Vd a saber', 'error', '.contenido-resumen', false)
        return
    } 
    
    const {nombre, fecha, hora, servicios} = cita

    // Heading para servicios
    const headingServicios = document.createElement('H3')
    headingServicios.textContent = 'Resumen de Servicios'
    resumen.appendChild(headingServicios)


    // Iterando en los servicios y mostrandolos
    servicios.forEach(servicio => {
        const {id, precio, nombre} = servicio
        const contenedorServicio = document.createElement('DIV')  
        contenedorServicio.classList.add('contenedor-servicio')

        const textoServicio = document.createElement('P')
        textoServicio.textContent = nombre

        const precioServicio = document.createElement('P')
        precioServicio.innerHTML = `<span>Precio:</span> $${precio}`

        contenedorServicio.appendChild(textoServicio)
        contenedorServicio.appendChild(precioServicio)

        resumen.appendChild(contenedorServicio)

    })

     // Formatear el div de resumen

     // Heading para servicios
    const headingCita = document.createElement('H3')
    headingCita.textContent = 'Información de la Cita'
    resumen.appendChild(headingCita)
     

     const nombreCliente = document.createElement('P')
     nombreCliente.innerHTML = `<span>Nombre:</span> ${nombre}`

     // Formatear la fecha
     const fechaObj = new Date(fecha)
     const mes = fechaObj.getMonth()
     const dia = fechaObj.getDate() + 2
     const year = fechaObj.getFullYear()
     const fechaUTC = new Date(Date.UTC(year, mes , dia))
     const opciones = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'}
     const fechaFormateada = fechaUTC.toLocaleDateString('es-ES', opciones)
     

     const fechaCita = document.createElement('P')
     fechaCita.innerHTML = `<span>Fecha:</span> ${fechaFormateada}`
 
     const horaCita = document.createElement('P')
     horaCita.innerHTML = `<span>Hora:</span> ${hora} Horas`

     // Boton para crear una cita
     const botonReservar = document.createElement('BUTTON')
     botonReservar.classList.add('boton')
     botonReservar.textContent = 'Reservar Cita'
     botonReservar.onclick = reservarCita

    resumen.appendChild(nombreCliente)
    resumen.appendChild(fechaCita)
    resumen.appendChild(horaCita)

    resumen.appendChild(botonReservar)

}

async function reservarCita() {
    
    const { nombre, fecha, hora, servicios, id } = cita

    const idServicios = servicios.map( servicio => servicio.id)
    
    const datos = new FormData()
    
    datos.append('fecha', fecha)
    datos.append('hora', hora)
    datos.append('usuarioId', id)
    datos.append('servicios', idServicios)

    


    try {
        const url = '/api/citas'

        const respuesta = await fetch(url, {
            method: 'POST',
            body: datos
        })  
    

    const resultado = await respuesta.json()

    console.log(resultado.resultado)

    
        if(resultado.resultado) {
            Swal.fire({
                icon: "success",
                title: "Cita Creada",
                text: "Tu cita fué creada correctamente",
                button: 'OK'
                
            }).then( () => {
                setTimeout(() => {
                    window.location.reload()  
                }, 3000);
            
            })
        }
        
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Hubo un error al guardar la cita",
            button: 'OK'
        })
        
    }

        // console.log([...datos])

    // Peticion hacia la api mediante async await , la functio n debe asincrona poner async 
    



function mostrarAlerta(mensaje,tipo, elemento, desaparece = true) {

    // Previene que se genere mas de una alerta
    const alertaPrevia = document.querySelector('.alerta')
    if(alertaPrevia) {
        alertaPrevia.remove()
    }
    // Scripting
    const alerta = document.createElement('DIV')
    alerta.textContent = mensaje
    alerta.classList.add('alerta')
    alerta.classList.add(tipo)
    
    const referencia = document.querySelector(elemento)
    referencia.appendChild(alerta)

    // Pasados 3 segundos elimina la alerta
    if(desaparece) {
        setTimeout(() => {
            alerta.remove()
        }, 3000);
    }
   
}

}