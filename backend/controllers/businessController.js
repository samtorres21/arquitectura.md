const db = require('../config/db');

exports.createBusiness = async (req, res) => {
    try {
        const { name, description, category, contact_phone, contact_email, social_links } = req.body;
        let image_url = null;
        if (req.file) {
            image_url = '/uploads/' + req.file.filename;
        }

        const [result] = await db.query(
            'INSERT INTO businesses (user_id, name, description, category, contact_phone, contact_email, social_links, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [req.user.userId, name, description, category, contact_phone, contact_email, social_links, image_url]
        );
        res.status(201).json({ message: 'Emprendimiento creado exitosamente', id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error del servidor al crear emprendimiento' });
    }
};

exports.getBusinesses = async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = 'SELECT b.*, u.name as owner_name FROM businesses b JOIN users u ON b.user_id = u.id WHERE 1=1';
        let params = [];

        if (category) {
            query += ' AND b.category = ?';
            params.push(category);
        }
        if (search) {
            query += ' AND (b.name LIKE ? OR b.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        const [businesses] = await db.query(query, params);
        res.json(businesses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

exports.getBusinessById = async (req, res) => {
    try {
        const [businesses] = await db.query(
            'SELECT b.*, u.name as owner_name FROM businesses b JOIN users u ON b.user_id = u.id WHERE b.id = ?',
            [req.params.id]
        );
        if (businesses.length === 0) return res.status(404).json({ error: 'Emprendimiento no encontrado' });
        res.json(businesses[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error agregando del servidor' });
    }
};

exports.deleteBusiness = async (req, res) => {
    try {
        const businessId = req.params.id;
        const userId = req.user.userId;

        // Verificar si el negocio existe y pertenece al usuario
        const [businesses] = await db.query('SELECT * FROM businesses WHERE id = ?', [businessId]);
        
        if (businesses.length === 0) {
            return res.status(404).json({ error: 'Emprendimiento no encontrado' });
        }

        if (businesses[0].user_id !== userId) {
            return res.status(403).json({ error: 'No tienes permiso para eliminar este emprendimiento' });
        }

        await db.query('DELETE FROM businesses WHERE id = ?', [businessId]);
        res.json({ message: 'Emprendimiento eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error del servidor al eliminar emprendimiento' });
    }
};
