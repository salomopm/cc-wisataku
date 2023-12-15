const bcrypt = require('bcrypt')
const users = require('./users');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'CH2-PS432';
const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',  // Use the Cloud SQL IP address or connection name
  user: 'root',
  password: '',
  database: 'wisataKu',
});

const LoginUserHandler = async (request, h) => {
    const {email, password} = request.payload;
    const selectQuery = 'SELECT * FROM user_data WHERE email = ?';    
    try {
      const usersResult = await new Promise((resolve, reject) => {
          connection.query(selectQuery, [email], (err, result) => {
              if (err) {
                  console.error('Error querying database:', err);
                  reject(err);
              } else {
                  resolve(result);
              }
          });
      });

      const user = usersResult[0]; // Assuming the email is unique

      if (!user) {
          const response = h.response({
              status: 'Failed',
              message: 'User not found. Please check your credentials.',
          });
          response.code(400);
          return response;
      }

      if (await bcrypt.compare(password, user.hashedPassword)) {
          const userPayload = {
              email: user.email,
              nama: user.name,
              role: user.role,
          };

          const expiresIn = 60 * 60 * 1;

          const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn });
          const decodedToken = jwt.verify(token, JWT_SECRET);
          console.log(decodedToken);

          const response = h.response({
              status: 'Success',
              message: 'Authentication and Authorization successful',
              token: token,
          });
          response.code(201);
          return response;
      } else {
          const response = h.response({
              status: 'Failed',
              message: 'Authentication and Authorization failed',
          });
          response.code(400);
          return response;
      }
  } catch (error) {
      console.error(error); // Log the error to the console
      const response = h.response({
          status: 'Failed',
          message: 'Internal Server Error',
      });
      response.code(500);
      return response;
  }

};

const addUsersHandler = async (request, h) => {
  
    const {name, email, password} = request.payload;

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUsers = {name, email, hashedPassword, role: "user"}
    
    const checkEmailQuery = 'SELECT COUNT(*) as count FROM user_data WHERE email = ?';
    const checkEmailValues = [newUsers.email];

    const emailCheckResult = await new Promise((resolve, reject) => {
      connection.query(checkEmailQuery, checkEmailValues, (err, result) => {
          if (err) {
              console.error('Error checking email:', err);
              reject(err);
          } else {
              resolve(result);
          }
      });
    });

    const emailExists = emailCheckResult[0].count > 0;

    if (emailExists) {
        const response = h.response({
            status: 'fail',
            message: 'Email is already taken',
        });
        response.code(400);
        return response;
    }
    
    const insertQuery = 'INSERT INTO user_data (name, email, hashedPassword, role) VALUES (?, ?, ?, ?)';
    
    if (newUsers.name != null && newUsers.email != null && newUsers.hashedPassword != null) {
      const response = h.response({
        status: 'success',
        message: 'User berhasil ditambahkan',
      });
      response.code(201);

      connection.query(insertQuery, [newUsers.name, newUsers.email, newUsers.hashedPassword, newUsers.role], (err, result) => {
        if (err) {
          console.error('Error registering user:', err);
          return reject(err);
        }

        console.log('User registered successfully');
      });

      return response;
  }



    const response = h.response({
        status: 'fail',
        message: 'Gagal menambahkan User. Mohon isi data dengan benar',
        });
        response.code(400);
        return response;
};


const getAllUsersHandler = (request, h) => {

  const token = request.headers.authorization.split('Bearer ')[1];
  const decodedToken = jwt.decode(token, { complete: true });
  const { payload } = decodedToken;
  

  if (payload.role && payload.role == 'user') {
    const filteredUsers = users.map((user) => ({
      email: user.email,
      nama: user.name,
      password: user.hashedPassword,
      role: user.role
    }));
    
    const response = h.response({
      status: 'success',
      data: {
        users: filteredUsers,
      },
    });
    response.code(200);
    return response;
  } else {
    const response = h.response({
      status: 'Failed',
      message: 'Access denied'
    });
    response.code(400);
    return response;
  }
};

module.exports = { addUsersHandler, LoginUserHandler, getAllUsersHandler };
