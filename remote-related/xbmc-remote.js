var config = require('../host');
var Xbmc = require('./node-xbmc');
var xbmcApi;
var connection;
var queue = [];
var specials = {
    'ShowOSD' : {
    	'noplayer': 'Input.ContextMenu'
    },
    'Up': {
    	'player': 'Application.IncreaseVolume'
    },
    'Up': {
    	'player': 'Application.ReduceVolume'
    }
};

function CQ() {
    var self = this;
    this.connect = function() {
        console.log('Acquiring connection');
        connection = new Xbmc.TCPConnection({
            host : config.host,
            port : 9090,
            verbose : false
        });
        if (!xbmcApi) {
            xbmcApi = new Xbmc.XbmcApi;
        }
        xbmcApi.setConnection(connection);
        // xbmcApi.on('connection:close', function() {});
        xbmcApi.on('connection:open', function() {
            xbmcApi.message('Roku remote connected.', 'Roku remote', 3000);
        });
        xbmcApi.on('connection:error', function() {
            self.connect();
        });
    };
    this.changeDefaults = function(xbmcApi) {
        xbmcApi.application.defaults.stepVol = 70;
        return xbmcApi;
    };
    this.add = function(cmd) {
        queue.push(cmd);
        this.relay();
    };
    this.relay = function() {
        if (connection && connection.isActive()) {
            // do it now
            self.fire();
        } else {
            // connect
            self.connect();
            // do upon connection
            console.log('Lost connection');
            xbmcApi.on('connection:open', function() {
                self.changeDefaults(xbmcApi);
                self.fire();
            });
        }
    };
    this.identifyCommand = function(command) {
        var temp = command.split('.');
        var category = temp[0].toLowerCase();
        var name = temp[1];
        return {
            category : category,
            name : name
        };
    };
    this.fire = function() {
        var command;
        while (queue.length > 0) {
            command = this.identifyCommand(queue[0]);
            console.log('Doing', command.name, 'on', command.category);
            queue.shift();
            if (xbmcApi[command.category][command.name] != null) {
                if (command.name in specials) {
                    xbmcApi.player
                            .GetActivePlayers(function(data) {
                                var specialCommand
                                	condition = data.result.length === 0 ? 'noplayer' : 'player';
                                if (specials[command.name][condition]) {
                                    specialCommand = self.identifyCommand(specials[command.name][condition]);
                                    xbmcApi[specialCommand.category][specialCommand.name]();
                                }
                            });
                }
                xbmcApi[command.category][command.name]();
            } else {
                console.log(command.category + "." + command.name + " does not exists");
            }
        }
    };
}

// console.log('Status check', connection.isActive());
// xbmcApi.on('connection:data', function() { console.log('onData'); });
// xbmcApi.on('connection:close', function() { console.log('onClose'); });
//xbmcApi.on('connection:open', function()  {
//console.log('Status check', connection.isActive());
//});

module.exports = CQ;
