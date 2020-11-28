function createEmptyPlaylist(){
    return {
        name: "NewPlaylist",
        elements: [],
        id: 0
    }
}

const getRefreshPlaylists = state => {
    return state.playlists.must_refresh;
}

const getSinglePlaylist = state => {
    if (state.tabs.playlist_code === 0 || state.tabs.playlist_code === undefined){
        return createEmptyPlaylist();
    }
    let ret = {}
    const pl = state.playlists.playlists;
    for (let el in pl){
        if (pl[el] !== undefined && pl[el] !== null) 
            if (pl[el].id === state.tabs.playlist_code)
                ret = pl[el];
    }
    return ret;
}


const getPlaylistsLimited = state => { 
    if (Array.isArray(state.playlists.playlists))
        return state.playlists.playlists.slice(0,10);
    else return [];
};

const getPlaylists = state => { 
    if (Array.isArray(state.playlists.playlists))
        return state.playlists.playlists;
    else return [];
};


export { getRefreshPlaylists, getSinglePlaylist, getPlaylists, getPlaylistsLimited };