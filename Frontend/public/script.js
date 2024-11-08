
document.addEventListener("DOMContentLoaded", async () => {
    renderMusicas()
});

async function renderMusicas() {
    const musicList = document.getElementById("music-list");

    try {
        const response = await fetch("/api/musicas");
        if (!response.ok) {
            throw new Error("Erro ao carregar músicas");
        }

        const musicas = await response.json(); // Busca as músicas do backend

        musicList.innerHTML = ""; // Limpa o conteúdo existente

        musicas.forEach(musica => {
            const musicItem = document.createElement("div");
            musicItem.className = "music-item";
        
            const title = document.createElement("h3");
            title.innerText = `${musica.titulo} - ${musica.artista}`;
        
            const album = document.createElement("p");
            album.innerText = `Álbum: ${musica.album}`;
        
            const buttonEdit = document.createElement("button");
            buttonEdit.innerText = "Editar";
            
            // Adiciona um event listener para abrir a função de edição ao clicar
            buttonEdit.addEventListener("click", () => {
                // Solicita os novos valores usando prompt (ou use um modal para uma interface melhor)
                const titulo = prompt("Novo título da música:", musica.titulo);
                const artista = prompt("Novo artista:", musica.artista);
                const album = prompt("Novo álbum:", musica.album);
                const duracao = prompt("Nova duração:", musica.duracao);
                const musica_url = prompt("Nova URL da música:", musica.musica_url);
        
                if (titulo && artista && album && duracao && musica_url) {
                    // Chama a função editMusica com os novos valores e o ID da música
                    editMusica(musica.id, titulo, artista, album, duracao, musica_url);
                } else {
                    alert("Por favor, preencha todos os campos.");
                }
            });
        
            const buttonDelete = document.createElement("button");
            buttonDelete.innerText = "Deletar";
            buttonDelete.addEventListener("click", async () => {
                await deleteMusica(musica.id);
            });
        
            // Cria o iframe e ajusta o URL caso seja um link do YouTube
            const player = document.createElement("iframe");
            let embedUrl = musica.musica_url;
            if (embedUrl.includes("youtube.com/watch?v=")) {
                const videoId = embedUrl.split("v=")[1];
                embedUrl = `https://www.youtube.com/embed/${videoId}`;
            }
            player.src = embedUrl;
        
            // Adiciona elementos ao musicItem
            musicItem.appendChild(title);
            musicItem.appendChild(album);
            musicItem.appendChild(buttonEdit);
            musicItem.appendChild(buttonDelete);
            musicItem.appendChild(player);
        
            // Adiciona musicItem ao musicList
            musicList.appendChild(musicItem);
        });
        
    } catch (error) {
        console.error(error.message);
        musicList.innerHTML = "<p>Erro ao carregar a lista de músicas.</p>";
    }
}


buttonAppend = document.getElementById("append-music");
buttonAppend.addEventListener("click", async () => {
    const inputs = document.querySelectorAll('#insert-music input');
    const data = {
        titulo: inputs[0].value,
        artista: inputs[1].value,
        album: inputs[2].value,
        duracao: inputs[3].value,
        musica_url: inputs[4].value
    };
    try {
        // Envia os dados para o backend com fetch
        const response = await fetch("/api/musicas", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        // Trata a resposta do backend
        if (response.ok) {
            alert("Música adicionada com sucesso");
        } else {
            const errorMessage = await response.text();
            alert("Erro ao adicionar música: " + errorMessage);
        }
    } catch (error) {
        console.error("Erro na requisição: ", error);
        alert("Erro na requisição: " + error.message);
    }

    inputs.forEach((item)=>{item.value=""})

    renderMusicas()
});


async function deleteMusica(id) {
    try {
        const response = await fetch("/api/musicas", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: id })
        });

        if (response.ok) {
            alert("Música excluída com sucesso!");
            renderMusicas();
        } else {
            throw new Error("Erro ao excluir a música.");
        }
    } catch (error) {
        console.error("Erro ao excluir a música:", error.message);
        alert("Erro ao excluir a música: " + error.message);
    }
}

async function editMusica(id, titulo, artista, album, duracao, musica_url) {
    const data = {
        id: id,
        titulo: titulo,
        artista: artista,
        album: album,
        duracao: duracao,
        musica_url: musica_url
    };
    
    try {
        const response = await fetch("/api/musicas", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert("Música editada com sucesso");
            renderMusicas(); // Atualiza a lista de músicas
        } else {
            const errorMessage = await response.text();
            alert("Erro ao editar música: " + errorMessage);
        }
    } catch (error) {
        console.error("Erro na requisição: ", error);
        alert("Erro na requisição: " + error.message);
    }
}

// Exemplo de uso ao clicar no botão de edição
buttonEdit.addEventListener("click", () => {
    const titulo = prompt("Novo título da música:", musica.titulo);
    const artista = prompt("Novo artista:", musica.artista);
    const album = prompt("Novo álbum:", musica.album);
    const duracao = prompt("Nova duração:", musica.duracao);
    const musica_url = prompt("Nova URL da música:", musica.musica_url);

    if (titulo && artista && album && duracao && musica_url) {
        editMusica(musica.id, titulo, artista, album, duracao, musica_url);
    } else {
        alert("Por favor, preencha todos os campos.");
    }
});
