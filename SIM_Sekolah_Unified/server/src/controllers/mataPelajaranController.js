import { MataPelajaran } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getAllMapel = asyncHandler(async (req, res) => {
  const mapel = await MataPelajaran.findAll();
  return res.json(mapel);
});

export const addMapel = asyncHandler(async (req, res) => {
  const { mata_pelajaran, kkm } = req.body;

  if (!mata_pelajaran || !kkm) {
    return res.status(422).json({
      message: 'Validation error',
      errors: {
        mata_pelajaran: !mata_pelajaran ? ['Mata pelajaran is required'] : [],
        kkm: !kkm ? ['KKM is required'] : []
      }
    });
  }

  const mapel = await MataPelajaran.create({
    mata_pelajaran,
    kkm
  });

  return res.status(201).json(mapel);
});

export const getMapelById = asyncHandler(async (req, res) => {
  const mapel = await MataPelajaran.findByPk(req.params.id);

  if (!mapel) {
    return res.status(404).json({ message: 'Mata pelajaran not found' });
  }

  return res.json(mapel);
});

export const updateMapel = asyncHandler(async (req, res) => {
  const mapel = await MataPelajaran.findByPk(req.params.id);

  if (!mapel) {
    return res.status(404).json({ message: 'Mata pelajaran not found' });
  }

  const { mata_pelajaran, kkm } = req.body;

  if (mata_pelajaran) mapel.mata_pelajaran = mata_pelajaran;
  if (kkm) mapel.kkm = kkm;

  await mapel.save();

  return res.json(mapel);
});

export const deleteMapel = asyncHandler(async (req, res) => {
  const mapel = await MataPelajaran.findByPk(req.params.id);

  if (!mapel) {
    return res.status(404).json({ message: 'Mata pelajaran not found' });
  }

  await mapel.destroy();
  return res.json({ message: 'Mata pelajaran deleted successfully' });
});
