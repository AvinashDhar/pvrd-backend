const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');
const authJwt = require('../helpers/jwt');
const errorHandler = require('../helpers/error-handler');

// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
//   });

app.use(cors());
// app.options('*', cors())

//middleware
app.use(express.json());
app.use(morgan('tiny'));
//app.use(authJwt());
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
//app.use(errorHandler);

//Routes
const categoriesRoutes = require('../routes/categories');
const subCategoriesRoutes = require('../routes/subCategories');
const productsRoutes = require('../routes/products');
const usersRoutes = require('../routes/users');
const ordersRoutes = require('../routes/orders');
const addressRoutes = require('../routes/address');

const api = process.env.API_URL;
app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/subCategories`, subCategoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);
app.use(`${api}/addresses`,addressRoutes);

//Database
mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'eshop-database'
})
.then(()=>{
    console.log('Database Connection is ready...')
})
.catch((err)=> {
    console.log(err);
})

//Server
// app.listen(8000, ()=>{

//     console.log('server is running http://localhost:8000');
// })

// const port = process.env.PORT || 8000;
// app.listen(port, () => {
//   console.log(`App running on port ${port}...`);
// });

module.exports = app;
