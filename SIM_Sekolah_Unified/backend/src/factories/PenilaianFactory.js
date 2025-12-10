import Factory from './Factory.js';
import { Faker, id_ID } from '@faker-js/faker';

const faker = new Faker({ locale: [id_ID] });

export default class PenilaianFactory extends Factory {
  definition() {
    return {
      semester: faker.helpers.arrayElement(['ganjil', 'genap']),
      nilai_harian_1: faker.number.int({ min: 60, max: 100 }),
      nilai_harian_2: faker.number.int({ min: 60, max: 100 }),
      nilai_harian_3: faker.number.int({ min: 60, max: 100 }),
      nilai_harian_4: faker.number.int({ min: 60, max: 100 }),
      nilai_harian_5: faker.number.int({ min: 60, max: 100 }),
      nilai_harian_6: faker.number.int({ min: 60, max: 100 }),
      nilai_UTS: faker.number.int({ min: 60, max: 100 }),
      nilai_UAS: faker.number.int({ min: 60, max: 100 }),
      nilai_Akhir: faker.number.int({ min: 60, max: 100 }), 
    };
  }
}
