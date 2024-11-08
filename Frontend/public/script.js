
document.addEventListener("DOMContentLoaded", async () => {
    const musicList = document.getElementById("music-list");

    try {
        const response = await fetch("/api/musicas");
        if (!response.ok) {
            throw new Error("Erro ao carregar músicas");
        }
        
        const musicas = await response.json();
        renderMusicas(musicas);
    } catch (error) {
        console.error(error.message);
        musicList.innerHTML = "<p>Erro ao carregar a lista de músicas.</p>";
    }
});

function renderMusicas(musicas) {
    const musicList = document.getElementById("music-list");
    musicList.innerHTML = ""; // Limpa o conteúdo existente

    musicas.forEach(musica => {
        const musicItem = document.createElement("div");
        musicItem.className = "music-item";

        const title = document.createElement("h2");
        title.innerText = `${musica.titulo} - ${musica.artista}`;

        const album = document.createElement("p");
        album.innerText = `Álbum: ${musica.album}`;

        // Cria o iframe e verifica se o link do video contem a parte indesejada, se tiver remove
        const player = document.createElement("iframe");
        let embedUrl = musica.musica_url;
        if (embedUrl.includes("youtube.com/watch?v=")) {
            const videoId = embedUrl.split("v=")[1];
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }
        player.src = embedUrl;

        musicItem.appendChild(title);
        musicItem.appendChild(album);
        musicItem.appendChild(player);
        musicList.appendChild(musicItem);
    });
}
