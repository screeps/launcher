// Add an object with type "myobject" visually represented by a green circle

module.exports = function(config) {

    if(config.backend) {
        // Add visuals
        config.backend.customObjectTypes.myobject = {
            svg: '<ellipse cx="0" cy="0" rx="40" ry="40" fill="#77ff77"></ellipse>'
        }
    }

    if(config.engine) {
        // Add MyObject prototype to user scripts
        config.engine.registerCustomObjectPrototype('myobject', 'MyObject', {
            findConstant: 10000
        });
    }
}

/*

 How to test

 Add a new object using CLI:

 storage.db['rooms.objects'].insert({type: 'myobject', room: yourRoomName,
    x: 20, y: 20});

 Now you will see a green circle at this position in the room.
 This object will have MyObject prototype in your script,
 you can address it this way:
 
 Game.rooms[yourRoomName].find(10000);

 */