module.exports = function(apacheConfig){
    // Split all virtual hosts
    var virtualHosts = apacheConfig.split("<VirtualHost");

    // Delete everything before the first virtualhost
    virtualHosts.shift();

    return virtualHosts.map(function(virtualHost){
        var vh = {
            domains: [],
            root: undefined
        };
        virtualHost.split('\n').forEach(function(line){
            var split = line.trim().split(' ');
            if(split[0] == "ServerName" || split[0] == "ServerAlias"){
                vh.domains.push(split[1]);
            }
            else if(split[0] == "DocumentRoot"){
                vh.root = split[1];
            }
        });
        return vh;
    });
};