function createEmptyPlaylist(){
    return {
        name: "NewPlaylist",
        elements: [],
        id: 0
    }
}

const getMandatoryRefresh = state => {
    return state.playlists.mandatoryRefresh;
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
            if (pl[el].id === state.playlists.playlistId)
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

const getSinglePlaylistId = state => {
    return state.playlists.playlistId;
}

const getPlaylistName = (state, id) => {
    for (let p in state.playlists.playlists){
        p = state.playlists.playlists[p];
        if (p.id === id){
            return p.name;
        }
    }
}

const playlistHasBeenDeleted = state => {
    return state.playlists.playlistDeleted;
}

const singlePlaylistMustRefresh = state => {
    return state.playlists.mandatoryRefresh;
}

const isShowNewPlaylist = state => {
    return state.playlists.showNewPlaylist;
}

export { getMandatoryRefresh, getSinglePlaylist, getPlaylists, getPlaylistsLimited, getPlaylistsList, singlePlaylistMustRefresh, getPlaylistName, playlistHasBeenDeleted, isShowNewPlaylist };