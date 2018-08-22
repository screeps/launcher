// Add simple graphic for custom object type "test"
// Use this CLI command to add it in the game:
// storage.db['rooms.objects'].insert({type: "test", room: "W3N3", x: 20, y: 20});
//
// See renderer documentation: https://github.com/screeps/renderer

module.exports = function (config) {
    if (config.backend) {
        config.backend.renderer.metadata['test'] = {
            processors: [
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

            ],
        }
    }
}