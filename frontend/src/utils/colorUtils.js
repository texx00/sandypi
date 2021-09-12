// TODO could be interesting to use the "colorjs.io" module instead of using these functions

function RGBToHex(rgb) {

    let r = rgb.r.toString(16);
    let g = rgb.g.toString(16);
    let b = rgb.b.toString(16);

    r = r.length === 2 ? r : "0" + r;
    g = g.length === 2 ? g : "0" + g;
    b = b.length === 2 ? b : "0" + b;
  
    return "#" + r + g + b;
}

function hexToRGB(h) {
    let r = 0, g = 0, b = 0;
  
    // 3 digits
    if (h.length === 4) {
      r = "0x" + h[1] + h[1];
      g = "0x" + h[2] + h[2];
      b = "0x" + h[3] + h[3];
  
    // 6 digits
    } else if (h.length === 7) {
      r = "0x" + h[1] + h[2];
      g = "0x" + h[3] + h[4];
      b = "0x" + h[5] + h[6];
    }
    
    return {r: r, g: g, b: b};
}

// Point in the brightness bar at which should have the choosen color from the color picker. 
// Above that threshold the color becomes lighter, below this it becomes darker
// Higher thresholds increases the control in the dark side, 
// lower threshold increases the control in the bright side (this was not inspired in any way from starwars)
// This idea was to remove the need of another control for the color saturation (with this mixing the saturation tends toward the whitish version of the color)
// With BRIGHTNESS_CHANGE_TH = 1 the mixing is not done and there is only brightness control (brightness 1 -> full color saturation at full brightness)

const BRIGHTNESS_CHANGE_TH = 1;   

function alphaToBrightness(rgba, th=BRIGHTNESS_CHANGE_TH){
    let r = rgba.r,
        g = rgba.g,
        b = rgba.b,
        a = rgba.a;
    
    if (BRIGHTNESS_CHANGE_TH === 1){
        r = Math.floor(r*a);
        g = Math.floor(g*a);
        b = Math.floor(b*a);
    }else{
        // formulas to get the brightness down from completely off (black) to full on (white)
        let a1 = Math.min(a, th)/th;
        let a2 = Math.max(a-th, 0)/(1-th);
        r = Math.floor(r*a1 + (255-r)*a2);
        g = Math.floor(g*a1 + (255-g)*a2);
        b = Math.floor(b*a1 + (255-b)*a2);
    }

    return {r: r, g: g, b: b}
}

function RGBAToHex(rgba){
    let a = (Math.floor(rgba.a*255)).toString(16);
    a = a.length === 2 ? a : "0" + a;
    return RGBToHex(rgba) + a;
}

export {
    RGBToHex,
    RGBAToHex,
    hexToRGB,
    alphaToBrightness
}