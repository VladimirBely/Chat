const http = require('http');
const WebSocketServer = require('websocket').server;
const PORT = 8080;
const clientsURL = ['http://127.0.0.1:5500/'];
function callback(req, res) {
    console.log('HTTP request');
    res.writeHead(404);
    res.end();
}

const httpServer = http.createServer(callback);
const wsServer = new WebSocketServer({
    httpServer
});

let connectionObj = {};
let usersCount = 1;
wsServer.on('request', function (request) {

    let userName = `User${usersCount}`;
    usersCount++;

    let isExist = !clientsURL.some(clientURL => {
        return clientURL === request.origin;
    });

    if (!isExist) {
        request.reject();
        console.log('Enemy connection');
    }

    const connection = request.accept('echo-protocol', request.origin);

    connectionObj[userName] = connection;

    const registrationData = {
        type: 'registration',
        name: userName
    };

    connection.send(JSON.stringify(registrationData));

    connection.on('message', data => {
        const returnObj = JSON.parse(data.utf8Data);
        returnObj.time = new Date().toLocaleTimeString();


        Object.values(connectionObj).forEach(connection => {
            connection.send(JSON.stringify(returnObj));
        });
        console.log(data);
    });

    connection.on('close', () => {
        Object.keys(connectionObj).forEach(key => {
            if (connectionObj[key] === connection) {
                const closeInfoObj = {
                    type: 'close',
                    name: key
                };
                Object.values(connectionObj).forEach(connection => {
                    connection.send(JSON.stringify(closeInfoObj));
                });
            }
        });
        console.log('Server connection is close');
    });

    connection.on('error', () => {
        console.log('Server error');
    });
});

httpServer.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
});


