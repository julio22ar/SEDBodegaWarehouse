// server/server.js
const http = require('http');

// Función de hash (la misma que en el frontend)
function hashPassword(password) {
    let hash = 0;
    const salt = "inventarioApp2024";
    const combinedString = password + salt;
    
    for (let i = 0; i < combinedString.length; i++) {
        const char = combinedString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    
    return Math.abs(hash).toString(16);
}

// Usuarios de prueba con contraseñas hasheadas
const users = [
    {
        id: 1,
        username: 'admin',
        // admin123 hasheado
        password: hashPassword('admin123'),
        role: 'super_admin',
        name: 'Administrador'
    },
    {
        id: 2,
        username: 'usuario',
        // usuario123 hasheado
        password: hashPassword('usuario123'),
        role: 'user',
        name: 'Usuario Normal'
    }
];

// Headers CORS
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS, POST, GET, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '2592000'
};

// Función para generar un token simple
function generateToken(user) {
    const tokenData = {
        id: user.id,
        username: user.username,
        role: user.role,
        timestamp: new Date().getTime()
    };
    
    // Codificar en base64
    return Buffer.from(JSON.stringify(tokenData)).toString('base64');
}

// Función para procesar el body
function getRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (error) {
                resolve({});
            }
        });
    });
}

// Crear servidor
const server = http.createServer(async (req, res) => {
    // Manejar CORS
    if (req.method === 'OPTIONS') {
        res.writeHead(204, corsHeaders);
        res.end();
        return;
    }

    // Agregar headers CORS
    Object.keys(corsHeaders).forEach(key => {
        res.setHeader(key, corsHeaders[key]);
    });
    res.setHeader('Content-Type', 'application/json');

    // Ruta de login
    if (req.url === '/auth/login' && req.method === 'POST') {
        try {
            const body = await getRequestBody(req);
            const { username, password } = body;

            // Buscar usuario
            const user = users.find(u => u.username === username);
            if (!user) {
                res.writeHead(401);
                res.end(JSON.stringify({ 
                    success: false, 
                    error: 'Usuario o contraseña incorrectos' 
                }));
                return;
            }

            // Verificar contraseña
            const hashedPassword = hashPassword(password);
            if (hashedPassword !== user.password) {
                res.writeHead(401);
                res.end(JSON.stringify({ 
                    success: false, 
                    error: 'Usuario o contraseña incorrectos' 
                }));
                return;
            }

            // Generar token simple
            const token = generateToken(user);

            // Respuesta exitosa
            res.writeHead(200);
            res.end(JSON.stringify({
                success: true,
                data: {
                    user: {
                        id: user.id,
                        username: user.username,
                        role: user.role,
                        name: user.name
                    },
                    token
                }
            }));

        } catch (error) {
            console.error('Login error:', error);
            res.writeHead(500);
            res.end(JSON.stringify({ 
                success: false, 
                error: 'Error interno del servidor' 
            }));
        }
    } else {
        // Ruta no encontrada
        res.writeHead(404);
        res.end(JSON.stringify({ 
            success: false, 
            error: 'Ruta no encontrada' 
        }));
    }
});

// Iniciar servidor
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log('Usuarios disponibles:');
    console.log('1. admin / admin123 (Super Admin)');
    console.log('2. usuario / usuario123 (Usuario Normal)');
});