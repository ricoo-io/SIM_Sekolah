import Factory from './Factory.js';
import { Faker, id_ID } from '@faker-js/faker';

const faker = new Faker({ locale: [id_ID] });

const subjects = [
  'Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'IPA', 'IPS', 
  'PKn', 'Penjaskes', 'Seni Budaya', 'Prakarya', 'Agama'
];

export default class MataPelajaranFactory extends Factory {
  definition() {
    return {
      mata_pelajaran: faker.helpers.arrayElement(subjects),
      kkm: 75,
    };
  }
}
