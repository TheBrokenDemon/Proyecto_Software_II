interface Registro {
    estado: string;
    descripcion: string;
    fecha: string;
}

// Se almacenan los estados provenientes de los registros
let registros: Registro[] = []

function renderTable(){
    const body = document.getElementById("tablaID")
    if (!body) return;

    body.innerHTML = '';

    registros.forEach(function callback(estado){
        const row = 
            "<tr>" +
                "<td>" + estado.estado + "</td>" +
                "<td>" + estado.descripcion + "</td>" +
                "<td>" + estado.fecha + "</td>" + 
            "</tr>"
        body.innerHTML += row;
    });
}