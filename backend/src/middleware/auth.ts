import basicAuth from 'express-basic-auth';

export default basicAuth({
  users: { 'acess': '2358' },
  challenge: true
});