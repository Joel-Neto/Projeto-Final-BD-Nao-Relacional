const urlBase = "http://localhost:4000/api";

const access_token = localStorage.getItem("token") || null;

async function carregaJogadores() {
  const tabela = document.getElementById("dadosTabela");
  tabela.innerHTML = ""; //limpa antes de recarregar
  //Faremos a requisição GET para a nossa API REST
  await fetch(`${urlBase}/jogadores`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "access-token": access_token,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      // console.table(data)
      data.forEach((jogador) => {
        tabela.innerHTML += `
            <tr>
              <td>${jogador.nome}</td>
              <td>${jogador.numero_camisa}</td>
              <td>${primeiraLetraMaiusula(jogador.posicao)}</td>
              <td>${jogador.time}</td>
              <td>
                <button class='btn btn-danger btn-sm' title='Remover jogador' onclick='removeJogador("${
                  jogador._id
                }")'>
                  🗑 
                </button>
              </td>
              <td>
                <button class='btn btn-success btn-sm' title='Editar jogador' onclick='editaJogador("${
                  jogador._id
                }")'>
                  ✏️ 
                </button>
              </td>
            </tr>
            `;
      });
    });
}

async function removeJogador(id) {
  if (confirm("Deseja realmente excluir este jogador?")) {
    await fetch(`${urlBase}/jogadores/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "access-token": access_token,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.deletedCount > 0) {
          document.getElementById("buscaSucesso").classList.add("d-none");
          const tabela = document.getElementById("dadosTabelaBusca");
          tabela.innerHTML = "";
          carregaJogadores(); //atualizamos a UI
          alert("Jogador removido com sucesso!");
        }
      })
      .catch((error) => {
        alert(`Erro ao remover o jogador: ${error.message}`);
        // document.getElementById(
        //   "mensagem"
        // ).innerHTML = `Erro ao remover o jogador: ${error.message}`;
        // resultadoModal.show(); //exibe o modal com o erro
      });
  }
}

function editaJogador(id) {
  let url = new URL("http://localhost:4000/jogadoresUpdate.html");
  url.searchParams.append("id", id);
  window.location.href = url.href;
}

function primeiraLetraMaiusula(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

async function buscaJogadores(ev) {
  ev.preventDefault();

  const nome = document.getElementById("nomeJogador");
  const numero = document.getElementById("numeroJogador");

  await fetch(
    `http://localhost:4000/api/jogadores/jogador?nome=${
      nome.value ?? ""
    }&numeroCamisa=${numero.value ?? ""}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "access-token": access_token,
      },
    }
  )
    .then((res) => res.json())
    .then((data) => {
      carregaDados(data);
      nome.value = "";
      numero.value = "";
    })
    .catch((error) => {
      alert(
        `Erro ao buscar jogador por nome ou número de camisa: ${error.message}`
      );
    });
}

function carregaDados(data) {
  if (data.length > 0) {
    const tabela = document.getElementById("dadosTabelaBusca");
    document.getElementById("buscaComErro").classList.add("d-none");
    document.getElementById("buscaSucesso").classList.remove("d-none");

    tabela.innerHTML = "";

    data.forEach((jogador) => {
      tabela.innerHTML += `
          <tr>
            <td>${jogador.nome}</td>
            <td>${jogador.numero_camisa}</td>
            <td>${primeiraLetraMaiusula(jogador.posicao)}</td>
            <td>${jogador.time}</td>
            <td>
              <button class='btn btn-danger btn-sm' title='Remover jogador' onclick='removeJogador("${
                jogador._id
              }")'>
                🗑 
              </button>
            </td>
            <td>
              <button class='btn btn-success btn-sm' title='Editar jogador' onclick='editaJogador("${
                jogador._id
              }")'>
                ✏️ 
              </button>
            </td>
          </tr>
          `;
    });
  } else {
    document.getElementById("buscaSucesso").classList.add("d-none");
    document.getElementById("buscaComErro").classList.remove("d-none");
  }
}

document
  .getElementById("buscaJogadores")
  .addEventListener("submit", buscaJogadores);
