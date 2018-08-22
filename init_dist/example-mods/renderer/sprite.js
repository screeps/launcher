// Add PNG sprite graphic for custom object type "test"
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
                },
            ],
        }
    }
}