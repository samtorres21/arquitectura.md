const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { verifyToken, isRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEventById);
router.post('/', verifyToken, upload.single('image'), eventController.createEvent);
router.delete('/:id', verifyToken, eventController.deleteEvent);

module.exports = router;
