
const mongoose = require('mongoose');

export const init = (mongoUri: string, cb?: any, options:any = {drop: false}) => {
  cb = cb || function() { }
  mongoose.connect(mongoUri, { useNewUrlParser: true }, function(err: any) {
    if(options.drop) {
      mongoose.connection.db.dropDatabase(function (err: any) {
        cb(err);
      });
    } else {
      cb(err);
    }
  });
}

export const drop = function() {
  return mongoose.connection.db.dropDatabase();
}

export const close = function() {
  return mongoose.connection.close();
}