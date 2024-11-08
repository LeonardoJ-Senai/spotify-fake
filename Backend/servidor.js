const express = require("express")
const app = express()
const PORT = 3000;

const pg = require("pg")

const bcrypt = require("bcrypt")

const path = require('path')

app.use(express.static(path.join(__dirname,"../Frontend/public")))
app.use(express.json());

// Configurar o acesso ao BD
const { Pool } = require("pg");
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "spotifyLeo",
    password: "admin",
    port: 5432,
    max: 5, // Número máximo de conexões simultâneas
    idleTimeoutMillis: 30000 // Tempo máximo que a conexão pode ficar ociosa
});

// Enviar a página para o frontend
app.get("/",(req,res)=>{
    try{
        res.sendFile(path.join(__dirname,"../Frontend/views/index.html"))
    }catch(error){
        res.status(418).send("Erro: "+ error.message)
    }
})

// Endpoint para mostrar todas as músicas na tela principal
async function dbSelectMusicas() {
    try {
        const responseDB = await pool.query("SELECT * FROM musicas")
        return responseDB.rows
    } catch (error) {
        console.log("A consulta retornou o seguinte erro: " + error.message)
        throw error; // Lança o erro para ser tratado no endpoint
    }
}
app.get("/api/musicas", async (req, res) => {
    try {
        const responseDB = await dbSelectMusicas()
        res.json(responseDB)
    } catch (error) {
        res.status(500).send("Erro ao buscar músicas: " + error.message)
    }
});


// Endpoints para o administrador adicionar(post), editar(put) e deletar(delete) a lista de músicas global
async function dbModeradorAdicionarMusica(titulo, artista, album, duracao, musica_url) {
    try {
        const respondeDB = await pool.query("INSERT INTO musicas (titulo, artista, album, duracao, musica_url) VALUES ($1,$2,$3,$4,$5)",[titulo, artista, album, duracao, musica_url])
    } catch (error) {
        console.log("A consulta retornou o seguinte erro: " + error.message)
        throw error; // Lança o erro para ser tratado no endpoint
    }
}
app.post("/api/musicas", async (req, res) => {
    try {
        // Não há nenhuma verificação de como vem o json do usuário, é interessante ter
        await dbModeradorAdicionarMusica(
            req.body.titulo,
            req.body.artista,
            req.body.album,
            req.body.duracao,
            req.body.musica_url
        );
        res.status(201).send("Música adicionada com sucesso");
    } catch (error) {
        res.status(500).send("Erro ao adicionar música: " + error.message);
    }
});


async function dbModeradorEditarMusica(id, titulo, artista, album, duracao, musica_url) {
    try {
        const responseDB = await pool.query(`UPDATE musicas SET titulo=$2, artista=$3, album=$4, duracao=$5, musica_url=$6 WHERE id = $1;`,[id, titulo, artista, album, duracao, musica_url])
    } catch (error) {
        console.log("A consulta retornou o seguinte erro: " + error.message)
        throw error; // Lança o erro para ser tratado no endpoint
    }
}
app.put("/api/musicas", async (req,res)=>{
    try {
        await dbModeradorEditarMusica(
            req.body.id,
            req.body.titulo,
            req.body.artista,
            req.body.album,
            req.body.duracao,
            req.body.musica_url
        );
        res.status(201).send("Musica editada com sucesso")
    } catch (error) {
        res.status(500).json({ error: "Erro moderador ao editar música: " + error.message })
    }
})

async function dbModeradorExcluirMusica(id) {
    try {
        const responseDB = await pool.query(`DELETE FROM musicas WHERE id=$1`,[id])
    } catch (error) {
        console.log("A consulta retornou o seguinte erro: " + error.message)
        throw error; // Lança o erro para ser tratado no endpoint
    }
}
app.delete("/api/musicas", async(req,res)=>{
    try {
        await dbModeradorExcluirMusica(req.body.id)
        res.status(201).send("Musica excluida com sucesso")
    } catch (error) {
        res.status(500).json({ error: "Erro moderador ao deletar música: " + error.message })
    }
})

// Endpoints para o usuário ver a lista de musicas pessoal(get),postar uma nova música(post) e deletar uma musica(delete)
async function dbSelectListaUsuario() {
    try {
        const responseDB = await pool.query("SELECT * FROM lista_musicas")
        return responseDB.rows
    } catch (error) {
        console.log("A consulta retornou o seguinte erro: " + error.message)
        throw error; // Lança o erro para ser tratado no endpoint
    }
}
app.get("/api/lista/user", async (req,res)=>{
    try {
        const responseDB = await dbSelectListaUsuario()
        res.json(responseDB)
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar músicas: " + error.message })
    }
})

async function dbAdicionarMusicaLista(usuario_id, musica_id) {
    try {
        const respondeDB = await pool.query("INSERT INTO lista_musicas (usuario_id, musica_id) VALUES ($1,$2)",[usuario_id, musica_id])
    } catch (error) {
        console.log("A consulta retornou o seguinte erro: " + error.message)
        throw error; // Lança o erro para ser tratado no endpoint
    }
}
app.post("/api/lista/user", async (req, res) => {
    try {
        // Não há nenhuma verificação de como vem o json do usuário, é interessante ter
        await dbAdicionarMusicaLista(
            req.body.usuario_id,
            req.body.musica_id
        );
        res.status(201).send("Música adicionada a lista com sucesso");
    } catch (error) {
        res.status(500).send("Erro ao adicionar música: " + error.message);
    }
});


async function dbExcluirMusicaLista(id) {
    try {
        const responseDB = await pool.query(`DELETE FROM lista_musicas WHERE id=$1`,[id])
    } catch (error) {
        console.log("A consulta retornou o seguinte erro: " + error.message)
        throw error; // Lança o erro para ser tratado no endpoint
    }
}
app.delete("/api/lista/user", async(req,res)=>{
    try {
        await dbExcluirMusicaLista(req.body.id)
        res.status(201).send("Musica excluida com sucesso")
    } catch (error) {
        res.status(500).send("Erro moderador ao deletar música: " + error.message )
    }
})


// Endpoints para cadastrar usuário, fazer login e excluir usuário
app.post("/api/registrar", async (req, res) => {
    try {
      const { nome, senha, email } = req.body;
      if (!nome || !senha || !email) {
        return res.status(400).send("Nome de usuário e senha são obrigatórios: " + error.message);
      }
      const hash = await bcrypt.hash(senha, 10);
      await pool.query(
        "INSERT INTO usuarios (nome, senha, email) VALUES ($1, $2, $3)",
        [nome, hash, email]
      );
      res.status(201).send("Usuário registrado com sucesso");
    } catch (error) {
      console.error("Erro ao registrar usuário: ", error.message);
      res.status(500).send("Erro ao registrar usuário: " + error.message );
    }
  });
  
  app.post("/api/login", async (req, res) => {
    try {
      const { email, senha } = req.body;
      const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
      if (result.rows.length === 0) {
        return res.status(404).send("Usuário não encontrado: " + error.message);
      }
      const user = result.rows[0];
      const validPassword = await bcrypt.compare(senha, user.senha);
      if (!validPassword) {
        return res.status(401).send("Senha incorreta: "+error.message);
      }
      res.status(200).send("Login bem-sucedido");
    } catch (error) {
      console.error("Erro ao fazer login: ", error.message);
      res.status(500).send("Erro ao fazer login: " + error.message);
    }
  });
  
  app.delete("/api/deletaruser", async (req, res) => {
    try {
      const { id } = req.body;
      const result = await pool.query("DELETE FROM usuarios WHERE id = $1 RETURNING *", [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      res.status(200).send("Usuário excluído com sucesso");
    } catch (error) {
      console.error("Erro ao excluir usuário: ", error.message);
      res.status(500).send("Erro ao excluir usuário"+error.message);
    }
  });
  

app.listen(PORT,()=>{
    console.log(`Servidor rodando na porta localhost:${PORT}`)
})