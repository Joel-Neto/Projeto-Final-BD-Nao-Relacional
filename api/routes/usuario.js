import express from "express";
import { connectToDatabase } from "../utils/mongodb.js";
import { check, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import auth from "../middleware/auth.js";

const router = express.Router();
const { db, ObjectId } = await connectToDatabase();
const nomeCollection = "usuarios";

// Verificação do usuário
const validaUsuario = [
  check("nome")
    .not()
    .isEmpty()
    .trim()
    .withMessage("É obrigatório informar o nome.")
    .isAlpha("pt-BR", { ignore: " " })
    .withMessage("Informar apenas texto.")
    .isLength({ min: 3 })
    .withMessage("Informe no mínimo 3 caracteres.")
    .isLength({ max: 100 })
    .withMessage("Informe o máximo de 100 caracteres."),
  check("email")
    .not()
    .isEmpty()
    .trim()
    .withMessage("É obrigatório informar o email.")
    .isLowercase()
    .withMessage("Não são permitidas maiúsculas.")
    .isEmail()
    .withMessage("Informe um e-mail válido.")
    .custom((value, { req }) => {
      return db
        .collection(nomeCollection)
        .find({ email: { $eq: value } })
        .toArray()
        .then((email) => {
          // Verifica se não existe o ID para garantir a inclusão
          if (email.length && !req.params.id) {
            return Promise.reject(`O e-mail ${value} já existe!`);
          }
        });
    }),
  check("senha")
    .not()
    .isEmpty()
    .trim()
    .withMessage("É obrigatório informar a senha.")
    .isLength({ min: 6 })
    .withMessage("A senha deve ter no mínimo 6 caracteres")
    .isStrongPassword({
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minSymbols: 1,
      minNumbers: 1,
    })
    .withMessage(
      "A senha não é segura. Informe no mínimo 1 caractere maiúsculo, 1 minúsculo, 1 número e 1 caractere especial"
    ),
  check("ativo")
    .default(true)
    .isBoolean()
    .withMessage("O valor deve ser um booleano"),
  check("tipo")
    .default("Cliente")
    .isIn(["Admin", "Cliente"])
    .withMessage("O tipo deve ser Admin ou Cliente"),
];

// GET usuario
router.get("/", auth, async (req, res) => {
  /* 
    * #swagger.tags = ['Usuários']
    * #swagger.summary = 'Lista todos os usuários do sistema'
    * #swagger.description = 'Endpoint para obter todos os usuários do sistema.'    
    * #swagger.path = '/usuarios'
    * #swagger.method = 'GET'
  */
  try {
    const docs = [];

    await db
      .collection(nomeCollection)
      .find({}, { senha: 0 })
      .sort({ nome: 1 })
      .forEach((doc) => {
        docs.push(doc);
      });

    res.status(200).json(docs);
  } catch (error) {
    res.status(500).json({
      message: "Erro ao obter a listagem dos usuários",
      error: `${error.message}`,
    });
  }
});

// POST usuario
router.post("/", validaUsuario, async (req, res) => {
  /* 
    * #swagger.tags = ['Usuários']
    * #swagger.summary = 'Adiciona um novo usuário ao sistema'
    * #swagger.description = 'Endpoint para adicionar um novo usuário.'    
    * #swagger.path = '/usuarios'
    * #swagger.method = 'POST'
    * #swagger.parameters['usuario'] = {
        in: 'body',
        description: 'Informações do usuário',
        required: true,
        schema: {
          type: 'object',
          properties: {
            nome: { type: 'string', example: 'JOSÉ MARIA LIMA' },
            email: { type: 'string', example: 'joselima@uol.com.br' },
            senha: { type: 'string', example: '123Mudar@' }
          }
        }
      }
  */
  const schemaErrors = validationResult(req);
  if (!schemaErrors.isEmpty()) {
    return res.status(400).json({
      errors: schemaErrors.array(),
    });
  }

  // Criptografia da senha
  // genSalt => impede que 2 senhas tenham resultados iguais
  const salt = await bcrypt.genSalt(10);
  req.body.senha = await bcrypt.hash(req.body.senha, salt);
  //iremos salvar o registro
  await db
    .collection(nomeCollection)
    .insertOne(req.body)
    .then((result) => res.status(201).send(result))
    .catch((err) => res.status(400).json(err));
});

const validaLogin=[
    check('email')
        .not().isEmpty().trim().withMessage('O email é obrigatório')
        .isEmail().withMessage('Informe um email válido para o login'),
    check('senha')
        .not().isEmpty().trim().withMessage('A senha é obrigatória')
]

router.post("/login", validaLogin, async (req, res) => {
  /* 
    * #swagger.tags = ['Usuários']
    * #swagger.summary = 'Efetua o login do usuário do sistema'
    * #swagger.description = 'Endpoint para efetuar o login e receber o token JWT.'    
    * #swagger.path = '/usuarios/login'
    * #swagger.method = 'POST'
  */
  const schemaErrors = validationResult(req);
  if (!schemaErrors.isEmpty()) {
    return res.status(403).json({ errors: schemaErrors.array() });
  }

  const { email, senha } = req.body;

  try {
    // Verificar se o e-mail existe no mongodb
    let usuario = await db
      .collection(nomeCollection)
      .find({ email })
      .limit(1)
      .toArray();
    // Se o array estiver vazio, o e-mail não existe
    if (!usuario.length) {
      return res.status(404).json({
        // Not Found
        errors: [
          {
            value: `${email}`,
            msg: `O email ${email} não está cadastrado`,
            param: "email",
          },
        ],
      });
    }
    // Se o email existe, comparamos se a senha está correta
    const isMatch = await bcrypt.compare(senha, usuario[0].senha);
    if (!isMatch) {
      return res.status(403).json({
        // Forbidden
        errors: [
          {
            value: `Senha`,
            msg: `A senha informada está incorreta`,
            param: "Senha",
          },
        ],
      });
    }
    // Iremos gerar o token JWT
    jwt.sign(
        { usuario: { id: usuario[0]._id } }, 
        process.env.SECRETE_KEY,
        {expiresIn: process.env.EXPIRES_IN},
        (err, token) => {
            if (err) throw err;
            res.status(200).json({
                access_token: token
            })
        }
    );
  } catch (err) {
    console.log(err.message);
  }
});

export default router;
