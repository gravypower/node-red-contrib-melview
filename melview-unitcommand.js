module.exports = function(RED) {
    function UnitCommandNode(config) {
        RED.nodes.createNode(this, config);
        this.melviewConnection = RED.nodes.getNode(config.melviewConnection);

        let node = this;
        node.on('input', function(msg) {

            let authCookie = node.melviewConnection.getAuthCookie();

            if(authCookie != null && melviewCookie.cookie != null) {
                this.status({fill: "green", shape: "dot", text: "connected"});
            }
            else {
                this.status({fill: "red", shape: "ring", text: "disconnected"});
            }

            node.send(msg);
        });
    }
    RED.nodes.registerType("unit-command", UnitCommandNode);
};
