var express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    methodOverride = require('method-override'),
    errorHandler = require('express-error-handler'),
    morgan = require('morgan'),
    path = require('path');

var routes = require('./routes'),
    api = require('./routes/api');

var app = module.exports = express();

/* Configuration */

app.use(function(req, res, next) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Credentials", "true");
	res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
	res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
	next();
});

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(morgan('dev'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

var env = process.env.NODE_ENV || 'development';

// development only
if (env === 'development') {
    app.use(errorHandler());
}

// production only
if (env === 'production') {}

/*Routes */

// serve index and view partials
app.get('/', routes.index);
app.post('/', routes.index);

// JSON API
app.get('/api/getTPEntity', api.getTPEntity);
app.get('/api/getSitesForTenant', api.getSitesForTenant);
app.post('/api/createTPEntity', api.createTPEntity);
app.put('/api/updateTPEntity', api.updateTPEntity);

app.get('*', routes.index);


/* Start Server */
var currentEnvironment = process.argv[2];
var server;
if (currentEnvironment == '--local') {
    //use https for local only
    var https = require('https'),
    fs = require('fs'),
    options = {
        key: fs.readFileSync('private.key'),
        cert: fs.readFileSync('certificate.pem')
    };
    server = https.createServer(options, app).listen(3002, function(e) {
        console.log('Express http server listening on port ' + 3002);
    });
}
else {
    var http = require('http');
    server = http.createServer(app).listen(process.env.PORT || 3000, function() {
        console.log('Express http server listening on port ' + app.get('port'));
    });
}
server.timeout = 30000;