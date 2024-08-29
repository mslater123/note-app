
async function fetchTodos() {
    try {
        const response = await fetch(`/todos`);
        const data = await response.json();

        const todoItems = document.getElementById('todo-items');
        todoItems.innerHTML = ''; // Clear the existing content

        if (data.length) {
            data.forEach((todo) => {
                const item = document.createElement('div');
                item.classList.add('todo-item');

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = todo.completed;
                checkbox.addEventListener('change', () => updateTodoStatus(todo._id, checkbox.checked));
                item.appendChild(checkbox);

                const titleInput = document.createElement('input');
                titleInput.type = 'text';
                titleInput.value = todo.title;
                titleInput.classList.add('todo-title');
                titleInput.dataset.id = todo._id; // Store the ID in the dataset
                titleInput.addEventListener('blur', () => updateTodoItem(todo._id, titleInput.value, detailsInput.value));
                item.appendChild(titleInput);

                const detailsInput = document.createElement('textarea');
                detailsInput.value = todo.details;
                detailsInput.classList.add('todo-details');
                detailsInput.addEventListener('blur', () => updateTodoItem(todo._id, titleInput.value, detailsInput.value));
                item.appendChild(detailsInput);

                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = 'Delete';
                deleteButton.type = 'button';
                deleteButton.addEventListener('click', () => deleteTodoItem(todo._id));
                item.appendChild(deleteButton);

                todoItems.appendChild(item);
            });
        } else {
            todoItems.innerHTML = '<p>No todo items found!</p>';
        }

    } catch (error) {
        console.error(error);
    }
}

async function addTodoItem(title, details) {
    try {
        const response = await fetch(`/todos`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, details })
        });

        if (response.ok) {
            await fetchTodos();
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.message}`);
        }
    } catch (error) {
        console.error(error);
    }
}

async function updateTodoStatus(id, completed) {
    try {
        await fetch(`/todos/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ completed })
        });

        await fetchTodos();
    } catch (error) {
        console.error(error);
    }
}

async function updateTodoItem(id, title, details) {
    try {
        const response = await fetch(`/todos/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, details })
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(`Error: ${errorData.message}`);
        }
    } catch (error) {
        console.error(error);
    }
}

async function deleteTodoItem(id) {
    try {
        await fetch(`/todos/${id}`, {
            method: 'DELETE'
        });

        await fetchTodos();
    } catch (error) {
        console.error(error);
    }
}

async function deleteAllCheckedTodos() {
    try {
        const todoItems = Array.from(document.getElementById('todo-items').children);
        const promises = [];

        for (let item of todoItems) {
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox.checked) {
                const todoId = item.querySelector('.todo-title').dataset.id;
                promises.push(deleteTodoItem(todoId));
            }
        }

        await Promise.all(promises);
        await fetchTodos();
    } catch (error) {
        console.error(error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await fetchTodos();

    const form = document.getElementById('add-todo');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const title = document.getElementById('title').value;
        const details = document.getElementById('details').value;

        if (title && details) {
            await addTodoItem(title, details);
            form.reset();
        } else {
            alert('Please enter both title and details.');
        }
    });

    const deleteAllButton = document.getElementById('delete-all');
    deleteAllButton.addEventListener('click', async () => {
        await deleteAllCheckedTodos();
    });
});
