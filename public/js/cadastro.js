const urlBase = `${window.location.href.replace(/\/[^\/]*$/, "")}/api`;

document.getElementById("formUsuario").addEventListener("submit", (ev) => {
  ev.preventDefault(); // Evita o recarreamento da página
  const msgModal = new bootstrap.Modal(
    document.getElementById("modalMensagem")
  );

  //Obtendo os dados do formulário
  const nome = document.getElementById("nome").value;
  const login = document.getElementById("login").value;
  const senha = document.getElementById("senha").value;

  //Criando o objeto de autenticação
  const dadosUsuario = {
    nome,
    email: login,
    senha,
  };

  // alert(JSON.stringify(dadosUsuario));

  //Efetuar o POST para endpoint de login
  fetch(`${urlBase}/usuarios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dadosUsuario),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      //Verifica se o token foi retornado
      if (data.acknowledged) {
        document.getElementById("mensagem").innerHTML =
          "<span class='text-success'>Usuário criado com sucesso! </br> Por favor, efetue o login.</span>";
        msgModal.show();
        setTimeout(() => {
          window.location = "login.html";
        }, 3 * 1000);
      } else if (data.errors) {
        const messages = data.errors.map((error) => error.msg).join("</br>");
        document.getElementById(
          "mensagem"
        ).innerHTML = `<span class='text-danger'>${messages}</span>`;
        msgModal.show();
      }
    });
});
