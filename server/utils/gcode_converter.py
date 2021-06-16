from PIL import Image, ImageDraw
from math import cos, sin, pi, sqrt
from dotmap import DotMap

class ImageFactory:
    # straight lines gcode commands
    straight_lines = ["G01", "G1", "G0", "G00"]

    # Args:
    #  - device: dict with the following values
    #     * type: device type (values: "Cartesian", "Polar", "Scara")
    #     * radius: for polar and scara needs the maximum radius of the device
    #     * offset_angle_1: for polar and scara needs an offset angle to rotate the view of the drawing (homing position angle) in motor units
    #     * offset_angle_2: for scara only: homing angle of the second part of the arm with respect to the first arm (alpha offset) in motor units
    #     * angle_conversion_factor (scara and polar): conversion value between motor units and radians (default for polar is pi, for scara is 6)
    #  - final_width (default: 800): final image width in px
    #  - final_height (default: 800): final image height in px
    #  - bg_color (default: (0,0,0)): tuple of the rgb color for the background
    #  - final_border_px (default: 20): the border to leave around the picture in px
    #  - line_width (default: 5): line thickness (px)
    #  - verbose (boolean) (default: False): if True prints the coordinates and other stuff in the command line
    def __init__(self, device, final_width=800, final_height=800, bg_color=(0,0,0), line_color=(255,255,255), final_border_px=20, line_width=1, verbose=False):
        self.final_width = final_width
        self.final_height = final_height
        self.bg_color = bg_color if len(bg_color) == 4 else (*bg_color, 0)  # color argument requires also alpha value
        self.line_color = line_color
        self.final_border_px = final_border_px
        self.line_width = line_width
        self.verbose = verbose
        self.update_device(device)

    def update_device(self, device):
        device["type"] = device["type"].upper()
        self.device = device
        if self.is_scara():
            # scara robot conversion factor
            # should be 2*pi/6 *1/2 (conversion between radians and motor units * 1/2 coming out of the theta alpha semplification)
            self.pi_conversion = pi/float(device["angle_conversion_factor"])    # for scara robots follow https://forum.v1engineering.com/t/sandtrails-a-polar-sand-table/16844/61
            self.device_radius = float(device["radius"])
            self.offset_1 = float(device["offset_angle_1"]) * 2                   # *2 for the conversion factor (will spare one operation in the loop)
            self.offset_2 = float(device["offset_angle_2"]) * 2                 # *2 for the conversion factor (will spare one operation in the loop)
        elif self.is_polar():
            self.pi_conversion = 2.0*pi/float(device["angle_conversion_factor"])
            self.device_radius = float(device["radius"])
            self.offset_1 = float(device["offset_angle_1"])

    def is_cartesian(self):
        return self.device["type"] == "CARTESIAN"

    def is_polar(self):
        return self.device["type"] == "POLAR"
    
    def is_scara(self):
        return self.device["type"] == "SCARA"

    # converts a gcode file to an image
    # requires: gcode file (not filepath)
    # return the image file
    def gcode_to_coords(self, file):
        total_lenght = 0
        coords = []
        xmin =  100000
        xmax = -100000
        ymin =  100000
        ymax = -100000
        old_X = 0
        old_Y = 0
        for line in file:
            # skipping comments
            if line.startswith(";"):  
                continue
            
            # remove inline comments
            if ";" in line:
                line = line.split(";")[0]

            if len(line) <3:
                continue

            # parsing line
            params = line.split(" ")
            if not (params[0] in self.straight_lines):       # TODO include also G2 and other curves command?
                if(self.verbose):
                    print("Skipping line: "+line)
                continue

            com_X = old_X               # command X value
            com_Y = old_Y               # command Y value
            # selecting values
            for p in params:
                if p[0]=="X":
                    com_X = float(p[1:])
                if p[0]=="Y":
                    com_Y = float(p[1:])
            
            # calculates incremental lenght
            total_lenght += sqrt(com_X**2 + com_Y**2)
            
            # converting command X and Y to x, y coordinates (default conversion is cartesian)
            x = com_X
            y = com_Y
            if self.is_scara():
                # m1 = thehta+alpha
                # m2 = theta-alpha 
                # -> 
                # theta = (m1 + m2)/2
                # alpha = (m1-m2)/2   
                # (moving /2 into the pi_conversion to reduce the number of multiplications)
                theta = (com_X + com_Y + self.offset_1) * self.pi_conversion
                rho = cos((com_X - com_Y + self.offset_2) * self.pi_conversion) * self.device_radius 
                # calculate cartesian coords
                x = cos(theta) * rho
                y = -sin(theta) * rho   # uses - to remove preview mirroring
            elif self.is_polar():
                x = cos((com_X + self.offset_1)*self.pi_conversion) * com_Y * self.device_radius
                y = sin((com_X + self.offset_1)*self.pi_conversion) * com_Y * self.device_radius


            if x<xmin:
                xmin = x
            if x>xmax:
                xmax = x
            if y<ymin:
                ymin = y
            if y>ymax:
                ymax = y
            c = (x,y)
            coords.append(c)
            old_X = com_X
            old_Y = com_Y
        if self.verbose:
            print("Coordinates:")
            print(coords)
            print("XMIN:{}, XMAX:{}, YMIN:{}, YMAX:{}".format(xmin, xmax, ymin, ymax))
        drawing_infos = {
            "total_lenght": total_lenght,
            "xmin": xmin,
            "xmax": xmax,
            "ymin": ymin,
            "ymax": ymax
        }

        # return the image obtained from the coordinates
        return drawing_infos, coords


    # draws an image with the given coordinates (array of tuple of points) and the extremes of the points
    def draw_image(self, coords, drawing_infos):
        limits = DotMap(drawing_infos)
        # Make the image larger than needed so can apply antialiasing
        factor = 5.0
        img_width = self.final_width*factor
        img_height = self.final_height*factor
        border_px = self.final_border_px*factor
        image = Image.new('RGB', (int(img_width), int(img_height)), color=self.bg_color)
        d = ImageDraw.Draw(image)
        rangex = limits.xmax-limits.xmin
        rangey = limits.ymax-limits.ymin
        scaleX = float(img_width  - border_px*2)/rangex
        scaleY = float(img_height - border_px*2)/rangey
        scale = min(scaleX, scaleY)

        def remapx(value):
            return int((value-limits.xmin)*scale + border_px)
        
        def remapy(value):
            return int(img_height-((value-limits.ymin)*scale + border_px))
        
        p_1 = coords[0]
        self.circle(d, (remapx(p_1[0]), remapy(p_1[1])), self.line_width*factor/2, self.line_color)        # draw a circle to make round corners
        for p in coords[1:]:                                                                # create the line between two consecutive coordinates
            d.line([remapx(p_1[0]), remapy(p_1[1]), remapx(p[0]), remapy(p[1])], \
            fill=self.line_color, width=int(self.line_width*factor))
            if self.verbose:
                print("coord: {} _ {}".format(remapx(p_1[0]), remapy(p_1[1])))
            p_1 = p
            self.circle(d, (remapx(p_1[0]), remapy(p_1[1])), self.line_width*factor/2, self.line_color)    # draw a circle to make round corners

        # Resize the image to the final dimension to use antialiasing
        image = image.resize((int(self.final_width), int(self.final_height)), Image.ANTIALIAS)
        return image

    def circle(self, d, c, r, color):
        d.ellipse([c[0]-r, c[1]-r, c[0]+r, c[1]+r], fill=color, outline=None)

    def thr_to_image(self, file):
        pass

if __name__ == "__main__":
    # testing scara
    device = {
        "type": "Scara",
        "angle_conversion_factor": 6.0,
        "radius": 200,
        "offset_angle": -1.5,
        "offset_angle_2": 1.5
    }
    factory = ImageFactory(device, verbose=True)
    with open('server/utils/test_scara.gcode') as file:
        im = factory.gcode_to_image(file)
        im.show()
    
    # testing cartesian
    device = {
        "type": "Cartesian"
    }
    factory = ImageFactory(device, verbose=True)
    with open('server/utils/test_cartesian.gcode') as file:
        im = factory.gcode_to_image(file)
        im.show()