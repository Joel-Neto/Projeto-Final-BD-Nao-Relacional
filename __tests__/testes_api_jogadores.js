/*
 * Testes na API de Jogadores
 * Tecnologias utilizadas:
 * Supertest: Biblioteca para testes na API Rest do NodeJS
 * dotenv: Biblioteca para gerenciar variáveis de ambiente
 */
const request = require("supertest");
const dotenv = require("dotenv");
dotenv.config(); //carrega as variáveis do .env

const baseURL = "http://localhost:4000/api";

describe("API REST de Jogadores sem o Token", () => {
  it("GET / - Lista todos os jogadores sem o token", async () => {
    const response = await request(baseURL)
      .get("/jogadores")
      .set("Content-Type", "application/json")
      .expect(401); //Unauthorized
  });

   it('GET / Obtém o Jogador pelo ID sem o token', async() => {
      const id = '665b26163addc3937a831bf4'
      const response = await request(baseURL)
      .get(`/jogadores/id/${id}`)
      .set('Content-Type','application/json')
      .expect(401) //Unauthorized
   })

   it('GET / Obtém o Jogador pelo nome ou número de camisa sem o token', async() => {
      const nome = 'joel'
      const numeroCamisa = 20
      const response = await request(baseURL)
      .get(`/jogadores/jogador?nome=${nome}&numeroCamisa=${numeroCamisa}`)
      .set('Content-Type','application/json')
      .expect(401) //Unauthorized
   })
});

describe('API REST de Jogadores com o token', ()=> {
    let token //Armazenaremos o access_token JWT
    it('POST - Autenticar usuário para retornar token JWT', async() => {
        const senha = process.env.SENHA_USUARIO
        const response = await request(baseURL)
        .post('/usuarios/login')
        .set('Content-Type','application/json')
        .send({"email":"josecaalves@uol.com.br","senha": senha})
        .expect(200) //OK

        token = response.body.access_token
        expect(token).toBeDefined() // Recebemos o token?
    })

    it('GET - Listar os jogadores com autenticação', async() => {
        const response = await request(baseURL)
        .get('/jogadores')
        .set('Content-Type','application/json')
        .set('access-token', token) //Inclui o token na chamada
        .expect(200)

        const jogadores = response.body
        expect(jogadores).toBeInstanceOf(Array)
    })

    const dadosJogador = {
      "nome": "Deyverson",
      "numero_camisa": 16,
      "posicao": "atacante",
      "time": "Palmeiras",
      "valor_de_mercado": 1000000,
      "cep": "01001000",
      "endereco": {
        "logradouro": "Av. 31 de Março, 321",
        "bairro": "Centro",
        "localidade": "Votorantim",
        "uf": "SP"
      },
      "data_inicio_atividade": "2024-06-04"
    }

    let idJogadorInserido;
    it('POST - Inclui um novo jogador com autenticação', async() => {
        const response = await request(baseURL)
        .post('/jogadores')
        .set('Content-Type','application/json')
        .set('access-token', token)
        .send(dadosJogador)
        .expect(201) //Created

        expect(response.body).toHaveProperty('acknowledged')
        expect(response.body.acknowledged).toBe(true)

        expect(response.body).toHaveProperty('insertedId')
        expect(typeof response.body.insertedId).toBe('string')
        idJogadorInserido = response.body.insertedId
        expect(response.body.insertedId.length).toBeGreaterThan(0)
    })

    it('GET /:id - Lista o jogador pelo id com token', async() => {
        const response = await request(baseURL)
        .get(`/jogadores/id/${idJogadorInserido}`)
        .set('Content-Type','application/json')
        .set('access-token', token)
        .expect(200)
    })

    it('GET ?nome=""&numeroCamisa="" - Lista o jogador pelo nome ou número da camisa com token', async() => {
        const response = await request(baseURL)
        .get(`/jogadores/jogador?nome=${dadosJogador.nome}&numeroCamisa=${1}`)
        .set('Content-Type','application/json')
        .set('access-token', token)
        .expect(200)
    })

    it('PUT - Altera os dados do jogador', async()=> {
        const novoDadosJogador = {
            ...dadosJogador, //spread operator
            '_id' : idJogadorInserido
        }
        novoDadosJogador.numero_camisa = 99
        const response = await request(baseURL)
        .put('/jogadores')
        .set('Content-Type','application/json')
        .set('access-token', token)
        .send(novoDadosJogador)
        .expect(202) //Accepted

        expect(response.body).toHaveProperty('acknowledged')
        expect(response.body.acknowledged).toBe(true)

        expect(response.body).toHaveProperty('modifiedCount')
        expect(typeof response.body.modifiedCount).toBe('number')
        expect(response.body.modifiedCount).toBeGreaterThan(0)
    })

    it('DELETE - Remove o jogador', async() => {
        const response = await request(baseURL)
        .delete(`/jogadores/${idJogadorInserido}`)
        .set('Content-Type','application/json')
        .set('access-token', token)
        .expect(200)

        expect(response.body).toHaveProperty('acknowledged')
        expect(response.body.acknowledged).toBe(true)

        expect(response.body).toHaveProperty('deletedCount')
        expect(typeof response.body.deletedCount).toBe('number')
        expect(response.body.deletedCount).toBeGreaterThan(0)
    })

})
