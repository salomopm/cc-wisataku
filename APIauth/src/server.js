const Hapi = require('@hapi/hapi');
const routes = require('./routes');
const HapiAuthJWT2 = require('hapi-auth-jwt2');
const JWT_SECRET = 'CH2-PS432';
const mysql = require('mysql');


const init = async () => {

  const server = Hapi.server({
    port: 3000,
    host: '127.0.0.1',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });
  await server.register(HapiAuthJWT2);

  const connection = mysql.createConnection({
    host: '34.128.87.127',  // Use the Cloud SQL IP address or connection name
    user: 'root',
    password: 'root',
    database: 'wisataKu',
  });

  
  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      process.exit(1);
    }
    console.log('Connected to the database');
  });

  server.auth.strategy('jwt', 'jwt', {
    key: JWT_SECRET,
    algorithm: 'HS256',
    validate: async (decoded, request) => {
        return { isValid: true, credentials: decoded };
    }
  });

  server.auth.default('jwt');

  server.route(routes);
  
  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};
   
  init();





