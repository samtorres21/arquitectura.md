const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Registro de usuarios
exports.register = async (req, res) => {
    const { name, email, password, role_name } = req.body;
    try {
        // Validar campos
        if (!name || !email || !password || !role_name) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        // Obtener ID del rol
        const [roles] = await db.query('SELECT id FROM roles WHERE name = ?', [role_name]);
        if (roles.length === 0) {
            return res.status(400).json({ error: 'Rol no válido' });
        }
        const role_id = roles[0].id;

        // Verificar si el correo ya existe
        const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (users.length > 0) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }

        // Encriptar contraseña
        const hash = await bcrypt.hash(password, 10);

        // Crear usuario
        const [result] = await db.query(
            'INSERT INTO users (name, email, password_hash, role_id) VALUES (?, ?, ?, ?)',
            [name, email, hash, role_id]
        );

        res.status(201).json({ message: 'Usuario registrado exitosamente', userId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error del servidor al registrar usuario' });
    }
};

// Login
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.query(
            'SELECT u.id, u.name, u.email, u.password_hash, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(400).json({ error: 'Credenciales inválidas' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Credenciales inválidas' });
        }

        // Generar JWT
        const payload = {
            userId: user.id,
            role: user.role
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            message: 'Login exitoso',
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error del servidor al iniciar sesión' });
    }
};

// Obtener perfil (Verificar Token)
exports.getProfile = async (req, res) => {
    try {
        // req.user viene del authMiddleware
        const [users] = await db.query(
            'SELECT u.id, u.name, u.email, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?',
            [req.user.userId]
        );
        if (users.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json({ user: users[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};
