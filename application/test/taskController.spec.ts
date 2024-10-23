import { Request, Response } from 'express';
import * as service from '../src/services/taskModel';
import { createTask, getAllTasks, getTaskById, updateTask, deleteTask } from '../src/controllers/taskController';
import db from '../config/sqLite';
import { SqlQuery } from '../src/enums/sqlQuery.enum';
import sqlite3 from 'sqlite3';

jest.mock('../config/sqLite');

describe('createTask Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    req = {
      body: {
        title: 'Test Task',
        description: 'Test Description',
      },
    };


    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    res = {
      status: statusMock,
    };
  });

  afterEach(() => {
    (service as any).tasks = [];
  });


  it('should return 500 and an error message if tittle or description is not present', async () => {
    const req = {
        body: {
          titles: 'Test Task',
          description: 'Test Description',
    }};

    await createTask(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Title and description are required' });
  });

  it('should respond with 500 when db.run throws an error', async () => {
   
    const mockDbRun = jest.spyOn(db, 'run').mockImplementation(function (
      this: sqlite3.Database,
      query: string,
      params: any[],
      callback: (err: Error | null) => void
    ) {
      const error = new Error('Database error');
      callback(error);
      return this;
    });

    try {
      await createTask(req as Request, res as Response);
    } catch (error) {
      console.error('Error captured during test execution', error);
    }
    expect(mockDbRun).toHaveBeenCalledWith(SqlQuery.INSERT_TASK, ['Test Task', 'Test Description'], expect.any(Function));
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Database error' });

    mockDbRun.mockRestore();
  });
  it('should respond with 201 and the created task when db.run succeeds', async () => {
   
    (db.run as any) = jest.fn((sql: string, params: any[] | ((this: sqlite3.RunResult, err: Error | null) => void), callback?: (this: sqlite3.RunResult, err: Error | null) => void): sqlite3.Database => {
      if (typeof params === 'function') {
       
        callback = params;
        params = [];
      }
  
      if (callback) {
        callback.call({ lastID: 1 } as sqlite3.RunResult, null);
      }
  

      return db as sqlite3.Database;
    });

    try {
      await createTask(req as Request, res as Response);
    } catch (error) {
      console.log('Error captured during test execution', error);
    }
  
    expect(db.run).toHaveBeenCalledWith(SqlQuery.INSERT_TASK, ['Test Task', 'Test Description'], expect.any(Function));
    expect(statusMock).toHaveBeenCalledWith(201);
    expect(jsonMock).toHaveBeenCalledWith({ id: 1, title: 'Test Task', description: 'Test Description' });
  
    (db.run as jest.Mock).mockRestore();
  });

  it('should catch an error in createTask and respond with 500', async () => {
    jest.spyOn(service, 'createTask').mockImplementation(() => {
      return Promise.reject(new Error('Simulated error in db.run'));
    });

    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn();

    await createTask(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Simulated error in db.run',
    });

    (service.createTask as jest.Mock).mockRestore();
  });
  
  
  
});

describe('getAllTasks Controller', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;
  
    beforeEach(() => {
      req = {};
  
      jsonMock = jest.fn();
      statusMock = jest.fn().mockReturnValue({ json: jsonMock });
  
      res = {
        status: statusMock,
        json: jsonMock,
      };
    });
  
    afterEach(() => {
      (service as any).tasks = [];
    });
  
    it('should respond with 200 and the list of tasks when db.all succeeds', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1', description: 'Description 1' },
        { id: 2, title: 'Task 2', description: 'Description 2' }
      ];
  
      (db.all as any) = jest.fn((query: string, callback: (err: Error | null, rows: any[]) => void) => {
        callback(null, mockTasks);
      });
  
      await getAllTasks(req as Request, res as Response);
  
      expect(db.all).toHaveBeenCalledWith(SqlQuery.SELECT_ALL_TASKS, expect.any(Function));
      expect(res.json).toHaveBeenCalledWith(mockTasks);
      expect(statusMock).not.toHaveBeenCalled();
      (db.all as jest.Mock).mockRestore();
    });
  
    it('should respond with 500 when db.all throws an error', async () => {
      (db.all as any) = jest.fn((query: string, callback: (err: Error | null, rows: any[]) => void) => {
        const error = new Error('Database error');
        callback(error, []);
      });
  
      await getAllTasks(req as Request, res as Response);
  
      expect(db.all).toHaveBeenCalledWith(SqlQuery.SELECT_ALL_TASKS, expect.any(Function));
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Database error' });
      (db.all as jest.Mock).mockRestore();
    });
});

describe('getTaskById Controller', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;
  
    beforeEach(() => {
      req = {
        params: {
          id: '1',
        },
      };
  
      jsonMock = jest.fn();
      statusMock = jest.fn().mockReturnValue({ json: jsonMock });
  
      res = {
        status: statusMock,
        json: jsonMock,
      };
    });
  
    afterEach(() => {
      (service as any).tasks = [];
    });
  
    it('should respond with 200 and the task when db.get succeeds', async () => {
      const mockTask = { id: 1, title: 'Task 1', description: 'Description 1' };
  
      (db.get as any) = jest.fn((query: string, params: any[], callback: (err: Error | null, row: any) => void) => {
        callback(null, mockTask);
      });
  
      await getTaskById(req as Request, res as Response);
  
      expect(db.get).toHaveBeenCalledWith(SqlQuery.SELECT_TASK_BY_ID, [1], expect.any(Function));
      
      expect(res.json).toHaveBeenCalledWith(mockTask);
      expect(statusMock).not.toHaveBeenCalled();
  
      (db.get as jest.Mock).mockRestore();
    });
  
    it('should respond with 404 if the task is not found', async () => {
      (db.get as any) = jest.fn((query: string, params: any[], callback: (err: Error | null, row: any) => void) => {
        callback(null, undefined);
      });
  
      await getTaskById(req as Request, res as Response);
  
      expect(db.get).toHaveBeenCalledWith(SqlQuery.SELECT_TASK_BY_ID, [1], expect.any(Function));
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Task not found' });
  
      (db.get as jest.Mock).mockRestore();
    });
  
    it('should respond with 500 when db.get throws an error', async () => {
      (db.get as any) = jest.fn((query: string, params: any[], callback: (err: Error | null, row: any) => void) => {
        const error = new Error('Database error');
        callback(error, null);
      });
  
      await getTaskById(req as Request, res as Response);
  
      expect(db.get).toHaveBeenCalledWith(SqlQuery.SELECT_TASK_BY_ID, [1], expect.any(Function));
  
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Database error' });
  
      (db.get as jest.Mock).mockRestore();
    });
  });

  describe('updateTask Controller', () => {
    let req: Partial<Request>;
    let badReq: Partial<Request>;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;

    req = {
        params: {
          id: '1',
        },
        body: {
          title: 'Updated Task',
          description: 'Updated Description',
        },
    };

    badReq = {
        params: {
          id: '1',
        },
        body: {
          titles: 'Updated Task',
          description: 'Updated Description',
        },
      };
  
    beforeEach(() => {
      jsonMock = jest.fn();
      statusMock = jest.fn().mockReturnValue({ json: jsonMock });
  
      res = {
        status: statusMock,
        json: jsonMock,
        send: jest.fn(),
      };
    });
  
    afterEach(() => {
      (service as any).tasks = [];
    });
  
    it('should respond with 200 when db.run successfully updates the task', async () => {
        (db.run as any) = jest.fn(function (
          query: string,
          params: any[],
          callback: (err: Error | null) => void
        ) {
          callback.call({ changes: 1 }, null);
        });
      
        await updateTask(req as Request, res as Response);
        expect(db.run).toHaveBeenCalledWith(SqlQuery.UPDATE_TASK, ['Updated Task', 'Updated Description', 1], expect.any(Function));
        expect(statusMock).toHaveBeenCalledWith(200);
      
        (db.run as jest.Mock).mockRestore();
      });
      
  
      it('should respond with 404 if the task is not found (no rows updated)', async () => {
        (db.run as any) = jest.fn(function (
          query: string,
          params: any[],
          callback: (err: Error | null) => void
        ) {
          callback.call({ changes: 0 }, null);
        });
      
        await updateTask(req as Request, res as Response);

        expect(db.run).toHaveBeenCalledWith(SqlQuery.UPDATE_TASK, ['Updated Task', 'Updated Description', 1], expect.any(Function));
        expect(statusMock).toHaveBeenCalledWith(404);
        expect(jsonMock).toHaveBeenCalledWith({ message: 'Task not found' });
      
        (db.run as jest.Mock).mockRestore();
      });
      
  
    it('should respond with 500 if db.run throws an error', async () => {
      (db.run as any) = jest.fn((query: string, params: any[], callback: (err: Error | null, changes: number) => void) => {
        const error = new Error('Database error');
        callback(error, 0);
      });
  
      await updateTask(req as Request, res as Response);
  
      expect(db.run).toHaveBeenCalledWith(SqlQuery.UPDATE_TASK, ['Updated Task', 'Updated Description', 1], expect.any(Function));
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Database error' });
  
      (db.run as jest.Mock).mockRestore();
    });

    it('should return 500 and an error message if tittle or description is not present on update service', async () => {
    
        await updateTask(badReq as Request, res as Response);
    
        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({ error: 'Title and description are required' });
      });
      
  });

  describe('deleteTask Controller', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;
  
    beforeEach(() => {
      req = {
        params: {
          id: '1',
        },
      };
  
      jsonMock = jest.fn();
      statusMock = jest.fn().mockReturnValue({ json: jsonMock });
  
      res = {
        status: statusMock,
        json: jsonMock,
        send: jest.fn(),
      };
    });
  
    afterEach(() => {
      (service as any).tasks = [];
    });

    it('should respond with 204 when db.run successfully deletes the task', async () => {
        (db.run as any) = jest.fn(function (
          query: string,
          params: any[],
          callback: (err: Error | null) => void
        ) {
          callback.call({ changes: 1 }, null);
        });

        res.send = jest.fn();
        res.status = jest.fn().mockReturnValue(res);
      
        await deleteTask(req as Request, res as Response);

        expect(db.run).toHaveBeenCalledWith(SqlQuery.DELETE_TASK, [1], expect.any(Function));

        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
      

        (db.run as jest.Mock).mockRestore();
    });

    it('should respond with 404 if the task is not found (no rows deleted)', async () => {
        (db.run as any) = jest.fn(function (
          query: string,
          params: any[],
          callback: (err: Error | null) => void
        ) {
          callback.call({ changes: 0 }, null);
        });

        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn();
      
        await deleteTask(req as Request, res as Response);

        expect(db.run).toHaveBeenCalledWith(SqlQuery.DELETE_TASK, [1], expect.any(Function));
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Task not found' });

        (db.run as jest.Mock).mockRestore();
      });
      
      it('should respond with 500 if db.run throws an error', async () => {
        (db.run as any) = jest.fn(function (
          query: string,
          params: any[],
          callback: (err: Error | null) => void
        ) {
          const error = new Error('Database error');
          callback.call({ changes: 0 }, error);
        });

        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn();
      
        await deleteTask(req as Request, res as Response);

        expect(db.run).toHaveBeenCalledWith(SqlQuery.DELETE_TASK, [1], expect.any(Function));
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });

        (db.run as jest.Mock).mockRestore();
      });
      
    
      

      
  });
