// Add an endpoint /api/test to the HTTP server

module.exports = function(config) {
    if(config.backend) {
        config.backend.router.get('/test', (request, response) => {
            response.json({ok: 1, foo: request.query.foo});
        })
    }
};