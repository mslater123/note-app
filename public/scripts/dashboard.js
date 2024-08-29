let editingTodoId = null;

// Attach event listeners to the buttons (edit, delete, view)
function attachEventListenersToButtons(todoElement) {
    // Delete button
    todoElement.querySelector('.delete').addEventListener('click', async () => {
        const todoId = todoElement.getAttribute('data-id');
        const response = await fetch(`/todos/${todoId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            todoElement.remove();
        } else {
            const errorData = await response.json();
            console.error('Delete failed:', errorData);
            alert(`Failed to delete to-do: ${errorData.message}`);
        }
    });

    // Edit button
    todoElement.querySelector('.edit').addEventListener('click', () => {
        const todoId = todoElement.getAttribute('data-id');
        const title = todoElement.querySelector('strong').textContent;
        const details = todoElement.querySelector('.details').textContent;
        const color = todoElement.style.backgroundColor;

        // Set the form fields with current to-do data
        document.getElementById('title').value = title;
        document.getElementById('details').value = details;
        document.getElementById('color').value = rgbToHex(color);

        // Change the submit button text to 'Update'
        document.querySelector('#add-todo button').textContent = 'Update';
        editingTodoId = todoId; // Set the editingTodoId to the current to-do's ID
    });

    // View button
    todoElement.querySelector('.view').addEventListener('click', () => {
        const todoId = todoElement.getAttribute('data-id');
        window.location.href = `/todos/view/${todoId}`; // Redirect to the view page
    });

    // Enable dragging for the todo item
    todoElement.setAttribute('draggable', 'true');
    todoElement.addEventListener('dragstart', handleDragStart);
    todoElement.addEventListener('dragover', handleDragOver);
    todoElement.addEventListener('drop', handleDrop);
    todoElement.addEventListener('dragend', handleDragEnd);
}

// Handle the form submission for adding/updating a to-do
document.getElementById('add-todo').addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const details = document.getElementById('details').value;
    const color = document.getElementById('color').value;
    const method = editingTodoId ? 'PUT' : 'POST';
    const url = editingTodoId ? `/todos/todo/${editingTodoId}` : '/todos';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, details, color })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to ${editingTodoId ? 'update' : 'add'} todo: ${errorData.message}`);
        }

        const updatedTodo = await response.json();

        // Check if the "No to-dos yet" placeholder exists and remove it
        const todoList = document.getElementById('todo-list');
        const noTodosMessage = document.querySelector('.no-todos');
        if (noTodosMessage) {
            noTodosMessage.remove();
        }

        if (editingTodoId) {
            updateTodoInUI(editingTodoId, updatedTodo);  // Update the existing todo in the UI
        } else {
            addToDoToList(updatedTodo);  // Add new todo to the UI
        }

        resetForm();  // Reset the form after success
    } catch (error) {
        console.error('Error:', error);
        alert(`An error occurred: ${error.message}`);
    }
});

// Add new to-do item to the list and attach event listeners
function addToDoToList(todo) {
    const li = document.createElement('li');
    li.classList.add('todo-item');
    li.setAttribute('data-id', todo._id);
    li.style.backgroundColor = todo.color;
    li.innerHTML = `<strong>${todo.title}</strong>
                    <span class="details">${todo.details}</span>
                    <div class="actions">
                        <button class="edit">Edit</button>
                        <button class="delete">Delete</button>
                        <button class="view">View</button>
                    </div>`;
    document.getElementById('todo-list').appendChild(li);

    // Attach event listeners to the new buttons
    attachEventListenersToButtons(li);
}


// Add new to-do item to the list and attach event listeners
function addToDoToList(todo) {
    const li = document.createElement('li');
    li.classList.add('todo-item');
    li.setAttribute('data-id', todo._id);
    li.style.backgroundColor = todo.color;
    li.innerHTML = `<strong>${todo.title}</strong>
                    <span class="details">${todo.details}</span>
                    <div class="actions">
                        <button class="edit">Edit</button>
                        <button class="delete">Delete</button>
                        <button class="view">View</button>
                    </div>`;
    document.getElementById('todo-list').appendChild(li);

    // Attach event listeners to the new buttons
    attachEventListenersToButtons(li);
}

// Update the to-do item in the UI
function updateTodoInUI(id, updatedTodo) {
    const todoElement = document.querySelector(`.todo-item[data-id='${id}']`);
    if (todoElement) {
        todoElement.querySelector('strong').textContent = updatedTodo.title;
        todoElement.querySelector('.details').textContent = updatedTodo.details;
        todoElement.style.backgroundColor = updatedTodo.color;
    }
}

// Reset the form after adding/updating a to-do
function resetForm() {
    document.getElementById('title').value = '';
    document.getElementById('details').value = '';
    document.getElementById('color').value = '#ffffff';
    document.querySelector('#add-todo button').textContent = 'Add';
    editingTodoId = null;
}

// Convert RGB color to Hex format
function rgbToHex(rgb) {
    const rgbValues = rgb.match(/\d+/g);
    return `#${rgbValues.map(x => parseInt(x).toString(16).padStart(2, '0')).join('')}`;
}

// Drag and Drop Handlers
let draggedItem = null;

function handleDragStart(e) {
    draggedItem = this;
    setTimeout(() => {
        this.style.display = 'none';
    }, 0);
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    if (draggedItem !== this) {
        const todoList = document.getElementById('todo-list');
        const allItems = Array.from(todoList.children);
        const draggedIndex = allItems.indexOf(draggedItem);
        const targetIndex = allItems.indexOf(this);

        if (draggedIndex > targetIndex) {
            todoList.insertBefore(draggedItem, this);
        } else {
            todoList.insertBefore(draggedItem, this.nextSibling);
        }
    }
}

function handleDragEnd() {
    this.style.display = 'block';
    draggedItem = null;
}

// Attach event listeners to the existing to-do items when the page loads
document.querySelectorAll('.todo-item').forEach(todoElement => {
    attachEventListenersToButtons(todoElement);
});
