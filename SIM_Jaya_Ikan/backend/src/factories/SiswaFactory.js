import Factory from './Factory.js';
import { Faker, id_ID } from '@faker-js/faker';

const faker = new Faker({ locale: [id_ID] });

export default class SiswaFactory extends Factory {
  definition() {
    return {
      nis: faker.number.int({ min: 10000, max: 99999 }).toString(),
      nama: faker.person.fullName(),
      jenis_kelamin: faker.helpers.arrayElement(['L', 'P']),
      alamat: faker.location.streetAddress(),
      ibu: faker.person.fullName({ sex: 'female' }),
      ayah: faker.person.fullName({ sex: 'male' }),
      wali: faker.person.fullName(),
      kontak_wali: faker.phone.number(),
      id_kelas: null,
    };
  }
}
