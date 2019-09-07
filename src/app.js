// Importando dependentas

const express = require("express");
const axios = require("axios");
const path = require("path");
const cors = require("cors");

// Funções auxiliares

async function calcularDistanciasEnderecos(listaEnderecos) {
  const distancias = [];

  for (let i = 0; i < listaEnderecos.length; i++) {
    for (let j = i + 1; j < listaEnderecos.length; j++) {
      distancias.push(calcularDistancia(listaEnderecos[i], listaEnderecos[j]));
    }
  }

  return distancias;
}

async function fazerRequisicao(endereco) {
  const apiKey = "AIzaSyBDow-0L38r53OTg4sMeJrF-NQ7En5Qhc8";
  const URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${endereco}&key=${apiKey}`;
  const requisicao = await axios.get(URL);
  const requisicaoDados = await requisicao.data;
  return {
    nome: requisicaoDados.results[0].formatted_address,
    lng: requisicaoDados.results[0].geometry.location.lng,
    lat: requisicaoDados.results[0].geometry.location.lat
  };
}

async function buscarDadosEnderecos(listaEnderecos) {
  const listaRespostas = [];

  for (let i = 0; i < listaEnderecos.length; i++) {
    listaRespostas.push(await fazerRequisicao(listaEnderecos[i]));
  }

  return listaRespostas;
}

function calcularDistancia(endereco1, endereco2) {
  const distancia = Math.sqrt(
    (endereco1.lng - endereco1.lat) * (endereco1.lng - endereco1.lat) +
      (endereco2.lng - endereco2.lat) * (endereco2.lng - endereco2.lat)
  );
  return {
    endereco1: endereco1.nome,
    endereco2: endereco2.nome,
    distancia: distancia
  };
}

const app = express();

// Middlewares

app.use(cors());
app.use(express.urlencoded());

// Rotas

app.get("/", (requisicao, resposta) => {
  resposta.sendFile(path.join(__dirname + "/index.html"));
});

app.post("/calcular-distancias", async (requisicao, resposta) => {
  const { enderecosAgrupados } = requisicao.body;

  const listaEnderecos = enderecosAgrupados.split(";");
  const listaRespostas = await buscarDadosEnderecos(listaEnderecos);
  const listaDistancias = await calcularDistanciasEnderecos(listaRespostas);

  resposta.json(listaDistancias);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT);
