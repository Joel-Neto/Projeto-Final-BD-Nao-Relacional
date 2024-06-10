const urlBase = "http://localhost:4000/api";

const access_token = localStorage.getItem("token") || null;

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

    salvaJogador(jogador);
  });

async function salvaJogador(jogador) {
  await fetch(`${urlBase}/jogadores`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "access-token": access_token,
    },
    body: JSON.stringify(jogador),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.acknowledged) {
        alert("Jogador incluído com sucesso!");
        //limpamos o formulário
        document.getElementById("formJogadores").reset();
      } else if (data.errors) {
        const errorMessages = data.errors.map((error) => error.msg).join("\n");
        alert(errorMessages);
      }
    });
}
