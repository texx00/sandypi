const getSettings = state => { return state.settings };

const systemIsLinux = state => { return state.settings.system.is_linux };

const shouldCheckUpdate = state => { return (state.settings.system.last_update_check_time === undefined) || (state.settings.system.last_update_check_time + 1 < new Date()/8.64e7)};    // check for an update every day once

export { getSettings, systemIsLinux, shouldCheckUpdate };