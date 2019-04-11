import { expect } from "chai";
import { Queue } from "../app";

describe("Queue", () => {
  it("should be able to be initialized without an initializer", () => {
    const s = new Queue<number>();
    expect(s.size()).to.equal(0);
  });
  it('should be able to be initialized with an initializer', () => {
    const s = new Queue<number>([1, 2, 3, 4]);
    expect(s.size()).to.equal(4);
  });
  it('should be able to add a new element after initialized', () => {
    const s = new Queue<number>([1, 2, 3, 4]);
    s.push(5);
    expect(s.size()).to.equal(5);
    expect(s.pop()).to.equal(1);
  });
  it('should be able to get the first element', () => {
    const s = new Queue<number>([1, 2, 3, 4]);
    expect(s.pop()).to.equal(1);
  });
}); 