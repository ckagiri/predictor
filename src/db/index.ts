import mongoose = require("mongoose");

export const init = (
  mongoUri: string,
  cb?: any,
  options: any = { drop: false }
) => {
  cb =
    cb ||
    (() => {
      /**/
    });
  mongoose.connect(mongoUri, { useNewUrlParser: true }, (error: any) => {
    if (options.drop) {
      mongoose.connection.db.dropDatabase((err: any) => {
        cb(err);
      });
    } else {
      cb(error);
    }
  });
};

export const drop = () => {
  return mongoose.connection.db.dropDatabase();
};

export const close = () => {
  return mongoose.connection.close();
};
