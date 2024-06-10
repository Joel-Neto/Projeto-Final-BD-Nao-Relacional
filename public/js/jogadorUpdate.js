const urlBase = "http://localhost:4000/api";
let jogadorId = "";

const access_token = localStorage.getItem("token") || null;

async function carregaPagina() {
  let params = new URLSearchParams(window.location.search);
  let id = params.get("id");

  if (id) {
    fetch(`${urlBase}/jogadores/id/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "access-token": access_token,
      },
    })
      .then((res) => res.json())
      .then(([data]) => {
        document.getElementById("nome").value = data.nome;
        document.getElementById("numCamisa").value = data.numero_camisa;
        document.getElementById("posicao").value = data.posicao;
        document.getElementById("time").value = data.time;
        document.getElementById("cep").value = data.cep;
        document.getElementById("logradouro").value = data.endereco.logradouro;
        document.getElementById("bairro").value = data.endereco.bairro;
        document.getElementById("localidade").value = data.endereco.localidade;
        document.getElementById("uf").value = data.endereco.uf;
        document.getElementById("data-de-inicio-da-atividade").value =
          data.data_inicio_atividade;
      });

    jogadorId = id;
  } else {
    alert("ID não existe na base de dados!");
    window.location.href = "http://localhost:4000/index.html";
  }
}

document.getElementById("cep").addEventListener("input", async function (ev) {
  const cep = ev.target.value;

  if (cep.length === 8) {
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
      .then((res) => res.json())
      .then((data) => {
        if (data.erro) {
          alert("Digite um CEP válido!");
        } else {
          document.getElementById("logradouro").value = data.logradouro;
          document.getElementById("bairro").value = data.bairro;
          document.getElementById("localidade").value = data.localidade;
          document.getElementById("uf").value = data.uf;
        }
      })
      .catch((err) => {
        alert(err);
      });
  }
});

document.getElementById('numCamisa').addEventListener("blur", function(ev) {
  const numCamisaInput = ev.target;

  if (Number(numCamisaInput.value) < 0) {
    document.getElementById("numeroNegativoErro").classList.remove("d-none")
  } else {
    document.getElementById("numeroNegativoErro").classList.add("d-none");
  }
})

document
  .getElementById("formJogadores")
  .addEventListener("submit", function (ev) {
    ev.preventDefault();
    const jogador = {
      _id: jogadorId,
      nome: document.getElementById("nome").value,
      numero_camisa: document.getElementById("numCamisa").value,
      posicao: document.getElementById("posicao").value,
      time: document.getElementById("time").value,
      cep: document.getElementById("cep").value,
      endereco: {
        logradouro: document.getElementById("logradouro").value,
        bairro: document.getElementById("bairro").value,
        localidade: document.getElementById("localidade").value,
        uf: document.getElementById("uf").value,
      },
      data_inicio_atividade: document.getElementById(
        "data-de-inicio-da-atividade"
      ).value,
    };

    salvaJogadorAtualizado(jogador);
  });

async function salvaJogadorAtualizado(jogador) {
  fetch(`${urlBase}/jogadores`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "access-token": access_token,
    },
    body: JSON.stringify(jogador),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.acknowledged) {
        alert("Jogador atualizado com sucesso!");
        //limpamos o formulário
        document.getElementById("formJogadores").reset();
        window.location.href = "http://localhost:4000/index.html";
      } else if (data.errors) {
        const errorMessages = data.errors.map((error) => error.msg).join("\n");
        alert(errorMessages);
      }
    });
}
