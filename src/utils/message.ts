export class Stop extends Error {
    // tslint:disable-next-line:variable-name
    protected __proto__: Error;
    constructor() {
        const trueProto = new.target.prototype;
        super();
        this.__proto__ = trueProto;
    }
}
