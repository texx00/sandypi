from PIL import Image, ImageDraw
from math import cos, sin, pi

straight_lines = ["G01", "G1", "G0", "G00"]

def gcode_to_image(file, final_width=800, final_height=800, bg_color=(0,0,0), line_color=(255,255,255), final_border_px=20, line_width=5, verbose=False, type="Cartesian", device_radius=100):
    # -- Extracting coordinates --
    device_radius = float(device_radius)
    half_radius = device_radius/2
    coords = []
    xmin =  100000
    xmax = -100000
    ymin =  100000
    ymax = -100000
    old_X = 0
    old_Y = 0
    for line in file:
        com_X = old_X               # command X value
        com_Y = old_Y               # command Y value

        # skipping comments
        if type=="Polar":           # thr files
            if line.startswith("#"):
                continue
        elif line.startswith(";"):    
            continue
        if len(line) <3:
            continue

        # parsing line
        params = line.split(" ")
        if type!= "Polar":
            if not (params[0] in straight_lines) :    # analyzing only G01. TODO Should add checks for other commands
                if(verbose):
                    print("Skipping line: "+line)
                continue

        # selecting values
        if type=="Polar":           # thr files only
            com_X = float(params[0])
            com_Y = float(params[1])
        else:
            for p in params:
                if p[0]=="X":
                    com_X = float(p[1:-1])
                if p[0]=="Y":
                    com_Y = float(p[1:-1])
        
        # converting command X and Y to x, y coordinates (default conversion is cartesian)
        x = com_X
        y = com_Y
        if type=="Scara":           # by default, the beams are identical -> beam lenght is radius/2
            x = (cos(com_X * pi/6) + cos(com_Y * pi/6)) * half_radius
            y = (sin(com_X * pi/6) + sin(com_Y * pi/6)) * half_radius
        elif type=="Polar":
            x = cos(com_X) * com_Y * device_radius
            y = sin(com_X) * com_Y * device_radius


        if x<xmin:
            xmin = x
        if x>xmax:
            xmax = x
        if y<ymin:
            ymin = y
        if y>ymax:
            ymax = y
        c = [x,y]
        coords.append(c)
        old_X = com_X
        old_Y = com_Y
    if verbose:
        print("Coordinates:")
        print(coords)
        print("XMIN:{}, XMAX:{}, YMIN:{}, YMAX:{}".format(xmin, xmax, ymin, ymax))
    
    # -- Drawing the image --
    # Make the image larger than needed so can apply antialiasing
    factor = 5
    img_width = final_width*factor
    img_height = final_height*factor
    border_px = final_border_px*factor
    image = Image.new('RGB', (img_width, img_height), color=(bg_color[0],bg_color[1],bg_color[2],0))
    d = ImageDraw.Draw(image)
    rangex = xmax-xmin
    rangey = ymax-ymin
    scaleX = (img_width  - border_px*2)/rangex
    scaleY = (img_height - border_px*2)/rangey
    scale = min(scaleX, scaleY)

    def remapx(value):
        return (value-xmin)*scale + border_px
    
    def remapy(value):
        return img_height-((value-ymin)*scale + border_px)
    
    p_1 = coords[0]
    circle(d, (remapx(p_1[0]), remapy(p_1[1])), line_width*factor/2, line_color)        # draw a circle to make round corners
    for p in coords[1:]:                                                                # create the line between two consecutive coordinates
        d.line([remapx(p_1[0]), remapy(p_1[1]), remapx(p[0]), remapy(p[1])], \
        fill=line_color, width=line_width*factor)
        if verbose:
            print("coord: {} _ {}".format(remapx(p_1[0]), remapy(p_1[1])))
        p_1 = p
        circle(d, (remapx(p_1[0]), remapy(p_1[1])), line_width*factor/2, line_color)    # draw a circle to make round corners

    # Resize the image to the final dimension to use antialiasing
    image = image.resize((final_width, final_height), Image.ANTIALIAS)
    return image

def circle(d, c, r, color):
    d.ellipse([c[0]-r, c[1]-r, c[0]+r, c[1]+r], fill=color, outline=None)

if __name__ == "__main__":
    with open('thr_test.thr') as file:
        im = gcode_to_image(file, verbose=True, type="Polar")
        im.show()