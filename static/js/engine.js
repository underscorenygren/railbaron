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
