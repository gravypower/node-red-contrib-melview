module.exports = function(RED) {
    function UnitCommandNode(config) {
        RED.nodes.createNode(this, config);
        this.melviewConnection = RED.nodes.getNode(config.melviewConnection);
        var globalContext = this.context().global;
        var melviewCookie = globalContext.get("melviewCookie", "file");

        if(melviewCookie != null && melviewCookie.cookie != null) {
            this.status({fill: "green", shape: "dot", text: "connected"});
        }
        else {
            this.status({fill: "red", shape: "ring", text: "disconnected"});
            this.melviewConnection.cookie();
        }

        var node = this;
        node.on('input', function(msg) {
            msg.payload = msg.payload.toLowerCase();
            node.send(msg);
        });
    }
    RED.nodes.registerType("unit-command",UnitCommandNode);
}
