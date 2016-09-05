'use strict';

module.exports.test = (website, ssh) => {
    return ssh
        .execCommand('drush pm-updatestatus --security-only --format=json', {
            cwd: website.root
        })
        .then(function(result){
            return result.code == 0;
        })
        .catch(err => {
            console.log('Error when testing for a Drupal site: ', err);
            return false;
        });
};

module.exports.refresh = (website, ssh) => {
    return ssh
        /**
         * Get updates
         */
        .execCommand('drush pm-updatestatus --security-only --format=json', {
            cwd: website.root
        })
        .then(function(result){
            if(result.stdout.length){
                try{
                    var updates = JSON.parse(result.stdout);

                    website.updates = [];

                    for(var module in updates){
                        website.updates.push({
                            name: updates[module].name,
                            existingVersion: updates[module].existing_version,
                            candidateVersion: updates[module].candidate_version
                        });
                    }
                    return website.save();
                }
                catch(err){
                    console.error('Error while parsing update status:', err, '\n\nThe result provided was:', result);
                }
            }
        });
};