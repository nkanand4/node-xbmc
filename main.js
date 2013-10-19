var Xbmc = require('./index');
var xbmcApi, connection;
connection = new Xbmc.TCPConnection({
        host: '192.168.1.5',
        port: 9090,
        verbose: true
    });
xbmcApi = new Xbmc.XbmcApi;
xbmcApi.setConnection(connection);

xbmcApi.on('connection:open', function()  {
    if(true /* command is OSD*/) {
        xbmcApi.player.GetActivePlayers(function(data) {
            if(data.result.length === 0) {
                xbmcApi.input.ContextMenu();
            }
        });
    }
});

xbmcApi.on('connection:data', function(data)  {
    console.log('response', data);  
});