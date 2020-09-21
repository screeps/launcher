// Add an object with type "myobject" visually represented by a green circle
// It should have a command for increment the counter

module.exports = function(config) {

    if(config.backend) {
        // Add side panel
        config.backend.customObjectTypes.myobject = {
            sidepanel: '<div><label>Counter:</label><span>{{object.counter}}</span></div>'
        };

        // Add visuals, see examples in renderer
        config.backend.renderer.metadata['myobject'] = {
            calculations: [
                {
                    id: 'displayCounter',
                    props: ['counter'],
                    func: {$state: 'counter'}
                }
            ],
            processors: [
                {
                    type: 'draw',
                    once: true,
                    payload: {
                        drawings: [
                            { method: 'beginFill', params: [0x77FF77] },
                            { method: 'drawCircle', params: [0,0,40] },
                            { method: 'endFill' }
                        ],
                    }
                },
                {
                    type: 'text',
                    props: ['counter'],
                    payload: {
                        text: { $calc: 'displayCounter' },
                        style: {  align: 'center', fill: '#000000', fontSize: 50, fontWeight: 'bold' },
                        anchor: {x: 0.5, y: 0.5}
                    }
                }
            ]
        };
    }

    if(config.engine) {

        // Add a new custom intent type description.
        // It is global for all object types
        config.engine.customIntentTypes.incCounter = {
            incValue: 'number'
        };

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

        config.engine.customIntentTypes['incCounter'] = {incValue: 'number'};

        // Add "incCounter" command processing
        config.engine.on('processObjectIntents', function(object, userId, intents, roomObjects,
                                                          roomTerrain, gameTime, roomInfo, objectsUpdate,
                                                          usersUpdate) {

            if (object.type == 'myobject') {
                if (intents.incCounter) {
                    objectsUpdate.update(object, {
                        counter: object.counter + intents.incCounter.incValue
                    });
                }
            }
        });
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
