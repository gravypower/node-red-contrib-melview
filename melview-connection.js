module.exports = function (RED) {
    const request = require('request');
    const NodeCache = require( "node-cache" );

    function MelviewConnectionNode(config) {
        RED.nodes.createNode(this, config);

        this.melviewEndpoint = config.melviewEndpoint;
        this.appVersion = config.appVersion;
        this.username = config.username;

        const nodeContext = this.context();
        const credentials = this.credentials;
        const node = this;

        this.getAuthCookie = function (callback) {
            let authCookie = nodeContext.get('authCookie');

            if (typeof authCookie != 'undefined') {
                node.log("Returning cookie form context.");
                callback(authCookie);
                return;
            }

            const postData = JSON.stringify({
                'user': config.username,
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
                callback(response.headers['set-cookie']);
            });
        };

        this.GetUnits = function(callback)
        {
            let nodeCache = nodeContext.get('NodeCache');

            if (typeof nodeCache == 'undefined') {
                nodeCache = new NodeCache();
                nodeContext.set('NodeCache', nodeCache);
            }

            let buildings = nodeCache.get("buildings");

            if (buildings !== undefined ){
                callback(buildings);
                return;
            }

            node.getAuthCookie(function (authCookie) {
                const options = {
                    'method': 'POST',
                    'url': `https://${config.melviewEndpoint}/api/rooms.aspx`,
                    'headers': {
                        'Content-Type': 'application/json; charset=utf-8',
                        'User-Agent': 'request',
                        'Cookie': authCookie
                    }
                };

                request(options, function (error, response) {
                    let buildings;
                    try {
                        buildings = JSON.parse(response.body);

                        nodeCache.set( "buildings", buildings, 5 );
                        nodeContext.set('NodeCache', nodeCache);

                        callback(buildings);
                    } catch (e) {
                        node.error(`error: ${e.message}`);
                    }
                });
            });
        };

        this.log(`starting endpoint: /melview/${node.id}/rooms`);
        RED.httpAdmin.get(`/melview/${node.id}/rooms`, function (req, res) {
            node.GetUnits(function (response) {
                res.send(response);
            });
        });
    }

    RED.nodes.registerType('melview-connection',
        MelviewConnectionNode,
        {
            credentials: {
                password: {type: 'password'}
            }
        });
};




