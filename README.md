## Como criar o banco de dados no Postgres

### Primeiramente deve-se criar um Banco de Dados chamado "spotifyLeo".
``` sql
CREATE DATABASE spotifyLeo;
```
Ou pode-se criar com o seu nome e mudar o "database: 'Seu_db_nome'", dentro de configurações do Pool, no arquivo "servidor.js"
### O banco de dados armazenará as entidades:
1. Tabela **musicas** que irá conter a lista de todas as músicas
**Comando SQL(Query Tool Pgadmin)**:
``` sql
CREATE TABLE musicas (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    artista VARCHAR(100) NOT NULL,
    album VARCHAR(100),
    duracao TIME NOT NULL,
    musica_url TEXT -- Armazena a URL do vídeo no youtube para reproduzir com iframe
);
```

2. Tabela **usuarios** que irá conter a lista de todos os usuários
**Comando SQL(Query Tool Pgadmin)**:
``` sql
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL -- Salva a senha criptografada
);
```

3. Tabela **lista_musicas** que irá conter a lista de musicas dos usuários, relação 1 para 1, pois cada usuário só terá uma lista de musicas curtidas
**Comando SQL(Query Tool Pgadmin)**:
``` sql
CREATE TABLE lista_musicas (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    musica_id INT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
    FOREIGN KEY (musica_id) REFERENCES musicas (id) ON DELETE CASCADE
);
```

----