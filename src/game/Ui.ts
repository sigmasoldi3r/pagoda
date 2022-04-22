import EventEmitter from "events";

export default class Ui extends EventEmitter {
    static instance = new Ui()
}

export const ui = Ui.instance
