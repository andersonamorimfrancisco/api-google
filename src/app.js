const express = require("express");
const axios = require("axios");
const path = require("path");
const cors = require("cors");

function calcularDistancia(ponto1, ponto2) {
  const distancia = Math.sqrt(
    (ponto1.lng - ponto1.lat) * (ponto1.lng - ponto1.lat) +
      (ponto2.lng - ponto2.lat) * (ponto2.lng - ponto2.lat)
  );
  console.log(distancia);
  return { ponto1: ponto1.nome, ponto2: ponto2.nome, distancia: distancia };
}

async function pegardados(endereco) {
  const apiKey = "AIzaSyBDow-0L38r53OTg4sMeJrF-NQ7En5Qhc8";
  const URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${endereco}&key=${apiKey}`;
  const request = await axios.get(URL);
  const requestData = await request.data;
  return {
    nome: requestData.results[0].formatted_address,
    lng: requestData.results[0].geometry.location.lng,
    lat: requestData.results[0].geometry.location.lat
  };
}

const app = express();
app.use(cors());
app.use(express.urlencoded());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/index.html"));
});

app.post("/request", async (req, res) => {
  const { listaDeEnderecos } = req.body;
  const enderecos = listaDeEnderecos.split(";");
  const respostas = [];

  for (let i = 0; i < enderecos.length; i++) {
    respostas.push(await pegardados(enderecos[i]));
  }

  const distancias = [];

  for (let i = 0; i < respostas.length; i++) {
    for (let j = i + 1; j < respostas.length; j++) {
      distancias.push(calcularDistancia(respostas[i], respostas[j]));
    }
  }

  res.json(distancias);
});
const PORT = process.env.PORT || 3000;
app.listen(PORT);
