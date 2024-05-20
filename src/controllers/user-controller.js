// src/controllers/user-controller.js
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getUserByUsername, createUser } from '../services/user-service.js';

const router = express.Router();

// Login Endpoint
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('username:', username);
    console.log('password:', password);

    try {
        const user = await getUserByUsername(username);
        console.log('User retrieved from DB:', user);

        if (!user) {
            console.log('User not found');
            return res.status(401).json({
                success: false,
                message: 'Usuario o clave inválida.',
                token: ''
            });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        console.log('Password is valid:', validPassword);

        if (!validPassword) {
            console.log('Invalid password');
            return res.status(401).json({
                success: false,
                message: 'Usuario o clave inválida.',
                token: ''
            });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, 'your_jwt_secret', { expiresIn: '1h' });
        console.log('Generated token:', token);

        res.status(200).json({
            success: true,
            message: 'Login exitoso.',
            token: token
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Register Endpoint
router.post('/register', async (req, res) => {
    const { first_name, last_name, username, password } = req.body;

    if (!first_name || !last_name) {
        return res.status(400).json({ message: 'Los campos first_name o last_name están vacíos.' });
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(username)) {
        return res.status(400).json({ message: 'El email (username) es sintácticamente inválido.' });
    }

    if (password.length < 3) {
        return res.status(400).json({ message: 'El campo password tiene menos de 3 letras.' });
    }

    try {
        //const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await createUser({ first_name, last_name, username, password: hashedPassword });
        console.log('New user created:', newUser);
        res.status(201).json({ message: 'Usuario registrado exitosamente.' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
