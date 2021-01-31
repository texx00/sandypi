


from server.utils.settings_utils import match_dict


def test_settings_match_dict():
    a = {"a":0, "b":{"c":2, "d":4}, "d":5}
    b = {"a":1, "b":{"c":1, "e":5}, "c":3}
    c = match_dict(a,b)
    assert(c=={"a":0, "b":{"c":2, "d":4, "e":5}, "d":5, "c":3})