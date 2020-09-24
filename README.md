# node-red-contrib-melview

Set of node red nodes to communicate with the melview API

## Getting Started
You install this node:
* Add the unitcommand node to your flow
* Open the configuration
* Add an new configuration node
* Save
* Deploy, you need to deploy now as the configuration node makes a call to melview to get the rooms in your house so you can finish the configuration of the unitcommand node. (I am not happy with this process but its the only way I could get things working)
* Open the the configuration again.
* Select the room and fill out the form.

You just need to trigger the node currently for it to send the command to melview. I have not set up passing it values via the payload yet but this is to come. If you have a newer wifi control module this may not be the best way to control your heat pumps. Anything later than MAC-558IF-E you can sent local commands to, best case is MAC-568IF-E. I plan to support more wifi modules in the future when I can get my hands on some.
