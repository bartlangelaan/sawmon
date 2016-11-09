'use strict';

const SettingsManager = require('./settings-manager');
const Website = require('./website');
const Server = require('./server');

class CronjobManager {

    run () {

        SettingsManager.get('core_server_refresh_interval').then(interval => {

            return Server.find({
                'refreshStatus.running': false,
                $or: [
                    {'refreshStatus.finished': {$lt: new Date() - (interval * 1000)}},
                    {'refreshStatus.finished': null}
                ]
            }).sort({'refreshStatus.finished': 'desc'}).limit(1);

        }).then(servers => {

            servers.forEach(server => server.refresh());

        });

        SettingsManager.get('core_server_ping_interval').then(interval => {

            return Server.find({
                'pingStatus.running': false,
                $or: [
                    {'pingStatus.finished': {$lt: new Date() - (interval * 1000)}},
                    {'pingStatus.finished': null}
                ]
            }).sort({'pingStatus.finished': 'desc'}).limit(1);

        }).then(servers => {

            servers.forEach(server => server.ping());

        });

        SettingsManager.get('core_website_refresh_interval').then(interval => {

            return Website.find({
                'refreshStatus.running': false,
                $or: [
                    {'refreshStatus.finished': {$lt: new Date() - (interval * 1000)}},
                    {'refreshStatus.finished': null}
                ]
            }).sort({'refreshStatus.finished': 'desc'}).limit(1);

        }).then(websites => {

            websites.forEach(website => website.refresh());

        });

        SettingsManager.get('core_website_ping_interval').then(interval => {

            return Website.find({
                'pingStatus.running': false,
                $or: [
                    {'pingStatus.finished': {$lt: new Date() - (interval * 1000)}},
                    {'pingStatus.finished': null}
                ]
            }).sort({'pingStatus.finished': 'desc'}).limit(1);

        }).then(websites => {

            websites.forEach(website => website.ping());

        });

    }
}

module.exports = new CronjobManager();
