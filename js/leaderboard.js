// leaderboard.js

// Function to format time as MM:SS
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Function to get the leaderboard from localStorage
function getLeaderboard() {
    const leaderboard = localStorage.getItem('leaderboard');
    return leaderboard ? JSON.parse(leaderboard) : [];
}

// Function to save a new score to the leaderboard
function saveScore(username, survivalTime) {
    const leaderboard = getLeaderboard();
    leaderboard.push({ username, survivalTime });
    // Sort by survival time (descending, longer is better) and keep top 10
    leaderboard.sort((a, b) => b.survivalTime - a.survivalTime);
    const top10 = leaderboard.slice(0, 10);
    localStorage.setItem('leaderboard', JSON.stringify(top10));
    return top10;
}

// Function to display the leaderboard in a given table body
function displayLeaderboard(tableBodyId) {
    const leaderboard = getLeaderboard();
    const tbody = document.getElementById(tableBodyId);
    if (!tbody) {
        console.error(`Leaderboard table body with ID ${tableBodyId} not found`);
        return;
    }
    tbody.innerHTML = '';

    leaderboard.forEach((entry, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${entry.username}</td>
            <td>${formatTime(entry.survivalTime)}</td>
        `;
        tbody.appendChild(row);
    });
}

// Export functions for use in other files
// Note: Since we're using <script> tags, we attach these to the global window object
window.leaderboard = {
    formatTime,
    getLeaderboard,
    saveScore,
    displayLeaderboard
};