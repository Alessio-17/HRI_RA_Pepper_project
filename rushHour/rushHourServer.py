import tornado.httpserver
import tornado.websocket
import tornado.ioloop
import tornado.web
import socket
import time
import argparse
import qi
from threading import Thread
import os
import sys
import json

from tornado.websocket import websocket_connect

sys.path.append(os.getenv('PEPPER_TOOLS_HOME')+'/cmd_server')

import pepper_cmd
from pepper_cmd import *

websocket_server = None     # websocket handler
run = True                  # main_loop run flag

class PlannerClient(object):
    def __init__(self, message, websocket_server):
        self.message = message
        self.websocket_server = websocket_server
        self.connect()

    @tornado.gen.coroutine
    def on_message(self, message):
        print "Received message: %s" % message
        config = json.loads(message)
        if ('level' in config['id']):
            self.websocket_server.write_message(json.dumps(config, indent=4))
        elif (config['id'] == 'nextMove'):
            print 'Sto ricevendo la configurazione dal planner'
            self.websocket_server.write_message(json.dumps(config, indent=4))
        #self.close()
        # Per chiuderla manda un messaggio None da planner
        #tornado.ioloop.IOLoop.current().stop() 

    @tornado.gen.coroutine
    def send_message(self, message):
        self.write_message(message)

    @tornado.gen.coroutine
    def connect(self):
        ws_client = yield websocket_connect('ws://localhost:9020/websocketserver', on_message_callback=self.on_message)
        print "Test here"
        ws_client.write_message(self.message)
        #tornado.ioloop.IOLoop.current().start()


class MyWebSocketServer(tornado.websocket.WebSocketHandler):

    def open(self):
        global websocket_server, run
        websocket_server = self
        print 'New connection'
       
    def on_message(self, message):
        global code, status, robot
        if (message=='stop'):
            print 'Stop code and robot'
            #robot_stop_request()
        
        elif ('level' in message):
            print 'Entrato in level1'
            client = PlannerClient(message, self)

        # SCRIVI ANCHE QUI L'IF PER MANDARE LA CONFIGURAZIONE AL PLANNER
        elif ('boardStatus' in message):
            client = PlannerClient(message, self)
            
        else:
            print 'Message received:\n%s' % message
            robot.say(message)
            '''
            if (status=='Idle'):
                t = Thread(target=run_code, args=(message,))
                t.start()
            else:
                print 'Program running. This code is discarded.'
            '''
        #self.write_message('OK')
  
    def on_close(self):
        print 'Connection closed'
  
    def on_ping(self, data):
        print 'ping received: %s' %(data)
  
    def on_pong(self, data):
        print 'pong received: %s' %(data)
  
    def check_origin(self, origin):
        #print "-- Request from %s" %(origin)
        return True

# Main loop (asynchrounous thread)

def main_loop(data):
    global run, websocket_server, status, tablet_service
    while (run):
        time.sleep(1)
        #if (run and not websocket_server is None):
            #try:
                #websocket_server.write_message(status)
                #print status
            #except tornado.websocket.WebSocketClosedError:
                #print 'Connection closed.'
                #websocket_server = None

    print "Main loop quit."


def main():
    global run,session,tablet_service, robot

    parser = argparse.ArgumentParser()
    parser.add_argument("--pip", type=str, default=os.environ['PEPPER_IP'],
                        help="Robot IP address.  On robot or Local Naoqi: use '127.0.0.1'.")
    parser.add_argument("--pport", type=int, default=9559,
                        help="Naoqi port number")
    parser.add_argument("--serverport", type=int, default=9000,
                        help="Server port")

    args = parser.parse_args()
    pip = args.pip
    pport = args.pport
    server_port = args.serverport 

    #Starting application
    '''
    try:
        connection_url = "tcp://" + pip + ":" + str(pport)
        app = qi.Application(["Websocket server", "--qi-url=" + connection_url ])
    except RuntimeError:
        print ("Can't connect to Naoqi at ip \"" + pip + "\" on port " + str(pport) +".\n"
               "Please check your script arguments. Run with -h option for help.")
        sys.exit(1)

    app.start()
    session = app.session
    pepper_cmd.session = app.session
    #tablet_service = app.session.service("ALTabletService")

    memory_service  = session.service("ALMemory")

    #Tablet touch (does not forward signal to other layers)
    #idTTouch = tablet_service.onTouchDown.connect(onTouched)

    #subscribe to any change on "HandRightBack" touch sensor
    #rhTouch = memory_service.subscriber("HandRightBackTouched")
    #idRHTouch = rhTouch.signal.connect(rhTouched)
    '''


    # Run main thread
    t = Thread(target=main_loop, args=(None,))
    t.start()

    # Run robot
    robot = PepperRobot()
    robot.connect(os.environ['PEPPER_IP'], pport, False)
    #begin()

    # Run web server
    application = tornado.web.Application([
        (r'/websocketserver', MyWebSocketServer),])  
    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(server_port)
    print "%sWebsocket server listening on port %d%s" %(GREEN,server_port,RESET)
#    tablet_service.showWebview(webview)



    try:
        tornado.ioloop.IOLoop.instance().start()
    except KeyboardInterrupt:
        print " -- Keyboard interrupt --"

    # Quit
    end()

    if (not websocket_server is None):
        websocket_server.close()
    print "Web server quit."
    run = False    
    print "Waiting for main loop to quit..."

if __name__ == "__main__":
    main()