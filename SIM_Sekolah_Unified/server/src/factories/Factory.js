import { faker } from '@faker-js/faker';

export default class Factory {
  constructor(model) {
    this.model = model;
    this._count = 1;
  }

  static define(model) {
    return new this(model);
  }

  count(n) {
    this._count = n;
    return this;
  }

  definition() {
    return {};
  }

  async create(overrides = {}) {
    const results = [];
    for (let i = 0; i < this._count; i++) {
      const data = { ...this.definition(), ...overrides };
      const instance = await this.model.create(data);
      results.push(instance);
    }
    return this._count === 1 ? results[0] : results;
  }
}
