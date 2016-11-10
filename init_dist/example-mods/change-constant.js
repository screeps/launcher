// Change a global constant

module.exports = function (config) {
    if(config.common) {
        config.common.constants.CREEP_LIFE_TIME = 300;
    }
};