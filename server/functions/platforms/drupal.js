'use strict';

const Platform = require('../../classes/platform');

class Drupal extends Platform {

    constructor(website, testResult){
        super(website);
        this.name = "Drupal";
        if(testResult) this.parseUpdateStatus(testResult);
    }

    static Test(website){
        return website.server._ssh.execCommand('drush pm-updatestatus --security-only --format=json', {
            cwd: website.root
        }).then(function(result){
            if(result.code != 0){
                // Not a Drupal site
                return false;
            }

            // for further use
            return result;
        }).catch(err => {
            console.log(err);
            return false;
        });
    }

    parseUpdateStatus(result){
        if(result.stdout.length){
            try{
                var updates = JSON.parse(result.stdout);

                this.updates = [];

                for(var module in updates){
                    this.updates.push({
                        name: updates[module].name,
                        existingVersion: updates[module].existing_version,
                        candidateVersion: updates[module].candidate_version
                    })
                }
            }
            catch(err){
                console.error(err, result);
            }
        }
    }
}

module.exports = Drupal;