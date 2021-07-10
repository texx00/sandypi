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
}

const setSubKey = (dict, keys, value) => {
    if (!Array.isArray(keys))
        keys = keys.split(".");
    
    if (keys.length === 1){
        if (Array.isArray(dict))
            dict = dict.filter(i => { return i.idx === parseInt(keys[0])});
        dict[keys[0]] = value;
    }else{
        let k = keys.shift();
        if (Array.isArray(dict)){
            let tmp = dict.filter(i => { return i.idx === parseInt(k)})[0];
            dict[k] = setSubKey(tmp, keys, value);
        }
        dict[k] = setSubKey(cloneDict(dict[k]), keys, value);
    }
    return dict;
}

const getSubKey = (dict, keys) => {
    if (!Array.isArray(keys))
        keys = keys.split(".");
    let res = "";
    
    if (keys.length === 1){
        if (Array.isArray(dict))
            res = dict.filter(i => { return i.idx === parseInt(keys[0])});

        res = dict[keys[0]];
    }else{ 
        let k = keys.shift()
        if (Array.isArray(dict)){
            let tmp = dict.filter(i => { return i.idx === parseInt(k)})[0];
            res = getSubKey(tmp, keys);
        }
        else res = getSubKey(cloneDict(dict[k]), keys);
    }
    return res;
}

const mapValueToName = (dict) =>{
    let res = cloneDict(dict);
    for (let r in res){
        res[r] = res[r].value;
    }
    return res;
}

// compares to dict lists (should work with every kind of list really)
const listsAreEqual = (dictList1, dictList2) => {
    return JSON.stringify(dictList1) === JSON.stringify(dictList2);
}

const dictsAreEqual = (dict1, dict2) => {
    return listsAreEqual(dict1, dict2);
}

export { mergeDicts, cloneDict, setSubKey, getSubKey, mapValueToName, listsAreEqual, dictsAreEqual };