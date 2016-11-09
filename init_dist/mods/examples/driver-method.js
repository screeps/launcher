// Change driver.getAllUsers method and exclude particular users from executing

var _ = require('lodash');

module.exports = function(config) {
    if(config.engine) {
        var oldGetAllUsers = config.engine.driver.getAllUsers;
        config.engine.driver.getAllUsers = function() {
            var promise = oldGetAllUsers.apply(this, Array.prototype.slice.call(arguments));

            return promise.then(result => {
                _.remove(result, {username: 'user_to_exclude'});
                return result;
            });
        }
    }
};