document.getElementById("tableInformation").addEventListener("submit")

// Se almacenan los estados provenientes de los registros
let registros = []

function renderTable(){
    const body = document.getElementById("tablaID")
    body.innerHTML = '';

    registros.forEach(function callback(estado){
        const row = 
            "<tr>" +
                "<td>" + estado.estado + "</td>" +
                "<td>" + estado.descripcion + "</td>" +
                "<td>" + estado.fecha + "</td>" + 
            "</tr>"
        body.innerHTML =+ row;
    });
}