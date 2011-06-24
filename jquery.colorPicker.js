/**
 * Really Simple Color Picker in jQuery
 * 
 * Copyright (c) 2008 Lakshan Perera (www.laktek.com)
 * Licensed under the MIT (MIT-LICENSE.txt)  licenses.
 * 
 */

(function ($) {
    /**
     * Create a couple private variables to use around our function.
    **/
    var selectorOwner,
        cItterate = 0,
        paletteTemplate = $('<div id="colorPicker_palette" class="colorPicker-palette" />');

    /**
     * Create our colorPicker function
    **/
    $.fn.colorPicker = function (options) {
        var opts = $.extend({}, $.fn.colorPicker.defaults, options);

        return this.each(function () {
            // $.fn.colorPicker.buildSelector(opts);
            // 
            // $.fn.colorPicker.buildPicker(this, opts);

            /**
             * Build a palette selection that we'll use to allow a user to pick a color.
            **/
            var newPalette  = paletteTemplate.clone().attr('id', 'colorPicker_palette-' + cItterate),
                paletteId   = newPalette[0].id,
                swatch      = $('<div class="color_swatch">&nbsp;</div>'),
                hex_field   = $('<label for="color_value">Hex</label><input type="text" size="8" id="color_value" />');

            //add color palette
            $.each(opts.colors, function (i) {
                swatch = swatch.clone();

                if (opts.colors[i] === "transparent") {
                    swatch.text('X');

                    $.fn.colorPicker.bindPalette(swatch, "transparent");

                } else {
                    swatch.css("background-color", "#" + this);

                    $.fn.colorPicker.bindPalette(swatch);

                }

                swatch.appendTo(newPalette);
            });

            hex_field.bind("keydown", function (event) {
                if (event.keyCode === 13) {
                    $.fn.colorPicker.changeColor($.fn.colorPicker.toHex($(this).val()));
                }
                if (event.keyCode === 27) {
                    $.fn.colorPicker.togglePalette(paletteId);
                }
            });

            $('<div id="color_custom"></div>').append(hex_field).appendTo(newPalette);

            $("body").append(newPalette);

            newPalette.hide();


            /**
             * Build the interface replacement for the color picker.
            **/
            var element      = this,
                control      = $('<div class="colorPicker-picker">&nbsp;</div>'),
                defaultColor = (opts.pickerDefault !== "FFFFFF") ? "#" + opts.pickerDefault : $(element).val();

            control.css('background-color', defaultColor);

            //bind click event to color picker
            control.bind("click", function () {
                $.fn.colorPicker.togglePalette(paletteId, $(this));
            });

            //add the color picker section
            $(element).after(control);

            //add even listener to input box
            $(element).bind("change", function () {
                var selectedValue = $.fn.colorPicker.toHex($(element).val());

                $(element).next(".colorPicker-picker").css("background-color", selectedValue);
            });

            //hide the input box
            $(element).hide();


            cItterate++;
        });
    };

    /**
     * Extend colorPicker with... all our functionality.
    **/
    $.extend(true, $.fn.colorPicker, {
        /**
         * Return a Hex color, convert an RGB value and return Hex, or return false.
         *
         * Inspired by http://code.google.com/p/jquery-color-utils
        **/
        toHex : function (color) {
            // If we have a standard or shorthand Hex color, return that value.
            if (color.match(/[0-9A-F]{6}|[0-9A-F]{3}$/i)) {
                return (color.charAt(0) === "#") ? color : ("#" + color);

            // Alternatively, check for RGB color, then convert and return it as Hex.
            } else if (color.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/)) {
                var c = ([parseInt(RegExp.$1, 10), parseInt(RegExp.$2, 10), parseInt(RegExp.$3, 10)]),
                    pad = function (str) {
                        if (str.length < 2) {
                            for (var i = 0, len = 2 - str.length; i < len; i++) {
                                str = '0' + str;
                            }
                        }

                        return str;
                    };

                if (c.length === 3) {
                    var r = pad(c[0].toString(16)),
                        g = pad(c[1].toString(16)),
                        b = pad(c[2].toString(16));

                    return '#' + r + g + b;
                }

            // Otherwise we wont do anything.
            } else {
                return false;

            }
        },

        /**
         * Check whether user clicked on the selector or owner.
        **/
        checkMouse : function (event, paletteId) {
            var selector = paletteId,
                selectorParent = $(event.target).parents(selector).length;

            if (event.target == $(selector)[0] || event.target == selectorOwner || selectorParent > 0) {
                return;
            }

            $.fn.colorPicker.hidePalette();
        },

        /**
         * Toggle visibility of the colorPicker palette.
        **/
        togglePalette : function (paletteId, origin) {
            var selector = $('#' + paletteId);

            if (origin) {
                // selectorOwner is the .colorPicker-picker div we
                // clicked on to get our color palette.
                selectorOwner = origin;
            }

            if (selector.is(':visible')) {
                $.fn.colorPicker.hidePalette();

            } else {
                $.fn.colorPicker.showPalette(selector);

            }
        },

        /**
         * Hide the color palette modal.
        **/
        hidePalette : function (paletteId) {
            $(document).unbind("mousedown", $.fn.colorPicker.checkMouse);

            $('.colorPicker-palette').hide();
        },

        /**
         * Show the color palette modal.
        **/
        showPalette : function (palette) {
            var hexColor = selectorOwner.prev("input").val();

            palette.css({
                top: selectorOwner.offset().top + (selectorOwner.outerHeight()),
                left: selectorOwner.offset().left
            });

            $("#color_value").val(hexColor);

            palette.show();

            $(document).bind("mousedown", function (ev) {
                $.fn.colorPicker.checkMouse(ev, palette.selector);
            });
        },

        /**
         * Update the input with a newly selected color.
        **/
        changeColor : function (value) {
            selectorOwner.css("background-color", value);

            selectorOwner.prev("input").val(value).change();

            $.fn.colorPicker.hidePalette();
        },

        /**
         * Bind events to the color palette swatches.
        */
        bindPalette : function (element, color) {
            color = (color === "transparent") ? color : $.fn.colorPicker.toHex(element.css("background-color"));

            element.bind({
                click : function (ev) {
                    $.fn.colorPicker.changeColor(color);
                },
                mouseover : function (ev) {
                    $(this).css("border-color", "#598FEF");

                    $("#color_value").val(color);
                },
                mouseout : function (ev) {
                    $(this).css("border-color", "#000");

                    $("#color_value").val(selectorOwner.css("background-color"));

                    $("#color_value").val("#ffffff");
                }
            });
        }
    });

    /**
     * Default colorPicker options.
     *
     * These are publibly available for global modification using a setting such as:
     *
     * $.fn.colorPicker.defaults.colors = ['151337', '111111']
     *
     * They can also be applied on a per-bound element basis like so:
     *
     * $('#element1').colorPicker({pickerDefault: 'efefef', transparency: true});
     * $('#element2').colorPicker({pickerDefault: '333333', colors: ['333333', '111111']});
     *
    **/
    $.fn.colorPicker.defaults = {
        // colorPicker default selected color.
        pickerDefault : "FFFFFF",

        // Default color set.
        colors : [
            '000000', '993300', '333300', '000080', '333399', '333333', '800000', 'FF6600',
            '808000', '008000', '008080', '0000FF', '666699', '808080', 'FF0000', 'FF9900',
            '99CC00', '339966', '33CCCC', '3366FF', '800080', '999999', 'FF00FF', 'FFCC00',
            'FFFF00', '00FF00', '00FFFF', '00CCFF', '993366', 'C0C0C0', 'FF99CC', 'FFCC99',
            'FFFF99', 'CCFFFF', '99CCFF', 'FFFFFF'
        ],

        // If we want to simply add more colors to the default set, use addColors.
        addColors : []
    };

})(jQuery);
