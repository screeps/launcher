// Add simple graphic for custom object type "test"
// Use this CLI command to add it in the game:
// storage.db['rooms.objects'].insert({type: "test", room: "W3N3", x: 20, y: 20, score: 0, scoreMax: 100});
// Then try to set the score property:
// storage.db['rooms.objects'].update({type: 'test'}, {$set: {score: 30}});
//
// See renderer documentation: https://github.com/screeps/renderer

module.exports = function (config) {
    if (config.backend) {
        config.backend.renderer.metadata['test'] = {
            calculations: [
                {
                    // it is addressed from the second draw processor below
                    id: 'scoreDrawRadius',
                    //recalculate when `score` or `scoreMax` are changed
                    props: ['score','scoreMax'],
                    // 40 * state / stateMax
                    func: {
                        $mul: [
                            40,
                            {$div: [
                                {$state: 'score'},
                                {$state: 'scoreMax'}
                            ]}
                        ]
                    }
                }
            ],
            processors: [

                // base rectangle
                {
                    type: 'draw',
                    once: true,
                    payload: { 
                        drawings: [
                            // Each element here describes a PIXI.Graphics method
                            // See http://pixijs.download/dev/docs/PIXI.Graphics.html
                            {
                                method: 'lineStyle',
                                params: [
                                    5,
                                    0xFFAAFF
                                ],
                            },
                            {
                                method: 'beginFill',
                                params: [0xFF00FF]
                            },
                            {
                                method: 'drawRoundedRect',
                                params: [
                                    -40,
                                    -40,
                                    80,
                                    80,
                                    10,
                                ],
                            },
                            {
                                method: 'endFill'
                            },
                        ],
                    },
                },

                // a circle with radius depending on the `score` property
                {
                    type: 'draw',
                    props: ['score','scoreMax'], // recreate this drawing when `score` or `scoreMax` are changed
                    when: {$gt: [{$state: 'score'}, 0]}, // only display if `score` property is greater than 0
                    payload: {
                        drawings: [
                            {
                                method: 'beginFill',
                                params: [0xFFFFFF]
                            },
                            {
                                method: 'drawCircle',
                                params: [
                                    0,
                                    0,
                                    {$calc: 'scoreDrawRadius'}
                                ],
                            },
                            {
                                method: 'endFill'
                            },
                        ],
                    },
                },

                // add some conditional lighting
                {
                    type: 'sprite',
                    once: true,
                    layer: 'lighting',
                    when: {$gt: [{$state: 'score'}, 0]}, // only display if `score` property is greater than 0
                    payload: {
                        texture: 'glow',
                        width: 800,
                        height: 800,
                        tint: 0xFFFFFF,
                    },
                },

            ],
        }
    }
}