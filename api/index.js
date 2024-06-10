import express from "express";
import cors from "cors";
import { config } from "dotenv";
import fs from "fs";
import swaggerUI from "swagger-ui-express";
config(); // Carega as variáveis do .env

const app = express();
const { PORT } = process.env;

//Import das rotas da aplicação
import RotasJogadores from "./routes/jogador.js";
import RotasUsuarios from "./routes/usuario.js";

app.use(express.json()); //Habilita o parse do JSON
app.use(cors());

// Rota de conteúdo público
app.use("/", express.static("public"));

// Removendo o X-powered by por segurança
app.disable("x-powered-by");

// Configurando o favicon
app.use(
  "/favicon.ico",
  express.static(
    "public/images/png-transparent-technology-computer-icons-technology-electronics-text-logo-thumbnail.png"
  )
);

//rotas da api
app.use("/api/jogadores", RotasJogadores);
app.use("/api/usuarios", RotasUsuarios);

// Rota default
app.get("/api", (req, res) => {
  res.status(200).json({
    message: "API Fatec 100% funcional 👨‍💻",
    version: "1.0.0",
  });
});

/* Rota da documentação Swagger */
const CSS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";

app.use(
  "/api/doc",
  swaggerUI.serve,
  swaggerUI.setup(
    JSON.parse(fs.readFileSync("./api/swagger/swagger_output.json")),
    {
      customCss:
        ".swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }",
      customCssUrl: CSS_URL,
    }
  )
);

// Listen
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
