// Add PNG sprite graphic for custom object type "test"
// Use this CLI command to add it in the game:
// storage.db['rooms.objects'].insert({type: "test", room: "W3N3", x: 20, y: 20, hasGift: false});
// Then try to set the hasGift property:
// storage.db['rooms.objects'].update({type: 'test'}, {$set: {hasGift: true}});
//
// See renderer documentation: https://github.com/screeps/renderer

module.exports = function(config) {
    if(config.backend) {
        config.backend.renderer.resources['my_gift_texture'] = '{ASSETS_URL}/gift.png';
        config.backend.renderer.metadata['test'] = {
            processors: [
                {
                    id: 'baseSprite',
                    type: 'sprite',
                    once: true,
                    payload: {
                        texture: 'my_gift_texture',
                        width: 100,
                        height: 100,
                    },
                },

                // Add some conditional lighting
                {
                    type: 'sprite',
                    props: ['hasGift'], // recreate this sprite when `hasGift` is changed
                    layer: 'lighting',
                    payload: {
                        texture: 'glow',
                        width: 800,
                        height: 800,
                        tint: 0xFFFFFF,
                        alpha: {$if: {$state: 'hasGift'}, then: 1.0, else: 0.5}
                    },
                },
            ],

            actions: [
                //this action should be outside the sprite processor since it should have its own `when` condition
                {
                    targetId: 'baseSprite',
                    when: {$state: 'hasGift'}, // only animate if `hasGift` property is truthy
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
                }
            ]
        }
    }
}