const API = "https://api.restcountries.com/countries/v5";
const API_KEY = "rc_live_e5cf4198b25044b998786471fb3701a7"; // propia
const CAMPOS = "response_fields=names.common,capitals,region,population,flag.url_png";

// hacer la petición a la API y regresa el arreglo de países
async function buscarPais(nombre) {
  if (API_KEY === "PEGA_AQUI_TU_API_KEY") {
    throw new Error("Falta poner tu API key en app.js");
  }

  const url = `${API}/name?q=${encodeURIComponent(nombre)}&${CAMPOS}`;

  let respuesta;
  try {
    respuesta = await fetch(url, {
      headers: { "Authorization": `Bearer ${API_KEY}` }
    });
  } catch (err) {
    // validacion en caso de error
    console.error(err);
    throw new Error("No se pudo conectar con el servidor. Revisa tu conexión a internet.");
  }

  if (respuesta.status === 401) {
    throw new Error("La API key no es válida.");
  }
  if (respuesta.status === 403) {
    throw new Error("Acceso denegado. Revisa tu cuenta o el límite de peticiones.");
  }
  if (respuesta.status === 429) {
    throw new Error("Demasiadas peticiones, espera unos segundos.");
  }
  if (!respuesta.ok && respuesta.status !== 404) {
    throw new Error(`Error del servidor (código ${respuesta.status}).`);
  }

  // paises dentro de un data.objects
  let paises = [];
  if (respuesta.ok) {
    const datos = await respuesta.json();
    paises = datos.data.objects;
  }

  if (paises.length === 0) {
    throw new Error("No se encontró ningún país con ese nombre.");
  }
  return paises;
}

// tarjeta por cada pais mostrado
function mostrarPaises(paises) {
  const contenedor = document.getElementById("resultados");
  contenedor.innerHTML = "";

  paises.forEach(pais => {
    // la capital es un objeto con nombre, por eso el .name
    let capital = "Sin capital";
    if (pais.capitals && pais.capitals.length > 0) {
      capital = pais.capitals[0].name || pais.capitals[0];
    }

    const poblacion = pais.population
      ? pais.population.toLocaleString("es-MX")
      : "Sin dato";

    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta";
    tarjeta.innerHTML = `
      <img src="${pais.flag.url_png}" alt="Bandera de ${pais.names.common}">
      <h3>${pais.names.common}</h3>
      <p><b>Capital:</b> ${capital}</p>
      <p><b>Región:</b> ${pais.region}</p>
      <p><b>Población:</b> ${poblacion}</p>
    `;
    contenedor.appendChild(tarjeta);
  });
}

// conectar con el form
const form = document.getElementById("formBuscar");
const mensaje = document.getElementById("mensaje");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("txtPais").value.trim();
  mensaje.textContent = "Cargando...";

  try {
    const paises = await buscarPais(nombre);
    mostrarPaises(paises);
    mensaje.textContent = `${paises.length} resultado(s)`;
  } catch (error) {
    document.getElementById("resultados").innerHTML = "";
    mensaje.textContent = error.message;
  }
});
