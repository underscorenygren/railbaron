#!/usr/bin/python
import tornado.ioloop
import tornado.web
from tornado import template
from argparse import ArgumentParser
import os

def even(arr):
    return arr
def odd(arr):
    return [-x for x in arr]

allz = {}
allz['regions'] = { 
     "plains" : [-2, 8, 11],
     "southeast" : odd([3, 4, 5]),
     "northcentral" : odd([6,7]), 
     "northeast" : odd(range(8, 12)), 
     "southwest" : even([2, 6, 7]), 
     "southcentral" : even([3, 4, 5]), 
     "northwest" : even([9, 10, 12])
} 

def value_getter(region, dice, is_odd):
    dice = -dice
    region = allz.get(region)
    for key, value in region.items():
        for elem in value:
            if elem == dice:
                return key
    return 0
    
class MainHandler(tornado.web.RequestHandler):
    def get(self, name):
        if not name or name == '':
            name = 'index.html'
        html = open(name, 'r').read()
        self.write(html)

    def post(self):
        typ = self.get_argument("qtype", "").lower()
        dice = self.get_argument("dice", 0)
        is_odd = self.get_argument("is_odd", 0)
        error = ''
        res = ''
        if is_odd == "0":
            is_odd = 0

        try: 
            dice = int(dice)
        except Exception:
            dice = 0
        if not dice:
            error = 1
            res = "Illegal dice value"
        else:
            res = value_getter(typ, dice, is_odd)

        if not res:
           error = 1
           res = "Illegal value, no result found"

        self.write('{"value":"%s","error":"%s"}' % (res, error))
            
settings = {
    "static_path" : os.path.join(os.path.dirname(__file__), 'static')
}

application = tornado.web.Application([
    (r"/css/(.*)", tornado.web.StaticFileHandler, {"path" : os.path.join(settings['static_path'], 'css')}),
    (r"/js/(.*)", tornado.web.StaticFileHandler, {"path" : os.path.join(settings['static_path'], 'js')}),
    (r"/img/(.*)", tornado.web.StaticFileHandler, {"path" : os.path.join(settings['static_path'], 'img')}),
    (r"/data/(.*)", tornado.web.StaticFileHandler, {"path" : os.path.join(settings['static_path'], 'data')}),
    (r"/favicon.ico", tornado.web.StaticFileHandler, {"path" : os.path.join(settings['static_path'], 'img')}),
    (r"/([\w\s.]*)", MainHandler), 
], **settings)

if __name__ == "__main__":
    import sys
    
    parser = ArgumentParser()
    parser.add_argument('--port', type=int, default=80, 
                        help='The port on which to run the server')
    args = parser.parse_args(sys.argv[1:])
    port = args.port
    application.listen(port)
    
    print "Starting App"
    tornado.ioloop.IOLoop.instance().start()

