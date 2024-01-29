export class Task {
  done: Promise<void>;
  finish = () => {};
  fail = () => {};
  constructor() {
    this.done = new Promise((resolve, reject) => {
      this.finish = () => {
        resolve();
      };
      this.fail = () => {
        reject();
      };
    });
  }
}
