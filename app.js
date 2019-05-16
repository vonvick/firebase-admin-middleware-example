// Install express server
import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import routes from './routes';
import models from './models';
import cors from 'cors';

const app = express();
const router = express.Router();

const headers1 = 'Origin, X-Requested-With, Content-Type, Accept';
const headers2 = 'Authorization, Access-Control-Allow-Credentials, x-access-token';
const whitelist = [process.env.CLIENT_URL, process.env.ADMIN_URL, process.env.TRUCK_OWNER_URL];
const corsOptionsDelegate = (req, callback) => {
  let corsOptions;
  if (whitelist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true };
  } else if (process.env.NODE_ENV === 'production') {
    corsOptions = { origin: true };
  } else {
    corsOptions = { origin: false };
  }
  callback(null, corsOptions);
};


// Serve static pages
app.use(express.static(__dirname +'/dist/TruckrWeb'));

// setup body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Use express backend routes
routes(router);
const clientHeaderOrigin = process.env.CLIENT_URL;

app.use(cors(corsOptionsDelegate));
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if(whitelist.indexOf(origin) > -1){
      res.header('Access-Control-Allow-Origin', origin);
  } else {
      res.header('Access-Control-Allow-Origin', clientHeaderOrigin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, PATCH, OPTIONS, PUT');
  res.header('Access-Control-Allow-Headers', `${headers1},${headers2}`);
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// Add API Routes 
app.use('/api', router);

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/dist/TruckrWeb/index.html'))
});

const port = process.env.PORT || 3000;

// Sync sequelize db models
models.sequelize.sync().then(() => {
  console.log('Database server synced');
}).catch(() => {
  console.log('Database server could not be synced');
})

// Verbose promise rejection error
process.on('unhandledRejection', (reason, p) => {
  console.log('Error:::: Unhandled Rejection at:', p, 'reason:', reason);
});

// start the app by using heroku port
app.listen(port, () => {
  console.log('App started on port: ' + port);
});