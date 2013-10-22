var Xbmc = require('./node-xbmc');
var xbmcApi;
var connection;
var queue = [];
var specials = {
	'ShowOSD': 'Input.ContextMenu'
};

function CQ() {
	var self = this;
	this.connect = function() {
		console.log('Acquiring connection');
  		connection = new Xbmc.TCPConnection({
    			host: '192.168.1.5',
    			port: 9090,
    			verbose: false
  		});
		if(!xbmcApi) {
			xbmcApi = new Xbmc.XbmcApi;
		}
  		xbmcApi.setConnection(connection);
		xbmcApi.on('connection:close', function() {
			//connection.close();
		});
		xbmcApi.on('connection:error', function() {
			self.connect();
		});
	}
	this.add = function(cmd) {
		queue.push(cmd);
		this.relay();
	}
	this.relay = function() {
		if(connection && connection.isActive()) {
			// do it now
			self.fire();
		}else {
			// connect
			self.connect();
			// do upon connection
			console.log('Lost connection');
			xbmcApi.on('connection:open', function()  {
				self.fire();
  			});
		}
	}
	this.identifyCommand = function(command) {
		var temp = queue[0].split('.');
		var category = temp[0].toLowerCase();
		var name = temp[1];
		return {
			category: category,
			name: name
		};
	}
	this.fire = function() {
    		var command;
    		while(queue.length > 0) {
				command = this.identifyCommand(queue[0]);
      			console.log('Doing', command.name, 'on', command.category);
      			queue.shift();
      			if (xbmcApi[command.category][command.name] != null) {
        			if(command.name in specials) {
        				xbmcApi.player.GetActivePlayers(function(data) {
        					var command;
        					if(data.result.length === 0) {
            					command = self.identifyCommand(specials[command.name]);
            					xbmcApi[command.category][command.name]();
        					}
        				});
    				}
				xbmcApi[command.category][command.name]();
      			} else {
        			console.log(category + "." + name + " does not exists");
      			}
    		}
	}
}

  //console.log('Status check', connection.isActive());
  //xbmcApi.on('connection:data', function()  { console.log('onData');  });
  //xbmcApi.on('connection:close', function() { console.log('onClose'); });
  //xbmcApi.on('connection:open', function()  {
    //console.log('Status check', connection.isActive());
  //});
  
module.exports = CQ;
