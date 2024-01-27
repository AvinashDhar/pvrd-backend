const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');
const authJwt = require('../helpers/jwt');
const errorHandler = require('../helpers/error-handler');

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
const colourRoutes = require('../routes/colours');
const brandRoutes = require('../routes/brands');
const sizeRoutes = require('../routes/sizes');
const uomRoutes = require('../routes/uom');
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
app.use(`${api}/colours`, colourRoutes);
app.use(`${api}/brands`, brandRoutes);
app.use(`${api}/sizes`, sizeRoutes);
app.use(`${api}/uoms`, uomRoutes);

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
