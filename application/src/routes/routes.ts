import { Router } from 'express';
import config from '../../config/config';
import * as controllers from '../controllers/taskController';
import { authenticateToken } from '../middlewares/authorization';


const routes: Router = Router();

const v1Prefix = config.apiPath + config.apiVersion;

const v1Group = Router();

v1Group.use(authenticateToken);

v1Group.post('/saveTask', controllers.createTask);
v1Group.get('/getTask', controllers.getAllTasks);
v1Group.get('/getTask/:id', controllers.getTaskById);
v1Group.put('/updateTask/:id', controllers.updateTask);
v1Group.delete('/deleteTask/:id', controllers.deleteTask);

routes.use(v1Prefix, v1Group);

export default routes;