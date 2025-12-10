import { MataPelajaran } from '../models/index.js';

export const index = async (req, res) => {
  try {
    const mapel = await MataPelajaran.findAll();
    return res.json(mapel);
  } catch (error) {
    console.error('Get mata pelajaran error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const store = async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Create mata pelajaran error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const show = async (req, res) => {
  try {
    const mapel = await MataPelajaran.findByPk(req.params.id);

    if (!mapel) {
      return res.status(404).json({ message: 'Mata pelajaran not found' });
    }

    return res.json(mapel);
  } catch (error) {
    console.error('Get mata pelajaran error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const update = async (req, res) => {
  try {
    const mapel = await MataPelajaran.findByPk(req.params.id);

    if (!mapel) {
      return res.status(404).json({ message: 'Mata pelajaran not found' });
    }

    const { mata_pelajaran, kkm } = req.body;

    if (mata_pelajaran) mapel.mata_pelajaran = mata_pelajaran;
    if (kkm) mapel.kkm = kkm;

    await mapel.save();

    return res.json(mapel);
  } catch (error) {
    console.error('Update mata pelajaran error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const destroy = async (req, res) => {
  try {
    const mapel = await MataPelajaran.findByPk(req.params.id);

    if (!mapel) {
      return res.status(404).json({ message: 'Mata pelajaran not found' });
    }

    await mapel.destroy();

    return res.json({ message: 'Mata pelajaran deleted successfully' });
  } catch (error) {
    console.error('Delete mata pelajaran error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
