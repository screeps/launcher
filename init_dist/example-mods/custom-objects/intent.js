// Add an object with type "myobject" visually represented by a green circle
// It should be able to run the "move" command

module.exports = function(config) {

    if(config.backend) {
        // Add visuals
        config.backend.renderer.metadata['myobject'] = {
            processors: [
                {
                    type: 'draw',
                    once: true,
                    payload: {
                        drawings: [
                            { method: 'beginFill', params: [0x77FF77] },
                            { method: 'drawCircle', params: [0,0,40] },
                            { method: 'endFill' }
                        ]
                    }
                }
            ],
            actions: [
                {
                    id: 'moveTo',
                    props: ['x', 'y'],
                    actions: [{
                        action: 'Ease',
                        params: [
                            {
                                action: 'MoveTo',
                                params: [
                                    { $state: 'x', koef: 100 },
                                    { $state: 'y', koef: 100 },
                                    { $processorParam: 'tickDuration' },
                                ],
                            },
                            'EASE_IN_OUT_QUAD',
                        ],
                    }],
                }
            ]
        };
    }

    if(config.engine) {
        // Add MyObject prototype to user scripts
        config.engine.registerCustomObjectPrototype('myobject', 'MyObject', {
            userOwned: true,
            prototypeExtender(prototype, scope) {
                prototype.move = function(direction) {
                    scope.intents.set(this.id, 'move', {direction});
                    return 0;
                }
            },
            findConstant: 10000
        });

        // Add "move" command processing logic
        config.engine.on('processObjectIntents', function(object, userId, intents, roomObjects,
                                                          roomTerrain, gameTime, roomInfo, objectsUpdate,
                                                          usersUpdate) {

            if(object.type == 'myobject') {
                if(intents.move) {
                    var x = object.x, y = object.y;
                    switch(intents.move.direction) {
                        case 1: {
                            y = object.y - 1;
                            break;
                        }
                        case 2: {
                            x = object.x + 1;
                            y = object.y - 1;
                            break;
                        }
                        case 3: {
                            x = object.x + 1;
                            break;
                        }
                        case 4: {
                            x = object.x + 1;
                            y = object.y + 1;
                            break;
                        }
                        case 5: {
                            y = object.y + 1;
                            break;
                        }
                        case 6: {
                            x = object.x - 1;
                            y = object.y + 1;
                            break;
                        }
                        case 7: {
                            x = object.x - 1;
                            break;
                        }
                        case 8: {
                            x = object.x - 1;
                            y = object.y - 1;
                            break;
                        }
                    }
                    objectsUpdate.update(object, {x,y});
                }
            }
        });
    }
}

/*

 How to test

 Find your user id:

 storage.db.users.findOne({username: yourUserName})

 Add a new owned object using CLI:

 storage.db['rooms.objects'].insert({type: 'myobject', room: yourRoomName,
    x: 20, y: 20, user: yourUserId});

 Now you will see a green circle at this position in the room.
 This object will have MyObject prototype in your script,
 you can address it this way:

 var objects = Game.rooms[yourRoomName].find(10000);

 Now you can move it:

 objects[0].move(TOP);

 */
