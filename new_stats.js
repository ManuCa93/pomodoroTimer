// ====== STATS LOGIC ======
let statsChartInstance = null;
let currentStatsFilter = 'today';

function setStatsFilter(filter) {
    currentStatsFilter = filter;
    
    // Update active tab UI
    document.querySelectorAll('.stats-tab').forEach(tab => {
        if(tab.dataset.filter === filter) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    updateStatsUI();
}

function injectMockStats() {
    if (!appData.statsHistory) appData.statsHistory = {};
    const today = new Date();
    for (let i = 0; i <= 35; i++) {
        let d = new Date(today);
        d.setDate(d.getDate() - i);
        let dateStr = d.toISOString().split('T')[0];
        
        // Only inject if it doesn't exist
        if (!appData.statsHistory[dateStr] || appData.statsHistory[dateStr].pomodoros === 0) {
            let randomMins = Math.floor(Math.random() * 250) + 50;
            let mockHourly = {};
            let mockSessions = [];
            let remaining = randomMins;
            let hour = 8;
            while(remaining > 0 && hour <= 22) {
                let chunk = Math.min(remaining, Math.floor(Math.random() * 45) + 10);
                mockHourly[hour] = chunk;
                
                let numSessions = Math.ceil(chunk / 25);
                for(let s = 0; s < numSessions; s++) {
                    let dStart = new Date(d);
                    dStart.setHours(hour, s * 25, 0);
                    let dEnd = new Date(dStart.getTime() + (25 * 60000));
                    mockSessions.push({
                        start: dStart.toISOString(),
                        end: dEnd.toISOString(),
                        durationSeconds: 25 * 60
                    });
                }
                
                remaining -= chunk;
                hour++;
            }
            appData.statsHistory[dateStr] = {
                workMinutes: randomMins,
                pomodoros: Math.floor(randomMins / 25),
                hourly: mockHourly,
                sessions: mockSessions
            };
        }
    }
    saveAppData();
}

function initStats() {
    if (!appData.statsHistory) {
        appData.statsHistory = {};
        if (appData.stats && appData.stats.date) {
            let oldDate = new Date(appData.stats.date).toISOString().split('T')[0];
            appData.statsHistory[oldDate] = { 
                pomodoros: appData.stats.pomodoros || 0, 
                workMinutes: appData.stats.workMinutes || 0,
                hourly: {},
                sessions: []
            };
        }
    }
    
    const today = new Date().toISOString().split('T')[0];
    if (!appData.statsHistory[today]) {
        appData.statsHistory[today] = { pomodoros: 0, workMinutes: 0, hourly: {}, sessions: [] };
        saveAppData();
    } else {
        if (!appData.statsHistory[today].hourly) appData.statsHistory[today].hourly = {};
        if (!appData.statsHistory[today].sessions) appData.statsHistory[today].sessions = [];
        saveAppData();
    }
}

function recordPomodoroStat(seconds, startObj, endObj) {
    initStats();
    const todayDate = new Date();
    const today = todayDate.toISOString().split('T')[0];
    const currentHour = todayDate.getHours();
    
    appData.statsHistory[today].pomodoros++;
    const mins = Math.floor(seconds / 60);
    appData.statsHistory[today].workMinutes += mins;
    
    if(!appData.statsHistory[today].hourly) appData.statsHistory[today].hourly = {};
    appData.statsHistory[today].hourly[currentHour] = (appData.statsHistory[today].hourly[currentHour] || 0) + mins;
    
    if(!appData.statsHistory[today].sessions) appData.statsHistory[today].sessions = [];
    appData.statsHistory[today].sessions.push({
        start: startObj.toISOString(),
        end: endObj.toISOString(),
        durationSeconds: seconds
    });
    
    saveAppData();
    updateStatsUI();
}

function updateStatsUI() {
    initStats();
    const filter = currentStatsFilter;
    
    let totalPomos = 0;
    let totalMins = 0;
    let chartLabels = [];
    let chartData = [];
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (filter === "today") {
        let todayStr = new Date().toISOString().split('T')[0];
        let todayStats = appData.statsHistory[todayStr] || { hourly: {}, workMinutes: 0, pomodoros: 0, sessions: [] };
        totalPomos = todayStats.pomodoros || 0;
        totalMins = todayStats.workMinutes || 0;
        
        let hourlyData = todayStats.hourly || {};
        for(let h = 0; h <= 23; h++) {
            chartLabels.push(h.toString().padStart(2, '0') + ":00");
            chartData.push(hourlyData[h] || 0);
        }
    } else if (filter !== "lifetime") {
        let daysToLookBack = (filter === "7days") ? 7 : 30;
        for (let i = daysToLookBack - 1; i >= 0; i--) {
            let d = new Date(today);
            d.setDate(d.getDate() - i);
            let dateStr = d.toISOString().split('T')[0];
            
            let pomos = 0;
            let mins = 0;
            if (appData.statsHistory[dateStr]) {
                pomos = appData.statsHistory[dateStr].pomodoros || 0;
                mins = appData.statsHistory[dateStr].workMinutes || 0;
            }
            
            totalPomos += pomos;
            totalMins += mins;
            chartLabels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
            chartData.push(mins);
        }
    } else {
        let sortedDates = Object.keys(appData.statsHistory).sort();
        sortedDates.forEach(dateStr => {
            let pomos = appData.statsHistory[dateStr].pomodoros || 0;
            let mins = appData.statsHistory[dateStr].workMinutes || 0;
            totalPomos += pomos;
            totalMins += mins;
            let d = new Date(dateStr);
            chartLabels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            chartData.push(mins);
        });
    }

    const statWork = document.getElementById("stat-work");
    const statPomos = document.getElementById("stat-pomos");
    if(statWork && statPomos) {
        let hrs = Math.floor(totalMins / 60);
        let remMins = totalMins % 60;
        statWork.textContent = hrs > 0 ? `${hrs}h ${remMins}m` : `${remMins}m`;
        statPomos.textContent = totalPomos;
    }
    
    drawStatsChart(chartLabels, chartData);
}

function drawStatsChart(labels, data) {
    const canvas = document.getElementById('stats-chart');
    if (!canvas || typeof Chart === 'undefined') return;
    
    const ctx = canvas.getContext('2d');
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#8A2BE2';
    
    if (statsChartInstance) {
        statsChartInstance.destroy();
    }
    
    statsChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Work Minutes',
                data: data,
                backgroundColor: primaryColor,
                borderRadius: 4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.raw + ' mins';
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false, drawBorder: false },
                    ticks: { color: 'rgba(255, 255, 255, 0.6)', font: { size: 10 } }
                },
                y: {
                    display: false,
                    beginAtZero: true
                }
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    injectMockStats();
    updateStatsUI();
});
