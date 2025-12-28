import { User, Kelas, Siswa, MataPelajaran, GuruMataPelajaran, Penilaian } from './models/index.js';
import { UserFactory, KelasFactory, SiswaFactory, MataPelajaranFactory, PenilaianFactory } from './factories/index.js';
import sequelize from './config/database.js';

const seed = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true }); 

    await UserFactory.define(User).admin();

    const subjectNames = [
      'Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'IPA', 'IPS', 
      'PKn', 'Penjaskes', 'Seni Budaya', 'Prakarya', 'Agama'
    ];
    const mapels = [];
    for (const name of subjectNames) {
      const mapel = await MataPelajaranFactory.define(MataPelajaran).create({ mata_pelajaran: name, kkm: 75 });
      mapels.push(mapel);
    }


    const gurus = [];
    const startNip = 1234567890;
    for (let i = 0; i < 15; i++) {
        const nip = (startNip + i).toString();
        const guru = await UserFactory.define(User).create({ nip });
        gurus.push(guru);
    }

    const classList = [
      { tingkat: '7', nama: '7A' }, { tingkat: '7', nama: '7B' }, { tingkat: '7', nama: '7C' },
      { tingkat: '8', nama: '8A' }, { tingkat: '8', nama: '8B' }, { tingkat: '8', nama: '8C' },
      { tingkat: '9', nama: '9A' }, { tingkat: '9', nama: '9B' }, { tingkat: '9', nama: '9C' }
    ];

    const kelases = [];
    let guruIndex = 0;

    for (const c of classList) {
    
      const waliKelas = gurus[guruIndex % gurus.length];
      guruIndex++;

      const kelas = await KelasFactory.define(Kelas).create({
        nama_kelas: c.nama,
        tingkat: c.tingkat,
        id_guru: waliKelas.id
      });
      kelases.push(kelas);

      waliKelas.wali_kelas = true;
      await waliKelas.save();
    }


    for (const kelas of kelases) {
      for (const mapel of mapels) {
        const teacher = gurus[Math.floor(Math.random() * gurus.length)];
        
        try {
          await GuruMataPelajaran.create({
              id_guru: teacher.id,
              id_mapel: mapel.id,
              id_kelas: kelas.id
          });
        } catch (e) {
        }
      }
    }

    for (const kelas of kelases) {
  
      const siswaList = await SiswaFactory.define(Siswa).count(5).create({ id_kelas: kelas.id });
      
      for (const siswa of siswaList) {
        
        for (const mapel of mapels) {

           const guruMapel = await GuruMataPelajaran.findOne({
             where: { id_kelas: kelas.id, id_mapel: mapel.id }
           });

           if (guruMapel) {
             const years = ['2023/2024', '2024/2025', '2025/2026'];
             const semesters = ['ganjil', 'genap'];

             for (const year of years) {
                for (const sem of semesters) {
                     const grades = PenilaianFactory.define(Penilaian).definition();

                     const totalHarian = (grades.nilai_harian_1 + grades.nilai_harian_2 + grades.nilai_harian_3 + grades.nilai_harian_4 + grades.nilai_harian_5) / 5;
                     const akhir = (totalHarian + grades.nilai_UTS + grades.nilai_UAS) / 3;
                     
                     await Penilaian.create({
                       ...grades,
                       nilai_Akhir: Math.round(akhir),
                       id_siswa: siswa.id,
                       id_mapel: mapel.id,
                       id_guru: guruMapel.id_guru,
                       semester: sem,
                       tahun_ajaran: year
                     });
                }
             }
           }
        }
      }
    }

    console.log('✅ Database seeded successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seed();
