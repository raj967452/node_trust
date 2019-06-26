exports.index = function(req, res) {
    var tenantId = 0;        
    if (req && req.body) {
        tenantId = req.body['x-vol-tenant'] || req.query.tenantId;
    }    
    res.render('index', {
        tenantId: tenantId       
    });
};