var config = require('./host');
var Xbmc = require('./index');
var xbmcApi, connection;
connection = new Xbmc.TCPConnection({
        host: config.host,
        port: 9090,
        verbose: true
    });
xbmcApi = new Xbmc.XbmcApi;
xbmcApi.setConnection(connection);

xbmcApi.on('connection:open', function()  {
    xbmcApi.application.IncreaseVolume(function(data) {
        console.log('Volume increased', data);
    });
});

xbmcApi.on('connection:data', function(data)  {
    console.log('response', data);  
});