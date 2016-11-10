// Change the server welcome text dialog

module.exports = function(config) {
    if(config.backend) {
        config.backend.welcomeText = `This is my Screeps server. 
                                      <b>HTML</b> <i>markup</i> is <span style="font-size: 20px; color: #33ff99">allowed</span>.`;
    }
};