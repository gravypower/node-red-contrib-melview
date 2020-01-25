module.exports = function(RED) {
    const request = require('request');
    const tough = require('tough-cookie');
    const Cookie = tough.Cookie;

    function MelviewConnectionNode(config) {
        RED.nodes.createNode(this, config);
        this.melviewEndpoint = config.melviewEndpoint;
        this.appVersion = config.appVersion;
        let nodeContext = this.context();

        this.getRooms = function () {
            let postData = JSON.stringify({
                'user': this.credentials.username,
                'pass': this.credentials.password,
                'appversion': this.appVersion
            });

            const options = {
                'method': 'POST',
                'url': 'https://' + config.melviewEndpoint + '/api/rooms.aspx',
                'headers': {
                    'Content-Type': 'application/json; charset=utf-8',
                    'User-Agent': 'request',
                    'Content-Length': postData.length,
                    'set-cookie': this.getAuthCookie().value
                },
                body: postData
            };

            request(options, function (error, response) {
                if (error) throw new Error(error);

                let rooms = nodeContext.get('rooms');
                if (typeof rooms != 'undefined') {
                    return rooms;
                }

                nodeContext.set('rooms', response.body);
                return response.body;
            });
        };

        this.getAuthCookie = function () {
            let authCookie = nodeContext.get('authCookie');
            if (typeof authCookie != 'undefined') {
                return authCookie;
            }

            let postData = JSON.stringify({
                'user': this.credentials.username,
                'pass': this.credentials.password,
                'appversion': this.appVersion
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

                let cookies;
                if (response.headers['set-cookie'] instanceof Array)
                    cookies = response.headers['set-cookie'].map(Cookie.parse);
                else
                    cookies = [Cookie.parse(response.headers['set-cookie'])];

                for (let i in cookies) {
                    let cookie = cookies[i];
                    cookies[i] = cookie.toJSON();
                }

                let authCookie = cookies.find(c => c.key === 'auth');
                nodeContext.set('authCookie', authCookie);

                return authCookie;
            });
        };
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




