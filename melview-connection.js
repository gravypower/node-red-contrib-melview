module.exports = function(RED) {
    const request = require('request');
    const cookie = require("cookie");

    function MelviewConnectionNode(config) {
        RED.nodes.createNode(this, config);
        this.melviewEndpoint = config.melviewEndpoint;
        this.appVersion = config.appVersion;
        const nodeContext = this.context();
        const  credentials = this.credentials;

        const getAuthCookie = function () {
            let authCookie = nodeContext.get('authCookie');
            if (typeof authCookie != 'undefined') {
                return authCookie;
            }

            const  postData = JSON.stringify({
                'user': credentials.username,
                'pass': credentials.password,
                'appversion': config.appVersion
            });

            const options = {
                'method': 'POST',
                'url': 'https://' + config.melviewEndpoint + '/api/login.aspx',
                'headers': {
                    'Content-Type': 'application/json; charset=utf-8',
                    'User-Agent': 'request',
                    'Content-Length': postData.length
                },
                body: postData
            };

            request(options, function (error, response) {
                if (error) throw new Error(error);

                nodeContext.set('authCookie', response.headers['set-cookie']);
                return authCookie;
            });
        };

        RED.httpAdmin.get('/melview/rooms', function(req, res) {
            console.log('/melview/rooms');
            let postData = JSON.stringify({
                'user': credentials.username,
                'pass': credentials.password,
                'appversion': config.appVersion
            });

            const options = {
                'method': 'POST',
                'url': 'https://' + config.melviewEndpoint + '/api/rooms.aspx',
                'headers': {
                    'Content-Type': 'application/json; charset=utf-8',
                    'User-Agent': 'request',
                    'Content-Length': postData.length,
                    'Cookie': getAuthCookie()
                },
                body: postData
            };

            console.log(options);

            request(options, function (error, response) {
                if (error) throw new Error(error);
                console.log('https://' + config.melviewEndpoint + '/api/rooms.aspx');
                const rooms = nodeContext.get('rooms');
                if (typeof rooms != 'undefined') {
                    return rooms;
                }

                nodeContext.set('rooms', response.body);

                res.status(200).send(response.body);
            });
        });

        this.getAuthCookie = getAuthCookie();
    }

    RED.nodes.registerType('melview-connection',
        MelviewConnectionNode,
        {
            credentials: {
                username: {type: 'text'},
                password: {type: 'password'}
            }
        });

};




