
module.exports = function(RED) {
    function MelviewConnectionNode(n) {
        RED.nodes.createNode(this,n);
        this.melviewEndpoint = n.melviewEndpoint;
        this.appVersion = n.appVersion;
        this.cookie = function()
        {
            const https = require('https');

            var postData = JSON.stringify({
                "user" : this.credentials.username,
                "pass" : this.credentials.password,
                "appversion": this.appVersion
            });

            console.log('postData:', postData);

            var options = {
                hostname: this.melviewEndpoint,
                port: 443,
                path: "/api/login.aspx",
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "Content-Length": postData.length
                }
            };

            console.log('options:', options);

            var req = https.request(options, (res) => {
                console.log('statusCode:', res.statusCode);
                console.log('headers:', res.headers);

                res.on('data', (d) => {
                    process.stdout.write(d);
                });
            });

            req.on('error', (e) => {
                console.error(e);
            });

            req.write(postData);
            req.end();
        }
    }
    RED.nodes.registerType("melview-connection",
        MelviewConnectionNode,
        {
            credentials: {
                username: {type:"text"},
                password: {type:"password"}
            }
        });
}