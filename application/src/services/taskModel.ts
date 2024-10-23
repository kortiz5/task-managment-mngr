import db from "../../config/sqLite";
import { SqlQuery } from "../enums/sqlQuery.enum";
import { Task } from "../models/ITask";


export const createTask = async (body: Task): Promise<Task> => {
    const { title, description } = body;
    if (!title || !description) {
        throw new Error('Title and description are required');
    }
    return new Promise((resolve, reject) => {
        db.run(SqlQuery.INSERT_TASK, [title, description], function (err) {
            if (err) {
                console.log('Error on createTask: ', err);
                return reject(err);
            }
            resolve({ id: this.lastID, title, description });
        });
    });
};


export const getAllTasks = (): Promise<Task[]> => {
    return new Promise((resolve, reject) => {
        db.all(SqlQuery.SELECT_ALL_TASKS, (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows as Task[]);
        });
    });
};

export const getTaskById = (id: number): Promise<Task> => {
    return new Promise((resolve, reject) => {
        db.get(SqlQuery.SELECT_TASK_BY_ID, [id], (err, row) => {
            if (err) {
                return reject(err);
            }
            resolve(row as Task);
        });
    });
};

export const updateTask = (id: number, body: Task): Promise<number> => {
    const { title, description } = body;
    if (!title || !description) {
        throw new Error('Title and description are required');
    }
    return new Promise((resolve, reject) => {
        db.run(SqlQuery.UPDATE_TASK, [title, description, id], function (err) {
            if (err) {
                console.log('Error on updateTask: ', err);
                return reject(err);
            }
            resolve(this.changes);
        });
    });
};

export const deleteTask = (id: number): Promise<number> => {
    return new Promise((resolve, reject) => {
        db.run(SqlQuery.DELETE_TASK, [id], function (err) {
            if (err) {
                return reject(err);
            }
            resolve(this.changes);
        });
    });
};
