(function() { 

var $win = $(window),
    $doc = $(document), 
    $payoff = null,
    $destination = null,
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
    adjust_close_button = function($kendo_win) { 
        var $ref = $kendo_win.parent().find('.k-window-actions'); 
        $ref.find('a')
            .removeClass('k-window-action k-link')
            .addClass('k-button')
            .click(close_windows)
            .css({'font-size' : '24px'})
                .find('span')
                .removeClass('k-icon k-i-close')
    },
    init_payoff = function() { 
        var $from = $('#payoff-from'),
            $to = $('#payoff-to'), 
            $payoff_orig = $('#payoff');

        $payoff_orig.kendoWindow(
            {
                "width" : '600px', 
                "title" : 'Payoff',
            }
        );
        $payoff = $payoff_orig.data('kendoWindow');
        adjust_close_button($payoff_orig); 

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
    init_destination = function() { 
        $destination = $('#destination'); 
        $destination.kendoWindow(
            {
                "width" : "800px", 
                "title" : "New Destination"
            }
        ); 
        adjust_close_button($destination); 

		$.get('data/regions.json', function(data) { 
			regions = data;
			regions = sortObject(regions); 
            make_dest_selector($destination); 
		}); 
    },
    radio_selector = function(evt) { 
        var $clicked = $(evt.target),
            $paren = $clicked.closest('ul');
        $paren.find('li').removeClass('k-selected');
        $clicked.closest('li').addClass('k-selected');
    },
    make_dest_selector = function($container) { 
        var li_template = kendo.template('<li class="k-button" data-value="#=value#"><span>#=value#</span></li>'),
            $region_div = $('<div id="regions"></div>'),
            $region_ul = $('<ul></ul>'),
            $city_div = $('<div></div>'),
            i, il, odd_even, $odd_even_ul, $dice_ul, key, region_city, 
            one, two,
            set_region, set_city, parse_roll;  

        parse_roll = function($panel, region, dice_val_fn) { 
            var is_odd = $panel.find("ul.odd-even > li.k-selected"),
                dice_val = $panel.find("ul.dice > li.k-selected"), 
                result = ''; 
            if (!is_odd || !dice_val) { return null; }
            is_odd = (is_odd.attr('data-value') === 'Odd');
            dice_val = dice_val.attr('data-value');
            dice_val = parseInt(dice_val); 
            if (is_odd) { dice_val = -dice_val; }
            if (region && dice_val) {
                result = regions[region][dice_val]; 
            }
            dice_val_fn(result); 
        };

        set_region = function() { 
            setTimeout(function() { 
                parse_roll($region_div, 'Regions', function(region_val) { 
                    $region_ul.find('li').each(function() { 
                        var $elem = $(this); 
                        if ($elem.text() === region_val) { 
                            $elem.addClass('k-selected'); 
                        } else { 
                            $elem.removeClass('k-selected'); 
                        }
                    }); 
                }); 
            }, 50); 
        };

        set_city = function() { 
            setTimeout(function() { 
                parse_roll($city_div, $region_ul.find('li.k-selected').attr('data-value'), function(city_val) { 
                    var greeting = (city_val) ? 'You\'re going to ' : ""; 
                    if (!city_val) { return; }
                    $('#city_greeting').html("You're going to&nbsp;"); 
                    $('#city').text(city_val); 
               }); 
           }, 50); 
        };

        for (one = 0; one < 2; one++) { 
            region_city = (!one) ? 'Region' : 'City'; 
            $dice_ul = $('<ul class="dice autoupdate"></ul>'); 
            $container.append($('<h2></h2>').text(region_city));

            $odd_even_ul = $('<ul class="odd-even autoupdate"></ul>');
            for (two = 0; two < 2; two++) {
                odd_even = (!two) ? 'Odd' : 'Even';
                $odd_even_ul.append($(kendo.render(li_template, [{"value" : odd_even}]))); 
            }
            $odd_even_ul.appendTo((region_city === 'Region') ? $region_div : $city_div); 

            for (i = 2; i < 13; i++) { 
                $dice_ul.append($(kendo.render(li_template, [{'value' : i}]))); 
            }

            if (region_city === 'Region') { 
                $region_div.append($dice_ul); 
                for (key in regions) { 
                    if (own_prop(regions, key) && key !== 'Regions') {    
                        $region_ul.append(kendo.render(li_template, [{"value" : key}])); 
                    }
                }
                $region_div.append($region_ul); 
                $container.append($region_div);
                $dice_ul.find('li').bind('click', set_region); 
            } else {
                $city_div.append($dice_ul); 
                $city_div.append($("<h3><span id='city_greeting'></span><span id='city'></span></h3>"));
                $container.append($city_div);
                $dice_ul.find('li').bind('click', set_city); 
            }
            
            if (region_city === 'Region') { 
                $region_div.find('.autoupdate > li').bind('click',  set_region); 
            } else { 
                $city_div.find('.autoupdate > li').bind('click',  set_city); 
            }

        }   
        $container.find('li').bind('click', function(evt) { 
            radio_selector(evt); 
            set_city(); 
        });
    },
    key_handlers = {},
    register_key = function(character, handler_fn) { 
        key_handlers[character[0].toUpperCase().charCodeAt(0)] = handler_fn;
        key_handlers[character[0].toLowerCase().charCodeAt(0)] = handler_fn; 
    },
    open_payoffs = function() { 
        $payoff.center();
        $payoff.open(); 
    }, 
    open_destination = function() {
        var $dest_win = $destination.data('kendoWindow'); 
        $dest_win.center(); 
        $dest_win.open();
    },
    close_windows = function() { 
        $payoff.close();
        $destination.data('kendoWindow').close(); 
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
                close_windows(); 
            }
        });
        register_key('p', function() { 
            open_payoffs();
        }); 
        register_key('n', function() { 
            open_destination(); 
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
    init_destination(); 
    $('#destination_button').click(open_destination); 
    $('#payoff_button').click(open_payoffs); 
}); 

})(); 
