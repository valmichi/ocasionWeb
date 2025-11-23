const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

// Inicializa el cliente de Google con tu ID de Cliente
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Endpoint POST: /api/auth/google
 * Recibe el token JWT de Google del frontend, lo verifica y genera un token interno.
 */
exports.googleLogin = async (req, res) => {
    const { token } = req.body; // El token que envía Angular

    if (!token) {
        return res.status(400).json({ success: false, error: 'Token de Google no proporcionado.' });
    }

    try {
        // 1. Verificar el token JWT de Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        // 2. Obtener los datos del usuario verificados por Google
        const payload = ticket.getPayload();
        const { sub, email, name, picture } = payload;
        
        // --- 3. Lógica de Asignación de Roles (Simulación de DB) ---
        
        // Asignación de rol: En un caso real, buscarías el email en tu base de datos (DB)
        // Aquí, simulamos la asignación: si el email contiene 'admin', le damos rol 'admin'.
        const userRole = email && email.includes('admin') ? 'admin' : 'user';

        const userDB = {
            id: sub, // Usar sub como ID único (Google User ID)
            email: email,
            name: name,
            role: userRole,
            picture: picture,
            // Agrega otros campos de tu DB aquí si existieran (ej: lastLogin)
        };
        
        // --- 4. Generar el JWT de Sesión Interno ---
        
        // Firma un nuevo token JWT para la sesión de tu aplicación
        const tokenSesion = jwt.sign(
            { id: userDB.id, email: userDB.email, role: userDB.role },
            JWT_SECRET,
            { expiresIn: '7d' } // El token expira en 7 días
        );

        // 5. Envía el token de sesión y los datos del usuario al frontend
        return res.status(200).json({
            success: true,
            message: 'Autenticación exitosa con Google y sesión iniciada.',
            token: tokenSesion, // 👈 Tu token JWT interno para el frontend
            user: userDB
        });

    } catch (error) {
        console.error('Error al verificar el token de Google:', error.message);
        return res.status(401).json({ success: false, error: 'Token de Google inválido, expirado o error de verificación.' });
    }
};