document.addEventListener('DOMContentLoaded', async () => {
    const API_KEY = "4434b956e10fc1a0080b7071b5b589da";
    const API_URL = "https://v3.football.api-sports.io/fixtures?live=all";

    const headers = {
        "x-rapidapi-host": "v3.football.api-sports.io",
        "x-rapidapi-key": API_KEY
    };

    const scoresList = document.querySelector('.scores-list');
    const leagueFilter = document.getElementById('leagueFilter');
    const showFavorites = document.getElementById('showFavorites');
    const liveTime = document.getElementById('live-time');

    let previousScores = {};
    let favoriteMatches = new Set();

    function updateTime() {
        const now = new Date();
        liveTime.textContent = now.toLocaleString('de-DE', {
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    }

    async function fetchScores() {
        try {
            const response = await fetch(API_URL, { headers });
            const data = await response.json();

            if (data.response && data.response.length > 0) {
                const filteredScores = leagueFilter.value
                    ? data.response.filter(match => match.league.country === leagueFilter.value)
                    : data.response;

                const groupedByLeague = filteredScores.reduce((groups, match) => {
                    if (!groups[match.league.name]) {
                        groups[match.league.name] = [];
                    }
                    groups[match.league.name].push(match);
                    return groups;
                }, {});

                scoresList.innerHTML = Object.keys(groupedByLeague).map(league => {
                    const matches = groupedByLeague[league]
                        .map(match => {
                            const isFavorite = favoriteMatches.has(match.fixture.id);
                            return `
                                <div class="match" id="match-${match.fixture.id}">
                                    <span class="favorite" onclick="toggleFavorite('${match.fixture.id}')">
                                        ${isFavorite ? '★' : '☆'}
                                    </span>
                                    <div class="team home">
                                        <img src="${match.teams.home.logo}" alt="${match.teams.home.name} Logo">
                                        <p>${match.teams.home.name}</p>
                                    </div>
                                    <div class="score">
                                        <p>${match.goals.home} - ${match.goals.away}</p>
                                    </div>
                                    <div class="team away">
                                        <p>${match.teams.away.name}</p>
                                        <img src="${match.teams.away.logo}" alt="${match.teams.away.name} Logo">
                                    </div>
                                </div>
                            `;
                        }).join('');

                    return `
                        <div class="league-group">
                            <h3>${league}</h3>
                            ${matches}
                        </div>
                    `;
                }).join('');
            } else {
                scoresList.innerHTML = "<p>Keine Live-Spiele verfügbar</p>";
            }
        } catch (error) {
            console.error("Fehler beim Abrufen der Live-Daten:", error);
        }
    }

    function toggleFavorite(matchId) {
        if (favoriteMatches.has(matchId)) {
            favoriteMatches.delete(matchId);
        } else {
            favoriteMatches.add(matchId);
        }
        fetchScores();
    }

    leagueFilter.addEventListener('change', fetchScores);
    showFavorites.addEventListener('change', () => {
        fetchScores();
    });

    setInterval(updateTime, 1000);
    setInterval(fetchScores, 10000);

    updateTime();
    fetchScores();
});
