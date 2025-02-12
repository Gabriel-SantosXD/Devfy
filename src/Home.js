import React, { useState, useEffect, useRef, useCallback } from "react";
import { API_KEY } from "./api-key.js";
import EmojiPicker from "emoji-picker-react"; // Importar o EmojiPicker

const Home = () => {
    const [search, setSearch] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const videoPlayerRef = useRef(null);
    const progressBarRef = useRef(null);
    const volumeBarRef = useRef(null);
    const [player, setPlayer] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playlists, setPlaylists] = useState(
        JSON.parse(localStorage.getItem("playlists")) || []
    );
    const [currentPlaylist, setCurrentPlaylist] = useState(null);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
    const [isAddingSongs, setIsAddingSongs] = useState(false);
    const [currentVideo, setCurrentVideo] = useState(null);
    const [showPlaylistOptions, setShowPlaylistOptions] = useState(false);
    const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
    const [error, setError] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false); // Estado para controlar a exibição do EmojiPicker
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [playlistToDelete, setPlaylistToDelete] = useState(null);
    const [playingPlaylist, setPlayingPlaylist] = useState(null); // Estado para armazenar a playlist onde o vídeo está sendo reproduzido
    const [isLooping, setIsLooping] = useState(false); // Estado para controlar o loop
    const [isShuffling, setIsShuffling] = useState(false); // Estado para controlar o modo de reprodução aleatória
    const [playedSongs, setPlayedSongs] = useState([]); // Estado para armazenar as músicas já tocadas no modo aleatório
    const [showEditModal, setShowEditModal] = useState(false);
    const [playlistToEdit, setPlaylistToEdit] = useState(null);
    const [newPlaylistNameEdit, setNewPlaylistNameEdit] = useState("");

    const handleSearchChange = (event) => setSearch(event.target.value);
    const handleFocus = () => setIsFocused(true);
    const handleBlur = (event) => {
        setTimeout(() => {
            setIsFocused(false);
        }, 200); // Pequeno delay para permitir o clique na sugestão antes de esconder
    };

    const handlePlusButtonClick = () => {
        setIsCreatingPlaylist(true);
        setIsSecondModalOpen(false); // Garante que o segundo modal esteja fechado
        setNewPlaylistName(""); // Limpa o nome da nova playlist
        setCurrentPlaylist(null); // Reseta a playlist atual
        setError(""); // Limpa o erro
    };

    const toggleDropdownMenu = () => {
        const dropdownMenu = document.querySelector(".drop-list-mb");
        if (dropdownMenu) {
            dropdownMenu.style.display =
                dropdownMenu.style.display === "none" ||
                    dropdownMenu.style.display === ""
                    ? "flex"
                    : "none";
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            const dropdownMenu = document.querySelector(".drop-list-mb");
            if (
                dropdownMenu &&
                dropdownMenu.style.display === "flex" &&
                !event.target.closest(".drop-list-mb") &&
                !event.target.closest(".drop-mb")
            ) {
                dropdownMenu.style.display = "none";
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (search.trim().length > 0) {
                try {
                    const videos = await searchYouTube(search);
                    setSuggestions(videos);
                } catch (error) {
                    console.error("Erro ao buscar vídeos:", error);
                }
            } else {
                setSuggestions([]);
            }
        };

        fetchSuggestions();
    }, [search]);

    useEffect(() => {
        if (player) {
            const interval = setInterval(() => {
                if (player && typeof player.getCurrentTime === "function") {
                    const currentTime = player.getCurrentTime();
                    const duration = player.getDuration();
                    const progress = (currentTime / duration) * 100;
                    progressBarRef.current.style.width = `${progress}%`;

                    // Atualizar os tempos currentTime e durationTime
                    document.getElementById("currentTime").textContent =
                        formatTime(currentTime);
                    document.getElementById("durationTime").textContent =
                        formatTime(duration);
                }
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [player]);

    // Carregar a API do YouTube IFrame Player
    useEffect(() => {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        window.onYouTubeIframeAPIReady = () => {
            console.log("YouTube IFrame API carregada");
        };
    }, []);

    // Função para realizar a busca no YouTube
    async function searchYouTube(query) {
        const apiKey = API_KEY; // Use a chave de API importada
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
            query
        )}&type=video&key=${apiKey}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("Erro na requisição para a API do YouTube");
            }
            const data = await response.json();
            return data.items || [];
        } catch (error) {
            console.error("Erro ao buscar dados do YouTube:", error);
            return [];
        }
    }

    // Função para exibir o vídeo selecionado
    const handleSuggestionClick = (video, playlist = null) => {
        const videoPlayer = document.getElementById("videoPlayer");
        if (videoPlayer) {
            videoPlayer.innerHTML = `
<iframe class="video-iframe" 
src="https://www.youtube.com/embed/${video.id.videoId}?enablejsapi=1&autoplay=1" 
frameborder="0" 
allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
allowfullscreen>
</iframe>`;
            const newPlayer = new window.YT.Player(
                videoPlayer.querySelector("iframe"),
                {
                    events: {
                        onReady: (event) => {
                            event.target.setPlaybackQuality("small"); // Define a qualidade do vídeo para 144p
                            event.target.playVideo(); // Garante que o vídeo comece a tocar
                            // Atualiza a barra de volume com o volume atual
                            const currentVolume = event.target.getVolume();
                            volumeBarRef.current.style.width = `${currentVolume}%`;

                            // Loop para garantir que a qualidade permaneça em 144p
                            const qualityCheckInterval = setInterval(() => {
                                if (event.target.getPlaybackQuality() !== "small") {
                                    event.target.setPlaybackQuality("small");
                                }
                            }, 1000);
                            // Limpa o intervalo quando o vídeo é interrompido
                            event.target.addEventListener("onStateChange", (stateEvent) => {
                                if (
                                    stateEvent.data === window.YT.PlayerState.ENDED ||
                                    stateEvent.data === window.YT.PlayerState.PAUSED
                                ) {
                                    clearInterval(qualityCheckInterval);
                                }
                            });
                        },
                        onStateChange: (event) => {
                            if (event.data === window.YT.PlayerState.PLAYING) {
                                setIsPlaying(true);
                            } else {
                                setIsPlaying(false);
                            }
                        },
                    },
                }
            );
            setPlayer(newPlayer);
            setCurrentVideo(video);
            setPlayingPlaylist(playlist); // Define a playlist onde o vídeo está sendo reproduzido
        }
        setSearch(""); // Limpa o campo de busca após a seleção
        setSuggestions([]); // Oculta as sugestões
    };

    // Função para alterar a posição do tempo do vídeo
    const handleProgressBarClick = (event) => {
        if (player) {
            const rect = event.target.getBoundingClientRect();
            const offsetX = event.clientX - rect.left;
            const newTime = (offsetX / rect.width) * player.getDuration();
            player.seekTo(newTime, true); // O segundo parâmetro 'true' garante que a atualização seja imediata
        }
    };

    // Função para formatar o tempo em mm:ss
    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`;
    };

    // Função para alternar entre play e pause
    const togglePlayPause = () => {
        if (player) {
            if (isPlaying) {
                player.pauseVideo();
            } else {
                player.playVideo();
            }
        }
    };

    // Função para alterar o volume
    const handleVolumeChange = (event) => {
        if (player) {
            const rect = event.target.getBoundingClientRect();
            const offsetX = event.clientX - rect.left;
            const newVolume = (offsetX / rect.width) * 100;
            player.setVolume(newVolume);
            volumeBarRef.current.style.width = `${newVolume}%`;
        }
    };

    // Função para aumentar o volume
    const increaseVolume = () => {
        if (player) {
            let currentVolume = player.getVolume();
            if (currentVolume < 100) {
                currentVolume += 10;
                player.setVolume(currentVolume);
                volumeBarRef.current.style.width = `${currentVolume}%`;
            }
        }
    };

    // Função para diminuir o volume
    const decreaseVolume = () => {
        if (player) {
            let currentVolume = player.getVolume();
            if (currentVolume > 0) {
                currentVolume -= 10;
                player.setVolume(currentVolume);
                volumeBarRef.current.style.width = `${currentVolume}%`;
            }
        }
    };

    // Função para criar uma nova playlist
    const handleCreatePlaylist = () => {
        setIsCreatingPlaylist(true);
    };

    // Função para salvar a nova playlist
    const handleSavePlaylist = () => {
        if (newPlaylistName.trim() === "") return; // Verifica se o nome da playlist está vazio
        setIsCreatingPlaylist(false);
        setIsSecondModalOpen(true); // Abre o segundo modal
    };

    const handleConcludePlaylist = () => {
        const newPlaylist = {
            name: newPlaylistName,
            songs: [],
        };
        const updatedPlaylists = [...playlists, newPlaylist];
        setPlaylists(updatedPlaylists);
        localStorage.setItem("playlists", JSON.stringify(updatedPlaylists));
        setIsSecondModalOpen(false);
        setIsAddingSongs(true);
        setCurrentPlaylist(newPlaylist);
    };

    // Função para exibir as músicas da playlist
    const handleShowPlaylistSongs = (playlist) => {
        setCurrentPlaylist(playlist);
        setIsAddingSongs(false);
    };

    // Função para excluir uma playlist
    const handleDeletePlaylist = (playlistName) => {
        const updatedPlaylists = playlists.filter(
            (playlist) => playlist.name !== playlistName
        );
        setPlaylists(updatedPlaylists);
        localStorage.setItem("playlists", JSON.stringify(updatedPlaylists));
        setIsCreatingPlaylist(false);
        setIsAddingSongs(false);
    };

    const handleDeletePlaylistClick = (playlistName) => {
        setPlaylistToDelete(playlistName);
        setShowDeleteModal(true);
    };

    const confirmDeletePlaylist = () => {
        handleDeletePlaylist(playlistToDelete);
        setShowDeleteModal(false);
        setPlaylistToDelete(null);
    };

    const cancelDeletePlaylist = () => {
        setShowDeleteModal(false);
        setPlaylistToDelete(null);
    };

    const handleEditPlaylistClick = (playlist) => {
        setPlaylistToEdit(playlist);
        setNewPlaylistNameEdit(playlist.name);
        setShowEditModal(true);
    };

    const handleEditPlaylistNameChange = (e) => {
        setNewPlaylistNameEdit(e.target.value);
    };

    const confirmEditPlaylistName = () => {
        handleEditPlaylistName(playlistToEdit.name, newPlaylistNameEdit);
        setShowEditModal(false);
        setPlaylistToEdit(null);
    };

    const cancelEditPlaylistName = () => {
        setShowEditModal(false);
        setPlaylistToEdit(null);
    };

    // Função para editar o nome da playlist
    const handleEditPlaylistName = (playlistName, newName) => {
        const updatedPlaylists = playlists.map((playlist) =>
            playlist.name === playlistName ? { ...playlist, name: newName } : playlist
        );
        setPlaylists(updatedPlaylists);
        localStorage.setItem("playlists", JSON.stringify(updatedPlaylists));
    };

    // Função para adicionar o vídeo atual à playlist selecionada
    const handleAddToPlaylist = (playlistName) => {
        const updatedPlaylists = playlists.map((playlist) => {
            if (playlist.name === playlistName) {
                // Verifica se a música já está na playlist
                if (
                    !playlist.songs.some(
                        (song) => song.id.videoId === currentVideo.id.videoId
                    )
                ) {
                    return {
                        ...playlist,
                        songs: [...playlist.songs, currentVideo],
                    };
                }
            }
            return playlist;
        });
        setPlaylists(updatedPlaylists);
        localStorage.setItem("playlists", JSON.stringify(updatedPlaylists));
        setShowPlaylistOptions(false);
    };

    // Função para excluir um vídeo da playlist
    const handleDeleteSongFromPlaylist = (videoId) => {
        const updatedPlaylist = {
            ...currentPlaylist,
            songs: currentPlaylist.songs.filter(
                (song) => song.id.videoId !== videoId
            ),
        };
        const updatedPlaylists = playlists.map((playlist) =>
            playlist.name === currentPlaylist.name ? updatedPlaylist : playlist
        );
        setPlaylists(updatedPlaylists);
        localStorage.setItem("playlists", JSON.stringify(updatedPlaylists));
        setCurrentPlaylist(updatedPlaylist);
    };

    const closeModal = () => {
        setIsCreatingPlaylist(false);
        setIsAddingSongs(false);
        setNewPlaylistName("");
        setCurrentPlaylist(null);
        setIsSecondModalOpen(false);
        setError(""); // Limpa o erro
    };

    const closeSecondModal = () => {
        setIsSecondModalOpen(false);
    };

    const handlePlaylistNameChange = (e) => {
        const value = e.target.value;
        if (value.length > 20) {
            setError("O nome da playlist não pode exceder 20 caracteres.");
        } else {
            setError("");
            setNewPlaylistName(value);
        }
    };

    const handleEmojiClick = (emojiObject) => {
        setNewPlaylistName((prevName) => prevName + emojiObject.emoji); // Adicionar o emoji ao nome da playlist
        setShowEmojiPicker(false); // Fechar o EmojiPicker após a seleção
    };

    const togglePlaylistOptions = () => {
        setShowPlaylistOptions(!showPlaylistOptions);
    };

    const isSongInPlaylist = (playlist, song) => {
        return playlist.songs.some((s) => s.id.videoId === song.id.videoId);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                showPlaylistOptions &&
                !event.target.closest(".playlist-options") &&
                !event.target.closest(".heart-button-preview")
            ) {
                setShowPlaylistOptions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showPlaylistOptions]);

    const getNextRandomSong = useCallback(() => {
        if (currentPlaylist) {
            const remainingSongs = currentPlaylist.songs.filter(
                (song) => !playedSongs.includes(song.id.videoId)
            );
            if (remainingSongs.length === 0) {
                setPlayedSongs([]); // Reinicia a lista de músicas tocadas
                return getNextRandomSong(); // Chama recursivamente para obter uma nova música
            }
            const randomIndex = Math.floor(Math.random() * remainingSongs.length);
            return remainingSongs[randomIndex];
        }
        return null;
    }, [currentPlaylist, playedSongs]);

    const playNextSong = useCallback(() => {
        if (currentPlaylist && currentVideo) {
            let nextSong;
            if (isShuffling) {
                nextSong = getNextRandomSong();
            } else {
                const currentIndex = currentPlaylist.songs.findIndex(
                    (song) => song.id.videoId === currentVideo.id.videoId
                );
                const nextIndex = currentIndex + 1;
                if (nextIndex < currentPlaylist.songs.length) {
                    nextSong = currentPlaylist.songs[nextIndex];
                } else if (isLooping) {
                    nextSong = currentPlaylist.songs[0];
                }
            }
            if (nextSong) {
                setPlayedSongs((prev) => [...prev, nextSong.id.videoId]);
                handleSuggestionClick(nextSong, currentPlaylist);
            }
        }
    }, [
        currentPlaylist,
        currentVideo,
        isLooping,
        isShuffling,
        getNextRandomSong,
    ]);

    const playPreviousSong = () => {
        if (currentPlaylist && currentVideo) {
            let previousSong;
            if (isShuffling) {
                previousSong = getNextRandomSong();
            } else {
                const currentIndex = currentPlaylist.songs.findIndex(
                    (song) => song.id.videoId === currentVideo.id.videoId
                );
                const previousIndex = currentIndex - 1;
                if (previousIndex >= 0) {
                    previousSong = currentPlaylist.songs[previousIndex];
                } else if (isLooping) {
                    previousSong =
                        currentPlaylist.songs[currentPlaylist.songs.length - 1];
                } else {
                    previousSong = currentPlaylist.songs[0]; // Reinicia a primeira música
                }
            }
            if (previousSong) {
                setPlayedSongs((prev) => [...prev, previousSong.id.videoId]);
                handleSuggestionClick(previousSong, currentPlaylist);
            }
        }
    };

    useEffect(() => {
        if (player) {
            const onPlayerStateChange = (event) => {
                if (event.data === window.YT.PlayerState.ENDED) {
                    playNextSong();
                }
            };

            player.addEventListener("onStateChange", onPlayerStateChange);

            return () => {
                player.removeEventListener("onStateChange", onPlayerStateChange);
            };
        }
    }, [player, currentPlaylist, currentVideo, playNextSong]);

    const sortedPlaylists = [...playlists].sort(
        (a, b) => b.songs.length - a.songs.length
    );

    const toggleLoop = () => {
        setIsLooping(!isLooping);
    };

    const toggleShuffle = () => {
        setIsShuffling(!isShuffling);
        setPlayedSongs([]); // Reinicia a lista de músicas tocadas ao alternar o modo
    };

    useEffect(() => {
        if (currentVideo) {
            document.title = `Devfy - ${currentVideo.snippet.title}`;
        } else {
            document.title = "Devfy";
        }
    }, [currentVideo]);

    return (
        <div>
            <nav className="Menu bg-dark">
                <ul>
                    <li>
                        <div className="Logo">
                            <span className="bi bi-soundwave soundwave"></span>
                            <span>Devfy</span>
                        </div>
                    </li>

                    <div className="input-container">
                        <input
                            type="text"
                            id="search-input"
                            className="input-search"
                            placeholder="Digite o nome da música"
                            autoComplete="off"
                            value={search}
                            onChange={handleSearchChange}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                        />
                        {isFocused && (
                            <ul id="suggestions" className="sugestions-search">
                                {suggestions.map((video, index) => (
                                    <li
                                        key={video.id.videoId || index} // Adiciona uma chave única
                                        className="suggestion-item"
                                        onClick={() => handleSuggestionClick(video)}
                                    >
                                        <img
                                            src={video.snippet.thumbnails.default.url}
                                            alt={video.snippet.title}
                                            className="suggestion-thumbnail"
                                        />
                                        <span className="suggestion-title">
                                            {video.snippet.title}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <li>
                        <a
                            href="https://github.com/Gabriel-SantosXD"
                            className="Github Github-hidden"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span className="bi bi-github"> </span>
                            <span style={{ fontFamily: "GothamMedium" }}>Github</span>
                        </a>
                        <button
                            className="bi bi-list text-light drop-mb"
                            onClick={toggleDropdownMenu}
                        ></button>
                        <div className="drop-list-mb">
                            <div className="github-drop">

                                <a
                                    href="https://github.com/Gabriel-SantosXD"
                                    className="Github"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <span className="bi bi-github"> </span>
                                    <span style={{ fontFamily: "GothamMedium" }}>Github</span>
                                </a>
                            </div>
                            <div className="hr-drop"></div>
                            <h5
                                style={{ fontFamily: "GothamMedium" }}
                                className="tile-biblioteca text-light"
                            >
                                <span className="bi bi-journal-bookmark-fill"></span> Sua
                                biblioteca
                                <button
                                    onClick={() => {
                                        handlePlusButtonClick();
                                        toggleDropdownMenu(); // Fechar o dropdown ao clicar no botão plus
                                    }}
                                    title="Criar Playlist"
                                >
                                    <span className="bi bi-plus Plus-button"></span>
                                </button>
                            </h5>
                            {sortedPlaylists.map((playlist) => (
                                <div
                                    key={playlist.name}
                                    className={`playlist-item ${currentPlaylist && currentPlaylist.name === playlist.name
                                            ? "active"
                                            : ""
                                        }`}
                                    onClick={() => handleShowPlaylistSongs(playlist)}
                                >
                                    <span className="playlist-name text-light">{playlist.name}</span>
                                    <div className="playlist-buttons">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditPlaylistClick(playlist);
                                            }}
                                            title="Editar nome da Playlist"
                                        >
                                            <span
                                                className="bi bi-pencil"
                                                alt="Editar nome da Playlist"
                                            ></span>
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeletePlaylistClick(playlist.name);
                                            }}
                                            title="Apagar playlist"
                                        >
                                            <span
                                                className="bi bi-trash"
                                                alt="Apagar playlist"
                                            ></span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </li>
                </ul>
            </nav>
            <div className="content">
                <div className="containers">
                    <div className="sidebar bg-dark">
                        <h5
                            style={{ fontFamily: "GothamMedium" }}
                            className="tile-biblioteca"
                        >
                            <span className="bi bi-journal-bookmark-fill"></span> Sua
                            biblioteca
                            <button onClick={handlePlusButtonClick} title="Criar Playlist">
                                <span className="bi bi-plus Plus-button"></span>
                            </button>
                        </h5>
                        <section className="section-playlist">
                            {!isCreatingPlaylist &&
                                !isAddingSongs &&
                                playlists.length === 0 && (
                                    <div className="section-pc">
                                        <div className="section-playlist_content">
                                            <span className="text title">
                                                Crie sua primeira playlist
                                            </span>
                                            <span className="text subtitle">
                                                É fácil, vamos te ajudar.
                                            </span>
                                            <button
                                                className="section-playlist_button"
                                                onClick={handleCreatePlaylist}
                                            >
                                                <span>Criar Playlist</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            {isAddingSongs && (
                                <div className="section-playlist_content">
                                    {/* Removido o input "buscar música" */}
                                </div>
                            )}
                        </section>
                        <div className="playlists">
                            {sortedPlaylists.map((playlist) => (
                                <div
                                    key={playlist.name}
                                    className={`playlist-item ${currentPlaylist && currentPlaylist.name === playlist.name
                                            ? "active"
                                            : ""
                                        }`}
                                    onClick={() => handleShowPlaylistSongs(playlist)}
                                >
                                    <span className="playlist-name">{playlist.name}</span>
                                    <div className="playlist-buttons">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditPlaylistClick(playlist);
                                            }}
                                            title="Editar nome da Playlist"
                                        >
                                            <span
                                                className="bi bi-pencil"
                                                alt="Editar nome da Playlist"
                                            ></span>
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeletePlaylistClick(playlist.name);
                                            }}
                                            title="Apagar playlist"
                                        >
                                            <span
                                                className="bi bi-trash"
                                                alt="Apagar playlist"
                                            ></span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="content-preview">
                        {currentVideo && (
                            <div className="preview-content">
                                <img
                                    src={currentVideo.snippet.thumbnails.high.url}
                                    alt={currentVideo.snippet.title}
                                    className="current-video-thumbnail"
                                />
                                <div className="title-preview text-light">
                                    <span data-full-title={currentVideo.snippet.title}>
                                        {currentVideo.snippet.title}
                                    </span>
                                    {playingPlaylist && (
                                        <div className="playlist-info">
                                            <span>Playlist: {playingPlaylist.name}</span>
                                        </div>
                                    )}
                                   
                                    <i
                                        className="bi bi-heart-fill heart-button-preview"
                                        onClick={togglePlaylistOptions}
                                    ></i>
                                </div>
                                {showPlaylistOptions && (
                                    <ul className="playlist-options show">
                                        {sortedPlaylists.map((playlist) => (
                                            <li
                                                key={playlist.name}
                                                onClick={() => handleAddToPlaylist(playlist.name)}
                                            >
                                                {playlist.name}
                                                {isSongInPlaylist(playlist, currentVideo) && (
                                                    <span className="bi bi-heart-fill"></span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="main bg-dark">
                        <div className="content-result">
                            {currentPlaylist &&
                                currentPlaylist.songs.map((song) => (
                                    <div
                                        key={song.id.videoId}
                                        className={`content-box ${currentVideo &&
                                                currentVideo.id.videoId === song.id.videoId &&
                                                playingPlaylist &&
                                                playingPlaylist.name === currentPlaylist.name
                                                ? "playing"
                                                : ""
                                            }`}
                                    >
                                        <img
                                            src={song.snippet.thumbnails.default.url}
                                            alt={song.snippet.title}
                                            className="song-thumbmail"
                                            onClick={() =>
                                                handleSuggestionClick(song, currentPlaylist)
                                            }
                                        />
                                        <span
                                            className="song-title"
                                            onClick={() =>
                                                handleSuggestionClick(song, currentPlaylist)
                                            }
                                            title={song.snippet.title} // Adicionar o atributo title
                                        >
                                            {song.snippet.title}
                                        </span>
                                        <i
                                            className="bi bi-trash Ttrash"
                                            onClick={() =>
                                                handleDeleteSongFromPlaylist(song.id.videoId)
                                            }
                                        ></i>
                                    </div>
                                ))}
                        </div>
                        <div className="Preview">
                            <div id="player">
                                {currentVideo && (
                                    <div className="video-info">
                                        <div className="title-preview">
                                            <span data-full-title={currentVideo.snippet.title}>
                                                {currentVideo.snippet.title}
                                            </span>
                                            <i
                                                className="bi bi-heart-fill heart-button-preview"
                                                onClick={togglePlaylistOptions}
                                            ></i>
                                        </div>
                                        
                                        <img
                                            src={currentVideo.snippet.thumbnails.high.url}
                                            alt={currentVideo.snippet.title}
                                            className="current-video-thumbnail"
                                        />

                                        {showPlaylistOptions && (
                                            <ul className="playlist-options show">
                                                {sortedPlaylists.map((playlist) => (
                                                    <li
                                                        key={playlist.name}
                                                        onClick={() => handleAddToPlaylist(playlist.name)}
                                                    >
                                                        {playlist.name}
                                                        {isSongInPlaylist(playlist, currentVideo) && (
                                                            <span className="bi bi-heart-fill"></span>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}
                                <div id="videoPlayer" ref={videoPlayerRef}></div>
                            </div>
                        </div>
                    </div>
                </div>
                {isCreatingPlaylist && (
                    <div className="section-playlist_content-modal">
                        <button className="close-modal" onClick={closeModal}>
                            &times;
                        </button>
                        <div>
                            <input
                                type="text"
                                placeholder="Nome da Playlist"
                                value={newPlaylistName}
                                onChange={handlePlaylistNameChange}
                                className="input-create-list"
                                maxLength={15} // Limita o máximo de caracteres para 20
                            />

                            {error && <p style={{ color: "red" }}>{error}</p>}
                            <button
                                className="emoji-create-list"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            >
                                <span className="bi bi-emoji-smile"></span>
                            </button>
                            {showEmojiPicker && (
                                <EmojiPicker
                                    onEmojiClick={handleEmojiClick}
                                    className="modal-emoji"
                                />
                            )}
                        </div>
                        <button
                            className="section-playlist_button"
                            onClick={handleSavePlaylist}
                            disabled={newPlaylistName.trim() === "" || error !== ""} // Desabilita o botão se o input estiver vazio ou houver erro
                        >
                            <span className="button-next-modal">Próximo</span>
                        </button>
                    </div>
                )}
                {isSecondModalOpen && (
                    <div className="section-playlist_content-modal">
                        <button className="close-modal" onClick={closeSecondModal}>
                            &times;
                        </button>
                        {/* Conteúdo do segundo modal */}
                        <div className="text-light">
                            <h2>Adicionar Músicas</h2>
                            <p>Você pode adicionar músicas à sua playlist.</p>
                            <button
                                className="section-playlist_button"
                                onClick={handleConcludePlaylist}
                            >
                                <span className="button-next-modal">Concluir</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <footer className="MediaControl bg-black">
                <div>
                    <button
                        id="shuffleButton"
                        onClick={toggleShuffle}
                        alt="Alternar Aleatório"
                        title={
                            isShuffling
                                ? "Reprodução aleatória das músicas da playlist"
                                : "Reprodução sequencial das músicas da playlist"
                        }
                    >
                        <span
                            className={`bi ${isShuffling ? "bi-shuffle" : "bi-list-ul"
                                } btn-media`}
                        ></span>
                    </button>
                    <button
                        id="skipButton"
                        onClick={playPreviousSong}
                        alt="pular para trás"
                    >
                        <span className="bi bi-skip-start-circle-fill btn-media"></span>
                    </button>
                    <button
                        id="playPauseButton"
                        onClick={togglePlayPause}
                        alt="Reproduzir/Pausar"
                    >
                        <span
                            className={`bi ${isPlaying ? "bi-pause-circle-fill" : "bi-play-circle-fill"
                                } btn-media`}
                        ></span>
                    </button>
                    <button
                        id="skipButton"
                        onClick={playNextSong}
                        alt="pular para frente"
                    >
                        <span className="bi bi-skip-end-circle-fill btn-media"></span>
                    </button>
                    <button
                        id="loopButton"
                        onClick={toggleLoop}
                        alt="Alternar Loop"
                        title={
                            isLooping
                                ? "Reprodução em loop da playlist"
                                : "Repetir a playlist"
                        }
                    >
                        <span
                            className={`btn-media bi ${isLooping ? "bi-arrow-repeat" : "bi-arrow-repeat"
                                }`}
                            style={{ color: isLooping ? "var(--color-green)" : "white" }}
                        ></span>
                    </button>
                </div>
                <div className="container-volume">
                    <button alt="Diminuir volume" onClick={decreaseVolume}>
                        <span className="bi bi-volume-down-fill bt-volume"></span>
                    </button>
                    <div className="progress-volume" onClick={handleVolumeChange}>
                        <div ref={volumeBarRef} alt="Progressbar"></div>
                    </div>
                    <button alt="Aumentar volume" onClick={increaseVolume}>
                        <span className="bi bi-volume-up-fill"></span>
                    </button>
                </div>
                <div className="progress-container" onClick={handleProgressBarClick}>
                    <div className="time" id="currentTime">
                        00:00
                    </div>
                    <div className="progress-bar">
                        <div ref={progressBarRef}></div>
                    </div>
                    <div className="time" id="durationTime">
                        00:00
                    </div>
                </div>
            </footer>
            {showDeleteModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Confirmar Exclusão</h2>
                        <p>Tem certeza que deseja apagar a playlist?</p>
                        <div className="modal-buttons">
                            <button onClick={confirmDeletePlaylist}>Sim</button>
                            <button onClick={cancelDeletePlaylist}>Não</button>
                        </div>
                    </div>
                </div>
            )}
            {showEditModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Editar Nome da Playlist</h2>
                        <input
                            type="text"
                            value={newPlaylistNameEdit}
                            onChange={handleEditPlaylistNameChange}
                            className="input-create-list"
                        />
                        <div className="modal-buttons">
                            <button onClick={confirmEditPlaylistName}>Alterar</button>
                            <button onClick={cancelEditPlaylistName}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;

