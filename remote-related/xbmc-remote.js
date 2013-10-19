var Xbmc = require('./node-xbmc');
var xbmcApi;
var connection;
var queue = [];

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
	this.fire = function() {
    		//console.log('onOpen');
    		while(queue.length > 0) {
			var category = queue[0].split('.')[0].toLowerCase();
      			var name = queue[0].split('.')[1];
      			console.log('Doing', name, 'on', category);
      			queue.shift();
      			if (xbmcApi[category][name] != null) {
        			if(name === 'ShowOSD') {
        				xbmcApi.player.GetActivePlayers(function(data) {
            					if(data.result.length === 0) {
                					xbmcApi.input.ContextMenu();
            					}
        				});
    				}
				xbmcApi[category][name]();
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
