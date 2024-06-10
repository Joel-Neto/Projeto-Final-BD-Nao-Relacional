const urlBase = "http://localhost:4000/api";

document.getElementById("formLogin").addEventListener("submit", (ev) => {
  ev.preventDefault(); // Evita o recarreamento da página
  const msgModal = new bootstrap.Modal(
    document.getElementById("modalMensagem")
  );

  //Obtendo os dados do formulário
  const login = document.getElementById("login").value;
  const senha = document.getElementById("senha").value;

  //Criando o objeto de autenticação
  const dadosLogin = {
    email: login,
    senha,
  };

  //Efetuar o POST para endpoint de login
  fetch(`${urlBase}/usuarios/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dadosLogin),
  })
    .then((res) => res.json())
    .then((data) => {
      //Verifica se o token foi retornado
      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        window.location.href = "index.html";
      } else if (data.errors) {
        const errorMessages = data.errors.map((error) => error.msg).join("\n");
        document.getElementById(
          "mensagem"
        ).innerHTML = `<span class="text-danger">${errorMessages}</span>`;
        msgModal.show();
      }
    });
});
