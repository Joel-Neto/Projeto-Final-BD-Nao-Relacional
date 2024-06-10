document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");
  console.log(token);
  if (!token) {
    //Não existe o token, enviamos para o login
    window.location.href = "login.html";
  } else {
    //token existe. Verificar se e valido
    const tokenData = parseJwt(token);
    if (tokenData && tokenData.exp && tokenData.exp * 1000 > Date.now()) {
      //token existe e não expirou. Não faremos nada
    } else {
      window.location.href = "index.html"; //se estiver expirado
    }
  }
});

function parseJwt(token) {
  try {
    const base64url = token.split(".")[1];
    const base64 = base64url.replace("-", "+").replace("_", "/");
    return JSON.parse(atob(base64));
  } catch (error) {
    return null;
  }
}

const btnLogout = document.getElementById("logout");

btnLogout.addEventListener("click", () => {
  if (confirm("Tem certeza que deseja sair?")) {
    // Removemos o token do LocalStorage
    localStorage.removeItem("token");
    // Redirecionamos para o login
    window.location.href = "login.html";
  }
});
