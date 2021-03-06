import { slick } from "./slick";
import musicPlayer from "./music-player";
import axios from "../admin/axios";
import trans from "../trans";

const _$ = document.querySelector.bind(document);
const _$$ = document.querySelectorAll.bind(document);

const main = {
    el: _$("#main"),
    render: function (html) {
        let r = `<div class="main-content">${html}</div>`;
        this.el.innerHTML = r;
    },
    homepage: async function (isGoBack = false) {
        let resp = await axios.get("/homepage");
        if (resp && resp.status === 200) {
            sidebar.unactiveMenuItems();
            $("#homepage-button").addClass("c-active");
            uri.updateQueryStringParameter({ key: "", value: "homepage" });
            main.render(resp.data);
            back.setStorage(window.location.search, isGoBack);
            musicPlayer.handleEvents();
            slick();
        }
    },
    searchpage: async function (isGoBack = false) {
        let resp = await axios.get("/search");
        sidebar.unactiveMenuItems();
        $("#search-button").addClass("c-active");
        uri.updateQueryStringParameter({ key: "", value: "search" });
        main.render(resp.data);
        back.setStorage(window.location.search, isGoBack);
        musicPlayer.handleEvents();
    },
    categorypage: async function (id, isGoBack = false) {
        let resp = await axios.get("/category?id=" + id);
        uri.updateQueryStringParameter(
            { key: "", value: "category" },
            { param: "id", val: id }
        );
        main.render(resp.data);
        sidebar.unactiveMenuItems();
        musicPlayer.handleEvents();
        back.setStorage(window.location.search, isGoBack);
    },
    albumpage: async function (id, isGoBack = false) {
        let resp = await axios.get("/album?id=" + id);
        uri.updateQueryStringParameter(
            { key: "", value: "album" },
            { param: "id", val: id }
        );
        main.render(resp.data);
        sidebar.unactiveMenuItems();
        musicPlayer.handleEvents();
        back.setStorage(window.location.search, isGoBack);
        slick();
    },
    authorpage: async function (id, isGoBack = false) {
        let resp = await axios.get("/author?id=" + id);
        uri.updateQueryStringParameter(
            { key: "", value: "author" },
            { param: "id", val: id }
        );
        main.render(resp.data);
        sidebar.unactiveMenuItems();
        musicPlayer.handleEvents();
        back.setStorage(window.location.search, isGoBack);
    },
    playlistPage: async function (id, isGoBack = false) {
        let resp = await axios.get("/playlist/" + id);
        if (resp && resp.status === 200) {
            main.render(resp.data);
            sidebar.unactiveMenuItems();
            $(`.menu-item[data-id="${id}"]`).addClass("c-active");
            uri.updateQueryStringParameter(
                { key: "", value: "playlist" },
                { param: "id", val: id }
            );
            musicPlayer.handleEvents();
            back.setStorage(window.location.search, isGoBack);
        }
        if (resp && resp.response && resp.response.status == 401) {
            toastr.error(trans.__('auth.must_login'));
        }
    },
    songPage: async function (id, isGoBack = false) {
        let resp = await axios.get("/song?id=" + id);
        uri.updateQueryStringParameter(
            { key: "", value: "song" },
            { param: "id", val: id }
        );
        main.render(resp.data);
        musicPlayer.handleEvents();
        back.setStorage(window.location.search, isGoBack);
    },
    getUrlParam: async function (url = null, isGoBack = false) {
        const params = new URLSearchParams(url || window.location.search);
        let _url = params.get("");
        switch (_url) {
            case "homepage":
                await main.homepage(isGoBack);
                break;
            case "search":
                await main.searchpage(isGoBack);
                break;
            case "category":
                await main.categorypage(params.get("id"), isGoBack);
                break;
            case "album":
                await main.albumpage(params.get("id"), isGoBack);
                break;
            case "author":
                await main.authorpage(params.get("id"), isGoBack);
                break;
            case "playlist":
                await main.playlistPage(params.get("id"), isGoBack);
                break;
            case "song":
                await main.songPage(params.get("id"), isGoBack);
                break;
            default:
                break;
        }
    },
};

const sidebar = {
    el: _$("#sidebar-playlist"),
    renderPlaylist: function (playlists) {
        let r = "";
        playlists.forEach((playlist) => {
            r += `<li class="menu-item menu-item-light" data-id="${playlist.id}">
                        <span class="title">${playlist.name}</span>
                    </li>`;
        });
        this.el.innerHTML = r;
    },
    unactiveMenuItems: function () {
        _$$(".menu-item").forEach((e) => {
            e.classList.remove("c-active");
        });
    },
    getPlaylist: async function () {
        let resp = await axios.get("/playlist");
        if (resp && resp.status === 200) {
            sidebar.unactiveMenuItems();
            sidebar.renderPlaylist(resp.data.playlists);
            $("#homepage-button").addClass("c-active");
        }
    },
    getFavoritePlaylist: async function () {
        let resp = await axios.get("/favorite");
        if (resp && resp.status === 200) {
            _$('.favorite').setAttribute("data-id", resp.data.favorite.id);
        }
    }
};

const uri = {
    updateQueryStringParameter: function (cx, pr) {
        const { key, value } = cx;
        const url = new URL(window.location);
        url.searchParams.delete("id");
        url.searchParams.set(key, value);
        if (pr) {
            const { param, val } = pr;
            url.searchParams.set(param, val);
        }
        window.history.pushState({}, "", url);
    },
};

const playlist = {
    name: _$("#name"),
    el: _$("#sidebar-playlist"),
    select: _$("#select-playlist"),
    songId: _$("#song-id-select"),
    renderPlaylist: function (playlist) {
        let r = `<li class="menu-item menu-item-light" data-id="${playlist.id}">
                        <span class="title">${playlist.name}</span>
                </li>`;
        this.el.innerHTML = this.el.innerHTML + r;
    },
    renderPlaylistSelect: function (playlists) {
        let r = "";

        if (playlists.length == 0) {
            r = `<option value="">${trans.__('Choose')}</option>`;
        } else {
            playlists.forEach((playlist) => {
                r += `<option value="${playlist.id}">${playlist.name}</option>`;
            });
        }

        this.select.innerHTML = r;
    },
    createPlaylist: async function () {
        let resp = await axios.post("/playlist", { name: this.name.value });
        if (resp && resp.status === 200) {
            toastr.success(trans.__("create_playlist_success"));
            this.renderPlaylist(resp.data.playlist);
            _$(".close").click();
        }
        if (resp && resp.response) {
            resp.response.status == 401
                ? toastr.error(trans.__('auth.must_login'))
                : toastr.error(trans.__('create_playlist_error'));
        }
    },
    addToPlaylist: async function () {
        if (this.songId.value) {
            let resp = await axios.post("/playlist/add-song", {
                playlist_id: this.select.value,
                song_id: this.songId.value,
            });
            resp.data.song.attached.length == 0
                ? toastr.warning(trans.__("exits_song"))
                : toastr.success(trans.__("add_song_success"));
    
            _$("#add-playlist .close").click();
        } else {
            toastr.error(trans.__('choose_song_first'));
        }
    },
    addToFavorite: async function () {
        if (this.songId) {
            if (this.songId.value) {
                let favoriteId = _$('.favorite').getAttribute('data-id');
                let resp = await axios.post("/playlist/add-song", {
                    playlist_id: favoriteId,
                    song_id: this.songId.value,
                });
                if (resp && resp.status === 200) {
                    if (!resp.data.song.attached.length == 0) {
                        $('.fav-btn').addClass('liked');
                        $('.fav-btn').removeClass('unlike');
                        toastr.success(trans.__("add_song_success"));
                    }
                }
                if (resp && resp.response && resp.response.status == 401) {
                    toastr.error(trans.__('auth.must_login'));
                }
            } else {
                toastr.error(trans.__('choose_song_first'));
            }
        } else {
            toastr.error(trans.__('auth.must_login'));
        }
    },
    deletePlaylist: async function () {
        let playlistId = _$(".playlist-id").value;
        let resp = await axios.delete("/playlist/" + playlistId);
        resp.status === 200
            ? toastr.success(trans.__('delete_playlist_success'))
            : toastr.success(trans.__('delete_playlist_error'));
        $("#homepage-button").click();
        $(`#sidebar-playlist .menu-item[data-id='${playlistId}']`).remove();
    },
    getPlaylistSelect: async function () {
        let resp = await axios.get("/playlist");
        if (resp && resp.status === 200) {
            this.renderPlaylistSelect(resp.data.playlists);
        }
        if (resp && resp.response && resp.response.status == 401) {
            toastr.error(trans.__('auth.must_login'));
        }
    },
    removePlaylist: async function (songId) {
        let playlistId = _$(".playlist-id").value;
        let resp = await axios.post("/playlist/remove-song", {
            playlist_id: playlistId,
            song_id: songId,
        });
        return resp;
    },
    removeFromFavorite: async function () {
        let favoriteId = _$('.favorite').getAttribute('data-id');
        let resp = await axios.post("/playlist/remove-song", {
            playlist_id: favoriteId,
            song_id: this.songId.value,
        });
        if (resp.status == 200) {
            $('.fav-btn').addClass('unlike');
            $('.fav-btn').removeClass('liked');
            toastr.success(trans.__("delete_song_success"));
        }
    },
};

const search = {
    formEl: '#search-form',
    inputEl: '#search-form .c-form-control',
    authorsBox: '.search-container .authors-box .search-result-box',
    songsBox: '.search-container .songs-box .search-result-box',
    albumsBox: '.search-container .albums-box .search-result-box',
    search: async function () {
        let res = await axios.get('/api/search', { value: _$(this.inputEl).value });
        this.render.songs(res.data.songs);
        this.render.albums(res.data.albums);
        this.render.authors(res.data.authors);
        musicPlayer.handleEvents();
    },
    render: {
        authors: function (authors) {
            let html = '';
            if (authors.length > 0) {
                authors.forEach(author => {
                    html += `
                        <div class="search-result-item author" style="background-color: ${author.rand_color}" data-id="${author.id}">
                            <h5> ${author.name} </h5>
                            <img src="${author.thumbnail}">
                        </div>`
                });
            } else {
                html = `<p>${trans.__('no_data')}</p>`;
            }
            _$(search.authorsBox).innerHTML = html;
        },
        albums: function (albums) {
            let html = '';
            if (albums.length > 0) {
                albums.forEach(album => {
                    if (album.songs && album.songs.length > 0) {
                        html += `
                            <div class="search-result-item album" style="background-color: ${album.rand_color}" data-id="${album.id}">
                                <h5 class="mb-1"> ${album.title} </h5>
                                <small class="d-inline-block px-2"> ${album.author.name} </small>
                                <img src="${album.songs[0].thumbnail}">
                            </div>
                        `;
                    }
                });
            } else {
                html = `<p>${trans.__('no_data')}</p>`;
            }
            _$(search.albumsBox).innerHTML = html;
        },
        songs: function (songs) {
            let html = '';
            if (songs.length > 0) {
                songs.forEach((song, key) => {
                    let dataAuthor = '';
                    if (song.authors && song.authors.length > 0) {
                        dataAuthor = song.authors.map(author => {
                            return author.name;
                        }).join(', ');
                    }
                    html += `
                        <div class="search-result-item song" style="background-color: ${song.rand_color}"
                            data-song="${song.path}" data-title="${song.name}" data-thumbnail="${song.thumbnail}"
                            data-id="${key}" data-author="${dataAuthor}" song-id="${song.id}">
                            <h5 class="mb-1"> ${song.name} </h5>
                            <small class="d-inline-block px-2">${dataAuthor}</small>
                            <div class="quick-play">
                                <i class="fa-solid fa-play"></i>
                                <i class="fa-solid fa-pause d-none"></i>
                            </div>
                            <img src="${song.thumbnail}">
                        </div>
                    `;
                });
            } else {
                html = `<p>${trans.__('no_data')}</p>`;
            }
            _$(search.songsBox).innerHTML = html;
        }
    }
};

const back = {
    historyKey: 'MYMUSIC_SS_H_K',
    element: '.navigate',
    storage: function () {
        let currentStorage = window.sessionStorage.getItem(back.historyKey);
        currentStorage = currentStorage ? JSON.parse(currentStorage) : [];

        return currentStorage;
    },
    setStorage: function (location, isGoBack) {
        let currentStorage = back.storage();
        if (isGoBack == false && location != currentStorage.slice(-1)) {
            currentStorage.push(location);
            currentStorage = JSON.stringify(currentStorage);
            window.sessionStorage.setItem(back.historyKey, currentStorage);
            back.changeBackButtonStyle();
        }
    },
    goBack: function () {
        let currentStorage = back.storage();
        if (currentStorage.length > 0) {
            let param = currentStorage.pop();

            if (param) {
                if (param == window.location.search) {
                    param = currentStorage.pop();
                }

                window.history.pushState({}, '', param);
                main.getUrlParam(param, true);
            }

            if (currentStorage.length == 0) {
                currentStorage.unshift('?=homepage');
            }

            currentStorage = JSON.stringify(currentStorage);
            window.sessionStorage.setItem(back.historyKey, currentStorage);
            back.changeBackButtonStyle();
        }
    },
    changeBackButtonStyle: function () {
        let currentStorage = back.storage();
        let dom = _$(back.element);
        if (currentStorage.length == 1 && window.location.search == currentStorage.slice(-1)) {
            dom.style.cursor = 'default';
            dom.style.visibility = 'hidden';
        } else {
            dom.style.cursor = 'pointer';
            dom.style.visibility = 'visible';
        }
    }
}

export default {
    sidebar,
    main,
    uri,
    playlist,
    search,
    back,
};
