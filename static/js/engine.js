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
    make_dest_selector = function($container) { 
        var li_template = kendo.template('<li data-value=#value#><span>#value</span></li>'),
            $region_ul = $('<ul></ul>'),
            $city_div = $('<div></div>'),
            i, il, odd_even, $odd_even_ul, $dice_ul, key, region_city, 
            set_region, set_city; 

        parse_roll = function($panel, dice_val_fn) { 
            var is_odd = $panel.find("ul.odd-even > li:selected"), 
                dice_val = $panel.find("ul.dice > li:selected"), 
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
            );
        }; 
        set_city = function() { 
            parse_roll($('#city_panel'), function(dice_val, is_odd) { 
                var city_val = dice_to_city(dice_val, is_odd); 
                $('#city_greeting').text("You're going to "); 
                $('#city').text(city_val); 
            }); 
        };

        $city_div.append($("<span id='city-greeting'></span><span id='city'></span>"));
        for (region_city = 'Region', region_city === 'Region'; region_city = 'City') { 
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
                    if (own_prop(regions, key) {    
                        $region_ul.append(kendo.render(li_template, {"value" : key})); 
                    }
                }
            } else {
                $container.append($city_div);
            }
       }
        $container.append($odd_even_ul); 
        $container.append($dice_ul); 
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
    noop = function() {};


$doc.ready(function() {
    $win.resize(adjust_viewport); 
    adjust_viewport(); 
    init_payoff(); 
    init_keystrokes();
}); 


})(); 

	function sortObject(o) {
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
	}

    $(document).ready(function() { 
		var regions, payoffs;
		$.get('data/regions.json', function(data) { 
			regions = data;
			var $region_sel = $('#region'); 
			regions = sortObject(regions); 
			for (key in regions) { 
				$region_sel.append($('<option>' + key + '</option>')); 
			} 	
		}); 
        $('#query').click(function(e) { 
			var dice  = $('#dice').val(); 
			var evenodd = $('#evenodd').find('option:selected').val();
			var region = $('#region').find('option:selected').text(); 

			if (evenodd === "odd") { 
				dice = '-' + dice;
			}

			$('#output').text(regions[region][dice]); 
				
        }); 

    }); 
