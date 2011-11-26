import json

def csv_to_arrs(filename):
	import re
	res = []
	fil = open(filename, 'r')
	def repl(match):
		return "%s|%s" % (match.group(1), match.group(2))

	for line in fil.readlines():
		line = line[:-2] #strip \r\n
		if line.find('"') != -1:
			line = re.sub('"(.*?),(.*?)"', repl, line)
		vals = line.split(',')
		res.append([val.replace('|', ',') for val in vals])
	return res

def json_dump(dicdic):
	outer = []
	for cname, cities in dicdic.items():
		inner = []
		for _cname, payoff in cities.items():
			inner.append('"%s":"%s"' % (_cname, payoff))
		outer.append('{%s}' % ','.join(inner))
	return '{%s}' % ','.join(outer)
	
def parse_regions(filename):
	regions_arr = csv_to_arrs(filename)
	all_regions = {}
	for row in regions_arr:
		roll = row[0]
		odd = row[1]
		even = row[2]
		if roll:
			try: 
				roll = int(roll)
				_region = all_regions[cur_region]
				_region[roll] = even
				_region["-%s" % roll] = odd
			except ValueError:
				cur_region = roll
				all_regions[roll] = {}
	
	return json.dumps(all_regions)
	
def parse_payoffs(filename):
	payoffs_arr = csv_to_arrs(filename)
	n_cities = len(payoffs_arr)
	payoffs = {}
	for col in xrange(2, n_cities):
		col_name = payoffs_arr[1][col].replace('"', '')
		city_dic = {}
		for row in xrange(2, n_cities):
			row_name = payoffs_arr[row][1].replace('"', '')
			payoff = payoffs_arr[row][col]
			if payoff == '':
				city_dic[row_name] = payoffs[row_name][col_name]
			else:
				city_dic[row_name] = payoff
		payoffs[col_name] = city_dic
	return json.dumps(payoffs)

if __name__ == "__main__":
    import sys
    arg = sys.argv[1]
    if arg == 'payoffs':
        print parse_payoffs("rb_payoff.csv")
    elif arg == "regions":
		print parse_regions("regions.csv")
