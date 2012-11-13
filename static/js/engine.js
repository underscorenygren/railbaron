(function() { 

var $win = $(window),
    $doc = $(document), 
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
    show_payoff = function() { 

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
    };


$doc.ready(function() {
    $win.resize(adjust_viewport); 
    adjust_viewport(); 
    init_payoff(); 
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
