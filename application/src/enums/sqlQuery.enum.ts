export enum SqlQuery {
    CREATE_TABLE = "CREATE TABLE tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT)",
    INSERT_TASK = "INSERT INTO tasks (title, description) VALUES (?, ?)",
    SELECT_ALL_TASKS = "SELECT * FROM tasks",
    SELECT_TASK_BY_ID = "SELECT * FROM tasks WHERE id = ?",
    UPDATE_TASK = "UPDATE tasks SET title = ?, description = ? WHERE id = ?",
    DELETE_TASK = "DELETE FROM tasks WHERE id = ?",
}