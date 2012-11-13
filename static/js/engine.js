
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
		$.get('data/payoffs.json', function(data) { 
			payoffs = data;
			payoffs = sortObject(payoffs); 
			var $from = $('#from'); 
			var $to = $('#to'); 
			
			for (key in payoffs) { 
				var $opt = $('<option>' + key + '</option>'); 
				$from.append($opt.clone()); 
				$to.append($opt); 
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

		$('#payoff').click(function(e) { 
			var from = $('#from').val(); 
			var to = $('#to').val(); 
			
			var pay = payoffs[to][from];
			pay = parseFloat(pay); 
			pay = '$' + (pay * 1000); 
			$('#payday').text(pay); 	
		}); 
    }); 
