# CRUD Jogadores ⚽⚽

O projeto visa demonstrar o funcionamento do banco de dados não relacional MongoDB + Node.js.

**Funcionalidades:**

**Create (Criar):**

- Os usuários podem enviar uma solicitação POST que contém os dados do jogador, incluindo nome, número da camisa, posição e time, para o servidor Node.js.
- O servidor Node.js valida os dados recebidos e os salva no banco de dados MongoDB.

**Read (Ler):**

- Os usuários podem enviar uma solicitação GET para recuperar todos os jogadores ou um jogador específico com base em um identificador único.
- O servidor Node.js consulta o banco de dados MongoDB e retorna os dados correspondentes em formato JSON.

**Update (Atualizar):**

- Os usuários podem enviar uma solicitação PUT contendo o identificador único do jogador a ser atualizado e os novos dados a serem atualizados.
- O servidor Node.js recebe a solicitação, encontra o jogador correspondente no banco de dados MongoDB e atualiza os dados conforme especificado.

**Delete (Excluir):**

- Os usuários podem enviar uma solicitação DELETE contendo o identificador único do jogador a ser excluído.
- O servidor Node.js recebe a solicitação, encontra o jogador correspondente no banco de dados MongoDB e o remove do banco de dados.

## Authors

- [Ali Haidar]()
- [Alexsander Ferreira]()
- [Cláudio Almeida ]()
- [João Fischer]()
- [Joel de Farias]()
