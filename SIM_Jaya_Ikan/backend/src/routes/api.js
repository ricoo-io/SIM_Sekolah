import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as authController from '../controllers/authController.js';
import * as userController from '../controllers/userController.js';
import * as kelasController from '../controllers/kelasController.js';
import * as siswaController from '../controllers/siswaController.js';
import * as mataPelajaranController from '../controllers/mataPelajaranController.js';
import * as guruMataPelajaranController from '../controllers/guruMataPelajaranController.js';
import * as penilaianController from '../controllers/penilaianController.js';
import * as rapotController from '../controllers/rapotController.js';

const router = express.Router();

router.post('/login', authController.loginUser);

router.use(authMiddleware);

// Route Auth
router.post('/logout', authController.logoutUser);
router.get('/user', authController.getCurrentUser);

// Route User
router.get('/users', userController.getAllUsers);
router.get('/users-guru', userController.getAllTeachers);
router.post('/users', userController.addUser);
router.get('/users/:id', userController.getUserById);
router.put('/users/:id', userController.updateUser);
router.patch('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

// Route Kelas
router.get('/kelas', kelasController.getAllKelas);
router.post('/kelas', kelasController.addKelas);
router.get('/kelas/:id', kelasController.getKelasById);
router.put('/kelas/:id', kelasController.updateKelas);
router.patch('/kelas/:id', kelasController.updateKelas);
router.delete('/kelas/:id', kelasController.deleteKelas);

// Route Siswa
router.get('/siswa', siswaController.getAllSiswa);
router.post('/siswa', siswaController.addSiswa);
router.get('/siswa/:id', siswaController.getSiswaById);
router.put('/siswa/:id', siswaController.updateSiswa);
router.patch('/siswa/:id', siswaController.updateSiswa);
router.delete('/siswa/:id', siswaController.deleteSiswa);

// Route Mapel
router.get('/mapel', mataPelajaranController.getAllMapel);
router.post('/mapel', mataPelajaranController.addMapel);
router.get('/mapel/:id', mataPelajaranController.getMapelById);
router.put('/mapel/:id', mataPelajaranController.updateMapel);
router.patch('/mapel/:id', mataPelajaranController.updateMapel);
router.delete('/mapel/:id', mataPelajaranController.deleteMapel);

// Route Guru Mapel
router.get('/guru-mapel', guruMataPelajaranController.getAllGuruMapel);
router.post('/guru-mapel', guruMataPelajaranController.addGuruMapel);
router.get('/guru-mapel/:id', guruMataPelajaranController.getGuruMapelById);
router.put('/guru-mapel/:id', guruMataPelajaranController.updateGuruMapel);
router.patch('/guru-mapel/:id', guruMataPelajaranController.updateGuruMapel);
router.delete('/guru-mapel/:id', guruMataPelajaranController.deleteGuruMapel);

// Route Penilaian
router.get('/penilaian', penilaianController.getAllPenilaian);
router.post('/penilaian', penilaianController.addPenilaian);
router.get('/penilaian/:id', penilaianController.getPenilaianById);
router.put('/penilaian/:id', penilaianController.updatePenilaian);
router.patch('/penilaian/:id', penilaianController.updatePenilaian);
router.delete('/penilaian/:id', penilaianController.deletePenilaian);

// Route Rapot
router.get('/rapot', rapotController.getAllRapot);
router.post('/rapot', rapotController.addRapot);
router.get('/rapot/:id', rapotController.getRapotById);
router.put('/rapot/:id', rapotController.updateRapot);
router.patch('/rapot/:id', rapotController.updateRapot);
router.delete('/rapot/:id', rapotController.deleteRapot);

export default router;
