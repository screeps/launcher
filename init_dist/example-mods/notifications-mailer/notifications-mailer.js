module.exports = function(config) {

    if(config.backend) {

        var nodemailer = require('nodemailer');
        var transporter = nodemailer.createTransport('smtps://user%40gmail.com:pass@smtp.gmail.com');

        config.backend.on('sendUserNotifications', function(user, notifications) {

            if(!user.email) {
                return;
            }

            var mailOptions = {
                from: 'Private Screeps Mailer <user@gmail.com>', 
                to: user.email,
                subject: 'Screeps private server notifications'
            };

            mailOptions.text = notifications.length + ' notifications received:\n\n';

            notifications.forEach(notification => {
                mailOptions.text += `${notification.message}\n[${notification.type}] (${notification.count})\n\n`;
            })

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    return console.error(error);
                }
            });
        });

    }

}