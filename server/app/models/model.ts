export class Model {
  constructor(public id: number) {
    this.id = id;
    if (this.isNew()) { delete this.id; }
  }

  set(data: any): void {
    if (data == null) { return null; }

    for (const key in data) {
      if (this.hasOwnProperty(key) && key !== 'id') {
        this[key] = data[key];
      }
    }
  }

  isNew(): boolean {
    return this.id == null;
  }
}