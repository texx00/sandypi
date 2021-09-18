from server.utils.settings_utils import get_only_values, match_dict


def test_settings_match_dict():
    a = {"a":0, "b":{"c":2, "d":4}, "d":5}
    b = {"a":1, "b":{"c":1, "e":5}, "c":3}
    c = match_dict(a,b)
    assert(c=={"a":0, "b":{"c":2, "d":4, "e":5}, "d":5, "c":3})

def test_get_only_values():
    d = {"a":500, "b":{"asf":3, "value":10}, "c":{"d":{"fds":29, "value":32}}}
    assert({"b": 10, "c": {"d": 32}}==get_only_values(d))