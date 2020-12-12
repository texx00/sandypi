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
    let id = getSinglePlaylistId(state);
    if (id === 0 || id === undefined){
        return createEmptyPlaylist();
    }
    let ret = {}
    const pl = getPlaylists(state);
    for (let el in pl){
        if (pl[el] !== undefined && pl[el] !== null) 
            if (pl[el].id === state.playlists.playlist_id)
                ret = pl[el];
    }
    if (ret.elements === undefined)
        ret.elements = [];
    return ret;
}

const getPlaylistsLimited = state => { 
    return getPlaylists(state).slice(0,10);
};

const getPlaylists = state => { 
    try{
        if (Array.isArray(state.playlists.playlists))
        return state.playlists.playlists;
        else return [];
    }catch(error){
        console.error(error);
        return [];
    }
};

const getPlaylistsList = state => {
    return getPlaylists(state).map((el) => {
        return {name: el.name, id: el.id}
    });
}

const getPlaylistResync = state => {
    return state.playlists.playlist_resync;
}

const getSinglePlaylistId = state => {
    return state.playlists.playlist_id;
}

export { getRefreshPlaylists, getSinglePlaylist, getPlaylists, getPlaylistsLimited, getPlaylistsList, getPlaylistResync };