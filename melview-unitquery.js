module.exports = function (RED) {
    function UnitQueryNode(config) {
        RED.nodes.createNode(this, config);
        this.melviewConnection = RED.nodes.getNode(config.melviewConnection);
        this.building = config.building;
        this.unit = config.unit;

        const node = this;
        const melviewConnection = this.melviewConnection;

        node.on('input', function (msg) {
            let query = {
                'building': config.building,
                'unit': config.unit
            };

            melviewConnection.GetUnits(function (response) {
                let building = response.find(b => b.buildingid === query.building);
                msg.payload = building.units.find(u => u.unitid === query.unit);
                node.send(msg);
            });
        });
    }

    RED.nodes.registerType("unit-query", UnitQueryNode);
};