import json
from server.database.generic_playlist_element import GenericPlaylistElement
from server.database.playlist_elements_tables import PlaylistElements

class ElementsFactory():
    @classmethod
    def create_element_from_dict(cls, dict_val):
        if not type(dict_val) is dict:
            raise ValueError("The argument must be a dict")
        if 'element_type' in dict_val:
            el_type = dict_val.pop("element_type")                                                  # remove element type. Should be already be choosen when using the class
        else:
            raise ValueError("the dictionary must contain an 'element_type'")

        from server.database.playlist_elements import _get_elements_types                           # need to import here to avoid circular import
        for elementClass in _get_elements_types():
            if elementClass.element_type == el_type:
                return elementClass(**dict_val)
        raise ValueError("'element_type' doesn't match any known element type")

    @classmethod
    def create_element_from_json(cls, json_str):
        dict_val = json.loads(json_str)
        return cls.create_element_from_dict(dict_val)

    @classmethod
    def create_element_from_db(cls, item):
        if not isinstance(item, PlaylistElements):
            raise ValueError("Need a db item from a playlist elements table")
        
        res = GenericPlaylistElement.clean_dict(item.__dict__)
        tmp = res.pop("element_options")
        res = {**res, **json.loads(tmp)}
        return cls.create_element_from_dict(res)
    