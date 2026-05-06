const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController');
const { verifyToken, isRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.get('/', businessController.getBusinesses);
router.get('/:id', businessController.getBusinessById);
router.post('/', verifyToken, upload.single('image'), businessController.createBusiness);
router.delete('/:id', verifyToken, businessController.deleteBusiness);

module.exports = router;
