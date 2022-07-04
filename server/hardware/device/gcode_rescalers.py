import math

# This class is the base class to create different types of stretching/clipping of the drawing to fit it on the table (because the drawing may be for a different table size)
# The base class can be extended to get different results
# Can rotate the drawings (angle in degrees)
class GcodeFilter():
    def __init__(self, dimensions, angle = 0.0):
        self.table_x = dimensions["table_x"]
        self.table_y = dimensions["table_y"]
        self.drawing_max_x = dimensions["drawing_max_x"]
        self.drawing_max_y = dimensions["drawing_max_y"]
        self.drawing_min_x = dimensions["drawing_min_x"]
        self.drawing_min_y = dimensions["drawing_min_y"]
        self.angle = angle * math.pi /180.0
        self.last_x = 0
        self.last_y = 0

    def get_coords(self, line):
        l = line.split(" ")
        if "G0" in l[0] or "G1" in l[0]:
            for i in l:
                if i[0]=="x":
                    x = float(i[1:])
                elif i[0]=="y":
                    y = float(i[1:])
            if not ("x" in locals()):
                x = self.last_x
            if not ("y" in locals()):
                y = self.last_y
            self.last_x = x
            self.last_y = y
            return x, y
        return False, False

    # Method to overwrite to do the rescale/clipping or anything else
    def parse_line(self, line):
        x, y = self.get_coords(line)
        if x and y:
            x, y = self.rotate_coords(x,y, self.table_x/2, self.table_y/2)
        return line
    
    # It may be necessary to rotate a line beacuse the original drawing was with a different angle
    def rotate_coords(self, x, y, center_x, center_y):
        r_x = math.cos(self.angle) * (x-center_x) - math.sin(self.angle) * (y-center_y) + center_x
        r_y = math.sin(self.angle) * (x-center_x) + math.cos(self.angle) * (y-center_y) + center_y
        return r_x, r_y
    
    def return_line(self, x, y):
        return "G1 X{0} Y{1}".format(x,y)


class Fit(GcodeFilter):
    def __init__(self, dimensions, angle = 0):
        super().__init__(dimensions, angle)
        self.scale_x = self.table_x / (self.drawing_max_x - self.drawing_min_x)
        self.scale_y = self.table_y / (self.drawing_max_y - self.drawing_min_y)

    def parse_line(self, line):
        x, y = self.get_coords(line)
        if x and y:
            x = x * self.scale_x
            y = y * self.scale_y
            x, y = self.rotate_coords(x,y, self.table_x/2, self.table_y/2)
            return self.return_line(x,y)
        return line

class FitNoStretch(GcodeFilter):
    def __init__(self, dimensions, angle = 0):
        super().__init__(dimensions, angle)
        self.scale_x = self.table_x / (self.drawing_max_x - self.drawing_min_x)
        self.scale_y = self.table_y / (self.drawing_max_y - self.drawing_min_y)
        self.scale = max(self.scale_x, self.scale_y)

    def parse_line(self, line):
        x, y = self.get_coords(line)
        if x and y:
            x = x * self.scale
            y = y * self.scale
            x, y = self.rotate_coords(x,y, self.table_x/2, self.table_y/2)
            return self.return_line(x,y)
        return line

class Clip(GcodeFilter):

    def parse_line(self, line):
        x, y = self.get_coords(line)
        if x and y:
            x = self.clip(x, 0, self.table_x)
            y = self.clip(y, 0, self.table_y)
            x, y = self.rotate_coords(x,y, self.table_x/2, self.table_y/2)
            return self.return_line(x,y)
        return line
    
    def clip(self, n, min, max):
        return max(min(max, n), min)