from shapely.geometry import Point, LineString


class BorderLimiter:
    def __init__(self, dims):
        # device dimensions
        self.w = dims.max_width
        self.h = dims.max_height

        # previous commanded point
        self.pp = Point(0,0)

        # previous limited point
        self.lpp = Point(0,0)

    # will limit the new value for the point 
    def limit_value(self, p):
        pass
