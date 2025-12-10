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

// Public routes
router.post('/login', authController.login);

// Protected routes
router.use(authMiddleware);

// Auth routes
router.post('/logout', authController.logout);
router.get('/user', authController.getUser);

// User routes
router.get('/users', userController.index);
router.get('/users-guru', userController.guru);
router.post('/users', userController.store);
router.get('/users/:id', userController.show);
router.put('/users/:id', userController.update);
router.patch('/users/:id', userController.update);
router.delete('/users/:id', userController.destroy);

// Kelas routes
router.get('/kelas', kelasController.index);
router.post('/kelas', kelasController.store);
router.get('/kelas/:id', kelasController.show);
router.put('/kelas/:id', kelasController.update);
router.patch('/kelas/:id', kelasController.update);
router.delete('/kelas/:id', kelasController.destroy);

// Siswa routes
router.get('/siswa', siswaController.index);
router.post('/siswa', siswaController.store);
router.get('/siswa/:id', siswaController.show);
router.put('/siswa/:id', siswaController.update);
router.patch('/siswa/:id', siswaController.update);
router.delete('/siswa/:id', siswaController.destroy);

// Mata Pelajaran routes
router.get('/mapel', mataPelajaranController.index);
router.post('/mapel', mataPelajaranController.store);
router.get('/mapel/:id', mataPelajaranController.show);
router.put('/mapel/:id', mataPelajaranController.update);
router.patch('/mapel/:id', mataPelajaranController.update);
router.delete('/mapel/:id', mataPelajaranController.destroy);

// Guru Mata Pelajaran routes
router.get('/guru-mapel', guruMataPelajaranController.index);
router.post('/guru-mapel', guruMataPelajaranController.store);
router.get('/guru-mapel/:id', guruMataPelajaranController.show);
router.put('/guru-mapel/:id', guruMataPelajaranController.update);
router.patch('/guru-mapel/:id', guruMataPelajaranController.update);
router.delete('/guru-mapel/:id', guruMataPelajaranController.destroy);

// Penilaian routes
router.get('/penilaian', penilaianController.index);
router.post('/penilaian', penilaianController.store);
router.get('/penilaian/:id', penilaianController.show);
router.put('/penilaian/:id', penilaianController.update);
router.patch('/penilaian/:id', penilaianController.update);
router.delete('/penilaian/:id', penilaianController.destroy);

// Rapot routes
router.get('/rapot', rapotController.index);
router.post('/rapot', rapotController.store);
router.get('/rapot/:id', rapotController.show);
router.put('/rapot/:id', rapotController.update);
router.patch('/rapot/:id', rapotController.update);
router.delete('/rapot/:id', rapotController.destroy);

export default router;
