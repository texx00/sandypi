const getSettings = state => {return state.settings};

const systemIsLinux = state => {return state.settings.system.is_linux};

export { getSettings, systemIsLinux };