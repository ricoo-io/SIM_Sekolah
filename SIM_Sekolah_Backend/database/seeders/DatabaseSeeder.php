<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Kelas;
use App\Models\Siswa;
use App\Models\MataPelajaran;
use App\Models\GuruMataPelajaran;
use App\Models\Penilaian;
use App\Models\Rapot;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Admin
        $admin = User::create([
            'nama' => 'Administrator',
            'nip' => 'admin123',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'wali_kelas' => false,
        ]);

        // Create Guru (Teachers)
        $guru1 = User::create(['nama' => 'Ibu Siti Rahayu', 'nip' => '1234567890', 'password' => Hash::make('password'), 'role' => 'guru', 'wali_kelas' => true]);
        $guru2 = User::create(['nama' => 'Bapak Budi Santoso', 'nip' => '1234567891', 'password' => Hash::make('password'), 'role' => 'guru', 'wali_kelas' => true]);
        $guru3 = User::create(['nama' => 'Ibu Ani Widyastuti', 'nip' => '1234567892', 'password' => Hash::make('password'), 'role' => 'guru', 'wali_kelas' => true]);
        $guru4 = User::create(['nama' => 'Bapak Joko Widodo', 'nip' => '1234567893', 'password' => Hash::make('password'), 'role' => 'guru', 'wali_kelas' => false]);
        $guru5 = User::create(['nama' => 'Ibu Sri Mulyani', 'nip' => '1234567894', 'password' => Hash::make('password'), 'role' => 'guru', 'wali_kelas' => false]);
        $guru6 = User::create(['nama' => 'Bapak Ahmad Dahlan', 'nip' => '1234567895', 'password' => Hash::make('password'), 'role' => 'guru', 'wali_kelas' => false]);
        $guru7 = User::create(['nama' => 'Ibu Dewi Sartika', 'nip' => '1234567896', 'password' => Hash::make('password'), 'role' => 'guru', 'wali_kelas' => false]);
        $guru8 = User::create(['nama' => 'Bapak Habibie Ainun', 'nip' => '1234567897', 'password' => Hash::make('password'), 'role' => 'guru', 'wali_kelas' => false]);
        $guru9 = User::create(['nama' => 'Ibu Kartini Raden', 'nip' => '1234567898', 'password' => Hash::make('password'), 'role' => 'guru', 'wali_kelas' => false]);
        $guru10 = User::create(['nama' => 'Bapak Soedirman', 'nip' => '1234567899', 'password' => Hash::make('password'), 'role' => 'guru', 'wali_kelas' => false]);

        // Create Kelas
        $kelas7A = Kelas::create(['id_guru' => $guru1->id, 'nama_kelas' => '7A', 'tingkat' => '7']);
        $kelas7B = Kelas::create(['id_guru' => $guru1->id, 'nama_kelas' => '7B', 'tingkat' => '7']);
        $kelas8A = Kelas::create(['id_guru' => $guru2->id, 'nama_kelas' => '8A', 'tingkat' => '8']);
        $kelas8B = Kelas::create(['id_guru' => $guru2->id, 'nama_kelas' => '8B', 'tingkat' => '8']);
        $kelas9A = Kelas::create(['id_guru' => $guru3->id, 'nama_kelas' => '9A', 'tingkat' => '9']);
        $kelas9B = Kelas::create(['id_guru' => $guru3->id, 'nama_kelas' => '9B', 'tingkat' => '9']);

        $allKelas = [$kelas7A, $kelas7B, $kelas8A, $kelas8B, $kelas9A, $kelas9B];

        // Create Siswa (Students)
        $siswaPerKelas = 5;
        $allSiswa = [];
        foreach ($allKelas as $kelas) {
            for ($i = 1; $i <= $siswaPerKelas; $i++) {
                $siswa = Siswa::create([
                    'nis' => fake()->unique()->numerify('##########'),
                    'nama' => fake()->name(),
                    'alamat' => fake()->address(),
                    'ibu' => fake()->name('female'),
                    'ayah' => fake()->name('male'),
                    'wali' => fake()->name(),
                    'kontak_wali' => fake()->phoneNumber(),
                    'id_kelas' => $kelas->id,
                ]);
                $allSiswa[] = $siswa;
            }
        }

        // Create Mata Pelajaran
        $mapelList = [
            ['mata_pelajaran' => 'Matematika', 'kkm' => 75],
            ['mata_pelajaran' => 'Bahasa Indonesia', 'kkm' => 75],
            ['mata_pelajaran' => 'Bahasa Inggris', 'kkm' => 70],
            ['mata_pelajaran' => 'IPA', 'kkm' => 75],
            ['mata_pelajaran' => 'IPS', 'kkm' => 75],
            ['mata_pelajaran' => 'PKN', 'kkm' => 75],
            ['mata_pelajaran' => 'Pendidikan Agama', 'kkm' => 75],
            ['mata_pelajaran' => 'Seni Budaya', 'kkm' => 75],
            ['mata_pelajaran' => 'Penjaskes', 'kkm' => 75],
            ['mata_pelajaran' => 'Prakarya', 'kkm' => 75],
        ];

        $allMapel = [];
        foreach ($mapelList as $mapelData) {
            $allMapel[] = MataPelajaran::create($mapelData);
        }

        // Assign Guru to Mapel and Kelas
        $allGuru = [$guru4, $guru5, $guru6, $guru7, $guru8, $guru9, $guru10];
        foreach ($allKelas as $kelas) {
            foreach ($allMapel as $index => $mapel) {
                $guru = $allGuru[$index % count($allGuru)];
                GuruMataPelajaran::create([
                    'id_guru' => $guru->id,
                    'id_mapel' => $mapel->id,
                    'id_kelas' => $kelas->id,
                ]);
            }
        }

        // Create Penilaian for each student
        foreach ($allSiswa as $siswa) {
            foreach ($allMapel as $mapel) {
                // Semester Ganjil
                $nilaiHarian1 = fake()->numberBetween(60, 100);
                $nilaiHarian2 = fake()->numberBetween(60, 100);
                $nilaiHarian3 = fake()->numberBetween(60, 100);
                $nilaiUTS = fake()->numberBetween(60, 100);
                $nilaiHarian4 = fake()->numberBetween(60, 100);
                $nilaiHarian5 = fake()->numberBetween(60, 100);
                $nilaiHarian6 = fake()->numberBetween(60, 100);
                $nilaiUAS = fake()->numberBetween(60, 100);
                $nilaiAkhir = round(($nilaiHarian1 + $nilaiHarian2 + $nilaiHarian3 + $nilaiUTS + 
                                     $nilaiHarian4 + $nilaiHarian5 + $nilaiHarian6 + $nilaiUAS) / 8, 2);

                $guru = $allGuru[array_rand($allGuru)];

                Penilaian::create([
                    'id_siswa' => $siswa->id,
                    'id_mapel' => $mapel->id,
                    'id_guru' => $guru->id,
                    'semester' => 'ganjil',
                    'nilai_harian_1' => $nilaiHarian1,
                    'nilai_harian_2' => $nilaiHarian2,
                    'nilai_harian_3' => $nilaiHarian3,
                    'nilai_UTS' => $nilaiUTS,
                    'nilai_harian_4' => $nilaiHarian4,
                    'nilai_harian_5' => $nilaiHarian5,
                    'nilai_harian_6' => $nilaiHarian6,
                    'nilai_UAS' => $nilaiUAS,
                    'nilai_Akhir' => $nilaiAkhir,
                    'update_terakhir' => now(),
                ]);
            }

            // Create Rapot
            Rapot::create([
                'id_siswa' => $siswa->id,
                'tahun_ajaran' => '2024/2025',
                'semester' => 'ganjil',
                'sakit' => fake()-> numberBetween(0, 5),
                'izin' => fake()-> numberBetween(0, 3),
                'alpha' => fake()-> numberBetween(0, 2),
                'catatan_wali_kelas' => fake()->sentence(),
            ]);
        }

        $this->command->info('Database seeded successfully!');
        $this->command->info('Admin - NIP: admin123, Password: password');
        $this->command->info('Guru - NIP: 1234567890-1234567899, Password: password');
    }
}
