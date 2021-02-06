import _ from 'lodash';


// merges two dicts that contains child dicts
const mergeDicts = (og, so) => {
    for (let key in so) {
        if (typeof (og[key]) === 'object' && !Array.isArray(og[key])) {
            og[key] = mergeDicts(og[key], so[key]);
        } else {
            og[key] = so[key];
        }
    }
    return og;
}

// clones a dict
const cloneDict = di => {
    return _.cloneDeep(di);
    /*
    let tmp = {};
    for (let key in di){
        if ((typeof (di[key]) === 'object' || typeof (di[key]) === 'Proxy')  && !Array.isArray(di[key])) {
            tmp[key] = cloneDict(di[key]);
        } else {
            tmp[key] = di[key];
        }
    }
    return tmp;*/
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

// compares to dict lists (should work with every kind of list really)
const listsAreEqual = (dictList1, dictList2) => {
    return JSON.stringify(dictList1) === JSON.stringify(dictList2);
}

const dictsAreEqual = (dict1, dict2) => {
    return listsAreEqual(dict1, dict2);
}

export { mergeDicts, cloneDict, setSubKey, getSubKey, listsAreEqual, dictsAreEqual };