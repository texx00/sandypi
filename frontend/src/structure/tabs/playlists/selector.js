function createEmptyPlaylist(){
    return {
        name: "NewPlaylist",
        elements: [],
        id: 0
    }
}

const getMandatoryRefresh = state => {
    return state.playlists.mandatory_refresh;
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

const getRefreshPlaylists = state => {
    return state.playlists.refresh_request;
}

const getSinglePlaylistId = state => {
    return state.playlists.playlist_id;
}

const getPlaylistName = (state, id) => {
    for (let p in state.playlists.playlists){
        p = state.playlists.playlists[p];
        if (p.id === id){
            return p.name;
        }
    }
}

const isPlaylistDeleted = state => {
    return state.playlists.playlist_deleted;
}

export { getMandatoryRefresh, getSinglePlaylist, getPlaylists, getPlaylistsLimited, getPlaylistsList, getPlaylistResync, getRefreshPlaylists, getPlaylistName, isPlaylistDeleted };