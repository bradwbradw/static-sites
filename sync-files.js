var Dat = require('dat-node');
var path = require('path');
var _ = require('lodash');

var folders = [{
    path:path.join(__dirname, "sites/bradwinter.ca/files"),
    key:"269b4f21ead25b0e7d454b6df12e271f6ce87fcffbc90967de1247f2d712ba46"
}];

_.each(folders, folder => {

  console.log(`trying to dat sync ${folder.path}`, folder.key);
  try {
    // 1. Tell Dat where to download the files
    Dat(folder.path, {
      // 2. Tell Dat what link I want
      key: folder.key // (a 64 character hash from above)
    }, function (err, dat) {
      if (err) throw err

      // 3. Join the network & download (files are automatically downloaded)
      dat.joinNetwork()
    })
  } catch (err){
    console.log(err);
  }
});
