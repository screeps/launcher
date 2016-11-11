// Add an object with type "myobject" visually represented by a green circle
// It should have a counter incrementing each tick

module.exports = function(config) {

    if(config.backend) {
        // Add visuals
        config.backend.customObjectTypes.myobject = {

            svg: `<ellipse cx="0" cy="0" rx="40" ry="40" fill="#77ff77"></ellipse>
                  <text x="0" y="20" text-anchor="middle" font-size="50" 
                        fill="#000000" font-weight="bold">{{object.counter}}</text>`,

            sidepanel: '<div><label>Counter:</label><span>{{object.counter}}</span></div>'
        }
    }

    if(config.engine) {
        // Add MyObject prototype to user scripts
        config.engine.registerCustomObjectPrototype('myobject', 'MyObject', {
            properties: {
                counter: object => object.counter
            },
            prototypeExtender(prototype, scope) {
                prototype.getCounter = function() {
                    scope.globals.console.log('Current counter is:', this.counter);
                    return this.counter + '!';
                }
            },
            findConstant: 10000
        });

        // Increment the counter each tick
        var oldCallback = config.engine.onProcessObject;

        config.engine.onProcessObject = function(object, roomObjects, roomTerrain, gameTime,
            roomInfo, objectsUpdate, usersUpdate) {

            oldCallback.apply(this, arguments);
            
            if(object.type == 'myobject') {                
                objectsUpdate.update(object, {
                    counter: object.counter + 1
                });
            }
        }
    }
}

/*

 How to test

 Add a new object using CLI:

 storage.db['rooms.objects'].insert({type: 'myobject', room: yourRoomName,
    x: 20, y: 20, counter: 0});

 Now you will see a green circle at this position in the room.
 This object will have MyObject prototype in your script,
 you can address it this way:

 var objects = Game.rooms[yourRoomName].find(10000);

 You will see how its counter grows:

 console.log(objects[0].counter);

 */