"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var app_1 = require("../app");
describe("Queue", function () {
    it("should be able to be initialized without an initializer", function () {
        var s = new app_1.Queue();
        chai_1.expect(s.size()).to.equal(0);
    });
    it('should be able to be initialized with an initializer', function () {
        var s = new app_1.Queue([1, 2, 3, 4]);
        chai_1.expect(s.size()).to.equal(4);
    });
    it('should be able to add a new element after initialized', function () {
        var s = new app_1.Queue([1, 2, 3, 4]);
        s.push(5);
        chai_1.expect(s.size()).to.equal(5);
        chai_1.expect(s.pop()).to.equal(1);
    });
    it('should be able to get the first element', function () {
        var s = new app_1.Queue([1, 2, 3, 4]);
        chai_1.expect(s.pop()).to.equal(1);
    });
});
//# sourceMappingURL=queue.spec.js.map