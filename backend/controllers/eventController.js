const db = require('../config/db');

exports.createEvent = async (req, res) => {
    try {
        const { name, event_date, event_time, location, description, event_type } = req.body;
        let image_url = null;
        if (req.file) {
            image_url = '/uploads/' + req.file.filename;
        }

        const [result] = await db.query(
            'INSERT INTO events (user_id, name, event_date, event_time, location, description, image_url, event_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [req.user.userId, name, event_date, event_time, location, description, image_url, event_type]
        );
        res.status(201).json({ message: 'Evento creado exitosamente', id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error agregando el evento' });
    }
};

exports.getEvents = async (req, res) => {
    try {
        const { event_type } = req.query;
        let query = 'SELECT * FROM events WHERE 1=1';
        let params = [];
        if (event_type) {
            query += ' AND event_type = ?';
            params.push(event_type);
        }
        query += ' ORDER BY event_date ASC';

        const [events] = await db.query(query, params);
        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error obteniendo los eventos' });
    }
};

exports.getEventById = async (req, res) => {
    try {
        const [events] = await db.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
        if (events.length === 0) return res.status(404).json({ error: 'Evento no encontrado' });
        res.json(events[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.user.userId;

        const [events] = await db.query('SELECT * FROM events WHERE id = ?', [eventId]);
        
        if (events.length === 0) {
            return res.status(404).json({ error: 'Evento no encontrado' });
        }

        if (events[0].user_id !== userId) {
            return res.status(403).json({ error: 'No tienes permiso para eliminar este evento' });
        }

        await db.query('DELETE FROM events WHERE id = ?', [eventId]);
        res.json({ message: 'Evento eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error del servidor al eliminar evento' });
    }
};
