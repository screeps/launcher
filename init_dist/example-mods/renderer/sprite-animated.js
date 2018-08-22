// Add PNG sprite graphic for custom object type "test"
// Animate sprite scale and lighting color
// Use this CLI command to add it in the game:
// storage.db['rooms.objects'].insert({type: "test", room: "W3N3", x: 20, y: 20});
//
// See renderer documentation: https://github.com/screeps/renderer

module.exports = function(config) {
    if(config.backend) {
        config.backend.renderer.resources['my_gift_texture'] = '{ASSETS_URL}/gift.png';
        config.backend.renderer.metadata['test'] = {
            processors: [
                {
                    type: 'sprite',
                    once: true,
                    payload: {
                        texture: 'my_gift_texture',
                        width: 100,
                        height: 100,
                    },
                    actions: [{
                        action: 'Repeat',
                        params: [{
                            action: 'Sequence',
                            params: [
                                [
                                    {
                                        action: 'ScaleTo',
                                        params: [
                                            1.5, // x scale
                                            1.5,  // y scale
                                            0.3, // duration in seconds
                                        ],
                                    },
                                    {
                                        action: 'ScaleTo',
                                        params: [
                                            1,
                                            1,
                                            1,
                                        ],
                                    },
                                ],
                            ],
                        }],
                    }],

                },

                // Add some animated lighting
                {
                    type: 'sprite',
                    once: true,
                    layer: 'lighting',
                    payload: {
                        texture: 'glow',
                        width: 800,
                        height: 800,
                        tint: 0xFFFFFF,
                    },
                    actions: [{
                        action: 'Repeat',
                        params: [{
                            action: 'Sequence',
                            params: [
                                [
                                    {
                                        action: 'TintTo',
                                        params: [
                                            0xFFFFFF,   // tint color
                                            0.3,        // duration in seconds
                                        ],
                                    },
                                    {
                                        action: 'TintTo',
                                        params: [
                                            0x33AA33,
                                            1,
                                        ],
                                    },
                                ],
                            ],
                        }],
                    }],
                },
            ],
        }
    }
}