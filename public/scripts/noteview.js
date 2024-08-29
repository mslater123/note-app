document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const usernameElement = document.getElementById('username');
    const profileButton = document.getElementById('profile');
    const logoutButton = document.getElementById('logout');

    // Fetch user info to display the username
    try {
        const response = await fetch('/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const user = await response.json();
            usernameElement.textContent = `Welcome, ${user.username}`;
        } else {
            throw new Error('Failed to fetch user information');
        }
    } catch (error) {
        console.error(error.message);
    }

    profileButton.addEventListener('click', () => {
        window.location.href = '/profile'; // Redirect to the profile page
    });

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '/login'; // Redirect to the login page
    });

    // Existing code for creating notes, changing colors, etc.
    const canvas = document.getElementById('nodeCanvas');
    const graph = new NodeGraph(canvas);

    document.getElementById('createNote').addEventListener('click', async () => {
        const title = document.getElementById('newTitle').value.trim();
        const details = document.getElementById('newDetails').value.trim();
        if (title && details) {
            const newNode = new Node(null, 100, 100, title, details); // Correct instantiation
            graph.addNode(newNode);
            await saveNode(newNode); // Save the new node to the database
            document.getElementById('newTitle').value = '';
            document.getElementById('newDetails').value = '';
        } else {
            alert('Please enter both title and details.');
        }
    });

    document.getElementById('colorYellow').addEventListener('click', () => {
        graph.selectedNodes.forEach(node => {
            node.color = '#ffeb3b';
            graph.draw();
            updateNodeColor(node.id, node.color);
        });
    });

    document.getElementById('colorBlue').addEventListener('click', () => {
        graph.selectedNodes.forEach(node => {
            node.color = '#00bfff';
            graph.draw();
            updateNodeColor(node.id, node.color);
        });
    });

    document.getElementById('colorGreen').addEventListener('click', () => {
        graph.selectedNodes.forEach(node => {
            node.color = '#98fb98';
            graph.draw();
            updateNodeColor(node.id, node.color);
        });
    });

    graph.draw();
});
