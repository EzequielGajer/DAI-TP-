import express from 'express';
import cors from 'cors';
import ProvinceRouter from './src/controllers/province-controller.js';
import CategoryRouter from './src/controllers/category-controller.js';
import LocationRouter from './src/controllers/location-controller.js';
import EnrollmentRouter from './src/controllers/enrollment-controller.js';
import UserRouter from './src/controllers/user-controller.js';
import EventRouter from './src/controllers/event-controller.js'; 


const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/province', ProvinceRouter);
app.use('/api/event-category', CategoryRouter);
app.use('/api/location', LocationRouter);
app.use('/api/enrollment', EnrollmentRouter);
app.use('/api/user', UserRouter);
app.use('/api/event', EventRouter); 

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
