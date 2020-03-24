(function() {
  var ColorExpression, ExpressionsRegistry, SVGColors, colorRegexp, colors, comma, elmAngle, float, floatOrPercent, hexadecimal, insensitive, int, intOrPercent, namePrefixes, notQuote, optionalPercent, pe, percent, ps, ref, ref1, registry, strip, variables;

  ref = require('./regexes'), int = ref.int, float = ref.float, percent = ref.percent, optionalPercent = ref.optionalPercent, intOrPercent = ref.intOrPercent, floatOrPercent = ref.floatOrPercent, comma = ref.comma, notQuote = ref.notQuote, hexadecimal = ref.hexadecimal, ps = ref.ps, pe = ref.pe, variables = ref.variables, namePrefixes = ref.namePrefixes;

  ref1 = require('./utils'), strip = ref1.strip, insensitive = ref1.insensitive;

  ExpressionsRegistry = require('./expressions-registry');

  ColorExpression = require('./color-expression');

  SVGColors = require('./svg-colors');

  module.exports = registry = new ExpressionsRegistry(ColorExpression);

  registry.createExpression('pigments:css_hexa_8', "#(" + hexadecimal + "{8})(?![\\d\\w-])", 1, ['css', 'less', 'styl', 'stylus', 'sass', 'scss'], function(match, expression, context) {
    var _, hexa;
    _ = match[0], hexa = match[1];
    return this.hexRGBA = hexa;
  });

  registry.createExpression('pigments:argb_hexa_8', "#(" + hexadecimal + "{8})(?![\\d\\w-])", ['*'], function(match, expression, context) {
    var _, hexa;
    _ = match[0], hexa = match[1];
    return this.hexARGB = hexa;
  });

  registry.createExpression('pigments:css_hexa_6', "#(" + hexadecimal + "{6})(?![\\d\\w-])", ['*'], function(match, expression, context) {
    var _, hexa;
    _ = match[0], hexa = match[1];
    return this.hex = hexa;
  });

  registry.createExpression('pigments:css_hexa_4', "(?:" + namePrefixes + ")#(" + hexadecimal + "{4})(?![\\d\\w-])", ['*'], function(match, expression, context) {
    var _, colorAsInt, hexa;
    _ = match[0], hexa = match[1];
    colorAsInt = context.readInt(hexa, 16);
    this.colorExpression = "#" + hexa;
    this.red = (colorAsInt >> 12 & 0xf) * 17;
    this.green = (colorAsInt >> 8 & 0xf) * 17;
    this.blue = (colorAsInt >> 4 & 0xf) * 17;
    return this.alpha = ((colorAsInt & 0xf) * 17) / 255;
  });

  registry.createExpression('pigments:css_hexa_3', "(?:" + namePrefixes + ")#(" + hexadecimal + "{3})(?![\\d\\w-])", ['*'], function(match, expression, context) {
    var _, colorAsInt, hexa;
    _ = match[0], hexa = match[1];
    colorAsInt = context.readInt(hexa, 16);
    this.colorExpression = "#" + hexa;
    this.red = (colorAsInt >> 8 & 0xf) * 17;
    this.green = (colorAsInt >> 4 & 0xf) * 17;
    return this.blue = (colorAsInt & 0xf) * 17;
  });

  registry.createExpression('pigments:int_hexa_8', "0x(" + hexadecimal + "{8})(?!" + hexadecimal + ")", ['*'], function(match, expression, context) {
    var _, hexa;
    _ = match[0], hexa = match[1];
    return this.hexARGB = hexa;
  });

  registry.createExpression('pigments:int_hexa_6', "0x(" + hexadecimal + "{6})(?!" + hexadecimal + ")", ['*'], function(match, expression, context) {
    var _, hexa;
    _ = match[0], hexa = match[1];
    return this.hex = hexa;
  });

  registry.createExpression('pigments:css_rgb', strip("" + (insensitive('rgb')) + ps + "\\s* (" + intOrPercent + "|" + variables + ") " + comma + " (" + intOrPercent + "|" + variables + ") " + comma + " (" + intOrPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var _, b, g, r;
    _ = match[0], r = match[1], g = match[2], b = match[3];
    this.red = context.readIntOrPercent(r);
    this.green = context.readIntOrPercent(g);
    this.blue = context.readIntOrPercent(b);
    return this.alpha = 1;
  });

  registry.createExpression('pigments:css_rgba', strip("" + (insensitive('rgba')) + ps + "\\s* (" + intOrPercent + "|" + variables + ") " + comma + " (" + intOrPercent + "|" + variables + ") " + comma + " (" + intOrPercent + "|" + variables + ") " + comma + " (" + float + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var _, a, b, g, r;
    _ = match[0], r = match[1], g = match[2], b = match[3], a = match[4];
    this.red = context.readIntOrPercent(r);
    this.green = context.readIntOrPercent(g);
    this.blue = context.readIntOrPercent(b);
    return this.alpha = context.readFloat(a);
  });

  registry.createExpression('pigments:stylus_rgba', strip("rgba" + ps + "\\s* (" + notQuote + ") " + comma + " (" + float + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var _, a, baseColor, subexpr;
    _ = match[0], subexpr = match[1], a = match[2];
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    this.rgb = baseColor.rgb;
    return this.alpha = context.readFloat(a);
  });

  registry.createExpression('pigments:css_hsl', strip("" + (insensitive('hsl')) + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + pe), ['css', 'sass', 'scss', 'styl', 'stylus'], function(match, expression, context) {
    var _, h, hsl, l, s;
    _ = match[0], h = match[1], s = match[2], l = match[3];
    hsl = [context.readInt(h), context.readFloat(s), context.readFloat(l)];
    if (hsl.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hsl = hsl;
    return this.alpha = 1;
  });

  registry.createExpression('pigments:less_hsl', strip("hsl" + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['less'], function(match, expression, context) {
    var _, h, hsl, l, s;
    _ = match[0], h = match[1], s = match[2], l = match[3];
    hsl = [context.readInt(h), context.readFloatOrPercent(s) * 100, context.readFloatOrPercent(l) * 100];
    if (hsl.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hsl = hsl;
    return this.alpha = 1;
  });

  registry.createExpression('pigments:css_hsla', strip("" + (insensitive('hsla')) + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + float + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var _, a, h, hsl, l, s;
    _ = match[0], h = match[1], s = match[2], l = match[3], a = match[4];
    hsl = [context.readInt(h), context.readFloat(s), context.readFloat(l)];
    if (hsl.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hsl = hsl;
    return this.alpha = context.readFloat(a);
  });

  registry.createExpression('pigments:hsv', strip("(?:" + (insensitive('hsv')) + "|" + (insensitive('hsb')) + ")" + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var _, h, hsv, s, v;
    _ = match[0], h = match[1], s = match[2], v = match[3];
    hsv = [context.readInt(h), context.readFloat(s), context.readFloat(v)];
    if (hsv.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hsv = hsv;
    return this.alpha = 1;
  });

  registry.createExpression('pigments:hsva', strip("(?:" + (insensitive('hsva')) + "|" + (insensitive('hsba')) + ")" + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + float + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var _, a, h, hsv, s, v;
    _ = match[0], h = match[1], s = match[2], v = match[3], a = match[4];
    hsv = [context.readInt(h), context.readFloat(s), context.readFloat(v)];
    if (hsv.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hsv = hsv;
    return this.alpha = context.readFloat(a);
  });

  registry.createExpression('pigments:hcg', strip("(?:" + (insensitive('hcg')) + ")" + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var _, c, gr, h, hcg;
    _ = match[0], h = match[1], c = match[2], gr = match[3];
    hcg = [context.readInt(h), context.readFloat(c), context.readFloat(gr)];
    if (hcg.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hcg = hcg;
    return this.alpha = 1;
  });

  registry.createExpression('pigments:hcga', strip("(?:" + (insensitive('hcga')) + ")" + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + float + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var _, a, c, gr, h, hcg;
    _ = match[0], h = match[1], c = match[2], gr = match[3], a = match[4];
    hcg = [context.readInt(h), context.readFloat(c), context.readFloat(gr)];
    if (hcg.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hcg = hcg;
    return this.alpha = context.readFloat(a);
  });

  registry.createExpression('pigments:vec4', strip("vec4" + ps + "\\s* (" + float + ") " + comma + " (" + float + ") " + comma + " (" + float + ") " + comma + " (" + float + ") " + pe), ['*'], function(match, expression, context) {
    var _, a, h, l, s;
    _ = match[0], h = match[1], s = match[2], l = match[3], a = match[4];
    return this.rgba = [context.readFloat(h) * 255, context.readFloat(s) * 255, context.readFloat(l) * 255, context.readFloat(a)];
  });

  registry.createExpression('pigments:hwb', strip("" + (insensitive('hwb')) + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + comma + " (" + optionalPercent + "|" + variables + ") (?:" + comma + "(" + float + "|" + variables + "))? " + pe), ['*'], function(match, expression, context) {
    var _, a, b, h, w;
    _ = match[0], h = match[1], w = match[2], b = match[3], a = match[4];
    this.hwb = [context.readInt(h), context.readFloat(w), context.readFloat(b)];
    return this.alpha = a != null ? context.readFloat(a) : 1;
  });

  registry.createExpression('pigments:cmyk', strip("" + (insensitive('cmyk')) + ps + "\\s* (" + float + "|" + variables + ") " + comma + " (" + float + "|" + variables + ") " + comma + " (" + float + "|" + variables + ") " + comma + " (" + float + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var _, c, k, m, y;
    _ = match[0], c = match[1], m = match[2], y = match[3], k = match[4];
    return this.cmyk = [context.readFloat(c), context.readFloat(m), context.readFloat(y), context.readFloat(k)];
  });

  registry.createExpression('pigments:gray', strip("" + (insensitive('gray')) + ps + "\\s* (" + optionalPercent + "|" + variables + ") (?:" + comma + "(" + float + "|" + variables + "))? " + pe), 1, ['*'], function(match, expression, context) {
    var _, a, p;
    _ = match[0], p = match[1], a = match[2];
    p = context.readFloat(p) / 100 * 255;
    this.rgb = [p, p, p];
    return this.alpha = a != null ? context.readFloat(a) : 1;
  });

  colors = Object.keys(SVGColors.allCases);

  colorRegexp = "(?:" + namePrefixes + ")(" + (colors.join('|')) + ")\\b(?![ \\t]*[-\\.:=\\(])";

  registry.createExpression('pigments:named_colors', colorRegexp, [], function(match, expression, context) {
    var _, name;
    _ = match[0], name = match[1];
    this.colorExpression = this.name = name;
    return this.hex = context.SVGColors.allCases[name].replace('#', '');
  });

  registry.createExpression('pigments:darken', strip("darken" + ps + " (" + notQuote + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var _, amount, baseColor, h, l, ref2, s, subexpr;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloat(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    ref2 = baseColor.hsl, h = ref2[0], s = ref2[1], l = ref2[2];
    this.hsl = [h, s, context.clampInt(l - amount)];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:lighten', strip("lighten" + ps + " (" + notQuote + ") " + comma + " (" + optionalPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var _, amount, baseColor, h, l, ref2, s, subexpr;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloat(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    ref2 = baseColor.hsl, h = ref2[0], s = ref2[1], l = ref2[2];
    this.hsl = [h, s, context.clampInt(l + amount)];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:fade', strip("(?:fade|alpha)" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var _, amount, baseColor, subexpr;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    this.rgb = baseColor.rgb;
    return this.alpha = amount;
  });

  registry.createExpression('pigments:transparentize', strip("(?:transparentize|fadeout|fade-out|fade_out)" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var _, amount, baseColor, subexpr;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    this.rgb = baseColor.rgb;
    return this.alpha = context.clamp(baseColor.alpha - amount);
  });

  registry.createExpression('pigments:opacify', strip("(?:opacify|fadein|fade-in|fade_in)" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var _, amount, baseColor, subexpr;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    this.rgb = baseColor.rgb;
    return this.alpha = context.clamp(baseColor.alpha + amount);
  });

  registry.createExpression('pigments:stylus_component_functions', strip("(red|green|blue)" + ps + " (" + notQuote + ") " + comma + " (" + int + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var _, amount, baseColor, channel, subexpr;
    _ = match[0], channel = match[1], subexpr = match[2], amount = match[3];
    amount = context.readInt(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    if (isNaN(amount)) {
      return this.invalid = true;
    }
    return this[channel] = amount;
  });

  registry.createExpression('pigments:transparentify', strip("transparentify" + ps + " (" + notQuote + ") " + pe), ['*'], function(match, expression, context) {
    var _, alpha, bestAlpha, bottom, expr, processChannel, ref2, top;
    _ = match[0], expr = match[1];
    ref2 = context.split(expr), top = ref2[0], bottom = ref2[1], alpha = ref2[2];
    top = context.readColor(top);
    bottom = context.readColor(bottom);
    alpha = context.readFloatOrPercent(alpha);
    if (context.isInvalid(top)) {
      return this.invalid = true;
    }
    if ((bottom != null) && context.isInvalid(bottom)) {
      return this.invalid = true;
    }
    if (bottom == null) {
      bottom = new context.Color(255, 255, 255, 1);
    }
    if (isNaN(alpha)) {
      alpha = void 0;
    }
    bestAlpha = ['red', 'green', 'blue'].map(function(channel) {
      var res;
      res = (top[channel] - bottom[channel]) / ((0 < top[channel] - bottom[channel] ? 255 : 0) - bottom[channel]);
      return res;
    }).sort(function(a, b) {
      return a < b;
    })[0];
    processChannel = function(channel) {
      if (bestAlpha === 0) {
        return bottom[channel];
      } else {
        return bottom[channel] + (top[channel] - bottom[channel]) / bestAlpha;
      }
    };
    if (alpha != null) {
      bestAlpha = alpha;
    }
    bestAlpha = Math.max(Math.min(bestAlpha, 1), 0);
    this.red = processChannel('red');
    this.green = processChannel('green');
    this.blue = processChannel('blue');
    return this.alpha = Math.round(bestAlpha * 100) / 100;
  });

  registry.createExpression('pigments:hue', strip("hue" + ps + " (" + notQuote + ") " + comma + " (" + int + "deg|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var _, amount, baseColor, h, l, ref2, s, subexpr;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloat(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    if (isNaN(amount)) {
      return this.invalid = true;
    }
    ref2 = baseColor.hsl, h = ref2[0], s = ref2[1], l = ref2[2];
    this.hsl = [amount % 360, s, l];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:stylus_sl_component_functions', strip("(saturation|lightness)" + ps + " (" + notQuote + ") " + comma + " (" + intOrPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var _, amount, baseColor, channel, subexpr;
    _ = match[0], channel = match[1], subexpr = match[2], amount = match[3];
    amount = context.readInt(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    if (isNaN(amount)) {
      return this.invalid = true;
    }
    baseColor[channel] = amount;
    return this.rgba = baseColor.rgba;
  });

  registry.createExpression('pigments:adjust-hue', strip("adjust-hue" + ps + " (" + notQuote + ") " + comma + " (-?" + int + "deg|" + variables + "|-?" + optionalPercent + ") " + pe), ['*'], function(match, expression, context) {
    var _, amount, baseColor, h, l, ref2, s, subexpr;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloat(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    ref2 = baseColor.hsl, h = ref2[0], s = ref2[1], l = ref2[2];
    this.hsl = [(h + amount) % 360, s, l];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:mix', "mix" + ps + "(" + notQuote + ")" + pe, ['*'], function(match, expression, context) {
    var _, amount, baseColor1, baseColor2, color1, color2, expr, ref2, ref3;
    _ = match[0], expr = match[1];
    ref2 = context.split(expr), color1 = ref2[0], color2 = ref2[1], amount = ref2[2];
    if (amount != null) {
      amount = context.readFloatOrPercent(amount);
    } else {
      amount = 0.5;
    }
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return ref3 = context.mixColors(baseColor1, baseColor2, amount), this.rgba = ref3.rgba, ref3;
  });

  registry.createExpression('pigments:stylus_tint', strip("tint" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['styl', 'stylus', 'less'], function(match, expression, context) {
    var _, amount, baseColor, subexpr, white;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    white = new context.Color(255, 255, 255);
    return this.rgba = context.mixColors(white, baseColor, amount).rgba;
  });

  registry.createExpression('pigments:stylus_shade', strip("shade" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['styl', 'stylus', 'less'], function(match, expression, context) {
    var _, amount, baseColor, black, subexpr;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    black = new context.Color(0, 0, 0);
    return this.rgba = context.mixColors(black, baseColor, amount).rgba;
  });

  registry.createExpression('pigments:compass_tint', strip("tint" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['sass:compass', 'scss:compass'], function(match, expression, context) {
    var _, amount, baseColor, subexpr, white;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    white = new context.Color(255, 255, 255);
    return this.rgba = context.mixColors(baseColor, white, amount).rgba;
  });

  registry.createExpression('pigments:compass_shade', strip("shade" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['sass:compass', 'scss:compass'], function(match, expression, context) {
    var _, amount, baseColor, black, subexpr;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    black = new context.Color(0, 0, 0);
    return this.rgba = context.mixColors(baseColor, black, amount).rgba;
  });

  registry.createExpression('pigments:bourbon_tint', strip("tint" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['sass:bourbon', 'scss:bourbon'], function(match, expression, context) {
    var _, amount, baseColor, subexpr, white;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    white = new context.Color(255, 255, 255);
    return this.rgba = context.mixColors(white, baseColor, amount).rgba;
  });

  registry.createExpression('pigments:bourbon_shade', strip("shade" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['sass:bourbon', 'scss:bourbon'], function(match, expression, context) {
    var _, amount, baseColor, black, subexpr;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    black = new context.Color(0, 0, 0);
    return this.rgba = context.mixColors(black, baseColor, amount).rgba;
  });

  registry.createExpression('pigments:desaturate', "desaturate" + ps + "(" + notQuote + ")" + comma + "(" + floatOrPercent + "|" + variables + ")" + pe, ['*'], function(match, expression, context) {
    var _, amount, baseColor, h, l, ref2, s, subexpr;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    ref2 = baseColor.hsl, h = ref2[0], s = ref2[1], l = ref2[2];
    this.hsl = [h, context.clampInt(s - amount * 100), l];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:saturate', strip("saturate" + ps + " (" + notQuote + ") " + comma + " (" + floatOrPercent + "|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var _, amount, baseColor, h, l, ref2, s, subexpr;
    _ = match[0], subexpr = match[1], amount = match[2];
    amount = context.readFloatOrPercent(amount);
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    ref2 = baseColor.hsl, h = ref2[0], s = ref2[1], l = ref2[2];
    this.hsl = [h, context.clampInt(s + amount * 100), l];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:grayscale', "gr(?:a|e)yscale" + ps + "(" + notQuote + ")" + pe, ['*'], function(match, expression, context) {
    var _, baseColor, h, l, ref2, s, subexpr;
    _ = match[0], subexpr = match[1];
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    ref2 = baseColor.hsl, h = ref2[0], s = ref2[1], l = ref2[2];
    this.hsl = [h, 0, l];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:invert', "invert" + ps + "(" + notQuote + ")" + pe, ['*'], function(match, expression, context) {
    var _, b, baseColor, g, r, ref2, subexpr;
    _ = match[0], subexpr = match[1];
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    ref2 = baseColor.rgb, r = ref2[0], g = ref2[1], b = ref2[2];
    this.rgb = [255 - r, 255 - g, 255 - b];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:complement', "complement" + ps + "(" + notQuote + ")" + pe, ['*'], function(match, expression, context) {
    var _, baseColor, h, l, ref2, s, subexpr;
    _ = match[0], subexpr = match[1];
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    ref2 = baseColor.hsl, h = ref2[0], s = ref2[1], l = ref2[2];
    this.hsl = [(h + 180) % 360, s, l];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:spin', strip("spin" + ps + " (" + notQuote + ") " + comma + " (-?(" + int + ")(deg)?|" + variables + ") " + pe), ['*'], function(match, expression, context) {
    var _, angle, baseColor, h, l, ref2, s, subexpr;
    _ = match[0], subexpr = match[1], angle = match[2];
    baseColor = context.readColor(subexpr);
    angle = context.readInt(angle);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    ref2 = baseColor.hsl, h = ref2[0], s = ref2[1], l = ref2[2];
    this.hsl = [(360 + h + angle) % 360, s, l];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:contrast_n_arguments', strip("contrast" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var _, base, baseColor, dark, expr, light, ref2, ref3, res, threshold;
    _ = match[0], expr = match[1];
    ref2 = context.split(expr), base = ref2[0], dark = ref2[1], light = ref2[2], threshold = ref2[3];
    baseColor = context.readColor(base);
    dark = context.readColor(dark);
    light = context.readColor(light);
    if (threshold != null) {
      threshold = context.readPercent(threshold);
    }
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    if (dark != null ? dark.invalid : void 0) {
      return this.invalid = true;
    }
    if (light != null ? light.invalid : void 0) {
      return this.invalid = true;
    }
    res = context.contrast(baseColor, dark, light);
    if (context.isInvalid(res)) {
      return this.invalid = true;
    }
    return ref3 = context.contrast(baseColor, dark, light, threshold), this.rgb = ref3.rgb, ref3;
  });

  registry.createExpression('pigments:contrast_1_argument', strip("contrast" + ps + " (" + notQuote + ") " + pe), ['*'], function(match, expression, context) {
    var _, baseColor, ref2, subexpr;
    _ = match[0], subexpr = match[1];
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    return ref2 = context.contrast(baseColor), this.rgb = ref2.rgb, ref2;
  });

  registry.createExpression('pigments:css_color_function', "(?:" + namePrefixes + ")(" + (insensitive('color')) + ps + "(" + notQuote + ")" + pe + ")", ['css'], function(match, expression, context) {
    var _, cssColor, e, expr, k, ref2, rgba, v;
    try {
      _ = match[0], expr = match[1];
      ref2 = context.vars;
      for (k in ref2) {
        v = ref2[k];
        expr = expr.replace(RegExp("" + (k.replace(/\(/g, '\\(').replace(/\)/g, '\\)')), "g"), v.value);
      }
      cssColor = require('css-color-function');
      rgba = cssColor.convert(expr.toLowerCase());
      this.rgba = context.readColor(rgba).rgba;
      return this.colorExpression = expr;
    } catch (error) {
      e = error;
      return this.invalid = true;
    }
  });

  registry.createExpression('pigments:sass_adjust_color', "adjust-color" + ps + "(" + notQuote + ")" + pe, 1, ['*'], function(match, expression, context) {
    var _, baseColor, i, len, param, params, res, subexpr, subject;
    _ = match[0], subexpr = match[1];
    res = context.split(subexpr);
    subject = res[0];
    params = res.slice(1);
    baseColor = context.readColor(subject);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    for (i = 0, len = params.length; i < len; i++) {
      param = params[i];
      context.readParam(param, function(name, value) {
        return baseColor[name] += context.readFloat(value);
      });
    }
    return this.rgba = baseColor.rgba;
  });

  registry.createExpression('pigments:sass_scale_color', "scale-color" + ps + "(" + notQuote + ")" + pe, 1, ['*'], function(match, expression, context) {
    var MAX_PER_COMPONENT, _, baseColor, i, len, param, params, res, subexpr, subject;
    MAX_PER_COMPONENT = {
      red: 255,
      green: 255,
      blue: 255,
      alpha: 1,
      hue: 360,
      saturation: 100,
      lightness: 100
    };
    _ = match[0], subexpr = match[1];
    res = context.split(subexpr);
    subject = res[0];
    params = res.slice(1);
    baseColor = context.readColor(subject);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    for (i = 0, len = params.length; i < len; i++) {
      param = params[i];
      context.readParam(param, function(name, value) {
        var dif, result;
        value = context.readFloat(value) / 100;
        result = value > 0 ? (dif = MAX_PER_COMPONENT[name] - baseColor[name], result = baseColor[name] + dif * value) : result = baseColor[name] * (1 + value);
        return baseColor[name] = result;
      });
    }
    return this.rgba = baseColor.rgba;
  });

  registry.createExpression('pigments:sass_change_color', "change-color" + ps + "(" + notQuote + ")" + pe, 1, ['*'], function(match, expression, context) {
    var _, baseColor, i, len, param, params, res, subexpr, subject;
    _ = match[0], subexpr = match[1];
    res = context.split(subexpr);
    subject = res[0];
    params = res.slice(1);
    baseColor = context.readColor(subject);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    for (i = 0, len = params.length; i < len; i++) {
      param = params[i];
      context.readParam(param, function(name, value) {
        return baseColor[name] = context.readFloat(value);
      });
    }
    return this.rgba = baseColor.rgba;
  });

  registry.createExpression('pigments:stylus_blend', strip("blend" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var _, baseColor1, baseColor2, color1, color2, expr, ref2;
    _ = match[0], expr = match[1];
    ref2 = context.split(expr), color1 = ref2[0], color2 = ref2[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return this.rgba = [baseColor1.red * baseColor1.alpha + baseColor2.red * (1 - baseColor1.alpha), baseColor1.green * baseColor1.alpha + baseColor2.green * (1 - baseColor1.alpha), baseColor1.blue * baseColor1.alpha + baseColor2.blue * (1 - baseColor1.alpha), baseColor1.alpha + baseColor2.alpha - baseColor1.alpha * baseColor2.alpha];
  });

  registry.createExpression('pigments:lua_rgba', strip("(?:" + namePrefixes + ")Color" + ps + "\\s* (" + int + "|" + variables + ") " + comma + " (" + int + "|" + variables + ") " + comma + " (" + int + "|" + variables + ") " + comma + " (" + int + "|" + variables + ") " + pe), ['lua'], function(match, expression, context) {
    var _, a, b, g, r;
    _ = match[0], r = match[1], g = match[2], b = match[3], a = match[4];
    this.red = context.readInt(r);
    this.green = context.readInt(g);
    this.blue = context.readInt(b);
    return this.alpha = context.readInt(a) / 255;
  });

  registry.createExpression('pigments:multiply', strip("multiply" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var _, baseColor1, baseColor2, color1, color2, expr, ref2, ref3;
    _ = match[0], expr = match[1];
    ref2 = context.split(expr), color1 = ref2[0], color2 = ref2[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return ref3 = baseColor1.blend(baseColor2, context.BlendModes.MULTIPLY), this.rgba = ref3.rgba, ref3;
  });

  registry.createExpression('pigments:screen', strip("screen" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var _, baseColor1, baseColor2, color1, color2, expr, ref2, ref3;
    _ = match[0], expr = match[1];
    ref2 = context.split(expr), color1 = ref2[0], color2 = ref2[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return ref3 = baseColor1.blend(baseColor2, context.BlendModes.SCREEN), this.rgba = ref3.rgba, ref3;
  });

  registry.createExpression('pigments:overlay', strip("overlay" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var _, baseColor1, baseColor2, color1, color2, expr, ref2, ref3;
    _ = match[0], expr = match[1];
    ref2 = context.split(expr), color1 = ref2[0], color2 = ref2[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return ref3 = baseColor1.blend(baseColor2, context.BlendModes.OVERLAY), this.rgba = ref3.rgba, ref3;
  });

  registry.createExpression('pigments:softlight', strip("softlight" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var _, baseColor1, baseColor2, color1, color2, expr, ref2, ref3;
    _ = match[0], expr = match[1];
    ref2 = context.split(expr), color1 = ref2[0], color2 = ref2[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return ref3 = baseColor1.blend(baseColor2, context.BlendModes.SOFT_LIGHT), this.rgba = ref3.rgba, ref3;
  });

  registry.createExpression('pigments:hardlight', strip("hardlight" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var _, baseColor1, baseColor2, color1, color2, expr, ref2, ref3;
    _ = match[0], expr = match[1];
    ref2 = context.split(expr), color1 = ref2[0], color2 = ref2[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return ref3 = baseColor1.blend(baseColor2, context.BlendModes.HARD_LIGHT), this.rgba = ref3.rgba, ref3;
  });

  registry.createExpression('pigments:difference', strip("difference" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var _, baseColor1, baseColor2, color1, color2, expr, ref2, ref3;
    _ = match[0], expr = match[1];
    ref2 = context.split(expr), color1 = ref2[0], color2 = ref2[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return ref3 = baseColor1.blend(baseColor2, context.BlendModes.DIFFERENCE), this.rgba = ref3.rgba, ref3;
  });

  registry.createExpression('pigments:exclusion', strip("exclusion" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var _, baseColor1, baseColor2, color1, color2, expr, ref2, ref3;
    _ = match[0], expr = match[1];
    ref2 = context.split(expr), color1 = ref2[0], color2 = ref2[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return ref3 = baseColor1.blend(baseColor2, context.BlendModes.EXCLUSION), this.rgba = ref3.rgba, ref3;
  });

  registry.createExpression('pigments:average', strip("average" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var _, baseColor1, baseColor2, color1, color2, expr, ref2, ref3;
    _ = match[0], expr = match[1];
    ref2 = context.split(expr), color1 = ref2[0], color2 = ref2[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return ref3 = baseColor1.blend(baseColor2, context.BlendModes.AVERAGE), this.rgba = ref3.rgba, ref3;
  });

  registry.createExpression('pigments:negation', strip("negation" + ps + " ( " + notQuote + " " + comma + " " + notQuote + " ) " + pe), ['*'], function(match, expression, context) {
    var _, baseColor1, baseColor2, color1, color2, expr, ref2, ref3;
    _ = match[0], expr = match[1];
    ref2 = context.split(expr), color1 = ref2[0], color2 = ref2[1];
    baseColor1 = context.readColor(color1);
    baseColor2 = context.readColor(color2);
    if (context.isInvalid(baseColor1) || context.isInvalid(baseColor2)) {
      return this.invalid = true;
    }
    return ref3 = baseColor1.blend(baseColor2, context.BlendModes.NEGATION), this.rgba = ref3.rgba, ref3;
  });

  registry.createExpression('pigments:elm_rgba', strip("rgba\\s+ (" + int + "|" + variables + ") \\s+ (" + int + "|" + variables + ") \\s+ (" + int + "|" + variables + ") \\s+ (" + float + "|" + variables + ")"), ['elm'], function(match, expression, context) {
    var _, a, b, g, r;
    _ = match[0], r = match[1], g = match[2], b = match[3], a = match[4];
    this.red = context.readInt(r);
    this.green = context.readInt(g);
    this.blue = context.readInt(b);
    return this.alpha = context.readFloat(a);
  });

  registry.createExpression('pigments:elm_rgb', strip("rgb\\s+ (" + int + "|" + variables + ") \\s+ (" + int + "|" + variables + ") \\s+ (" + int + "|" + variables + ")"), ['elm'], function(match, expression, context) {
    var _, b, g, r;
    _ = match[0], r = match[1], g = match[2], b = match[3];
    this.red = context.readInt(r);
    this.green = context.readInt(g);
    return this.blue = context.readInt(b);
  });

  elmAngle = "(?:" + float + "|\\(degrees\\s+(?:" + int + "|" + variables + ")\\))";

  registry.createExpression('pigments:elm_hsl', strip("hsl\\s+ (" + elmAngle + "|" + variables + ") \\s+ (" + float + "|" + variables + ") \\s+ (" + float + "|" + variables + ")"), ['elm'], function(match, expression, context) {
    var _, elmDegreesRegexp, h, hsl, l, m, s;
    elmDegreesRegexp = new RegExp("\\(degrees\\s+(" + context.int + "|" + context.variablesRE + ")\\)");
    _ = match[0], h = match[1], s = match[2], l = match[3];
    if (m = elmDegreesRegexp.exec(h)) {
      h = context.readInt(m[1]);
    } else {
      h = context.readFloat(h) * 180 / Math.PI;
    }
    hsl = [h, context.readFloat(s), context.readFloat(l)];
    if (hsl.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hsl = hsl;
    return this.alpha = 1;
  });

  registry.createExpression('pigments:elm_hsla', strip("hsla\\s+ (" + elmAngle + "|" + variables + ") \\s+ (" + float + "|" + variables + ") \\s+ (" + float + "|" + variables + ") \\s+ (" + float + "|" + variables + ")"), ['elm'], function(match, expression, context) {
    var _, a, elmDegreesRegexp, h, hsl, l, m, s;
    elmDegreesRegexp = new RegExp("\\(degrees\\s+(" + context.int + "|" + context.variablesRE + ")\\)");
    _ = match[0], h = match[1], s = match[2], l = match[3], a = match[4];
    if (m = elmDegreesRegexp.exec(h)) {
      h = context.readInt(m[1]);
    } else {
      h = context.readFloat(h) * 180 / Math.PI;
    }
    hsl = [h, context.readFloat(s), context.readFloat(l)];
    if (hsl.some(function(v) {
      return (v == null) || isNaN(v);
    })) {
      return this.invalid = true;
    }
    this.hsl = hsl;
    return this.alpha = context.readFloat(a);
  });

  registry.createExpression('pigments:elm_grayscale', "gr(?:a|e)yscale\\s+(" + float + "|" + variables + ")", ['elm'], function(match, expression, context) {
    var _, amount;
    _ = match[0], amount = match[1];
    amount = Math.floor(255 - context.readFloat(amount) * 255);
    return this.rgb = [amount, amount, amount];
  });

  registry.createExpression('pigments:elm_complement', strip("complement\\s+(" + notQuote + ")"), ['elm'], function(match, expression, context) {
    var _, baseColor, h, l, ref2, s, subexpr;
    _ = match[0], subexpr = match[1];
    baseColor = context.readColor(subexpr);
    if (context.isInvalid(baseColor)) {
      return this.invalid = true;
    }
    ref2 = baseColor.hsl, h = ref2[0], s = ref2[1], l = ref2[2];
    this.hsl = [(h + 180) % 360, s, l];
    return this.alpha = baseColor.alpha;
  });

  registry.createExpression('pigments:latex_gray', strip("\\[gray\\]\\{(" + float + ")\\}"), ['tex'], function(match, expression, context) {
    var _, amount;
    _ = match[0], amount = match[1];
    amount = context.readFloat(amount) * 255;
    return this.rgb = [amount, amount, amount];
  });

  registry.createExpression('pigments:latex_html', strip("\\[HTML\\]\\{(" + hexadecimal + "{6})\\}"), ['tex'], function(match, expression, context) {
    var _, hexa;
    _ = match[0], hexa = match[1];
    return this.hex = hexa;
  });

  registry.createExpression('pigments:latex_rgb', strip("\\[rgb\\]\\{(" + float + ")" + comma + "(" + float + ")" + comma + "(" + float + ")\\}"), ['tex'], function(match, expression, context) {
    var _, b, g, r;
    _ = match[0], r = match[1], g = match[2], b = match[3];
    r = Math.floor(context.readFloat(r) * 255);
    g = Math.floor(context.readFloat(g) * 255);
    b = Math.floor(context.readFloat(b) * 255);
    return this.rgb = [r, g, b];
  });

  registry.createExpression('pigments:latex_RGB', strip("\\[RGB\\]\\{(" + int + ")" + comma + "(" + int + ")" + comma + "(" + int + ")\\}"), ['tex'], function(match, expression, context) {
    var _, b, g, r;
    _ = match[0], r = match[1], g = match[2], b = match[3];
    r = context.readInt(r);
    g = context.readInt(g);
    b = context.readInt(b);
    return this.rgb = [r, g, b];
  });

  registry.createExpression('pigments:latex_cmyk', strip("\\[cmyk\\]\\{(" + float + ")" + comma + "(" + float + ")" + comma + "(" + float + ")" + comma + "(" + float + ")\\}"), ['tex'], function(match, expression, context) {
    var _, c, k, m, y;
    _ = match[0], c = match[1], m = match[2], y = match[3], k = match[4];
    c = context.readFloat(c);
    m = context.readFloat(m);
    y = context.readFloat(y);
    k = context.readFloat(k);
    return this.cmyk = [c, m, y, k];
  });

  registry.createExpression('pigments:latex_predefined', strip('\\{(black|blue|brown|cyan|darkgray|gray|green|lightgray|lime|magenta|olive|orange|pink|purple|red|teal|violet|white|yellow)\\}'), ['tex'], function(match, expression, context) {
    var _, name;
    _ = match[0], name = match[1];
    return this.hex = context.SVGColors.allCases[name].replace('#', '');
  });

  registry.createExpression('pigments:latex_predefined_dvipnames', strip('\\{(Apricot|Aquamarine|Bittersweet|Black|Blue|BlueGreen|BlueViolet|BrickRed|Brown|BurntOrange|CadetBlue|CarnationPink|Cerulean|CornflowerBlue|Cyan|Dandelion|DarkOrchid|Emerald|ForestGreen|Fuchsia|Goldenrod|Gray|Green|GreenYellow|JungleGreen|Lavender|LimeGreen|Magenta|Mahogany|Maroon|Melon|MidnightBlue|Mulberry|NavyBlue|OliveGreen|Orange|OrangeRed|Orchid|Peach|Periwinkle|PineGreen|Plum|ProcessBlue|Purple|RawSienna|Red|RedOrange|RedViolet|Rhodamine|RoyalBlue|RoyalPurple|RubineRed|Salmon|SeaGreen|Sepia|SkyBlue|SpringGreen|Tan|TealBlue|Thistle|Turquoise|Violet|VioletRed|White|WildStrawberry|Yellow|YellowGreen|YellowOrange)\\}'), ['tex'], function(match, expression, context) {
    var _, name;
    _ = match[0], name = match[1];
    return this.hex = context.DVIPnames[name].replace('#', '');
  });

  registry.createExpression('pigments:latex_mix', strip('\\{([^!\\n\\}]+[!][^\\}\\n]+)\\}'), ['tex'], function(match, expression, context) {
    var _, expr, mix, nextColor, op, triplet;
    _ = match[0], expr = match[1];
    op = expr.split('!');
    mix = function(arg) {
      var a, b, colorA, colorB, p;
      a = arg[0], p = arg[1], b = arg[2];
      colorA = a instanceof context.Color ? a : context.readColor("{" + a + "}");
      colorB = b instanceof context.Color ? b : context.readColor("{" + b + "}");
      percent = context.readInt(p);
      return context.mixColors(colorA, colorB, percent / 100);
    };
    if (op.length === 2) {
      op.push(new context.Color(255, 255, 255));
    }
    nextColor = null;
    while (op.length > 0) {
      triplet = op.splice(0, 3);
      nextColor = mix(triplet);
      if (op.length > 0) {
        op.unshift(nextColor);
      }
    }
    return this.rgb = nextColor.rgb;
  });

  registry.createExpression('pigments:qt_rgba', strip("Qt\\.rgba" + ps + "\\s* (" + float + ") " + comma + " (" + float + ") " + comma + " (" + float + ") " + comma + " (" + float + ") " + pe), ['qml', 'c', 'cc', 'cpp'], 1, function(match, expression, context) {
    var _, a, b, g, r;
    _ = match[0], r = match[1], g = match[2], b = match[3], a = match[4];
    this.red = context.readFloat(r) * 255;
    this.green = context.readFloat(g) * 255;
    this.blue = context.readFloat(b) * 255;
    return this.alpha = context.readFloat(a);
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvZWRzYW5kb3JmLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9jb2xvci1leHByZXNzaW9ucy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BY0ksT0FBQSxDQUFRLFdBQVIsQ0FkSixFQUNFLGFBREYsRUFFRSxpQkFGRixFQUdFLHFCQUhGLEVBSUUscUNBSkYsRUFLRSwrQkFMRixFQU1FLG1DQU5GLEVBT0UsaUJBUEYsRUFRRSx1QkFSRixFQVNFLDZCQVRGLEVBVUUsV0FWRixFQVdFLFdBWEYsRUFZRSx5QkFaRixFQWFFOztFQUdGLE9BQXVCLE9BQUEsQ0FBUSxTQUFSLENBQXZCLEVBQUMsa0JBQUQsRUFBUTs7RUFFUixtQkFBQSxHQUFzQixPQUFBLENBQVEsd0JBQVI7O0VBQ3RCLGVBQUEsR0FBa0IsT0FBQSxDQUFRLG9CQUFSOztFQUNsQixTQUFBLEdBQVksT0FBQSxDQUFRLGNBQVI7O0VBRVosTUFBTSxDQUFDLE9BQVAsR0FDQSxRQUFBLEdBQVcsSUFBSSxtQkFBSixDQUF3QixlQUF4Qjs7RUFXWCxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIscUJBQTFCLEVBQWlELElBQUEsR0FBSyxXQUFMLEdBQWlCLG1CQUFsRSxFQUFzRixDQUF0RixFQUF5RixDQUFDLEtBQUQsRUFBUSxNQUFSLEVBQWdCLE1BQWhCLEVBQXdCLFFBQXhCLEVBQWtDLE1BQWxDLEVBQTBDLE1BQTFDLENBQXpGLEVBQTRJLFNBQUMsS0FBRCxFQUFRLFVBQVIsRUFBb0IsT0FBcEI7QUFDMUksUUFBQTtJQUFDLFlBQUQsRUFBSTtXQUVKLElBQUMsQ0FBQSxPQUFELEdBQVc7RUFIK0gsQ0FBNUk7O0VBTUEsUUFBUSxDQUFDLGdCQUFULENBQTBCLHNCQUExQixFQUFrRCxJQUFBLEdBQUssV0FBTCxHQUFpQixtQkFBbkUsRUFBdUYsQ0FBQyxHQUFELENBQXZGLEVBQThGLFNBQUMsS0FB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QUFRLEdBQVIsRUFBYSxJQUFiLEVBQW1CLEtBQW5CLENBVkosRUFVK0IsQ0FWL0IsRUFVa0MsU0FBQyxLQUFELEVBQVEsVUFBUixFQUFvQixPQUFwQjtBQUNoQyxRQUFBO0lBQUMsWUFBRCxFQUFHLFlBQUgsRUFBSyxZQUFMLEVBQU8sWUFBUCxFQUFTO0lBRVQsSUFBQyxDQUFBLEdBQUQsR0FBTyxPQUFPLENBQUMsU0FBUixDQUFrQixDQUFsQixDQUFBLEdBQXVCO0lBQzlCLElBQUMsQ0FBQSxLQUFELEdBQVMsT0FBTyxDQUFDLFNBQVIsQ0FBa0IsQ0FBbEIsQ0FBQSxHQUF1QjtJQUNoQyxJQUFDLENBQUEsSUFBRCxHQUFRLE9BQU8sQ0FBQyxTQUFSLENBQWtCLENBQWxCLENBQUEsR0FBdUI7V0FDL0IsSUFBQyxDQUFBLEtBQUQsR0FBUyxPQUFPLENBQUMsU0FBUixDQUFrQixDQUFsQjtFQU51QixDQVZsQztBQXQ2Q0EiLCJzb3VyY2VzQ29udGVudCI6WyJ7XG4gIGludFxuICBmbG9hdFxuICBwZXJjZW50XG4gIG9wdGlvbmFsUGVyY2VudFxuICBpbnRPclBlcmNlbnRcbiAgZmxvYXRPclBlcmNlbnRcbiAgY29tbWFcbiAgbm90UXVvdGVcbiAgaGV4YWRlY2ltYWxcbiAgcHNcbiAgcGVcbiAgdmFyaWFibGVzXG4gIG5hbWVQcmVmaXhlc1xufSA9IHJlcXVpcmUgJy4vcmVnZXhlcydcblxue3N0cmlwLCBpbnNlbnNpdGl2ZX0gPSByZXF1aXJlICcuL3V0aWxzJ1xuXG5FeHByZXNzaW9uc1JlZ2lzdHJ5ID0gcmVxdWlyZSAnLi9leHByZXNzaW9ucy1yZWdpc3RyeSdcbkNvbG9yRXhwcmVzc2lvbiA9IHJlcXVpcmUgJy4vY29sb3ItZXhwcmVzc2lvbidcblNWR0NvbG9ycyA9IHJlcXVpcmUgJy4vc3ZnLWNvbG9ycydcblxubW9kdWxlLmV4cG9ydHMgPVxucmVnaXN0cnkgPSBuZXcgRXhwcmVzc2lvbnNSZWdpc3RyeShDb2xvckV4cHJlc3Npb24pXG5cbiMjICAgICMjICAgICAgICMjIyMgIyMjIyMjIyMgIyMjIyMjIyMgIyMjIyMjIyMgICAgICMjIyAgICAjI1xuIyMgICAgIyMgICAgICAgICMjICAgICAjIyAgICAjIyAgICAgICAjIyAgICAgIyMgICAjIyAjIyAgICMjXG4jIyAgICAjIyAgICAgICAgIyMgICAgICMjICAgICMjICAgICAgICMjICAgICAjIyAgIyMgICAjIyAgIyNcbiMjICAgICMjICAgICAgICAjIyAgICAgIyMgICAgIyMjIyMjICAgIyMjIyMjIyMgICMjICAgICAjIyAjI1xuIyMgICAgIyMgICAgICAgICMjICAgICAjIyAgICAjIyAgICAgICAjIyAgICMjICAgIyMjIyMjIyMjICMjXG4jIyAgICAjIyAgICAgICAgIyMgICAgICMjICAgICMjICAgICAgICMjICAgICMjICAjIyAgICAgIyMgIyNcbiMjICAgICMjIyMjIyMjICMjIyMgICAgIyMgICAgIyMjIyMjIyMgIyMgICAgICMjICMjICAgICAjIyAjIyMjIyMjI1xuXG4jICM2ZjM0ODllZlxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6Y3NzX2hleGFfOCcsIFwiIygje2hleGFkZWNpbWFsfXs4fSkoPyFbXFxcXGRcXFxcdy1dKVwiLCAxLCBbJ2NzcycsICdsZXNzJywgJ3N0eWwnLCAnc3R5bHVzJywgJ3Nhc3MnLCAnc2NzcyddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLCBoZXhhXSA9IG1hdGNoXG5cbiAgQGhleFJHQkEgPSBoZXhhXG5cbiMgIzZmMzQ4OWVmXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czphcmdiX2hleGFfOCcsIFwiIygje2hleGFkZWNpbWFsfXs4fSkoPyFbXFxcXGRcXFxcdy1dKVwiLCBbJyonXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXywgaGV4YV0gPSBtYXRjaFxuXG4gIEBoZXhBUkdCID0gaGV4YVxuXG4jICMzNDg5ZWZcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOmNzc19oZXhhXzYnLCBcIiMoI3toZXhhZGVjaW1hbH17Nn0pKD8hW1xcXFxkXFxcXHctXSlcIiwgWycqJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18sIGhleGFdID0gbWF0Y2hcblxuICBAaGV4ID0gaGV4YVxuXG4jICM2ZjM0XG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czpjc3NfaGV4YV80JywgXCIoPzoje25hbWVQcmVmaXhlc30pIygje2hleGFkZWNpbWFsfXs0fSkoPyFbXFxcXGRcXFxcdy1dKVwiLCBbJyonXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXywgaGV4YV0gPSBtYXRjaFxuICBjb2xvckFzSW50ID0gY29udGV4dC5yZWFkSW50KGhleGEsIDE2KVxuXG4gIEBjb2xvckV4cHJlc3Npb24gPSBcIiMje2hleGF9XCJcbiAgQHJlZCA9IChjb2xvckFzSW50ID4+IDEyICYgMHhmKSAqIDE3XG4gIEBncmVlbiA9IChjb2xvckFzSW50ID4+IDggJiAweGYpICogMTdcbiAgQGJsdWUgPSAoY29sb3JBc0ludCA+PiA0ICYgMHhmKSAqIDE3XG4gIEBhbHBoYSA9ICgoY29sb3JBc0ludCAmIDB4ZikgKiAxNykgLyAyNTVcblxuIyAjMzhlXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czpjc3NfaGV4YV8zJywgXCIoPzoje25hbWVQcmVmaXhlc30pIygje2hleGFkZWNpbWFsfXszfSkoPyFbXFxcXGRcXFxcdy1dKVwiLCBbJyonXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXywgaGV4YV0gPSBtYXRjaFxuICBjb2xvckFzSW50ID0gY29udGV4dC5yZWFkSW50KGhleGEsIDE2KVxuXG4gIEBjb2xvckV4cHJlc3Npb24gPSBcIiMje2hleGF9XCJcbiAgQHJlZCA9IChjb2xvckFzSW50ID4+IDggJiAweGYpICogMTdcbiAgQGdyZWVuID0gKGNvbG9yQXNJbnQgPj4gNCAmIDB4ZikgKiAxN1xuICBAYmx1ZSA9IChjb2xvckFzSW50ICYgMHhmKSAqIDE3XG5cbiMgMHhhYjM0ODllZlxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6aW50X2hleGFfOCcsIFwiMHgoI3toZXhhZGVjaW1hbH17OH0pKD8hI3toZXhhZGVjaW1hbH0pXCIsIFsnKiddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLCBoZXhhXSA9IG1hdGNoXG5cbiAgQGhleEFSR0IgPSBoZXhhXG5cbiMgMHgzNDg5ZWZcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOmludF9oZXhhXzYnLCBcIjB4KCN7aGV4YWRlY2ltYWx9ezZ9KSg/ISN7aGV4YWRlY2ltYWx9KVwiLCBbJyonXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXywgaGV4YV0gPSBtYXRjaFxuXG4gIEBoZXggPSBoZXhhXG5cbiMgcmdiKDUwLDEyMCwyMDApXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czpjc3NfcmdiJywgc3RyaXAoXCJcbiAgI3tpbnNlbnNpdGl2ZSAncmdiJ30je3BzfVxcXFxzKlxuICAgICgje2ludE9yUGVyY2VudH18I3t2YXJpYWJsZXN9KVxuICAgICN7Y29tbWF9XG4gICAgKCN7aW50T3JQZXJjZW50fXwje3ZhcmlhYmxlc30pXG4gICAgI3tjb21tYX1cbiAgICAoI3tpbnRPclBlcmNlbnR9fCN7dmFyaWFibGVzfSlcbiAgI3twZX1cblwiKSwgWycqJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18scixnLGJdID0gbWF0Y2hcblxuICBAcmVkID0gY29udGV4dC5yZWFkSW50T3JQZXJjZW50KHIpXG4gIEBncmVlbiA9IGNvbnRleHQucmVhZEludE9yUGVyY2VudChnKVxuICBAYmx1ZSA9IGNvbnRleHQucmVhZEludE9yUGVyY2VudChiKVxuICBAYWxwaGEgPSAxXG5cbiMgcmdiYSg1MCwxMjAsMjAwLDAuNylcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOmNzc19yZ2JhJywgc3RyaXAoXCJcbiAgI3tpbnNlbnNpdGl2ZSAncmdiYSd9I3twc31cXFxccypcbiAgICAoI3tpbnRPclBlcmNlbnR9fCN7dmFyaWFibGVzfSlcbiAgICAje2NvbW1hfVxuICAgICgje2ludE9yUGVyY2VudH18I3t2YXJpYWJsZXN9KVxuICAgICN7Y29tbWF9XG4gICAgKCN7aW50T3JQZXJjZW50fXwje3ZhcmlhYmxlc30pXG4gICAgI3tjb21tYX1cbiAgICAoI3tmbG9hdH18I3t2YXJpYWJsZXN9KVxuICAje3BlfVxuXCIpLCBbJyonXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXyxyLGcsYixhXSA9IG1hdGNoXG5cbiAgQHJlZCA9IGNvbnRleHQucmVhZEludE9yUGVyY2VudChyKVxuICBAZ3JlZW4gPSBjb250ZXh0LnJlYWRJbnRPclBlcmNlbnQoZylcbiAgQGJsdWUgPSBjb250ZXh0LnJlYWRJbnRPclBlcmNlbnQoYilcbiAgQGFscGhhID0gY29udGV4dC5yZWFkRmxvYXQoYSlcblxuIyByZ2JhKGdyZWVuLDAuNylcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOnN0eWx1c19yZ2JhJywgc3RyaXAoXCJcbiAgcmdiYSN7cHN9XFxcXHMqXG4gICAgKCN7bm90UXVvdGV9KVxuICAgICN7Y29tbWF9XG4gICAgKCN7ZmxvYXR9fCN7dmFyaWFibGVzfSlcbiAgI3twZX1cblwiKSwgWycqJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18sc3ViZXhwcixhXSA9IG1hdGNoXG5cbiAgYmFzZUNvbG9yID0gY29udGV4dC5yZWFkQ29sb3Ioc3ViZXhwcilcblxuICByZXR1cm4gQGludmFsaWQgPSB0cnVlIGlmIGNvbnRleHQuaXNJbnZhbGlkKGJhc2VDb2xvcilcblxuICBAcmdiID0gYmFzZUNvbG9yLnJnYlxuICBAYWxwaGEgPSBjb250ZXh0LnJlYWRGbG9hdChhKVxuXG4jIGhzbCgyMTAsNTAlLDUwJSlcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOmNzc19oc2wnLCBzdHJpcChcIlxuICAje2luc2Vuc2l0aXZlICdoc2wnfSN7cHN9XFxcXHMqXG4gICAgKCN7ZmxvYXR9fCN7dmFyaWFibGVzfSlcbiAgICAje2NvbW1hfVxuICAgICgje29wdGlvbmFsUGVyY2VudH18I3t2YXJpYWJsZXN9KVxuICAgICN7Y29tbWF9XG4gICAgKCN7b3B0aW9uYWxQZXJjZW50fXwje3ZhcmlhYmxlc30pXG4gICN7cGV9XG5cIiksIFsnY3NzJywgJ3Nhc3MnLCAnc2NzcycsICdzdHlsJywgJ3N0eWx1cyddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLGgscyxsXSA9IG1hdGNoXG5cbiAgaHNsID0gW1xuICAgIGNvbnRleHQucmVhZEludChoKVxuICAgIGNvbnRleHQucmVhZEZsb2F0KHMpXG4gICAgY29udGV4dC5yZWFkRmxvYXQobClcbiAgXVxuXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgaHNsLnNvbWUgKHYpIC0+IG5vdCB2PyBvciBpc05hTih2KVxuXG4gIEBoc2wgPSBoc2xcbiAgQGFscGhhID0gMVxuXG4jIGhzbCgyMTAsNTAlLDUwJSlcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOmxlc3NfaHNsJywgc3RyaXAoXCJcbiAgaHNsI3twc31cXFxccypcbiAgICAoI3tmbG9hdH18I3t2YXJpYWJsZXN9KVxuICAgICN7Y29tbWF9XG4gICAgKCN7ZmxvYXRPclBlcmNlbnR9fCN7dmFyaWFibGVzfSlcbiAgICAje2NvbW1hfVxuICAgICgje2Zsb2F0T3JQZXJjZW50fXwje3ZhcmlhYmxlc30pXG4gICN7cGV9XG5cIiksIFsnbGVzcyddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLGgscyxsXSA9IG1hdGNoXG5cbiAgaHNsID0gW1xuICAgIGNvbnRleHQucmVhZEludChoKVxuICAgIGNvbnRleHQucmVhZEZsb2F0T3JQZXJjZW50KHMpICogMTAwXG4gICAgY29udGV4dC5yZWFkRmxvYXRPclBlcmNlbnQobCkgKiAxMDBcbiAgXVxuXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgaHNsLnNvbWUgKHYpIC0+IG5vdCB2PyBvciBpc05hTih2KVxuXG4gIEBoc2wgPSBoc2xcbiAgQGFscGhhID0gMVxuXG4jIGhzbGEoMjEwLDUwJSw1MCUsMC43KVxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6Y3NzX2hzbGEnLCBzdHJpcChcIlxuICAje2luc2Vuc2l0aXZlICdoc2xhJ30je3BzfVxcXFxzKlxuICAgICgje2Zsb2F0fXwje3ZhcmlhYmxlc30pXG4gICAgI3tjb21tYX1cbiAgICAoI3tvcHRpb25hbFBlcmNlbnR9fCN7dmFyaWFibGVzfSlcbiAgICAje2NvbW1hfVxuICAgICgje29wdGlvbmFsUGVyY2VudH18I3t2YXJpYWJsZXN9KVxuICAgICN7Y29tbWF9XG4gICAgKCN7ZmxvYXR9fCN7dmFyaWFibGVzfSlcbiAgI3twZX1cblwiKSwgWycqJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18saCxzLGwsYV0gPSBtYXRjaFxuXG4gIGhzbCA9IFtcbiAgICBjb250ZXh0LnJlYWRJbnQoaClcbiAgICBjb250ZXh0LnJlYWRGbG9hdChzKVxuICAgIGNvbnRleHQucmVhZEZsb2F0KGwpXG4gIF1cblxuICByZXR1cm4gQGludmFsaWQgPSB0cnVlIGlmIGhzbC5zb21lICh2KSAtPiBub3Qgdj8gb3IgaXNOYU4odilcblxuICBAaHNsID0gaHNsXG4gIEBhbHBoYSA9IGNvbnRleHQucmVhZEZsb2F0KGEpXG5cbiMgaHN2KDIxMCw3MCUsOTAlKVxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6aHN2Jywgc3RyaXAoXCJcbiAgKD86I3tpbnNlbnNpdGl2ZSAnaHN2J318I3tpbnNlbnNpdGl2ZSAnaHNiJ30pI3twc31cXFxccypcbiAgICAoI3tmbG9hdH18I3t2YXJpYWJsZXN9KVxuICAgICN7Y29tbWF9XG4gICAgKCN7b3B0aW9uYWxQZXJjZW50fXwje3ZhcmlhYmxlc30pXG4gICAgI3tjb21tYX1cbiAgICAoI3tvcHRpb25hbFBlcmNlbnR9fCN7dmFyaWFibGVzfSlcbiAgI3twZX1cblwiKSwgWycqJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18saCxzLHZdID0gbWF0Y2hcblxuICBoc3YgPSBbXG4gICAgY29udGV4dC5yZWFkSW50KGgpXG4gICAgY29udGV4dC5yZWFkRmxvYXQocylcbiAgICBjb250ZXh0LnJlYWRGbG9hdCh2KVxuICBdXG5cbiAgcmV0dXJuIEBpbnZhbGlkID0gdHJ1ZSBpZiBoc3Yuc29tZSAodikgLT4gbm90IHY/IG9yIGlzTmFOKHYpXG5cbiAgQGhzdiA9IGhzdlxuICBAYWxwaGEgPSAxXG5cbiMgaHN2YSgyMTAsNzAlLDkwJSwwLjcpXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czpoc3ZhJywgc3RyaXAoXCJcbiAgKD86I3tpbnNlbnNpdGl2ZSAnaHN2YSd9fCN7aW5zZW5zaXRpdmUgJ2hzYmEnfSkje3BzfVxcXFxzKlxuICAgICgje2Zsb2F0fXwje3ZhcmlhYmxlc30pXG4gICAgI3tjb21tYX1cbiAgICAoI3tvcHRpb25hbFBlcmNlbnR9fCN7dmFyaWFibGVzfSlcbiAgICAje2NvbW1hfVxuICAgICgje29wdGlvbmFsUGVyY2VudH18I3t2YXJpYWJsZXN9KVxuICAgICN7Y29tbWF9XG4gICAgKCN7ZmxvYXR9fCN7dmFyaWFibGVzfSlcbiAgI3twZX1cblwiKSwgWycqJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18saCxzLHYsYV0gPSBtYXRjaFxuXG4gIGhzdiA9IFtcbiAgICBjb250ZXh0LnJlYWRJbnQoaClcbiAgICBjb250ZXh0LnJlYWRGbG9hdChzKVxuICAgIGNvbnRleHQucmVhZEZsb2F0KHYpXG4gIF1cblxuICByZXR1cm4gQGludmFsaWQgPSB0cnVlIGlmIGhzdi5zb21lICh2KSAtPiBub3Qgdj8gb3IgaXNOYU4odilcblxuICBAaHN2ID0gaHN2XG4gIEBhbHBoYSA9IGNvbnRleHQucmVhZEZsb2F0KGEpXG5cbiMgaGNnKDIxMCw2MCUsNTAlKVxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6aGNnJywgc3RyaXAoXCJcbiAgKD86I3tpbnNlbnNpdGl2ZSAnaGNnJ30pI3twc31cXFxccypcbiAgICAoI3tmbG9hdH18I3t2YXJpYWJsZXN9KVxuICAgICN7Y29tbWF9XG4gICAgKCN7b3B0aW9uYWxQZXJjZW50fXwje3ZhcmlhYmxlc30pXG4gICAgI3tjb21tYX1cbiAgICAoI3tvcHRpb25hbFBlcmNlbnR9fCN7dmFyaWFibGVzfSlcbiAgI3twZX1cblwiKSwgWycqJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18saCxjLGdyXSA9IG1hdGNoXG5cbiAgaGNnID0gW1xuICAgIGNvbnRleHQucmVhZEludChoKVxuICAgIGNvbnRleHQucmVhZEZsb2F0KGMpXG4gICAgY29udGV4dC5yZWFkRmxvYXQoZ3IpXG4gIF1cblxuICByZXR1cm4gQGludmFsaWQgPSB0cnVlIGlmIGhjZy5zb21lICh2KSAtPiBub3Qgdj8gb3IgaXNOYU4odilcblxuICBAaGNnID0gaGNnXG4gIEBhbHBoYSA9IDFcblxuIyBoY2dhKDIxMCw2MCUsNTAlLDAuNylcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOmhjZ2EnLCBzdHJpcChcIlxuICAoPzoje2luc2Vuc2l0aXZlICdoY2dhJ30pI3twc31cXFxccypcbiAgICAoI3tmbG9hdH18I3t2YXJpYWJsZXN9KVxuICAgICN7Y29tbWF9XG4gICAgKCN7b3B0aW9uYWxQZXJjZW50fXwje3ZhcmlhYmxlc30pXG4gICAgI3tjb21tYX1cbiAgICAoI3tvcHRpb25hbFBlcmNlbnR9fCN7dmFyaWFibGVzfSlcbiAgICAje2NvbW1hfVxuICAgICgje2Zsb2F0fXwje3ZhcmlhYmxlc30pXG4gICN7cGV9XG5cIiksIFsnKiddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLGgsYyxncixhXSA9IG1hdGNoXG5cbiAgaGNnID0gW1xuICAgIGNvbnRleHQucmVhZEludChoKVxuICAgIGNvbnRleHQucmVhZEZsb2F0KGMpXG4gICAgY29udGV4dC5yZWFkRmxvYXQoZ3IpXG4gIF1cblxuICByZXR1cm4gQGludmFsaWQgPSB0cnVlIGlmIGhjZy5zb21lICh2KSAtPiBub3Qgdj8gb3IgaXNOYU4odilcblxuICBAaGNnID0gaGNnXG4gIEBhbHBoYSA9IGNvbnRleHQucmVhZEZsb2F0KGEpXG5cbiMgdmVjNCgwLjIsIDAuNSwgMC45LCAwLjcpXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czp2ZWM0Jywgc3RyaXAoXCJcbiAgdmVjNCN7cHN9XFxcXHMqXG4gICAgKCN7ZmxvYXR9KVxuICAgICN7Y29tbWF9XG4gICAgKCN7ZmxvYXR9KVxuICAgICN7Y29tbWF9XG4gICAgKCN7ZmxvYXR9KVxuICAgICN7Y29tbWF9XG4gICAgKCN7ZmxvYXR9KVxuICAje3BlfVxuXCIpLCBbJyonXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXyxoLHMsbCxhXSA9IG1hdGNoXG5cbiAgQHJnYmEgPSBbXG4gICAgY29udGV4dC5yZWFkRmxvYXQoaCkgKiAyNTVcbiAgICBjb250ZXh0LnJlYWRGbG9hdChzKSAqIDI1NVxuICAgIGNvbnRleHQucmVhZEZsb2F0KGwpICogMjU1XG4gICAgY29udGV4dC5yZWFkRmxvYXQoYSlcbiAgXVxuXG4jIGh3YigyMTAsNDAlLDQwJSlcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOmh3YicsIHN0cmlwKFwiXG4gICN7aW5zZW5zaXRpdmUgJ2h3Yid9I3twc31cXFxccypcbiAgICAoI3tmbG9hdH18I3t2YXJpYWJsZXN9KVxuICAgICN7Y29tbWF9XG4gICAgKCN7b3B0aW9uYWxQZXJjZW50fXwje3ZhcmlhYmxlc30pXG4gICAgI3tjb21tYX1cbiAgICAoI3tvcHRpb25hbFBlcmNlbnR9fCN7dmFyaWFibGVzfSlcbiAgICAoPzoje2NvbW1hfSgje2Zsb2F0fXwje3ZhcmlhYmxlc30pKT9cbiAgI3twZX1cblwiKSwgWycqJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18saCx3LGIsYV0gPSBtYXRjaFxuXG4gIEBod2IgPSBbXG4gICAgY29udGV4dC5yZWFkSW50KGgpXG4gICAgY29udGV4dC5yZWFkRmxvYXQodylcbiAgICBjb250ZXh0LnJlYWRGbG9hdChiKVxuICBdXG4gIEBhbHBoYSA9IGlmIGE/IHRoZW4gY29udGV4dC5yZWFkRmxvYXQoYSkgZWxzZSAxXG5cbiMgY215aygwLDAuNSwxLDApXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czpjbXlrJywgc3RyaXAoXCJcbiAgI3tpbnNlbnNpdGl2ZSAnY215ayd9I3twc31cXFxccypcbiAgICAoI3tmbG9hdH18I3t2YXJpYWJsZXN9KVxuICAgICN7Y29tbWF9XG4gICAgKCN7ZmxvYXR9fCN7dmFyaWFibGVzfSlcbiAgICAje2NvbW1hfVxuICAgICgje2Zsb2F0fXwje3ZhcmlhYmxlc30pXG4gICAgI3tjb21tYX1cbiAgICAoI3tmbG9hdH18I3t2YXJpYWJsZXN9KVxuICAje3BlfVxuXCIpLCBbJyonXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXyxjLG0seSxrXSA9IG1hdGNoXG5cbiAgQGNteWsgPSBbXG4gICAgY29udGV4dC5yZWFkRmxvYXQoYylcbiAgICBjb250ZXh0LnJlYWRGbG9hdChtKVxuICAgIGNvbnRleHQucmVhZEZsb2F0KHkpXG4gICAgY29udGV4dC5yZWFkRmxvYXQoaylcbiAgXVxuXG4jIGdyYXkoNTAlKVxuIyBUaGUgcHJpb3JpdHkgaXMgc2V0IHRvIDEgdG8gbWFrZSBzdXJlIHRoYXQgaXQgYXBwZWFycyBiZWZvcmUgbmFtZWQgY29sb3JzXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czpncmF5Jywgc3RyaXAoXCJcbiAgI3tpbnNlbnNpdGl2ZSAnZ3JheSd9I3twc31cXFxccypcbiAgICAoI3tvcHRpb25hbFBlcmNlbnR9fCN7dmFyaWFibGVzfSlcbiAgICAoPzoje2NvbW1hfSgje2Zsb2F0fXwje3ZhcmlhYmxlc30pKT9cbiAgI3twZX1cIiksIDEsIFsnKiddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG5cbiAgW18scCxhXSA9IG1hdGNoXG5cbiAgcCA9IGNvbnRleHQucmVhZEZsb2F0KHApIC8gMTAwICogMjU1XG4gIEByZ2IgPSBbcCwgcCwgcF1cbiAgQGFscGhhID0gaWYgYT8gdGhlbiBjb250ZXh0LnJlYWRGbG9hdChhKSBlbHNlIDFcblxuIyBkb2RnZXJibHVlXG5jb2xvcnMgPSBPYmplY3Qua2V5cyhTVkdDb2xvcnMuYWxsQ2FzZXMpXG5jb2xvclJlZ2V4cCA9IFwiKD86I3tuYW1lUHJlZml4ZXN9KSgje2NvbG9ycy5qb2luKCd8Jyl9KVxcXFxiKD8hWyBcXFxcdF0qWy1cXFxcLjo9XFxcXChdKVwiXG5cbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOm5hbWVkX2NvbG9ycycsIGNvbG9yUmVnZXhwLCBbXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXyxuYW1lXSA9IG1hdGNoXG5cbiAgQGNvbG9yRXhwcmVzc2lvbiA9IEBuYW1lID0gbmFtZVxuICBAaGV4ID0gY29udGV4dC5TVkdDb2xvcnMuYWxsQ2FzZXNbbmFtZV0ucmVwbGFjZSgnIycsJycpXG5cbiMjICAgICMjIyMjIyMjICMjICAgICAjIyAjIyAgICAjIyAgIyMjIyMjXG4jIyAgICAjIyAgICAgICAjIyAgICAgIyMgIyMjICAgIyMgIyMgICAgIyNcbiMjICAgICMjICAgICAgICMjICAgICAjIyAjIyMjICAjIyAjI1xuIyMgICAgIyMjIyMjICAgIyMgICAgICMjICMjICMjICMjICMjXG4jIyAgICAjIyAgICAgICAjIyAgICAgIyMgIyMgICMjIyMgIyNcbiMjICAgICMjICAgICAgICMjICAgICAjIyAjIyAgICMjIyAjIyAgICAjI1xuIyMgICAgIyMgICAgICAgICMjIyMjIyMgICMjICAgICMjICAjIyMjIyNcblxuIyBkYXJrZW4oIzY2NjY2NiwgMjAlKVxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6ZGFya2VuJywgc3RyaXAoXCJcbiAgZGFya2VuI3twc31cbiAgICAoI3tub3RRdW90ZX0pXG4gICAgI3tjb21tYX1cbiAgICAoI3tvcHRpb25hbFBlcmNlbnR9fCN7dmFyaWFibGVzfSlcbiAgI3twZX1cblwiKSwgWycqJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18sIHN1YmV4cHIsIGFtb3VudF0gPSBtYXRjaFxuXG4gIGFtb3VudCA9IGNvbnRleHQucmVhZEZsb2F0KGFtb3VudClcbiAgYmFzZUNvbG9yID0gY29udGV4dC5yZWFkQ29sb3Ioc3ViZXhwcilcblxuICByZXR1cm4gQGludmFsaWQgPSB0cnVlIGlmIGNvbnRleHQuaXNJbnZhbGlkKGJhc2VDb2xvcilcblxuICBbaCxzLGxdID0gYmFzZUNvbG9yLmhzbFxuXG4gIEBoc2wgPSBbaCwgcywgY29udGV4dC5jbGFtcEludChsIC0gYW1vdW50KV1cbiAgQGFscGhhID0gYmFzZUNvbG9yLmFscGhhXG5cbiMgbGlnaHRlbigjNjY2NjY2LCAyMCUpXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czpsaWdodGVuJywgc3RyaXAoXCJcbiAgbGlnaHRlbiN7cHN9XG4gICAgKCN7bm90UXVvdGV9KVxuICAgICN7Y29tbWF9XG4gICAgKCN7b3B0aW9uYWxQZXJjZW50fXwje3ZhcmlhYmxlc30pXG4gICN7cGV9XG5cIiksIFsnKiddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLCBzdWJleHByLCBhbW91bnRdID0gbWF0Y2hcblxuICBhbW91bnQgPSBjb250ZXh0LnJlYWRGbG9hdChhbW91bnQpXG4gIGJhc2VDb2xvciA9IGNvbnRleHQucmVhZENvbG9yKHN1YmV4cHIpXG5cbiAgcmV0dXJuIEBpbnZhbGlkID0gdHJ1ZSBpZiBjb250ZXh0LmlzSW52YWxpZChiYXNlQ29sb3IpXG5cbiAgW2gscyxsXSA9IGJhc2VDb2xvci5oc2xcblxuICBAaHNsID0gW2gsIHMsIGNvbnRleHQuY2xhbXBJbnQobCArIGFtb3VudCldXG4gIEBhbHBoYSA9IGJhc2VDb2xvci5hbHBoYVxuXG4jIGZhZGUoI2ZmZmZmZiwgMC41KVxuIyBhbHBoYSgjZmZmZmZmLCAwLjUpXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czpmYWRlJywgc3RyaXAoXCJcbiAgKD86ZmFkZXxhbHBoYSkje3BzfVxuICAgICgje25vdFF1b3RlfSlcbiAgICAje2NvbW1hfVxuICAgICgje2Zsb2F0T3JQZXJjZW50fXwje3ZhcmlhYmxlc30pXG4gICN7cGV9XG5cIiksIFsnKiddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLCBzdWJleHByLCBhbW91bnRdID0gbWF0Y2hcblxuICBhbW91bnQgPSBjb250ZXh0LnJlYWRGbG9hdE9yUGVyY2VudChhbW91bnQpXG4gIGJhc2VDb2xvciA9IGNvbnRleHQucmVhZENvbG9yKHN1YmV4cHIpXG5cbiAgcmV0dXJuIEBpbnZhbGlkID0gdHJ1ZSBpZiBjb250ZXh0LmlzSW52YWxpZChiYXNlQ29sb3IpXG5cbiAgQHJnYiA9IGJhc2VDb2xvci5yZ2JcbiAgQGFscGhhID0gYW1vdW50XG5cbiMgdHJhbnNwYXJlbnRpemUoI2ZmZmZmZiwgMC41KVxuIyB0cmFuc3BhcmVudGl6ZSgjZmZmZmZmLCA1MCUpXG4jIGZhZGVvdXQoI2ZmZmZmZiwgMC41KVxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6dHJhbnNwYXJlbnRpemUnLCBzdHJpcChcIlxuICAoPzp0cmFuc3BhcmVudGl6ZXxmYWRlb3V0fGZhZGUtb3V0fGZhZGVfb3V0KSN7cHN9XG4gICAgKCN7bm90UXVvdGV9KVxuICAgICN7Y29tbWF9XG4gICAgKCN7ZmxvYXRPclBlcmNlbnR9fCN7dmFyaWFibGVzfSlcbiAgI3twZX1cblwiKSwgWycqJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18sIHN1YmV4cHIsIGFtb3VudF0gPSBtYXRjaFxuXG4gIGFtb3VudCA9IGNvbnRleHQucmVhZEZsb2F0T3JQZXJjZW50KGFtb3VudClcbiAgYmFzZUNvbG9yID0gY29udGV4dC5yZWFkQ29sb3Ioc3ViZXhwcilcblxuICByZXR1cm4gQGludmFsaWQgPSB0cnVlIGlmIGNvbnRleHQuaXNJbnZhbGlkKGJhc2VDb2xvcilcblxuICBAcmdiID0gYmFzZUNvbG9yLnJnYlxuICBAYWxwaGEgPSBjb250ZXh0LmNsYW1wKGJhc2VDb2xvci5hbHBoYSAtIGFtb3VudClcblxuIyBvcGFjaWZ5KDB4NzhmZmZmZmYsIDAuNSlcbiMgb3BhY2lmeSgweDc4ZmZmZmZmLCA1MCUpXG4jIGZhZGVpbigweDc4ZmZmZmZmLCAwLjUpXG4jIGFscGhhKDB4NzhmZmZmZmYsIDAuNSlcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOm9wYWNpZnknLCBzdHJpcChcIlxuICAoPzpvcGFjaWZ5fGZhZGVpbnxmYWRlLWlufGZhZGVfaW4pI3twc31cbiAgICAoI3tub3RRdW90ZX0pXG4gICAgI3tjb21tYX1cbiAgICAoI3tmbG9hdE9yUGVyY2VudH18I3t2YXJpYWJsZXN9KVxuICAje3BlfVxuXCIpLCBbJyonXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXywgc3ViZXhwciwgYW1vdW50XSA9IG1hdGNoXG5cbiAgYW1vdW50ID0gY29udGV4dC5yZWFkRmxvYXRPclBlcmNlbnQoYW1vdW50KVxuICBiYXNlQ29sb3IgPSBjb250ZXh0LnJlYWRDb2xvcihzdWJleHByKVxuXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgY29udGV4dC5pc0ludmFsaWQoYmFzZUNvbG9yKVxuXG4gIEByZ2IgPSBiYXNlQ29sb3IucmdiXG4gIEBhbHBoYSA9IGNvbnRleHQuY2xhbXAoYmFzZUNvbG9yLmFscGhhICsgYW1vdW50KVxuXG4jIHJlZCgjMDAwLDI1NSlcbiMgZ3JlZW4oIzAwMCwyNTUpXG4jIGJsdWUoIzAwMCwyNTUpXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czpzdHlsdXNfY29tcG9uZW50X2Z1bmN0aW9ucycsIHN0cmlwKFwiXG4gIChyZWR8Z3JlZW58Ymx1ZSkje3BzfVxuICAgICgje25vdFF1b3RlfSlcbiAgICAje2NvbW1hfVxuICAgICgje2ludH18I3t2YXJpYWJsZXN9KVxuICAje3BlfVxuXCIpLCBbJyonXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXywgY2hhbm5lbCwgc3ViZXhwciwgYW1vdW50XSA9IG1hdGNoXG5cbiAgYW1vdW50ID0gY29udGV4dC5yZWFkSW50KGFtb3VudClcbiAgYmFzZUNvbG9yID0gY29udGV4dC5yZWFkQ29sb3Ioc3ViZXhwcilcblxuICByZXR1cm4gQGludmFsaWQgPSB0cnVlIGlmIGNvbnRleHQuaXNJbnZhbGlkKGJhc2VDb2xvcilcbiAgcmV0dXJuIEBpbnZhbGlkID0gdHJ1ZSBpZiBpc05hTihhbW91bnQpXG5cbiAgQFtjaGFubmVsXSA9IGFtb3VudFxuXG4jIHRyYW5zcGFyZW50aWZ5KCM4MDgwODApXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czp0cmFuc3BhcmVudGlmeScsIHN0cmlwKFwiXG4gIHRyYW5zcGFyZW50aWZ5I3twc31cbiAgKCN7bm90UXVvdGV9KVxuICAje3BlfVxuXCIpLCBbJyonXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXywgZXhwcl0gPSBtYXRjaFxuXG4gIFt0b3AsIGJvdHRvbSwgYWxwaGFdID0gY29udGV4dC5zcGxpdChleHByKVxuXG4gIHRvcCA9IGNvbnRleHQucmVhZENvbG9yKHRvcClcbiAgYm90dG9tID0gY29udGV4dC5yZWFkQ29sb3IoYm90dG9tKVxuICBhbHBoYSA9IGNvbnRleHQucmVhZEZsb2F0T3JQZXJjZW50KGFscGhhKVxuXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgY29udGV4dC5pc0ludmFsaWQodG9wKVxuICByZXR1cm4gQGludmFsaWQgPSB0cnVlIGlmIGJvdHRvbT8gYW5kIGNvbnRleHQuaXNJbnZhbGlkKGJvdHRvbSlcblxuICBib3R0b20gPz0gbmV3IGNvbnRleHQuQ29sb3IoMjU1LDI1NSwyNTUsMSlcbiAgYWxwaGEgPSB1bmRlZmluZWQgaWYgaXNOYU4oYWxwaGEpXG5cbiAgYmVzdEFscGhhID0gWydyZWQnLCdncmVlbicsJ2JsdWUnXS5tYXAoKGNoYW5uZWwpIC0+XG4gICAgcmVzID0gKHRvcFtjaGFubmVsXSAtIChib3R0b21bY2hhbm5lbF0pKSAvICgoaWYgMCA8IHRvcFtjaGFubmVsXSAtIChib3R0b21bY2hhbm5lbF0pIHRoZW4gMjU1IGVsc2UgMCkgLSAoYm90dG9tW2NoYW5uZWxdKSlcbiAgICByZXNcbiAgKS5zb3J0KChhLCBiKSAtPiBhIDwgYilbMF1cblxuICBwcm9jZXNzQ2hhbm5lbCA9IChjaGFubmVsKSAtPlxuICAgIGlmIGJlc3RBbHBoYSBpcyAwXG4gICAgICBib3R0b21bY2hhbm5lbF1cbiAgICBlbHNlXG4gICAgICBib3R0b21bY2hhbm5lbF0gKyAodG9wW2NoYW5uZWxdIC0gKGJvdHRvbVtjaGFubmVsXSkpIC8gYmVzdEFscGhhXG5cbiAgYmVzdEFscGhhID0gYWxwaGEgaWYgYWxwaGE/XG4gIGJlc3RBbHBoYSA9IE1hdGgubWF4KE1hdGgubWluKGJlc3RBbHBoYSwgMSksIDApXG5cbiAgQHJlZCA9IHByb2Nlc3NDaGFubmVsKCdyZWQnKVxuICBAZ3JlZW4gPSBwcm9jZXNzQ2hhbm5lbCgnZ3JlZW4nKVxuICBAYmx1ZSA9IHByb2Nlc3NDaGFubmVsKCdibHVlJylcbiAgQGFscGhhID0gTWF0aC5yb3VuZChiZXN0QWxwaGEgKiAxMDApIC8gMTAwXG5cbiMgaHVlKCM4NTUsIDYwZGVnKVxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6aHVlJywgc3RyaXAoXCJcbiAgaHVlI3twc31cbiAgICAoI3tub3RRdW90ZX0pXG4gICAgI3tjb21tYX1cbiAgICAoI3tpbnR9ZGVnfCN7dmFyaWFibGVzfSlcbiAgI3twZX1cblwiKSwgWycqJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18sIHN1YmV4cHIsIGFtb3VudF0gPSBtYXRjaFxuXG4gIGFtb3VudCA9IGNvbnRleHQucmVhZEZsb2F0KGFtb3VudClcbiAgYmFzZUNvbG9yID0gY29udGV4dC5yZWFkQ29sb3Ioc3ViZXhwcilcblxuICByZXR1cm4gQGludmFsaWQgPSB0cnVlIGlmIGNvbnRleHQuaXNJbnZhbGlkKGJhc2VDb2xvcilcbiAgcmV0dXJuIEBpbnZhbGlkID0gdHJ1ZSBpZiBpc05hTihhbW91bnQpXG5cbiAgW2gscyxsXSA9IGJhc2VDb2xvci5oc2xcblxuICBAaHNsID0gW2Ftb3VudCAlIDM2MCwgcywgbF1cbiAgQGFscGhhID0gYmFzZUNvbG9yLmFscGhhXG5cbiMgc2F0dXJhdGlvbigjODU1LCA2MGRlZylcbiMgbGlnaHRuZXNzKCM4NTUsIDYwZGVnKVxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6c3R5bHVzX3NsX2NvbXBvbmVudF9mdW5jdGlvbnMnLCBzdHJpcChcIlxuICAoc2F0dXJhdGlvbnxsaWdodG5lc3MpI3twc31cbiAgICAoI3tub3RRdW90ZX0pXG4gICAgI3tjb21tYX1cbiAgICAoI3tpbnRPclBlcmNlbnR9fCN7dmFyaWFibGVzfSlcbiAgI3twZX1cblwiKSwgWycqJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18sIGNoYW5uZWwsIHN1YmV4cHIsIGFtb3VudF0gPSBtYXRjaFxuXG4gIGFtb3VudCA9IGNvbnRleHQucmVhZEludChhbW91bnQpXG4gIGJhc2VDb2xvciA9IGNvbnRleHQucmVhZENvbG9yKHN1YmV4cHIpXG5cbiAgcmV0dXJuIEBpbnZhbGlkID0gdHJ1ZSBpZiBjb250ZXh0LmlzSW52YWxpZChiYXNlQ29sb3IpXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgaXNOYU4oYW1vdW50KVxuXG4gIGJhc2VDb2xvcltjaGFubmVsXSA9IGFtb3VudFxuICBAcmdiYSA9IGJhc2VDb2xvci5yZ2JhXG5cbiMgYWRqdXN0LWh1ZSgjODU1LCA2MGRlZylcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOmFkanVzdC1odWUnLCBzdHJpcChcIlxuICBhZGp1c3QtaHVlI3twc31cbiAgICAoI3tub3RRdW90ZX0pXG4gICAgI3tjb21tYX1cbiAgICAoLT8je2ludH1kZWd8I3t2YXJpYWJsZXN9fC0/I3tvcHRpb25hbFBlcmNlbnR9KVxuICAje3BlfVxuXCIpLCBbJyonXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXywgc3ViZXhwciwgYW1vdW50XSA9IG1hdGNoXG5cbiAgYW1vdW50ID0gY29udGV4dC5yZWFkRmxvYXQoYW1vdW50KVxuICBiYXNlQ29sb3IgPSBjb250ZXh0LnJlYWRDb2xvcihzdWJleHByKVxuXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgY29udGV4dC5pc0ludmFsaWQoYmFzZUNvbG9yKVxuXG4gIFtoLHMsbF0gPSBiYXNlQ29sb3IuaHNsXG5cbiAgQGhzbCA9IFsoaCArIGFtb3VudCkgJSAzNjAsIHMsIGxdXG4gIEBhbHBoYSA9IGJhc2VDb2xvci5hbHBoYVxuXG4jIG1peCgjZjAwLCAjMDBGLCAyNSUpXG4jIG1peCgjZjAwLCAjMDBGKVxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6bWl4JywgXCJtaXgje3BzfSgje25vdFF1b3RlfSkje3BlfVwiLCBbJyonXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXywgZXhwcl0gPSBtYXRjaFxuXG4gIFtjb2xvcjEsIGNvbG9yMiwgYW1vdW50XSA9IGNvbnRleHQuc3BsaXQoZXhwcilcblxuICBpZiBhbW91bnQ/XG4gICAgYW1vdW50ID0gY29udGV4dC5yZWFkRmxvYXRPclBlcmNlbnQoYW1vdW50KVxuICBlbHNlXG4gICAgYW1vdW50ID0gMC41XG5cbiAgYmFzZUNvbG9yMSA9IGNvbnRleHQucmVhZENvbG9yKGNvbG9yMSlcbiAgYmFzZUNvbG9yMiA9IGNvbnRleHQucmVhZENvbG9yKGNvbG9yMilcblxuICByZXR1cm4gQGludmFsaWQgPSB0cnVlIGlmIGNvbnRleHQuaXNJbnZhbGlkKGJhc2VDb2xvcjEpIG9yIGNvbnRleHQuaXNJbnZhbGlkKGJhc2VDb2xvcjIpXG5cbiAge0ByZ2JhfSA9IGNvbnRleHQubWl4Q29sb3JzKGJhc2VDb2xvcjEsIGJhc2VDb2xvcjIsIGFtb3VudClcblxuIyB0aW50KHJlZCwgNTAlKVxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6c3R5bHVzX3RpbnQnLCBzdHJpcChcIlxuICB0aW50I3twc31cbiAgICAoI3tub3RRdW90ZX0pXG4gICAgI3tjb21tYX1cbiAgICAoI3tmbG9hdE9yUGVyY2VudH18I3t2YXJpYWJsZXN9KVxuICAje3BlfVxuXCIpLCBbJ3N0eWwnLCAnc3R5bHVzJywgJ2xlc3MnXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXywgc3ViZXhwciwgYW1vdW50XSA9IG1hdGNoXG5cbiAgYW1vdW50ID0gY29udGV4dC5yZWFkRmxvYXRPclBlcmNlbnQoYW1vdW50KVxuICBiYXNlQ29sb3IgPSBjb250ZXh0LnJlYWRDb2xvcihzdWJleHByKVxuXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgY29udGV4dC5pc0ludmFsaWQoYmFzZUNvbG9yKVxuXG4gIHdoaXRlID0gbmV3IGNvbnRleHQuQ29sb3IoMjU1LCAyNTUsIDI1NSlcblxuICBAcmdiYSA9IGNvbnRleHQubWl4Q29sb3JzKHdoaXRlLCBiYXNlQ29sb3IsIGFtb3VudCkucmdiYVxuXG4jIHNoYWRlKHJlZCwgNTAlKVxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6c3R5bHVzX3NoYWRlJywgc3RyaXAoXCJcbiAgc2hhZGUje3BzfVxuICAgICgje25vdFF1b3RlfSlcbiAgICAje2NvbW1hfVxuICAgICgje2Zsb2F0T3JQZXJjZW50fXwje3ZhcmlhYmxlc30pXG4gICN7cGV9XG5cIiksIFsnc3R5bCcsICdzdHlsdXMnLCAnbGVzcyddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLCBzdWJleHByLCBhbW91bnRdID0gbWF0Y2hcblxuICBhbW91bnQgPSBjb250ZXh0LnJlYWRGbG9hdE9yUGVyY2VudChhbW91bnQpXG4gIGJhc2VDb2xvciA9IGNvbnRleHQucmVhZENvbG9yKHN1YmV4cHIpXG5cbiAgcmV0dXJuIEBpbnZhbGlkID0gdHJ1ZSBpZiBjb250ZXh0LmlzSW52YWxpZChiYXNlQ29sb3IpXG5cbiAgYmxhY2sgPSBuZXcgY29udGV4dC5Db2xvcigwLDAsMClcblxuICBAcmdiYSA9IGNvbnRleHQubWl4Q29sb3JzKGJsYWNrLCBiYXNlQ29sb3IsIGFtb3VudCkucmdiYVxuXG4jIHRpbnQocmVkLCA1MCUpXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czpjb21wYXNzX3RpbnQnLCBzdHJpcChcIlxuICB0aW50I3twc31cbiAgICAoI3tub3RRdW90ZX0pXG4gICAgI3tjb21tYX1cbiAgICAoI3tmbG9hdE9yUGVyY2VudH18I3t2YXJpYWJsZXN9KVxuICAje3BlfVxuXCIpLCBbJ3Nhc3M6Y29tcGFzcycsICdzY3NzOmNvbXBhc3MnXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXywgc3ViZXhwciwgYW1vdW50XSA9IG1hdGNoXG5cbiAgYW1vdW50ID0gY29udGV4dC5yZWFkRmxvYXRPclBlcmNlbnQoYW1vdW50KVxuICBiYXNlQ29sb3IgPSBjb250ZXh0LnJlYWRDb2xvcihzdWJleHByKVxuXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgY29udGV4dC5pc0ludmFsaWQoYmFzZUNvbG9yKVxuXG4gIHdoaXRlID0gbmV3IGNvbnRleHQuQ29sb3IoMjU1LCAyNTUsIDI1NSlcblxuICBAcmdiYSA9IGNvbnRleHQubWl4Q29sb3JzKGJhc2VDb2xvciwgd2hpdGUsIGFtb3VudCkucmdiYVxuXG4jIHNoYWRlKHJlZCwgNTAlKVxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6Y29tcGFzc19zaGFkZScsIHN0cmlwKFwiXG4gIHNoYWRlI3twc31cbiAgICAoI3tub3RRdW90ZX0pXG4gICAgI3tjb21tYX1cbiAgICAoI3tmbG9hdE9yUGVyY2VudH18I3t2YXJpYWJsZXN9KVxuICAje3BlfVxuXCIpLCBbJ3Nhc3M6Y29tcGFzcycsICdzY3NzOmNvbXBhc3MnXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXywgc3ViZXhwciwgYW1vdW50XSA9IG1hdGNoXG5cbiAgYW1vdW50ID0gY29udGV4dC5yZWFkRmxvYXRPclBlcmNlbnQoYW1vdW50KVxuICBiYXNlQ29sb3IgPSBjb250ZXh0LnJlYWRDb2xvcihzdWJleHByKVxuXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgY29udGV4dC5pc0ludmFsaWQoYmFzZUNvbG9yKVxuXG4gIGJsYWNrID0gbmV3IGNvbnRleHQuQ29sb3IoMCwwLDApXG5cbiAgQHJnYmEgPSBjb250ZXh0Lm1peENvbG9ycyhiYXNlQ29sb3IsIGJsYWNrLCBhbW91bnQpLnJnYmFcblxuIyB0aW50KHJlZCwgNTAlKVxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6Ym91cmJvbl90aW50Jywgc3RyaXAoXCJcbiAgdGludCN7cHN9XG4gICAgKCN7bm90UXVvdGV9KVxuICAgICN7Y29tbWF9XG4gICAgKCN7ZmxvYXRPclBlcmNlbnR9fCN7dmFyaWFibGVzfSlcbiAgI3twZX1cblwiKSwgWydzYXNzOmJvdXJib24nLCAnc2Nzczpib3VyYm9uJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18sIHN1YmV4cHIsIGFtb3VudF0gPSBtYXRjaFxuXG4gIGFtb3VudCA9IGNvbnRleHQucmVhZEZsb2F0T3JQZXJjZW50KGFtb3VudClcbiAgYmFzZUNvbG9yID0gY29udGV4dC5yZWFkQ29sb3Ioc3ViZXhwcilcblxuICByZXR1cm4gQGludmFsaWQgPSB0cnVlIGlmIGNvbnRleHQuaXNJbnZhbGlkKGJhc2VDb2xvcilcblxuICB3aGl0ZSA9IG5ldyBjb250ZXh0LkNvbG9yKDI1NSwgMjU1LCAyNTUpXG5cbiAgQHJnYmEgPSBjb250ZXh0Lm1peENvbG9ycyh3aGl0ZSwgYmFzZUNvbG9yLCBhbW91bnQpLnJnYmFcblxuIyBzaGFkZShyZWQsIDUwJSlcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOmJvdXJib25fc2hhZGUnLCBzdHJpcChcIlxuICBzaGFkZSN7cHN9XG4gICAgKCN7bm90UXVvdGV9KVxuICAgICN7Y29tbWF9XG4gICAgKCN7ZmxvYXRPclBlcmNlbnR9fCN7dmFyaWFibGVzfSlcbiAgI3twZX1cblwiKSwgWydzYXNzOmJvdXJib24nLCAnc2Nzczpib3VyYm9uJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18sIHN1YmV4cHIsIGFtb3VudF0gPSBtYXRjaFxuXG4gIGFtb3VudCA9IGNvbnRleHQucmVhZEZsb2F0T3JQZXJjZW50KGFtb3VudClcbiAgYmFzZUNvbG9yID0gY29udGV4dC5yZWFkQ29sb3Ioc3ViZXhwcilcblxuICByZXR1cm4gQGludmFsaWQgPSB0cnVlIGlmIGNvbnRleHQuaXNJbnZhbGlkKGJhc2VDb2xvcilcblxuICBibGFjayA9IG5ldyBjb250ZXh0LkNvbG9yKDAsMCwwKVxuXG4gIEByZ2JhID0gY29udGV4dC5taXhDb2xvcnMoYmxhY2ssIGJhc2VDb2xvciwgYW1vdW50KS5yZ2JhXG5cbiMgZGVzYXR1cmF0ZSgjODU1LCAyMCUpXG4jIGRlc2F0dXJhdGUoIzg1NSwgMC4yKVxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6ZGVzYXR1cmF0ZScsIFwiZGVzYXR1cmF0ZSN7cHN9KCN7bm90UXVvdGV9KSN7Y29tbWF9KCN7ZmxvYXRPclBlcmNlbnR9fCN7dmFyaWFibGVzfSkje3BlfVwiLCBbJyonXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXywgc3ViZXhwciwgYW1vdW50XSA9IG1hdGNoXG5cbiAgYW1vdW50ID0gY29udGV4dC5yZWFkRmxvYXRPclBlcmNlbnQoYW1vdW50KVxuICBiYXNlQ29sb3IgPSBjb250ZXh0LnJlYWRDb2xvcihzdWJleHByKVxuXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgY29udGV4dC5pc0ludmFsaWQoYmFzZUNvbG9yKVxuXG4gIFtoLHMsbF0gPSBiYXNlQ29sb3IuaHNsXG5cbiAgQGhzbCA9IFtoLCBjb250ZXh0LmNsYW1wSW50KHMgLSBhbW91bnQgKiAxMDApLCBsXVxuICBAYWxwaGEgPSBiYXNlQ29sb3IuYWxwaGFcblxuIyBzYXR1cmF0ZSgjODU1LCAyMCUpXG4jIHNhdHVyYXRlKCM4NTUsIDAuMilcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOnNhdHVyYXRlJywgc3RyaXAoXCJcbiAgc2F0dXJhdGUje3BzfVxuICAgICgje25vdFF1b3RlfSlcbiAgICAje2NvbW1hfVxuICAgICgje2Zsb2F0T3JQZXJjZW50fXwje3ZhcmlhYmxlc30pXG4gICN7cGV9XG5cIiksIFsnKiddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLCBzdWJleHByLCBhbW91bnRdID0gbWF0Y2hcblxuICBhbW91bnQgPSBjb250ZXh0LnJlYWRGbG9hdE9yUGVyY2VudChhbW91bnQpXG4gIGJhc2VDb2xvciA9IGNvbnRleHQucmVhZENvbG9yKHN1YmV4cHIpXG5cbiAgcmV0dXJuIEBpbnZhbGlkID0gdHJ1ZSBpZiBjb250ZXh0LmlzSW52YWxpZChiYXNlQ29sb3IpXG5cbiAgW2gscyxsXSA9IGJhc2VDb2xvci5oc2xcblxuICBAaHNsID0gW2gsIGNvbnRleHQuY2xhbXBJbnQocyArIGFtb3VudCAqIDEwMCksIGxdXG4gIEBhbHBoYSA9IGJhc2VDb2xvci5hbHBoYVxuXG4jIGdyYXlzY2FsZShyZWQpXG4jIGdyZXlzY2FsZShyZWQpXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czpncmF5c2NhbGUnLCBcImdyKD86YXxlKXlzY2FsZSN7cHN9KCN7bm90UXVvdGV9KSN7cGV9XCIsIFsnKiddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLCBzdWJleHByXSA9IG1hdGNoXG5cbiAgYmFzZUNvbG9yID0gY29udGV4dC5yZWFkQ29sb3Ioc3ViZXhwcilcblxuICByZXR1cm4gQGludmFsaWQgPSB0cnVlIGlmIGNvbnRleHQuaXNJbnZhbGlkKGJhc2VDb2xvcilcblxuICBbaCxzLGxdID0gYmFzZUNvbG9yLmhzbFxuXG4gIEBoc2wgPSBbaCwgMCwgbF1cbiAgQGFscGhhID0gYmFzZUNvbG9yLmFscGhhXG5cbiMgaW52ZXJ0KGdyZWVuKVxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6aW52ZXJ0JywgXCJpbnZlcnQje3BzfSgje25vdFF1b3RlfSkje3BlfVwiLCBbJyonXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXywgc3ViZXhwcl0gPSBtYXRjaFxuXG4gIGJhc2VDb2xvciA9IGNvbnRleHQucmVhZENvbG9yKHN1YmV4cHIpXG5cbiAgcmV0dXJuIEBpbnZhbGlkID0gdHJ1ZSBpZiBjb250ZXh0LmlzSW52YWxpZChiYXNlQ29sb3IpXG5cbiAgW3IsZyxiXSA9IGJhc2VDb2xvci5yZ2JcblxuICBAcmdiID0gWzI1NSAtIHIsIDI1NSAtIGcsIDI1NSAtIGJdXG4gIEBhbHBoYSA9IGJhc2VDb2xvci5hbHBoYVxuXG4jIGNvbXBsZW1lbnQoZ3JlZW4pXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czpjb21wbGVtZW50JywgXCJjb21wbGVtZW50I3twc30oI3tub3RRdW90ZX0pI3twZX1cIiwgWycqJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18sIHN1YmV4cHJdID0gbWF0Y2hcblxuICBiYXNlQ29sb3IgPSBjb250ZXh0LnJlYWRDb2xvcihzdWJleHByKVxuXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgY29udGV4dC5pc0ludmFsaWQoYmFzZUNvbG9yKVxuXG4gIFtoLHMsbF0gPSBiYXNlQ29sb3IuaHNsXG5cbiAgQGhzbCA9IFsoaCArIDE4MCkgJSAzNjAsIHMsIGxdXG4gIEBhbHBoYSA9IGJhc2VDb2xvci5hbHBoYVxuXG4jIHNwaW4oZ3JlZW4sIDIwKVxuIyBzcGluKGdyZWVuLCAyMGRlZylcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOnNwaW4nLCBzdHJpcChcIlxuICBzcGluI3twc31cbiAgICAoI3tub3RRdW90ZX0pXG4gICAgI3tjb21tYX1cbiAgICAoLT8oI3tpbnR9KShkZWcpP3wje3ZhcmlhYmxlc30pXG4gICN7cGV9XG5cIiksIFsnKiddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLCBzdWJleHByLCBhbmdsZV0gPSBtYXRjaFxuXG4gIGJhc2VDb2xvciA9IGNvbnRleHQucmVhZENvbG9yKHN1YmV4cHIpXG4gIGFuZ2xlID0gY29udGV4dC5yZWFkSW50KGFuZ2xlKVxuXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgY29udGV4dC5pc0ludmFsaWQoYmFzZUNvbG9yKVxuXG4gIFtoLHMsbF0gPSBiYXNlQ29sb3IuaHNsXG5cbiAgQGhzbCA9IFsoMzYwICsgaCArIGFuZ2xlKSAlIDM2MCwgcywgbF1cbiAgQGFscGhhID0gYmFzZUNvbG9yLmFscGhhXG5cbiMgY29udHJhc3QoIzY2NjY2NiwgIzExMTExMSwgIzk5OTk5OSwgdGhyZXNob2xkKVxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6Y29udHJhc3Rfbl9hcmd1bWVudHMnLCBzdHJpcChcIlxuICBjb250cmFzdCN7cHN9XG4gICAgKFxuICAgICAgI3tub3RRdW90ZX1cbiAgICAgICN7Y29tbWF9XG4gICAgICAje25vdFF1b3RlfVxuICAgIClcbiAgI3twZX1cblwiKSwgWycqJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18sIGV4cHJdID0gbWF0Y2hcblxuICBbYmFzZSwgZGFyaywgbGlnaHQsIHRocmVzaG9sZF0gPSBjb250ZXh0LnNwbGl0KGV4cHIpXG5cbiAgYmFzZUNvbG9yID0gY29udGV4dC5yZWFkQ29sb3IoYmFzZSlcbiAgZGFyayA9IGNvbnRleHQucmVhZENvbG9yKGRhcmspXG4gIGxpZ2h0ID0gY29udGV4dC5yZWFkQ29sb3IobGlnaHQpXG4gIHRocmVzaG9sZCA9IGNvbnRleHQucmVhZFBlcmNlbnQodGhyZXNob2xkKSBpZiB0aHJlc2hvbGQ/XG5cbiAgcmV0dXJuIEBpbnZhbGlkID0gdHJ1ZSBpZiBjb250ZXh0LmlzSW52YWxpZChiYXNlQ29sb3IpXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgZGFyaz8uaW52YWxpZFxuICByZXR1cm4gQGludmFsaWQgPSB0cnVlIGlmIGxpZ2h0Py5pbnZhbGlkXG5cbiAgcmVzID0gY29udGV4dC5jb250cmFzdChiYXNlQ29sb3IsIGRhcmssIGxpZ2h0KVxuXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgY29udGV4dC5pc0ludmFsaWQocmVzKVxuXG4gIHtAcmdifSA9IGNvbnRleHQuY29udHJhc3QoYmFzZUNvbG9yLCBkYXJrLCBsaWdodCwgdGhyZXNob2xkKVxuXG4jIGNvbnRyYXN0KCM2NjY2NjYpXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czpjb250cmFzdF8xX2FyZ3VtZW50Jywgc3RyaXAoXCJcbiAgY29udHJhc3Qje3BzfVxuICAgICgje25vdFF1b3RlfSlcbiAgI3twZX1cblwiKSwgWycqJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18sIHN1YmV4cHJdID0gbWF0Y2hcblxuICBiYXNlQ29sb3IgPSBjb250ZXh0LnJlYWRDb2xvcihzdWJleHByKVxuXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgY29udGV4dC5pc0ludmFsaWQoYmFzZUNvbG9yKVxuXG4gIHtAcmdifSA9IGNvbnRleHQuY29udHJhc3QoYmFzZUNvbG9yKVxuXG4jIGNvbG9yKGdyZWVuIHRpbnQoNTAlKSlcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOmNzc19jb2xvcl9mdW5jdGlvbicsIFwiKD86I3tuYW1lUHJlZml4ZXN9KSgje2luc2Vuc2l0aXZlICdjb2xvcid9I3twc30oI3tub3RRdW90ZX0pI3twZX0pXCIsIFsnY3NzJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgdHJ5XG4gICAgW18sZXhwcl0gPSBtYXRjaFxuICAgIGZvciBrLHYgb2YgY29udGV4dC52YXJzXG4gICAgICBleHByID0gZXhwci5yZXBsYWNlKC8vL1xuICAgICAgICAje2sucmVwbGFjZSgvXFwoL2csICdcXFxcKCcpLnJlcGxhY2UoL1xcKS9nLCAnXFxcXCknKX1cbiAgICAgIC8vL2csIHYudmFsdWUpXG5cbiAgICBjc3NDb2xvciA9IHJlcXVpcmUgJ2Nzcy1jb2xvci1mdW5jdGlvbidcbiAgICByZ2JhID0gY3NzQ29sb3IuY29udmVydChleHByLnRvTG93ZXJDYXNlKCkpXG4gICAgQHJnYmEgPSBjb250ZXh0LnJlYWRDb2xvcihyZ2JhKS5yZ2JhXG4gICAgQGNvbG9yRXhwcmVzc2lvbiA9IGV4cHJcbiAgY2F0Y2ggZVxuICAgIEBpbnZhbGlkID0gdHJ1ZVxuXG4jIGFkanVzdC1jb2xvcihyZWQsICRsaWdodG5lc3M6IDMwJSlcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOnNhc3NfYWRqdXN0X2NvbG9yJywgXCJhZGp1c3QtY29sb3Ije3BzfSgje25vdFF1b3RlfSkje3BlfVwiLCAxLCBbJyonXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXywgc3ViZXhwcl0gPSBtYXRjaFxuICByZXMgPSBjb250ZXh0LnNwbGl0KHN1YmV4cHIpXG4gIHN1YmplY3QgPSByZXNbMF1cbiAgcGFyYW1zID0gcmVzLnNsaWNlKDEpXG5cbiAgYmFzZUNvbG9yID0gY29udGV4dC5yZWFkQ29sb3Ioc3ViamVjdClcblxuICByZXR1cm4gQGludmFsaWQgPSB0cnVlIGlmIGNvbnRleHQuaXNJbnZhbGlkKGJhc2VDb2xvcilcblxuICBmb3IgcGFyYW0gaW4gcGFyYW1zXG4gICAgY29udGV4dC5yZWFkUGFyYW0gcGFyYW0sIChuYW1lLCB2YWx1ZSkgLT5cbiAgICAgIGJhc2VDb2xvcltuYW1lXSArPSBjb250ZXh0LnJlYWRGbG9hdCh2YWx1ZSlcblxuICBAcmdiYSA9IGJhc2VDb2xvci5yZ2JhXG5cbiMgc2NhbGUtY29sb3IocmVkLCAkbGlnaHRuZXNzOiAzMCUpXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czpzYXNzX3NjYWxlX2NvbG9yJywgXCJzY2FsZS1jb2xvciN7cHN9KCN7bm90UXVvdGV9KSN7cGV9XCIsIDEsIFsnKiddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIE1BWF9QRVJfQ09NUE9ORU5UID1cbiAgICByZWQ6IDI1NVxuICAgIGdyZWVuOiAyNTVcbiAgICBibHVlOiAyNTVcbiAgICBhbHBoYTogMVxuICAgIGh1ZTogMzYwXG4gICAgc2F0dXJhdGlvbjogMTAwXG4gICAgbGlnaHRuZXNzOiAxMDBcblxuICBbXywgc3ViZXhwcl0gPSBtYXRjaFxuICByZXMgPSBjb250ZXh0LnNwbGl0KHN1YmV4cHIpXG4gIHN1YmplY3QgPSByZXNbMF1cbiAgcGFyYW1zID0gcmVzLnNsaWNlKDEpXG5cbiAgYmFzZUNvbG9yID0gY29udGV4dC5yZWFkQ29sb3Ioc3ViamVjdClcblxuICByZXR1cm4gQGludmFsaWQgPSB0cnVlIGlmIGNvbnRleHQuaXNJbnZhbGlkKGJhc2VDb2xvcilcblxuICBmb3IgcGFyYW0gaW4gcGFyYW1zXG4gICAgY29udGV4dC5yZWFkUGFyYW0gcGFyYW0sIChuYW1lLCB2YWx1ZSkgLT5cbiAgICAgIHZhbHVlID0gY29udGV4dC5yZWFkRmxvYXQodmFsdWUpIC8gMTAwXG5cbiAgICAgIHJlc3VsdCA9IGlmIHZhbHVlID4gMFxuICAgICAgICBkaWYgPSBNQVhfUEVSX0NPTVBPTkVOVFtuYW1lXSAtIGJhc2VDb2xvcltuYW1lXVxuICAgICAgICByZXN1bHQgPSBiYXNlQ29sb3JbbmFtZV0gKyBkaWYgKiB2YWx1ZVxuICAgICAgZWxzZVxuICAgICAgICByZXN1bHQgPSBiYXNlQ29sb3JbbmFtZV0gKiAoMSArIHZhbHVlKVxuXG4gICAgICBiYXNlQ29sb3JbbmFtZV0gPSByZXN1bHRcblxuICBAcmdiYSA9IGJhc2VDb2xvci5yZ2JhXG5cbiMgY2hhbmdlLWNvbG9yKHJlZCwgJGxpZ2h0bmVzczogMzAlKVxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6c2Fzc19jaGFuZ2VfY29sb3InLCBcImNoYW5nZS1jb2xvciN7cHN9KCN7bm90UXVvdGV9KSN7cGV9XCIsIDEsIFsnKiddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLCBzdWJleHByXSA9IG1hdGNoXG4gIHJlcyA9IGNvbnRleHQuc3BsaXQoc3ViZXhwcilcbiAgc3ViamVjdCA9IHJlc1swXVxuICBwYXJhbXMgPSByZXMuc2xpY2UoMSlcblxuICBiYXNlQ29sb3IgPSBjb250ZXh0LnJlYWRDb2xvcihzdWJqZWN0KVxuXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgY29udGV4dC5pc0ludmFsaWQoYmFzZUNvbG9yKVxuXG4gIGZvciBwYXJhbSBpbiBwYXJhbXNcbiAgICBjb250ZXh0LnJlYWRQYXJhbSBwYXJhbSwgKG5hbWUsIHZhbHVlKSAtPlxuICAgICAgYmFzZUNvbG9yW25hbWVdID0gY29udGV4dC5yZWFkRmxvYXQodmFsdWUpXG5cbiAgQHJnYmEgPSBiYXNlQ29sb3IucmdiYVxuXG4jIGJsZW5kKHJnYmEoI0ZGREUwMCwuNDIpLCAweDE5QzI2MSlcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOnN0eWx1c19ibGVuZCcsIHN0cmlwKFwiXG4gIGJsZW5kI3twc31cbiAgICAoXG4gICAgICAje25vdFF1b3RlfVxuICAgICAgI3tjb21tYX1cbiAgICAgICN7bm90UXVvdGV9XG4gICAgKVxuICAje3BlfVxuXCIpLCBbJyonXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXywgZXhwcl0gPSBtYXRjaFxuXG4gIFtjb2xvcjEsIGNvbG9yMl0gPSBjb250ZXh0LnNwbGl0KGV4cHIpXG5cbiAgYmFzZUNvbG9yMSA9IGNvbnRleHQucmVhZENvbG9yKGNvbG9yMSlcbiAgYmFzZUNvbG9yMiA9IGNvbnRleHQucmVhZENvbG9yKGNvbG9yMilcblxuICByZXR1cm4gQGludmFsaWQgPSB0cnVlIGlmIGNvbnRleHQuaXNJbnZhbGlkKGJhc2VDb2xvcjEpIG9yIGNvbnRleHQuaXNJbnZhbGlkKGJhc2VDb2xvcjIpXG5cbiAgQHJnYmEgPSBbXG4gICAgYmFzZUNvbG9yMS5yZWQgKiBiYXNlQ29sb3IxLmFscGhhICsgYmFzZUNvbG9yMi5yZWQgKiAoMSAtIGJhc2VDb2xvcjEuYWxwaGEpXG4gICAgYmFzZUNvbG9yMS5ncmVlbiAqIGJhc2VDb2xvcjEuYWxwaGEgKyBiYXNlQ29sb3IyLmdyZWVuICogKDEgLSBiYXNlQ29sb3IxLmFscGhhKVxuICAgIGJhc2VDb2xvcjEuYmx1ZSAqIGJhc2VDb2xvcjEuYWxwaGEgKyBiYXNlQ29sb3IyLmJsdWUgKiAoMSAtIGJhc2VDb2xvcjEuYWxwaGEpXG4gICAgYmFzZUNvbG9yMS5hbHBoYSArIGJhc2VDb2xvcjIuYWxwaGEgLSBiYXNlQ29sb3IxLmFscGhhICogYmFzZUNvbG9yMi5hbHBoYVxuICBdXG5cbiMgQ29sb3IoNTAsMTIwLDIwMCwyNTUpXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czpsdWFfcmdiYScsIHN0cmlwKFwiXG4gICg/OiN7bmFtZVByZWZpeGVzfSlDb2xvciN7cHN9XFxcXHMqXG4gICAgKCN7aW50fXwje3ZhcmlhYmxlc30pXG4gICAgI3tjb21tYX1cbiAgICAoI3tpbnR9fCN7dmFyaWFibGVzfSlcbiAgICAje2NvbW1hfVxuICAgICgje2ludH18I3t2YXJpYWJsZXN9KVxuICAgICN7Y29tbWF9XG4gICAgKCN7aW50fXwje3ZhcmlhYmxlc30pXG4gICN7cGV9XG5cIiksIFsnbHVhJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18scixnLGIsYV0gPSBtYXRjaFxuXG4gIEByZWQgPSBjb250ZXh0LnJlYWRJbnQocilcbiAgQGdyZWVuID0gY29udGV4dC5yZWFkSW50KGcpXG4gIEBibHVlID0gY29udGV4dC5yZWFkSW50KGIpXG4gIEBhbHBoYSA9IGNvbnRleHQucmVhZEludChhKSAvIDI1NVxuXG4jIyAgICAjIyMjIyMjIyAgIyMgICAgICAgIyMjIyMjIyMgIyMgICAgIyMgIyMjIyMjIyNcbiMjICAgICMjICAgICAjIyAjIyAgICAgICAjIyAgICAgICAjIyMgICAjIyAjIyAgICAgIyNcbiMjICAgICMjICAgICAjIyAjIyAgICAgICAjIyAgICAgICAjIyMjICAjIyAjIyAgICAgIyNcbiMjICAgICMjIyMjIyMjICAjIyAgICAgICAjIyMjIyMgICAjIyAjIyAjIyAjIyAgICAgIyNcbiMjICAgICMjICAgICAjIyAjIyAgICAgICAjIyAgICAgICAjIyAgIyMjIyAjIyAgICAgIyNcbiMjICAgICMjICAgICAjIyAjIyAgICAgICAjIyAgICAgICAjIyAgICMjIyAjIyAgICAgIyNcbiMjICAgICMjIyMjIyMjICAjIyMjIyMjIyAjIyMjIyMjIyAjIyAgICAjIyAjIyMjIyMjI1xuXG4jIG11bHRpcGx5KCNmMDAsICMwMEYpXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czptdWx0aXBseScsIHN0cmlwKFwiXG4gIG11bHRpcGx5I3twc31cbiAgICAoXG4gICAgICAje25vdFF1b3RlfVxuICAgICAgI3tjb21tYX1cbiAgICAgICN7bm90UXVvdGV9XG4gICAgKVxuICAje3BlfVxuXCIpLCBbJyonXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXywgZXhwcl0gPSBtYXRjaFxuXG4gIFtjb2xvcjEsIGNvbG9yMl0gPSBjb250ZXh0LnNwbGl0KGV4cHIpXG5cbiAgYmFzZUNvbG9yMSA9IGNvbnRleHQucmVhZENvbG9yKGNvbG9yMSlcbiAgYmFzZUNvbG9yMiA9IGNvbnRleHQucmVhZENvbG9yKGNvbG9yMilcblxuICByZXR1cm4gQGludmFsaWQgPSB0cnVlIGlmIGNvbnRleHQuaXNJbnZhbGlkKGJhc2VDb2xvcjEpIG9yIGNvbnRleHQuaXNJbnZhbGlkKGJhc2VDb2xvcjIpXG5cbiAge0ByZ2JhfSA9IGJhc2VDb2xvcjEuYmxlbmQoYmFzZUNvbG9yMiwgY29udGV4dC5CbGVuZE1vZGVzLk1VTFRJUExZKVxuXG4jIHNjcmVlbigjZjAwLCAjMDBGKVxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6c2NyZWVuJywgc3RyaXAoXCJcbiAgc2NyZWVuI3twc31cbiAgICAoXG4gICAgICAje25vdFF1b3RlfVxuICAgICAgI3tjb21tYX1cbiAgICAgICN7bm90UXVvdGV9XG4gICAgKVxuICAje3BlfVxuXCIpLCBbJyonXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXywgZXhwcl0gPSBtYXRjaFxuXG4gIFtjb2xvcjEsIGNvbG9yMl0gPSBjb250ZXh0LnNwbGl0KGV4cHIpXG5cbiAgYmFzZUNvbG9yMSA9IGNvbnRleHQucmVhZENvbG9yKGNvbG9yMSlcbiAgYmFzZUNvbG9yMiA9IGNvbnRleHQucmVhZENvbG9yKGNvbG9yMilcblxuICByZXR1cm4gQGludmFsaWQgPSB0cnVlIGlmIGNvbnRleHQuaXNJbnZhbGlkKGJhc2VDb2xvcjEpIG9yIGNvbnRleHQuaXNJbnZhbGlkKGJhc2VDb2xvcjIpXG5cbiAge0ByZ2JhfSA9IGJhc2VDb2xvcjEuYmxlbmQoYmFzZUNvbG9yMiwgY29udGV4dC5CbGVuZE1vZGVzLlNDUkVFTilcblxuXG4jIG92ZXJsYXkoI2YwMCwgIzAwRilcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOm92ZXJsYXknLCBzdHJpcChcIlxuICBvdmVybGF5I3twc31cbiAgICAoXG4gICAgICAje25vdFF1b3RlfVxuICAgICAgI3tjb21tYX1cbiAgICAgICN7bm90UXVvdGV9XG4gICAgKVxuICAje3BlfVxuXCIpLCBbJyonXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXywgZXhwcl0gPSBtYXRjaFxuXG4gIFtjb2xvcjEsIGNvbG9yMl0gPSBjb250ZXh0LnNwbGl0KGV4cHIpXG5cbiAgYmFzZUNvbG9yMSA9IGNvbnRleHQucmVhZENvbG9yKGNvbG9yMSlcbiAgYmFzZUNvbG9yMiA9IGNvbnRleHQucmVhZENvbG9yKGNvbG9yMilcblxuICByZXR1cm4gQGludmFsaWQgPSB0cnVlIGlmIGNvbnRleHQuaXNJbnZhbGlkKGJhc2VDb2xvcjEpIG9yIGNvbnRleHQuaXNJbnZhbGlkKGJhc2VDb2xvcjIpXG5cbiAge0ByZ2JhfSA9IGJhc2VDb2xvcjEuYmxlbmQoYmFzZUNvbG9yMiwgY29udGV4dC5CbGVuZE1vZGVzLk9WRVJMQVkpXG5cblxuIyBzb2Z0bGlnaHQoI2YwMCwgIzAwRilcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOnNvZnRsaWdodCcsIHN0cmlwKFwiXG4gIHNvZnRsaWdodCN7cHN9XG4gICAgKFxuICAgICAgI3tub3RRdW90ZX1cbiAgICAgICN7Y29tbWF9XG4gICAgICAje25vdFF1b3RlfVxuICAgIClcbiAgI3twZX1cblwiKSwgWycqJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18sIGV4cHJdID0gbWF0Y2hcblxuICBbY29sb3IxLCBjb2xvcjJdID0gY29udGV4dC5zcGxpdChleHByKVxuXG4gIGJhc2VDb2xvcjEgPSBjb250ZXh0LnJlYWRDb2xvcihjb2xvcjEpXG4gIGJhc2VDb2xvcjIgPSBjb250ZXh0LnJlYWRDb2xvcihjb2xvcjIpXG5cbiAgcmV0dXJuIEBpbnZhbGlkID0gdHJ1ZSBpZiBjb250ZXh0LmlzSW52YWxpZChiYXNlQ29sb3IxKSBvciBjb250ZXh0LmlzSW52YWxpZChiYXNlQ29sb3IyKVxuXG4gIHtAcmdiYX0gPSBiYXNlQ29sb3IxLmJsZW5kKGJhc2VDb2xvcjIsIGNvbnRleHQuQmxlbmRNb2Rlcy5TT0ZUX0xJR0hUKVxuXG5cbiMgaGFyZGxpZ2h0KCNmMDAsICMwMEYpXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czpoYXJkbGlnaHQnLCBzdHJpcChcIlxuICBoYXJkbGlnaHQje3BzfVxuICAgIChcbiAgICAgICN7bm90UXVvdGV9XG4gICAgICAje2NvbW1hfVxuICAgICAgI3tub3RRdW90ZX1cbiAgICApXG4gICN7cGV9XG5cIiksIFsnKiddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLCBleHByXSA9IG1hdGNoXG5cbiAgW2NvbG9yMSwgY29sb3IyXSA9IGNvbnRleHQuc3BsaXQoZXhwcilcblxuICBiYXNlQ29sb3IxID0gY29udGV4dC5yZWFkQ29sb3IoY29sb3IxKVxuICBiYXNlQ29sb3IyID0gY29udGV4dC5yZWFkQ29sb3IoY29sb3IyKVxuXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgY29udGV4dC5pc0ludmFsaWQoYmFzZUNvbG9yMSkgb3IgY29udGV4dC5pc0ludmFsaWQoYmFzZUNvbG9yMilcblxuICB7QHJnYmF9ID0gYmFzZUNvbG9yMS5ibGVuZChiYXNlQ29sb3IyLCBjb250ZXh0LkJsZW5kTW9kZXMuSEFSRF9MSUdIVClcblxuXG4jIGRpZmZlcmVuY2UoI2YwMCwgIzAwRilcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOmRpZmZlcmVuY2UnLCBzdHJpcChcIlxuICBkaWZmZXJlbmNlI3twc31cbiAgICAoXG4gICAgICAje25vdFF1b3RlfVxuICAgICAgI3tjb21tYX1cbiAgICAgICN7bm90UXVvdGV9XG4gICAgKVxuICAje3BlfVxuXCIpLCBbJyonXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXywgZXhwcl0gPSBtYXRjaFxuXG4gIFtjb2xvcjEsIGNvbG9yMl0gPSBjb250ZXh0LnNwbGl0KGV4cHIpXG5cbiAgYmFzZUNvbG9yMSA9IGNvbnRleHQucmVhZENvbG9yKGNvbG9yMSlcbiAgYmFzZUNvbG9yMiA9IGNvbnRleHQucmVhZENvbG9yKGNvbG9yMilcblxuICByZXR1cm4gQGludmFsaWQgPSB0cnVlIGlmIGNvbnRleHQuaXNJbnZhbGlkKGJhc2VDb2xvcjEpIG9yIGNvbnRleHQuaXNJbnZhbGlkKGJhc2VDb2xvcjIpXG5cbiAge0ByZ2JhfSA9IGJhc2VDb2xvcjEuYmxlbmQoYmFzZUNvbG9yMiwgY29udGV4dC5CbGVuZE1vZGVzLkRJRkZFUkVOQ0UpXG5cbiMgZXhjbHVzaW9uKCNmMDAsICMwMEYpXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czpleGNsdXNpb24nLCBzdHJpcChcIlxuICBleGNsdXNpb24je3BzfVxuICAgIChcbiAgICAgICN7bm90UXVvdGV9XG4gICAgICAje2NvbW1hfVxuICAgICAgI3tub3RRdW90ZX1cbiAgICApXG4gICN7cGV9XG5cIiksIFsnKiddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLCBleHByXSA9IG1hdGNoXG5cbiAgW2NvbG9yMSwgY29sb3IyXSA9IGNvbnRleHQuc3BsaXQoZXhwcilcblxuICBiYXNlQ29sb3IxID0gY29udGV4dC5yZWFkQ29sb3IoY29sb3IxKVxuICBiYXNlQ29sb3IyID0gY29udGV4dC5yZWFkQ29sb3IoY29sb3IyKVxuXG4gIHJldHVybiBAaW52YWxpZCA9IHRydWUgaWYgY29udGV4dC5pc0ludmFsaWQoYmFzZUNvbG9yMSkgb3IgY29udGV4dC5pc0ludmFsaWQoYmFzZUNvbG9yMilcblxuICB7QHJnYmF9ID0gYmFzZUNvbG9yMS5ibGVuZChiYXNlQ29sb3IyLCBjb250ZXh0LkJsZW5kTW9kZXMuRVhDTFVTSU9OKVxuXG4jIGF2ZXJhZ2UoI2YwMCwgIzAwRilcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOmF2ZXJhZ2UnLCBzdHJpcChcIlxuICBhdmVyYWdlI3twc31cbiAgICAoXG4gICAgICAje25vdFF1b3RlfVxuICAgICAgI3tjb21tYX1cbiAgICAgICN7bm90UXVvdGV9XG4gICAgKVxuICAje3BlfVxuXCIpLCBbJyonXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXywgZXhwcl0gPSBtYXRjaFxuXG4gIFtjb2xvcjEsIGNvbG9yMl0gPSBjb250ZXh0LnNwbGl0KGV4cHIpXG5cbiAgYmFzZUNvbG9yMSA9IGNvbnRleHQucmVhZENvbG9yKGNvbG9yMSlcbiAgYmFzZUNvbG9yMiA9IGNvbnRleHQucmVhZENvbG9yKGNvbG9yMilcblxuICBpZiBjb250ZXh0LmlzSW52YWxpZChiYXNlQ29sb3IxKSBvciBjb250ZXh0LmlzSW52YWxpZChiYXNlQ29sb3IyKVxuICAgIHJldHVybiBAaW52YWxpZCA9IHRydWVcblxuICB7QHJnYmF9ID0gYmFzZUNvbG9yMS5ibGVuZChiYXNlQ29sb3IyLCBjb250ZXh0LkJsZW5kTW9kZXMuQVZFUkFHRSlcblxuIyBuZWdhdGlvbigjZjAwLCAjMDBGKVxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6bmVnYXRpb24nLCBzdHJpcChcIlxuICBuZWdhdGlvbiN7cHN9XG4gICAgKFxuICAgICAgI3tub3RRdW90ZX1cbiAgICAgICN7Y29tbWF9XG4gICAgICAje25vdFF1b3RlfVxuICAgIClcbiAgI3twZX1cblwiKSwgWycqJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18sIGV4cHJdID0gbWF0Y2hcblxuICBbY29sb3IxLCBjb2xvcjJdID0gY29udGV4dC5zcGxpdChleHByKVxuXG4gIGJhc2VDb2xvcjEgPSBjb250ZXh0LnJlYWRDb2xvcihjb2xvcjEpXG4gIGJhc2VDb2xvcjIgPSBjb250ZXh0LnJlYWRDb2xvcihjb2xvcjIpXG5cbiAgcmV0dXJuIEBpbnZhbGlkID0gdHJ1ZSBpZiBjb250ZXh0LmlzSW52YWxpZChiYXNlQ29sb3IxKSBvciBjb250ZXh0LmlzSW52YWxpZChiYXNlQ29sb3IyKVxuXG4gIHtAcmdiYX0gPSBiYXNlQ29sb3IxLmJsZW5kKGJhc2VDb2xvcjIsIGNvbnRleHQuQmxlbmRNb2Rlcy5ORUdBVElPTilcblxuIyMgICAgIyMjIyMjIyMgIyMgICAgICAgIyMgICAgICMjXG4jIyAgICAjIyAgICAgICAjIyAgICAgICAjIyMgICAjIyNcbiMjICAgICMjICAgICAgICMjICAgICAgICMjIyMgIyMjI1xuIyMgICAgIyMjIyMjICAgIyMgICAgICAgIyMgIyMjICMjXG4jIyAgICAjIyAgICAgICAjIyAgICAgICAjIyAgICAgIyNcbiMjICAgICMjICAgICAgICMjICAgICAgICMjICAgICAjI1xuIyMgICAgIyMjIyMjIyMgIyMjIyMjIyMgIyMgICAgICMjXG5cbiMgcmdiYSA1MCAxMjAgMjAwIDFcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOmVsbV9yZ2JhJywgc3RyaXAoXCJcbiAgcmdiYVxcXFxzK1xuICAgICgje2ludH18I3t2YXJpYWJsZXN9KVxuICAgIFxcXFxzK1xuICAgICgje2ludH18I3t2YXJpYWJsZXN9KVxuICAgIFxcXFxzK1xuICAgICgje2ludH18I3t2YXJpYWJsZXN9KVxuICAgIFxcXFxzK1xuICAgICgje2Zsb2F0fXwje3ZhcmlhYmxlc30pXG5cIiksIFsnZWxtJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18scixnLGIsYV0gPSBtYXRjaFxuXG4gIEByZWQgPSBjb250ZXh0LnJlYWRJbnQocilcbiAgQGdyZWVuID0gY29udGV4dC5yZWFkSW50KGcpXG4gIEBibHVlID0gY29udGV4dC5yZWFkSW50KGIpXG4gIEBhbHBoYSA9IGNvbnRleHQucmVhZEZsb2F0KGEpXG5cbiMgcmdiIDUwIDEyMCAyMDBcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOmVsbV9yZ2InLCBzdHJpcChcIlxuICByZ2JcXFxccytcbiAgICAoI3tpbnR9fCN7dmFyaWFibGVzfSlcbiAgICBcXFxccytcbiAgICAoI3tpbnR9fCN7dmFyaWFibGVzfSlcbiAgICBcXFxccytcbiAgICAoI3tpbnR9fCN7dmFyaWFibGVzfSlcblwiKSwgWydlbG0nXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXyxyLGcsYl0gPSBtYXRjaFxuXG4gIEByZWQgPSBjb250ZXh0LnJlYWRJbnQocilcbiAgQGdyZWVuID0gY29udGV4dC5yZWFkSW50KGcpXG4gIEBibHVlID0gY29udGV4dC5yZWFkSW50KGIpXG5cbmVsbUFuZ2xlID0gXCIoPzoje2Zsb2F0fXxcXFxcKGRlZ3JlZXNcXFxccysoPzoje2ludH18I3t2YXJpYWJsZXN9KVxcXFwpKVwiXG5cbiMgaHNsIDIxMCA1MCA1MFxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6ZWxtX2hzbCcsIHN0cmlwKFwiXG4gIGhzbFxcXFxzK1xuICAgICgje2VsbUFuZ2xlfXwje3ZhcmlhYmxlc30pXG4gICAgXFxcXHMrXG4gICAgKCN7ZmxvYXR9fCN7dmFyaWFibGVzfSlcbiAgICBcXFxccytcbiAgICAoI3tmbG9hdH18I3t2YXJpYWJsZXN9KVxuXCIpLCBbJ2VsbSddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIGVsbURlZ3JlZXNSZWdleHAgPSBuZXcgUmVnRXhwKFwiXFxcXChkZWdyZWVzXFxcXHMrKCN7Y29udGV4dC5pbnR9fCN7Y29udGV4dC52YXJpYWJsZXNSRX0pXFxcXClcIilcblxuICBbXyxoLHMsbF0gPSBtYXRjaFxuXG4gIGlmIG0gPSBlbG1EZWdyZWVzUmVnZXhwLmV4ZWMoaClcbiAgICBoID0gY29udGV4dC5yZWFkSW50KG1bMV0pXG4gIGVsc2VcbiAgICBoID0gY29udGV4dC5yZWFkRmxvYXQoaCkgKiAxODAgLyBNYXRoLlBJXG5cbiAgaHNsID0gW1xuICAgIGhcbiAgICBjb250ZXh0LnJlYWRGbG9hdChzKVxuICAgIGNvbnRleHQucmVhZEZsb2F0KGwpXG4gIF1cblxuICByZXR1cm4gQGludmFsaWQgPSB0cnVlIGlmIGhzbC5zb21lICh2KSAtPiBub3Qgdj8gb3IgaXNOYU4odilcblxuICBAaHNsID0gaHNsXG4gIEBhbHBoYSA9IDFcblxuIyBoc2xhIDIxMCA1MCA1MCAwLjdcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOmVsbV9oc2xhJywgc3RyaXAoXCJcbiAgaHNsYVxcXFxzK1xuICAgICgje2VsbUFuZ2xlfXwje3ZhcmlhYmxlc30pXG4gICAgXFxcXHMrXG4gICAgKCN7ZmxvYXR9fCN7dmFyaWFibGVzfSlcbiAgICBcXFxccytcbiAgICAoI3tmbG9hdH18I3t2YXJpYWJsZXN9KVxuICAgIFxcXFxzK1xuICAgICgje2Zsb2F0fXwje3ZhcmlhYmxlc30pXG5cIiksIFsnZWxtJ10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgZWxtRGVncmVlc1JlZ2V4cCA9IG5ldyBSZWdFeHAoXCJcXFxcKGRlZ3JlZXNcXFxccysoI3tjb250ZXh0LmludH18I3tjb250ZXh0LnZhcmlhYmxlc1JFfSlcXFxcKVwiKVxuXG4gIFtfLGgscyxsLGFdID0gbWF0Y2hcblxuICBpZiBtID0gZWxtRGVncmVlc1JlZ2V4cC5leGVjKGgpXG4gICAgaCA9IGNvbnRleHQucmVhZEludChtWzFdKVxuICBlbHNlXG4gICAgaCA9IGNvbnRleHQucmVhZEZsb2F0KGgpICogMTgwIC8gTWF0aC5QSVxuXG4gIGhzbCA9IFtcbiAgICBoXG4gICAgY29udGV4dC5yZWFkRmxvYXQocylcbiAgICBjb250ZXh0LnJlYWRGbG9hdChsKVxuICBdXG5cbiAgcmV0dXJuIEBpbnZhbGlkID0gdHJ1ZSBpZiBoc2wuc29tZSAodikgLT4gbm90IHY/IG9yIGlzTmFOKHYpXG5cbiAgQGhzbCA9IGhzbFxuICBAYWxwaGEgPSBjb250ZXh0LnJlYWRGbG9hdChhKVxuXG4jIGdyYXlzY2FsZSAxXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czplbG1fZ3JheXNjYWxlJywgXCJncig/OmF8ZSl5c2NhbGVcXFxccysoI3tmbG9hdH18I3t2YXJpYWJsZXN9KVwiLCBbJ2VsbSddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLGFtb3VudF0gPSBtYXRjaFxuICBhbW91bnQgPSBNYXRoLmZsb29yKDI1NSAtIGNvbnRleHQucmVhZEZsb2F0KGFtb3VudCkgKiAyNTUpXG4gIEByZ2IgPSBbYW1vdW50LCBhbW91bnQsIGFtb3VudF1cblxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6ZWxtX2NvbXBsZW1lbnQnLCBzdHJpcChcIlxuICBjb21wbGVtZW50XFxcXHMrKCN7bm90UXVvdGV9KVxuXCIpLCBbJ2VsbSddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLCBzdWJleHByXSA9IG1hdGNoXG5cbiAgYmFzZUNvbG9yID0gY29udGV4dC5yZWFkQ29sb3Ioc3ViZXhwcilcblxuICByZXR1cm4gQGludmFsaWQgPSB0cnVlIGlmIGNvbnRleHQuaXNJbnZhbGlkKGJhc2VDb2xvcilcblxuICBbaCxzLGxdID0gYmFzZUNvbG9yLmhzbFxuXG4gIEBoc2wgPSBbKGggKyAxODApICUgMzYwLCBzLCBsXVxuICBAYWxwaGEgPSBiYXNlQ29sb3IuYWxwaGFcblxuIyMgICAgIyMgICAgICAgICAgIyMjICAgICMjIyMjIyMjICMjIyMjIyMjICMjICAgICAjI1xuIyMgICAgIyMgICAgICAgICAjIyAjIyAgICAgICMjICAgICMjICAgICAgICAjIyAgICMjXG4jIyAgICAjIyAgICAgICAgIyMgICAjIyAgICAgIyMgICAgIyMgICAgICAgICAjIyAjI1xuIyMgICAgIyMgICAgICAgIyMgICAgICMjICAgICMjICAgICMjIyMjIyAgICAgICMjI1xuIyMgICAgIyMgICAgICAgIyMjIyMjIyMjICAgICMjICAgICMjICAgICAgICAgIyMgIyNcbiMjICAgICMjICAgICAgICMjICAgICAjIyAgICAjIyAgICAjIyAgICAgICAgIyMgICAjI1xuIyMgICAgIyMjIyMjIyMgIyMgICAgICMjICAgICMjICAgICMjIyMjIyMjICMjICAgICAjI1xuXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czpsYXRleF9ncmF5Jywgc3RyaXAoXCJcbiAgXFxcXFtncmF5XFxcXF1cXFxceygje2Zsb2F0fSlcXFxcfVxuXCIpLCBbJ3RleCddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLCBhbW91bnRdID0gbWF0Y2hcblxuICBhbW91bnQgPSBjb250ZXh0LnJlYWRGbG9hdChhbW91bnQpICogMjU1XG4gIEByZ2IgPSBbYW1vdW50LCBhbW91bnQsIGFtb3VudF1cblxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6bGF0ZXhfaHRtbCcsIHN0cmlwKFwiXG4gIFxcXFxbSFRNTFxcXFxdXFxcXHsoI3toZXhhZGVjaW1hbH17Nn0pXFxcXH1cblwiKSwgWyd0ZXgnXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXywgaGV4YV0gPSBtYXRjaFxuXG4gIEBoZXggPSBoZXhhXG5cbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOmxhdGV4X3JnYicsIHN0cmlwKFwiXG4gIFxcXFxbcmdiXFxcXF1cXFxceygje2Zsb2F0fSkje2NvbW1hfSgje2Zsb2F0fSkje2NvbW1hfSgje2Zsb2F0fSlcXFxcfVxuXCIpLCBbJ3RleCddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLCByLGcsYl0gPSBtYXRjaFxuXG4gIHIgPSBNYXRoLmZsb29yKGNvbnRleHQucmVhZEZsb2F0KHIpICogMjU1KVxuICBnID0gTWF0aC5mbG9vcihjb250ZXh0LnJlYWRGbG9hdChnKSAqIDI1NSlcbiAgYiA9IE1hdGguZmxvb3IoY29udGV4dC5yZWFkRmxvYXQoYikgKiAyNTUpXG4gIEByZ2IgPSBbciwgZywgYl1cblxucmVnaXN0cnkuY3JlYXRlRXhwcmVzc2lvbiAncGlnbWVudHM6bGF0ZXhfUkdCJywgc3RyaXAoXCJcbiAgXFxcXFtSR0JcXFxcXVxcXFx7KCN7aW50fSkje2NvbW1hfSgje2ludH0pI3tjb21tYX0oI3tpbnR9KVxcXFx9XG5cIiksIFsndGV4J10sIChtYXRjaCwgZXhwcmVzc2lvbiwgY29udGV4dCkgLT5cbiAgW18sIHIsZyxiXSA9IG1hdGNoXG5cbiAgciA9IGNvbnRleHQucmVhZEludChyKVxuICBnID0gY29udGV4dC5yZWFkSW50KGcpXG4gIGIgPSBjb250ZXh0LnJlYWRJbnQoYilcbiAgQHJnYiA9IFtyLCBnLCBiXVxuXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czpsYXRleF9jbXlrJywgc3RyaXAoXCJcbiAgXFxcXFtjbXlrXFxcXF1cXFxceygje2Zsb2F0fSkje2NvbW1hfSgje2Zsb2F0fSkje2NvbW1hfSgje2Zsb2F0fSkje2NvbW1hfSgje2Zsb2F0fSlcXFxcfVxuXCIpLCBbJ3RleCddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLCBjLG0seSxrXSA9IG1hdGNoXG5cbiAgYyA9IGNvbnRleHQucmVhZEZsb2F0KGMpXG4gIG0gPSBjb250ZXh0LnJlYWRGbG9hdChtKVxuICB5ID0gY29udGV4dC5yZWFkRmxvYXQoeSlcbiAgayA9IGNvbnRleHQucmVhZEZsb2F0KGspXG4gIEBjbXlrID0gW2MsbSx5LGtdXG5cbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOmxhdGV4X3ByZWRlZmluZWQnLCBzdHJpcCgnXG4gIFxcXFx7KGJsYWNrfGJsdWV8YnJvd258Y3lhbnxkYXJrZ3JheXxncmF5fGdyZWVufGxpZ2h0Z3JheXxsaW1lfG1hZ2VudGF8b2xpdmV8b3JhbmdlfHBpbmt8cHVycGxlfHJlZHx0ZWFsfHZpb2xldHx3aGl0ZXx5ZWxsb3cpXFxcXH1cbicpLCBbJ3RleCddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLCBuYW1lXSA9IG1hdGNoXG4gIEBoZXggPSBjb250ZXh0LlNWR0NvbG9ycy5hbGxDYXNlc1tuYW1lXS5yZXBsYWNlKCcjJywnJylcblxuXG5yZWdpc3RyeS5jcmVhdGVFeHByZXNzaW9uICdwaWdtZW50czpsYXRleF9wcmVkZWZpbmVkX2R2aXBuYW1lcycsIHN0cmlwKCdcbiAgXFxcXHsoQXByaWNvdHxBcXVhbWFyaW5lfEJpdHRlcnN3ZWV0fEJsYWNrfEJsdWV8Qmx1ZUdyZWVufEJsdWVWaW9sZXR8QnJpY2tSZWR8QnJvd258QnVybnRPcmFuZ2V8Q2FkZXRCbHVlfENhcm5hdGlvblBpbmt8Q2VydWxlYW58Q29ybmZsb3dlckJsdWV8Q3lhbnxEYW5kZWxpb258RGFya09yY2hpZHxFbWVyYWxkfEZvcmVzdEdyZWVufEZ1Y2hzaWF8R29sZGVucm9kfEdyYXl8R3JlZW58R3JlZW5ZZWxsb3d8SnVuZ2xlR3JlZW58TGF2ZW5kZXJ8TGltZUdyZWVufE1hZ2VudGF8TWFob2dhbnl8TWFyb29ufE1lbG9ufE1pZG5pZ2h0Qmx1ZXxNdWxiZXJyeXxOYXZ5Qmx1ZXxPbGl2ZUdyZWVufE9yYW5nZXxPcmFuZ2VSZWR8T3JjaGlkfFBlYWNofFBlcml3aW5rbGV8UGluZUdyZWVufFBsdW18UHJvY2Vzc0JsdWV8UHVycGxlfFJhd1NpZW5uYXxSZWR8UmVkT3JhbmdlfFJlZFZpb2xldHxSaG9kYW1pbmV8Um95YWxCbHVlfFJveWFsUHVycGxlfFJ1YmluZVJlZHxTYWxtb258U2VhR3JlZW58U2VwaWF8U2t5Qmx1ZXxTcHJpbmdHcmVlbnxUYW58VGVhbEJsdWV8VGhpc3RsZXxUdXJxdW9pc2V8VmlvbGV0fFZpb2xldFJlZHxXaGl0ZXxXaWxkU3RyYXdiZXJyeXxZZWxsb3d8WWVsbG93R3JlZW58WWVsbG93T3JhbmdlKVxcXFx9XG4nKSwgWyd0ZXgnXSwgKG1hdGNoLCBleHByZXNzaW9uLCBjb250ZXh0KSAtPlxuICBbXywgbmFtZV0gPSBtYXRjaFxuICBAaGV4ID0gY29udGV4dC5EVklQbmFtZXNbbmFtZV0ucmVwbGFjZSgnIycsJycpXG5cbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOmxhdGV4X21peCcsIHN0cmlwKCdcbiAgXFxcXHsoW14hXFxcXG5cXFxcfV0rWyFdW15cXFxcfVxcXFxuXSspXFxcXH1cbicpLCBbJ3RleCddLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLCBleHByXSA9IG1hdGNoXG5cbiAgb3AgPSBleHByLnNwbGl0KCchJylcblxuICBtaXggPSAoW2EscCxiXSkgLT5cbiAgICBjb2xvckEgPSBpZiBhIGluc3RhbmNlb2YgY29udGV4dC5Db2xvciB0aGVuIGEgZWxzZSBjb250ZXh0LnJlYWRDb2xvcihcInsje2F9fVwiKVxuICAgIGNvbG9yQiA9IGlmIGIgaW5zdGFuY2VvZiBjb250ZXh0LkNvbG9yIHRoZW4gYiBlbHNlIGNvbnRleHQucmVhZENvbG9yKFwieyN7Yn19XCIpXG4gICAgcGVyY2VudCA9IGNvbnRleHQucmVhZEludChwKVxuXG4gICAgY29udGV4dC5taXhDb2xvcnMoY29sb3JBLCBjb2xvckIsIHBlcmNlbnQgLyAxMDApXG5cbiAgb3AucHVzaChuZXcgY29udGV4dC5Db2xvcigyNTUsIDI1NSwgMjU1KSkgaWYgb3AubGVuZ3RoIGlzIDJcblxuICBuZXh0Q29sb3IgPSBudWxsXG5cbiAgd2hpbGUgb3AubGVuZ3RoID4gMFxuICAgIHRyaXBsZXQgPSBvcC5zcGxpY2UoMCwzKVxuICAgIG5leHRDb2xvciA9IG1peCh0cmlwbGV0KVxuICAgIG9wLnVuc2hpZnQobmV4dENvbG9yKSBpZiBvcC5sZW5ndGggPiAwXG5cbiAgQHJnYiA9IG5leHRDb2xvci5yZ2JcblxuIyAgICAgIyMjIyMjIyAgIyMjIyMjIyNcbiMgICAgIyMgICAgICMjICAgICMjXG4jICAgICMjICAgICAjIyAgICAjI1xuIyAgICAjIyAgICAgIyMgICAgIyNcbiMgICAgIyMgICMjICMjICAgICMjXG4jICAgICMjICAgICMjICAgICAjI1xuIyAgICAgIyMjIyMgIyMgICAgIyNcblxuIyBRdC5yZ2JhKDEuMCwwLjUsMC4wLDAuNylcbnJlZ2lzdHJ5LmNyZWF0ZUV4cHJlc3Npb24gJ3BpZ21lbnRzOnF0X3JnYmEnLCBzdHJpcChcIlxuICBRdFxcXFwucmdiYSN7cHN9XFxcXHMqXG4gICAgKCN7ZmxvYXR9KVxuICAgICN7Y29tbWF9XG4gICAgKCN7ZmxvYXR9KVxuICAgICN7Y29tbWF9XG4gICAgKCN7ZmxvYXR9KVxuICAgICN7Y29tbWF9XG4gICAgKCN7ZmxvYXR9KVxuICAje3BlfVxuXCIpLCBbJ3FtbCcsICdjJywgJ2NjJywgJ2NwcCddLCAxLCAobWF0Y2gsIGV4cHJlc3Npb24sIGNvbnRleHQpIC0+XG4gIFtfLHIsZyxiLGFdID0gbWF0Y2hcblxuICBAcmVkID0gY29udGV4dC5yZWFkRmxvYXQocikgKiAyNTVcbiAgQGdyZWVuID0gY29udGV4dC5yZWFkRmxvYXQoZykgKiAyNTVcbiAgQGJsdWUgPSBjb250ZXh0LnJlYWRGbG9hdChiKSAqIDI1NVxuICBAYWxwaGEgPSBjb250ZXh0LnJlYWRGbG9hdChhKVxuIl19
