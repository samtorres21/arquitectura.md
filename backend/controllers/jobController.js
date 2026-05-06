const db = require('../config/db');

exports.getJobs = async (req, res) => {
    try {
        const [jobs] = await db.query(
            'SELECT j.*, u.name as company_name FROM jobs j JOIN users u ON j.company_id = u.id WHERE j.status = "open" ORDER BY j.created_at DESC'
        );
        res.json(jobs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error obteniendo los empleos' });
    }
};

exports.createJob = async (req, res) => {
    try {
        const { title, description, requirements } = req.body;
        const [result] = await db.query(
            'INSERT INTO jobs (company_id, title, description, requirements) VALUES (?, ?, ?, ?)',
            [req.user.userId, title, description, requirements]
        );
        res.status(201).json({ message: 'Vacante publicada', id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error publicando la vacante' });
    }
};

exports.applyToJob = async (req, res) => {
    try {
        const { job_id } = req.body;
        if (!req.file) return res.status(400).json({ error: 'Debes adjuntar tu hoja de vida (PDF)' });

        const cv_url = '/uploads/' + req.file.filename;

        await db.query(
            'INSERT INTO job_applications (job_id, user_id, cv_url) VALUES (?, ?, ?)',
            [job_id, req.user.userId, cv_url]
        );

        res.status(201).json({ message: 'Aplicación enviada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al aplicar a la vacante' });
    }
};

exports.deleteJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId = req.user.userId;

        const [jobs] = await db.query('SELECT * FROM jobs WHERE id = ?', [jobId]);
        
        if (jobs.length === 0) {
            return res.status(404).json({ error: 'Vacante no encontrada' });
        }

        if (jobs[0].company_id !== userId) {
            return res.status(403).json({ error: 'No tienes permiso para eliminar esta vacante' });
        }

        // Eliminar aplicaciones asociadas
        await db.query('DELETE FROM job_applications WHERE job_id = ?', [jobId]);
        // Eliminar vacante
        await db.query('DELETE FROM jobs WHERE id = ?', [jobId]);
        
        res.json({ message: 'Vacante eliminada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error del servidor al eliminar vacante' });
    }
};

exports.getJobApplications = async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId = req.user.userId;

        // Verificar que el usuario es el dueño de la vacante
        const [jobs] = await db.query('SELECT * FROM jobs WHERE id = ?', [jobId]);
        if (jobs.length === 0) {
            return res.status(404).json({ error: 'Vacante no encontrada' });
        }
        if (jobs[0].company_id !== userId) {
            return res.status(403).json({ error: 'No tienes permiso para ver estas aplicaciones' });
        }

        // Obtener las aplicaciones uniendo con usuarios
        const [applications] = await db.query(
            'SELECT ja.id, ja.cv_url, ja.application_date, u.name as applicant_name, u.email as applicant_email FROM job_applications ja JOIN users u ON ja.user_id = u.id WHERE ja.job_id = ? ORDER BY ja.application_date DESC',
            [jobId]
        );

        res.json(applications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error obteniendo las aplicaciones' });
    }
};

exports.editJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId = req.user.userId;
        const { title, description, requirements } = req.body;

        const [jobs] = await db.query('SELECT * FROM jobs WHERE id = ?', [jobId]);
        if (jobs.length === 0) {
            return res.status(404).json({ error: 'Vacante no encontrada' });
        }
        if (jobs[0].company_id !== userId) {
            return res.status(403).json({ error: 'No tienes permiso para editar esta vacante' });
        }

        await db.query(
            'UPDATE jobs SET title = ?, description = ?, requirements = ? WHERE id = ?',
            [title, description, requirements, jobId]
        );

        res.json({ message: 'Vacante actualizada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar vacante' });
    }
};
