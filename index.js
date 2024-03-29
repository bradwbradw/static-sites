const port = process.env.PORT || '8000';

const connect = require('connect'),
  serveStatic = require('serve-static'),
  vhost = require('vhost'),
  _ = require('lodash'),
//  historyApiFallback = require('connect-history-api-fallback'),
  fs = require('fs');

const domains = require('./domains');


console.log(domains);
const rootDomainRobotsTxt = fs.readFileSync(__dirname + '/root-domain-robots.txt').toString();

const sites = {};

const app = connect();

// noinspection JSUnusedLocalSymbols
function track(req, res, next) {
  console.log(_.get(req, 'headers.host', '') + req.url);
  next();
}

app.use(track);

_.each(domains, function (domain) {
  console.log('serving ', domain);
  sites[domain] = connect();
  sites[domain].use(serveStatic('./sites/' + domain));


  app.use(vhost(domain, sites[domain]));
  app.use(vhost('www.' + domain, sites[domain]));

  if (process.env.FOCUS === domain) {
    console.log('focussing', domain);
    app.use('/', sites[domain]);
  } else {
    app.use('/' + domain, sites[domain]);
  }

});
app.use('/robots.txt', function (req, res) {
  res.end(rootDomainRobotsTxt)
});

//app.use(redirectToHTTPS([/localhost:(\d{4})/], 301));

app.listen(port);
console.log('listening on ' + port);

//require('./sync-files.js');
