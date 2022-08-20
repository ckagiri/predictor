import startServer from './server';

// @ts-ignore // check if code is not running under ts-node
// if (!process[Symbol.for("ts-node.register.instance")])
console.log('ts-node', process[Symbol.for("ts-node.register.instance")])
//startServer();
