// Add an object with type "myobject" visually represented by a green circle
// It should have a command for increment the counter 

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
                prototype.increment = function(value) {
                    scope.intents.set(this.id, 'incCounter', {incValue: value});
                    return 0;
                }
            },
            findConstant: 10000
        });
        
        // Add a new custom intent type description.
        // It is global for all object types
        config.engine.customIntentTypes.incCounter = {
            incValue: 'number'
        };

        // Add "incCounter" command processing
        config.engine.onProcessObjectIntents = function(object, userId, intents, roomObjects,
            roomTerrain, gameTime, roomInfo, objectsUpdate, usersUpdate) {

            if (object.type == 'myobject') {
                if (intents.incCounter) {
                    objectsUpdate.update(object, {
                        counter: object.counter + intents.incCounter.incValue
                    });
                }
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

 Run the command:

 objects[0].increment(2);
 console.log(objects[0].counter);

 */