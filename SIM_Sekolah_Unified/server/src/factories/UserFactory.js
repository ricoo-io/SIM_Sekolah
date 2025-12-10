import Factory from './Factory.js';
import { Faker, id_ID } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const faker = new Faker({ locale: [id_ID] });

export default class UserFactory extends Factory {
  definition() {
    return {
      nama: faker.person.fullName(),
      nip: faker.number.int({ min: 1234567890, max: 9876543210 }).toString(), 
      password: bcrypt.hashSync('password', 10),
      role: 'guru',
      wali_kelas: false,
    };
  }

  admin() {
    return this.create({
      nama: 'Administrator',
      nip: 'admin123',
      role: 'admin',
      wali_kelas: false
    });
  }
}
