// server/server.js
const http = require('http');
const pool = require('./config/database');

async function getRequestBody(req) {
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

const server = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.url === '/auth/login' && req.method === 'POST') {
        try {
            const body = await getRequestBody(req);
            console.log('Datos recibidos:', {
                username: body.username,
                password: '***' // No loggeamos la contraseña real
            });

            // Verificar que los campos necesarios estén presentes
            if (!body.username || !body.password) {
                res.writeHead(400);
                res.end(JSON.stringify({
                    success: false,
                    error: 'Usuario y contraseña son requeridos'
                }));
                return;
            }

            // Buscar el usuario por nombre de usuario
            const [users] = await pool.execute(
                'SELECT * FROM users WHERE username = ?',
                [body.username]
            );

            // Verificar si se encontró el usuario
            if (users.length === 0) {
                res.writeHead(401);
                res.end(JSON.stringify({
                    success: false,
                    error: 'Usuario o contraseña incorrectos'
                }));
                return;
            }

            const user = users[0];
            // Comparar la contraseña directamente ya que están en texto plano
            if (body.password === user.password) {
                console.log('Login exitoso para usuario:', user.username);
                
                res.writeHead(200);
                res.end(JSON.stringify({
                    success: true,
                    data: {
                        user: {
                            id: user.id,
                            username: user.username,
                            name: user.name,
                            role: user.role
                        },
                        token: 'token-' + Date.now()
                    }
                }));
            } else {
                console.log('Contraseña incorrecta para usuario:', user.username);
                res.writeHead(401);
                res.end(JSON.stringify({
                    success: false,
                    error: 'Usuario o contraseña incorrectos'
                }));
            }
        } catch (error) {
            console.error('Error del servidor:', error);
            res.writeHead(500);
            res.end(JSON.stringify({
                success: false,
                error: 'Error interno del servidor'
            }));
        }
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({
            success: false,
            error: 'Ruta no encontrada'
        }));
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});