const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { verifyToken, isRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.get('/', jobController.getJobs);
router.get('/:id/applications', verifyToken, isRole(['empresa', 'admin']), jobController.getJobApplications);
router.post('/', verifyToken, isRole(['empresa', 'admin']), jobController.createJob);
router.put('/:id', verifyToken, isRole(['empresa', 'admin']), jobController.editJob);
router.post('/apply', verifyToken, isRole(['usuario', 'artista']), upload.single('cv'), jobController.applyToJob);
router.delete('/:id', verifyToken, jobController.deleteJob);

module.exports = router;
