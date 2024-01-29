require ('dotenv').config().
cost app = ('/server.js');
const PORT = process.env.PORT || 3002;

app.listen (PORT, () => {
  console.log(`http server listening on port ${PORT}`);
});