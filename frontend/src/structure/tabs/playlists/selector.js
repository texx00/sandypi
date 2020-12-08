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
    const pl = getPlaylists(state);
    for (let el in pl){
        if (pl[el] !== undefined && pl[el] !== null) 
            if (pl[el].id === state.tabs.playlist_code)
                ret = pl[el];
    }
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

export { getRefreshPlaylists, getSinglePlaylist, getPlaylists, getPlaylistsLimited, getPlaylistsList };