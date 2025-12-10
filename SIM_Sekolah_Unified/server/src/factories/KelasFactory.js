import Factory from './Factory.js';
import { Faker, id_ID } from '@faker-js/faker';

const faker = new Faker({ locale: [id_ID] });

export default class KelasFactory extends Factory {
  definition() {
    const tingkat = faker.helpers.arrayElement(['7', '8', '9']);
    const letter = faker.helpers.arrayElement(['A', 'B', 'C', 'D']);
    return {
      nama_kelas: `${tingkat}${letter}`,
      tingkat: tingkat,
      id_guru: null, 
    };
  }
}
