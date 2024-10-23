import db from "../../config/sqLite";
import { SqlQuery } from "../enums/sqlQuery.enum";


interface Task {
    id?: number;
    title: string;
    description: string;
}

export const createTask = async (body: Task): Promise<Task> => {
    const { title, description } = body;
    if (!title || !description) {
        throw new Error('Title and description are required.');
    }
    try {
        return new Promise((resolve, reject) => {
            db.run(SqlQuery.INSERT_TASK, [title, description], function (err) {
                if (err) {
                    return reject(err);
                }
                resolve({ id: this.lastID, title, description });
            });
        });
    } catch (error) {
        throw new Error(`Error on createTask: ${error}`);
    }
};


export const getAllTasks = (): Promise<Task[]> => {
    try {
        return new Promise((resolve, reject) => {
            db.all(SqlQuery.SELECT_ALL_TASKS, (err, rows) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows as Task[]);
            });
        });
    } catch (error) {
        throw ("Error on getAllTasks: " + error);
    }
};

export const getTaskById = (id: number): Promise<Task> => {
   try {
        return new Promise((resolve, reject) => {
            db.get(SqlQuery.SELECT_TASK_BY_ID, [id], (err, row) => {
                if (err) {
                    return reject(err);
                }
                resolve(row as Task);
            });
        });
    } catch (error) {
        throw ("Error on getTaskById: " + error);
    }
};

export const updateTask = (id: number, body: Task): Promise<number> => {
   try {
        const { title, description } = body;
        if (!title || !description) {
            throw new Error('Title and description are required.');
        }
        return new Promise((resolve, reject) => {
            db.run(SqlQuery.UPDATE_TASK, [title, description, id], function (err) {
                if (err) {
                    return reject(err);
                }
                resolve(this.changes);
            });
        });
   } catch (error) {
        throw ("Error on updateTask: " + error);
   }
};

export const deleteTask = (id: number): Promise<number> => {
    try {
        return new Promise((resolve, reject) => {
            db.run(SqlQuery.DELETE_TASK, [id], function (err) {
                if (err) {
                    return reject(err);
                }
                resolve(this.changes);
            });
        });
    } catch (error) {
        throw ("Error on deleteTask: " + error);
    }
};
