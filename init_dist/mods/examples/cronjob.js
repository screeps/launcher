// Add a new cron job function

var cnt = 0;
module.exports = function(config) {
    if(config.cronjobs) {
        config.cronjobs.myCronJob = [
            5,                              // interval in seconds
            function myCronJob() {
                cnt++;
                console.log(cnt);           // Output goes to backend log
            }
        ];
    }
};