module.exports = function (RED) {
    const request = require('request');

    function UnitCommandNode(config) {
        RED.nodes.createNode(this, config);
        this.melviewConnection = RED.nodes.getNode(config.melviewConnection);
        this.building = config.building;
        this.unit = config.unit;
        this.power = config.power;
        this.mode = config.mode;
        this.fanspeed = config.fanspeed;
        this.direction = config.direction;
        this.temperature = config.temperature;
        const node = this;
        const melviewConnection = this.melviewConnection;
        let validTemperature = true;

        function addCommand(command, commands) {
            if (typeof command != 'undefined' && command !== '')
                commands.push(command);
        }

        function GetTempCommand(temp) {
            if(isNaN(temp)) {
                node.error("temperature is not a number");
                validTemperature = false;
            }

            const t = parseFloat(temp);
            if(t < 17 || t > 31)
            {
                node.error("Temperature out of range");
                validTemperature = false;
            }

            if (typeof temp == 'undefined')
                return undefined;

            return 'TS' + temp;
        }

        node.on('input', function (msg) {
            let commands = [];
            if (config.power) {
                addCommand(config.power, commands);
                addCommand(config.mode, commands);
                addCommand(config.fanspeed, commands);
                addCommand(config.direction, commands);
                addCommand(GetTempCommand(config.temperature), commands);
            } else {
                commands.push('PW0');
            }

            let postData = JSON.stringify({
                'unitid': config.unit,
                'v': 3,
                'commands': commands.join(',')
            });

            melviewConnection.getAuthCookie(function (authCookie) {
                const options = {
                    'method': 'POST',
                    'url': `https://${melviewConnection.melviewEndpoint}/api/unitcommand.aspx`,
                    'headers': {
                        'Content-Type': 'application/json; charset=utf-8',
                        'User-Agent': 'request',
                        'Cookie': authCookie,
                        'Content-Length': postData.length
                    },
                    body: postData
                };

                if(validTemperature) {
                    request(options, function (error, response) {
                        if (error) node.error(error);
                        node.log(`sending command: ${postData}`)
                        node.send(msg);
                    });
                }
                else {
                    node.warn(`Temperature of ${config.temperature} is not valid. Not posting to melview.`)
                }
            });

        });
    }

    RED.nodes.registerType("unit-command", UnitCommandNode);
};
