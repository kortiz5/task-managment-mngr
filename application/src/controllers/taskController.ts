import { Request, Response } from 'express';
import * as service from '../services/taskModel';

/**
 * Creates a task from the request body.
 * Responds with the created task (201) or an error (500).
 * 
 * @param req - Request object
 * @param res - Response object
 */
export const createTask = async (req: Request, res: Response) => {
    try {
        const task = await service.createTask(req.body);
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};


/**
 * Retrieves all tasks.
 * Responds with an array of tasks (200) or an error (500).
 * 
 * @param req - Request object
 * @param res - Response object
 */
export const getAllTasks = async (req: Request, res: Response) => {
    try {
        const tasks = await service.getAllTasks();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};


/**
 * Retrieves a task by its `id`.
 * Responds with the task (200) or a 404 if not found, or an error (500).
 * 
 * @param req - Request object
 * @param res - Response object
 */
export const getTaskById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const task = await service.getTaskById(Number(id));
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

/**
 * Updates a task by its `id`.
 * Responds with the updated task (200), 404 if not found, or an error (500).
 * 
 * @param req - Request object
 * @param res - Response object
 */
export const updateTask = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const changes = await service.updateTask(Number(id), req.body);
        if (changes === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).send();
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};


/**
 * Deletes a task by its `id`.
 * Responds with no content (204), 404 if not found, or an error (500).
 * 
 * @param req - Request object
 * @param res - Response object
 */
export const deleteTask = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const changes = await service.deleteTask(Number(id));
        if (changes === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};
