(function() { 

var $win = $(window),
    $doc = $(document), 
    $payoff = null,
    payoffs = null,
    regions = null,
    own_prop = function(elem, val) { 
        return elem.hasOwnProperty(val); 
    },
    dict_to_keys = function(dict) { 
        var key, val, arr = []; 
        for (key in dict) { 
            if (own_prop(dict, key)) { 
               arr.push(key); 
            }
        }
        return arr;
    },
    adjust_viewport = function() { 
        var h = $win.height(), 
            w = $win.width(), 
            $bg = $('#bg'); 

        //$bg.height(h); 
        $bg.width(w); 
        
    },
    show_new_dest = function() { 

    }, 
    update_payoff = function() { 
        var from = $('#payoff-from').val(),
            to = $('#payoff-to').val(), 
            pay;

        
        try {  
            pay = payoffs[to][from];
        } catch(err) {
            pay = 0;
        }
        pay = (pay) ? parseFloat(pay) : 0; 
        pay = '$' + (pay * 1000); 
        $('#payday').text(pay); 	
    },
    init_payoff = function() { 
        var $from = $('#payoff-from'),
            $to = $('#payoff-to');

        $payoff = $('#payoff');
        $payoff.kendoWindow(
            {
                "width" : '600px', 
                "title" : 'Payoff',
            }
        );
        $payoff = $payoff.data('kendoWindow');

		$.get('data/payoffs.json', function(data) { 
            var names;
			payoffs = data;
			payoffs = sortObject(payoffs); 
            names = dict_to_keys(payoffs);
            $to.kendoAutoComplete(names);
            $from.kendoAutoComplete(names); 
		});
        $from.change(update_payoff); 
        $to.change(update_payoff); 
    }, 
    dice_to_region = (function() { 
        var _regions = {
            "plains" : [-2, 8, 11],
            "southeast" : [-3, -4, -5],
            "northcentral" : [-6,-7], 
            "northeast" : [-8,  -9, -10, -11, -12],
            "southwest" : [2, 6, 7],
            "southcentral" : [3, 4, 5],
            "northwest" : [9, 10, 12]
        }; 

        return function(dice_val, is_odd) { 
            var key; 
            dice_val = parseInt(dice_val); 
            if (is_odd) { dice_val = -dice_val; } 

            for (key in _regions) { 
                if (own_prop(_regions, key)) { 
                    arr = _regions[key]; 
                    for (i = 0, il = arr.length; i < il; i++) { 
                        if (arr[i] === dice_val) { 
                            return key; 
                        }
                    }
                }
            }

            return null; 
        }
    })(), 
    dice_to_city = function(dice_val, region) { 
        if (!region || !dice_val) { return ''; }
        return regions[region][dice_val]; 
    },
    init_destination = function() { 
        $destination = $('#destination'); 
        $destination = $destination.kendoWindow(
            {
                "width" : "800px", 
                "title" : "New Destination"
            }
        ); 

		$.get('data/regions.json', function(data) { 
			regions = data;
			regions = sortObject(regions); 
            make_dest_selector($destination); 
		}); 
    },
    make_dest_selector = function($container) { 
        var li_template = kendo.template('<li data-value=#value#><span>#value</span></li>'),
            $region_ul = $('<ul></ul>'),
            $city_div = $('<div></div>'),
            i, il, odd_even, $odd_even_ul, $dice_ul, key, region_city, 
            set_region, set_city, parse_roll;  

        parse_roll = function($panel, dice_val_fn) { 
            var is_odd = $panel.find("ul.odd-even > li:selected"), 
                dice_val = $panel.find("ul.dice > li:selected");
            if (!is_odd || !dice_val) { return; }
            is_odd = (is_odd.val() === 'Odd'); 
            dice_val = dice_val.val(); 
            dice_val_fn(dice_val, is_odd); 
        }; 

        set_region = function() { 
            parse_roll($('#regions'), function(dice_val, is_odd) { 
                var region_val = dice_to_region(dice_val, is_odd); 

                $region_ul.find('li').each(function() { 
                    var $elem = $(this); 
                    if ($elem.val() === region_val) { 
                        $elem.attr("selected", "selected"); 
                    } else { 
                        $elem.removeAttr("selected"); 
                    }
                }); 
            }); 
        }

        set_city = function() { 
            var dice_val = $city_div.find('.dice > li:selected'),
                city_val = dice_to_city(dice_val, $region_ul.find('li:selected').val()), 
                greeting = (city_val) ? 'You\'re going to ' : ""; 

            $('#city_greeting').text("You're going to "); 
            $('#city').text(city_val); 
        };

        $city_div.append($("<span id='city-greeting'></span><span id='city'></span>"));
        for (region_city = 'Region'; region_city === 'Region'; region_city = 'City') { 
            $odd_even_ul = $('<ul></ul>');
            $dice_ul = $('<ul></ul>'); 
            for (odd_even = 'Odd'; odd_even === 'Odd'; odd_even = 'Even') { 
                $odd_even_ul.append($(kendo.render(li_template, {"value" : odd_even}))); 
                for (i = 2; i < 13; i++) { 
                    $dice_ul.append($(kendo.render(li_template, {'value' : i}))); 
                }
            }
            $container.append($('h2').text(region_city));
            $container.append($odd_even_ul); 
            $container.append($dice_ul); 

            if (region_city === 'Region') { 
                for (key in regions) { 
                    if (own_prop(regions, key)) {    
                        $region_ul.append(kendo.render(li_template, {"value" : key})); 
                    }
                }
                $odd_even_ul.change(set_region); 
                $dice_ul.change(set_region); 
            } else {
                $container.append($city_div);
                $odd_even_ul.change(set_city); 
                $dice_ul.change(set_city); 
            }
       }
    },
    key_handlers = {},
    register_key = function(character, handler_fn) { 
        key_handlers[character[0].toUpperCase().charCodeAt(0)] = handler_fn;
        key_handlers[character[0].toLowerCase().charCodeAt(0)] = handler_fn; 
    },
    init_keystrokes = function() { 
        $(window).keyup(function(evt) { 
            var handler = null; 
            if (evt.altKey) { 
                handler = key_handlers[evt.which]; 
                if (handler) { 
                    handler(evt); 
                }
            }
            else if (evt.which === 27) { //Esc
                $payoff.close();
            }
        });
        register_key('p', function() { 
            $payoff.center();
            $payoff.open(); 
        }); 
    },
    sortObject = function(o) {
		var sorted = {},
		key, a = [];

		for (key in o) {
			if (o.hasOwnProperty(key)) {
					a.push(key);
			}
		}

		a.sort();

		for (key = 0; key < a.length; key++) {
			sorted[a[key]] = o[a[key]];
		}
		return sorted;
	},
    noop = function() {};


$doc.ready(function() {
    $win.resize(adjust_viewport); 
    adjust_viewport(); 
    init_payoff(); 
    init_keystrokes();
}); 

})(); 
