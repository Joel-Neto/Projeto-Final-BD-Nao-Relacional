import express from "express";
import { connectToDatabase } from "../utils/mongodb.js";
import { check, validationResult } from "express-validator";
import auth from "../middleware/auth.js";

const router = express.Router();
const { db, ObjectId } = await connectToDatabase();
const nomeCollection = "jogadores";

const validaJogador = [
  check("nome")
    .not()
    .isEmpty()
    .trim()
    .withMessage("É obrigatório informar o nome")
    .isLength({ min: 1, max: 50 }),
  check("numero_camisa")
    .not()
    .isEmpty()
    .trim()
    .withMessage("O número da camisa é obrigatória")
    .isLength({ min: 1 })
    .isAlphanumeric("pt-BR", { ignore: "/. " })
    .withMessage("O número da  camisa  não pode conter caracteres especiais"),
  check("posicao")
    .not()
    .isEmpty()
    .trim()
    .withMessage("É obrigatório informar a posição"),
  check("time")
    .not()
    .isEmpty()
    .trim()
    .withMessage("É obrigatório informar o time"),
  check("cep")
    .not()
    .isEmpty()
    .trim()
    .withMessage("É obrigatório informar o CEP")
    .isNumeric()
    .withMessage("O CEP deve ter apenas números")
    .isLength({ min: 8, max: 8 })
    .withMessage("O CEP informado é inválido"),
  check("endereco.logradouro")
    .notEmpty()
    .withMessage("O logradouro é obrigatório"),
  check("endereco.bairro").notEmpty().withMessage("O bairro é obrigatório"),
  check("endereco.localidade")
    .notEmpty()
    .withMessage("Localidade é obrigatória"),
  check("endereco.uf").isLength({ min: 2, max: 2 }).withMessage("UF inválida"),
  check("data_inicio_atividade")
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("O formato de data é inválido. Informe yyyy-mm-dd"),
];

/**
 * GET /api/jogadores
 * Lista todos os jogadores
 * Parâmetros: limit, skip e order
 */
router.get("/", auth, async (req, res) => {
  /*
   * #swagger.tags = ['Jogadores']
   * #swagger.summary = 'Lista todos os jogadores'
   * #swagger.description = 'Endpoint para obter todos os jogadores.'
   * #swagger.path = '/jogadores'
   * #swagger.method = 'GET'
   * #swagger.parameters['limit'] = { type: 'int', description: 'Limite de registros por página (opcional, padrão: 10)' }
   * #swagger.parameters['skip'] = { type: 'int', description: 'Número de registros a pular (opcional, padrão: 0)' }
   * #swagger.parameters['order'] = { type: 'string', description: 'Campo de ordenação (opcional, ex: nome:asc)' }
   * #swagger.responses[200] = { description: 'Array com os jogadores' }
   * #swagger.responses[401] = { description: 'Acesso negado. É obrigatório o envio do token JWT' }
   * #swagger.responses[500] = { description: 'Erro ao obter a listagem dos jogadores' }
   */
  const { limit, skip, order } = req.query; //Obter da URL
  try {
    const docs = [];
    await db
      .collection(nomeCollection)
      .find()
      .limit(parseInt(limit) || 10)
      .skip(parseInt(skip) || 0)
      .sort({ order: 1 })
      .forEach((doc) => {
        docs.push(doc);
      });
    res.status(200).json(docs);
  } catch (err) {
    res.status(500).json({
      message: "Erro ao obter a listagem dos jogadores",
      error: `${err.message}`,
    });
  }
});

/**
 * GET /api/jogadores/id/:id
 * Lista o jogador pelo id
 * Parâmetros: id
 */
router.get("/id/:id", auth, async (req, res) => {
  /*
   * #swagger.tags = ['Jogadores']
   * #swagger.summary = 'Lista o Jogador pelo ID'
   * #swagger.description = 'Endpoint para obter um único jogador pelo ID.'
   * #swagger.path = '/jogadores/{id}'
   * #swagger.method = 'GET'
   * #swagger.parameters['id'] = { type: 'string', description: 'id do Jogador' }
   * #swagger.responses[200] = { description: 'Array com o Jogador' }
   * #swagger.responses[401] = { description: 'Acesso negado. É obrigatório o envio do token JWT' }
   * #swagger.responses[500] = { description: 'Erro ao obter o prestador pelo ID' }
   */
  try {
    const docs = [];
    await db
      .collection(nomeCollection)
      .find({ _id: { $eq: new ObjectId(req.params.id) } }, {})
      .forEach((doc) => {
        docs.push(doc);
      });
    res.status(200).json(docs);
  } catch (err) {
    res.status(500).json({
      errors: [
        {
          value: `${err.message}`,
          msg: "Erro ao obter o jogador pelo ID",
          param: "/id/:id",
        },
      ],
    });
  }
});

/**
 * GET /api/jogadores/nome/:nome/:numero_camisa
 * Lista o jogador pelo nome ou número de camisa
 * Parâmetros: filtro
 */
// router.get("/nome/:nome/numero/:numero_camisa", auth, async (req, res) => {
//   try {
//     const nome = req.params.nome;
//     const numeroCamisa = req.params.numero_camisa;
//     console.log(nome, numeroCamisa);
//     const docs = [];
//     await db
//       .collection(nomeCollection)
//       .find({
//         $or: [
//           { nome: new RegExp(`^${nome}$`, "i") },
//           { numero_camisa: { $eq: numeroCamisa } },
//         ],
//       })
//       .forEach((doc) => {
//         docs.push(doc);
//       });
//     res.status(200).json(docs);
//   } catch (err) {
//     res.status(500).json({
//       errors: [
//         {
//           value: `${err.message}`,
//           msg: "Erro ao obter o jogador pelo nome e número.",
//           param: "/nome/:filtro",
//         },
//       ],
//     });
//   }
// });

/**
 * GET /api/jogadores/jogador
 * Lista o jogador pelo nome ou número de camisa
 * Parâmetros: filtro
 */
router.get("/jogador", auth, async (req, res) => {
  /*
   * #swagger.tags = ['Jogadores']
   * #swagger.summary = 'Obter informações do jogador pelo nome e/ou número da camisa'
   * #swagger.description = 'Endpoint para obter informações do jogador com base no nome e/ou número da camisa.'
   * #swagger.path = '/jogadores/jogador'
   * #swagger.method = 'get'
   * #swagger.parameters['nome'] = { in: 'query', description: 'Nome do jogador', required: false, type: 'string' }
   * #swagger.parameters['numeroCamisa'] = { in: 'query', description: 'Número da camisa do jogador', required: false, type: 'integer' }
   * #swagger.responses[200] = { description: 'Operação bem-sucedida. Retorna um array com as informações do jogador.' }
   * #swagger.responses[401] = { description: 'Acesso negado. É obrigatório o envio do token JWT' }
   * #swagger.responses[500] = { description: 'Erro ao obter o jogador pelo nome e número.' }
   */
  const { nome, numeroCamisa } = req.query; //Obter da URL
  try {
    const docs = [];
    await db
      .collection(nomeCollection)
      .find({
        $or: [
          { nome: new RegExp(`^${nome}$`, "i") },
          { numero_camisa: { $eq: numeroCamisa } },
        ],
      })
      .forEach((doc) => {
        docs.push(doc);
      });
    res.status(200).json(docs);
  } catch (err) {
    res.status(500).json({
      errors: [
        {
          value: `${err.message}`,
          msg: "Erro ao obter o jogador pelo nome e número.",
          param: "/nome/:filtro",
        },
      ],
    });
  }
});

/**
 * DELETE /api/jogadores/:id
 * Remove o jogador pelo id
 * Parâmetros: id
 */
router.delete("/:id", auth, async (req, res) => {
  /*
   * #swagger.tags = ['Jogadores']
   * #swagger.summary = 'Remove o jogador pelo ID'
   * #swagger.description = 'Endpoint para apagar um único jogador pelo ID.'
   * #swagger.path = '/jogadores/{id}'
   * #swagger.method = 'DELETE'
   * #swagger.parameters['id'] = { type: 'string', description: 'id do jogador a ser excluído' }
   * #swagger.responses[200] = { description: 'Registro removido com sucesso' }
   * #swagger.responses[401] = { description: 'Acesso negado. É obrigatório o envio do token JWT' }
   * #swagger.responses[404] = { description: 'Não há nenhum jogador com o id informado' }
   * #swagger.responses[500] = { description: 'Erro ao excluir o jogador pelo ID' }
   */
  const result = await db.collection(nomeCollection).deleteOne({
    _id: { $eq: new ObjectId(req.params.id) },
  });
  if (result.deletedCount === 0) {
    res.status(404).json({
      errors: [
        {
          value: `Não há nenhum jogador com o id ${req.params.id}`,
          msg: "Erro ao excluir o jogador",
          param: "/:id",
        },
      ],
    });
  } else {
    res.status(200).send(result);
  }
});

/**
 * POST /api/jogadores
 * Insere um novo jogador
 * Parâmetros: Objeto jogador
 */
router.post("/", auth, validaJogador, async (req, res) => {
  /* 
    * #swagger.tags = ['Jogadores']
    * #swagger.summary = 'Adiciona um novo jogador'
    * #swagger.description = 'Endpoint para adicionar um novo jogador.'    
    * #swagger.path = '/jogadores'
    * #swagger.method = 'POST'
    * #swagger.parameters['jogador'] = {
        in: 'body',
        description: 'Informações do jogador',
        required: true,
        schema: {
          type: 'object',
          properties: {
            nome: { type: 'string', example: 'Jhon Doe' },
            numero_camisa: { type: 'number', example: 10 },
            posicao: { type: 'string', example: 'Zagueiro' },
            time: { type: 'string', example: 'Palmeiras' },
            valor_de_mercado: { type: 'number', example: 10000 },
            cep: { type: 'string', example: '01001000' },
            endereco: {
              logradouro: { type: 'string', example: 'Av. Presidente Kennedy, 321' },
              bairro: { type: 'string', example: 'Centro' },
              localidade: { type: 'string', example: 'Votorantim' },
              uf: { type: 'string', example: 'SP' }
            },
            data_inicio_atividade: { type: 'string', example: '2024-04-22' }
          }
        }
      }
  */
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    req.body.data_criacao = new Date();
    req.body.ultima_atualizacao = null;

    const jogador = await db.collection(nomeCollection).insertOne(req.body);
    res.status(201).json(jogador); //201 é o status created
  } catch (err) {
    res.status(500).json({ message: `${err.message} Erro no Server` });
  }
});

/**
 * PUT /api/jogadores
 * Altera um jogador pelo _id
 * Parâmetros: Objeto jogador
 */
router.put("/", auth, validaJogador, async (req, res) => {
  /*
   * #swagger.tags = ['Jogadores']
   * #swagger.summary = 'Altera um jogador pelo ID'
   * #swagger.description = 'Endpoint para alterar um jogador pelo ID.'
   * #swagger.path = '/jogadores'
   * #swagger.method = 'PUT'
   */
  let idDocumento = req.body._id; //armazenamos o _id do documento
  delete req.body._id; //removemos o _id do body que foi recebido na req.
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    req.body.ultima_atualizacao = new Date();

    const jogador = await db
      .collection(nomeCollection)
      .updateOne(
        { _id: { $eq: new ObjectId(idDocumento) } },
        { $set: req.body }
      );
    res.status(202).json(jogador); //Accepted
  } catch (err) {
    res.status(500).json({ errors: err.message });
  }
});

export default router;
