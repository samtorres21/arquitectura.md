const db = require('../config/db');

exports.getPortfolios = async (req, res) => {
    try {
        const [portfolios] = await db.query(
            'SELECT p.*, COALESCE(p.artist_name, u.name) as artist_name FROM portfolios p JOIN users u ON p.user_id = u.id'
        );
        res.json(portfolios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error obteniendo portafolios' });
    }
};

exports.getPortfolioById = async (req, res) => {
    try {
        const [portfolios] = await db.query(
            'SELECT p.*, COALESCE(p.artist_name, u.name) as artist_name, u.email as artist_email FROM portfolios p JOIN users u ON p.user_id = u.id WHERE p.id = ?',
            [req.params.id]
        );
        if (portfolios.length === 0) return res.status(404).json({ error: 'Portafolio no encontrado' });

        const [items] = await db.query('SELECT * FROM portfolio_items WHERE portfolio_id = ?', [req.params.id]);

        res.json({
            portfolio: portfolios[0],
            items
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error obteniendo el portafolio' });
    }
};

exports.createPortfolio = async (req, res) => {
    try {
        const { artist_name, bio, contact_info } = req.body;
        let profile_image_url = null;
        
        if (req.file) {
            profile_image_url = '/uploads/' + req.file.filename;
        }
        
        const [result] = await db.query('INSERT INTO portfolios (user_id, artist_name, bio, contact_info, profile_image_url) VALUES (?, ?, ?, ?, ?)', [req.user.userId, artist_name, bio, contact_info, profile_image_url]);
        const portfolioId = result.insertId;

        res.json({ message: 'Portafolio guardado exitosamente', portfolioId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error guardando el portafolio' });
    }
};

exports.addPortfolioItem = async (req, res) => {
    try {
        const { portfolio_id, title, description, type } = req.body;
        if (!portfolio_id) return res.status(400).json({ error: 'Falta el ID del portafolio' });
        if (!req.file) return res.status(400).json({ error: 'Debes adjuntar un archivo' });

        const media_url = '/uploads/' + req.file.filename;

        // Validar que el portafolio pertenezca al usuario
        const [portfolios] = await db.query('SELECT id FROM portfolios WHERE id = ? AND user_id = ?', [portfolio_id, req.user.userId]);
        if (portfolios.length === 0) return res.status(403).json({ error: 'No tienes permiso o el portafolio no existe' });

        const itemType = type || 'image';

        await db.query(
            'INSERT INTO portfolio_items (portfolio_id, title, media_url, type, description) VALUES (?, ?, ?, ?, ?)',
            [portfolio_id, title, media_url, itemType, description]
        );

        res.status(201).json({ message: 'Item agregado a la galería' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error agregando item al portafolio' });
    }
};

exports.deletePortfolio = async (req, res) => {
    try {
        const portfolioId = req.params.id;
        const userId = req.user.userId;

        const [portfolios] = await db.query('SELECT * FROM portfolios WHERE id = ?', [portfolioId]);
        
        if (portfolios.length === 0) {
            return res.status(404).json({ error: 'Portafolio no encontrado' });
        }

        if (portfolios[0].user_id !== userId) {
            return res.status(403).json({ error: 'No tienes permiso para eliminar este portafolio' });
        }

        // Primero eliminar los items asociados (para no romper foreign keys si no hay cascade)
        await db.query('DELETE FROM portfolio_items WHERE portfolio_id = ?', [portfolioId]);
        // Eliminar el portafolio
        await db.query('DELETE FROM portfolios WHERE id = ?', [portfolioId]);
        
        res.json({ message: 'Portafolio eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error del servidor al eliminar portafolio' });
    }
};
