import { trailService } from '../services/trailService.js';

export const trailController = {
  async list(_req, res) {
    res.json({ trails: await trailService.list() });
  },
  async getById(req, res) {
    res.json({ trail: await trailService.getById(req.params.id) });
  },
  async create(req, res) {
    res.status(201).json({ trail: await trailService.create(req.body) });
  },
  async update(req, res) {
    res.json({ trail: await trailService.update(req.params.id, req.body) });
  },
  async remove(req, res) {
    await trailService.remove(req.params.id);
    res.status(204).send();
  },
  async enroll(req, res) {
    res.status(201).json({ enrollment: await trailService.enroll(req.user.id, req.params.id) });
  },
  async myEnrollments(req, res) {
    res.json({ enrollments: await trailService.listEnrollments(req.user.id) });
  },
};
