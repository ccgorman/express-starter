exports.api_request = function(req, res) {
    let data = '{}';
    try {
        const fs = require('fs');
        data = loadData(fs.readFileSync('./data/premier-league.json', 'utf8'), req.params.id, req.params.location);
    } catch(e) {
        console.log('Failed to open json', e);
    }
    res.type('json').json({teams: data})

    function loadData(data, requestType, matchLocation) {
        const matches = JSON.parse(data);
		const teams = [];
		let team1 = {};
        let team2 = {};
        
        const requestNumber = parseFloat(requestType);
        const isNumber = !isNaN(requestNumber);
        if (!isNumber) {
            matchLocation = requestType;
            requestType = null;
        }
        let display = true;
		if (matches && matches.rounds) {
            for (let i = 0; i < matches.rounds.length; i++) {
                for (let j = 0; j < matches.rounds[i].matches.length; j++) {
					team1 = matches.rounds[i].matches[j].team1;
					team2 = matches.rounds[i].matches[j].team2;
					if (!teams[team1.code]) {
						teams[team1.code] = initTeam(team1.name);
					}
					if (!teams[team2.code]) {
						teams[team2.code] = initTeam(team2.name);
                    }
                    
                    if (isNumber && requestNumber < (i + 1)) {
                        display = false;
                    }
                    
                    if (display) {
                        if (!matchLocation || matchLocation == 'home') {
                            teams[team1.code] = updateTeam(teams[team1.code], matches.rounds[i].matches[j].score1, matches.rounds[i].matches[j].score2);
                        }
                        if (!matchLocation || matchLocation == 'away') {
                            teams[team2.code] = updateTeam(teams[team2.code], matches.rounds[i].matches[j].score2, matches.rounds[i].matches[j].score1);
                        }
                    }
                }
            }
            const sortedTeams = sortTeams(teams);
            return cleanJSON(sortedTeams);
		}
	}
	
	function initTeam (name) {
		return	{
			'name': name,
			'wins': 0,
			'draws': 0,
			'defeats': 0,
			'goalsFor': 0,
			'goalsAgains': 0,
			'goalsDifference': 0,
			'points': 0
		}
	}

	function updateTeam (team, score1, score2) {
		team.wins += score1 > score2 ? 1 : 0;
		team.draws += score1 === score2 ? 1 : 0;
		team.defeats += score1 < score2 ? 1 : 0;
		team.goalsFor += score1;
		team.goalsAgains += score2;
		team.goalsDifference += score1 - score2;
		team.points += getPoints(score1, score2);
		return team;
	}

	function getPoints (score1, score2) {
		if (score1 > score2) {
			return 3;
		} else if (score1 === score2) {
			return 1;
		}
		return 0;
	}

	function sortTeams (teams) {
		const sortedTeams = [];
		for (const team in teams) {
			sortedTeams.push([team, teams[team]]);
		}
		sortedTeams.sort(function(a, b) {
			if (a[1].points === b[1].points) {
				if (a[1].goalsDifference === b[1].goalsDifference) {
					return b[1].goalsFor - a[1].goalsFor;
				}
				return b[1].goalsDifference - a[1].goalsDifference;
			}
			return b[1].points - a[1].points;
		});
		for (let rank = 1; rank < sortedTeams.length; rank++) {
			sortedTeams[(rank - 1)][1].rank = rank;
		}
		return sortedTeams;
	}
	
	function cleanJSON(teams) {
        const json = [];
		for (let i = 0; i < teams.length; i++) {
			json.push(teams[i][1]);
		}
		return json;
	}
};
