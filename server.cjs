const jsonServer = require('json-server');
const path = require('path');
const customMiddleware = require('./data/middleware.js');

const app = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'data', 'db.json'));
const middlewares = jsonServer.defaults();

app.use(middlewares);
app.use(jsonServer.bodyParser);
app.use(customMiddleware); // 커스텀 미들웨어 등록
app.use(router);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`);
}); 
