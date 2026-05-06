const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const { verifyToken, isRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.get('/', portfolioController.getPortfolios);
router.get('/:id', portfolioController.getPortfolioById);
router.post('/', verifyToken, portfolioController.createOrUpdatePortfolio);
router.post('/items', verifyToken, upload.single('media'), portfolioController.addPortfolioItem);
router.delete('/:id', verifyToken, portfolioController.deletePortfolio);

module.exports = router;
