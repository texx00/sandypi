
const mergeDicts = (og, so) => {
    for (let key in so) {
        if (typeof (og[key]) === 'object') {
            og[key] = mergeDicts(og[key], so[key]);
        } else {
            og[key] = so[key];
        }
    }
    return og;
}

const cloneDict = di => {
    let tmp = {};
    for (let key in di){
        if (typeof (di[key]) === 'object') {
            tmp[key] = cloneDict(di[key]);
        } else {
            tmp[key] = di[key];
        }
    }
    return tmp;
}

const setSubKey = (dict, keys, value) => {
    if (!Array.isArray(keys))
        keys = keys.split(".");
    
    if (keys.length === 1)
        dict[keys[0]] = value;
    else dict[keys[0]] = setSubKey(cloneDict(dict[keys[0]]), keys.pop(), value);
    return dict;
}

const getSubKey = (dict, keys) => {
    if (!Array.isArray(keys))
        keys = keys.split(".");
    
    if (keys.length === 1)
        return dict[keys[0]];
    else return getSubKey(cloneDict(dict[keys[0]]), keys.pop());
}

export {mergeDicts, cloneDict, setSubKey, getSubKey};