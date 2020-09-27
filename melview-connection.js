const Mutex = require('async-mutex').Mutex;
const NodeCache = require("node-cache");

const fetchingUnitsLock = new Mutex();
const nodeCache = new NodeCache();

module.exports = function (RED) {
    const request = require('request');

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

        this.GetUnits = async function (callback) {

            let buildings = nodeCache.get("buildings");

            if (buildings !== undefined) {
                callback(buildings);
                return;
            }

            const release = await fetchingUnitsLock.acquire();

            buildings = nodeCache.get("buildings");

            if (buildings !== undefined) {
                release();
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
                        nodeCache.set("buildings", buildings, 10);
                        release();
                        callback(buildings);
                    } catch (e) {
                        release();
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