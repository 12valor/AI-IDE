// Chart styling configuration
Chart.defaults.color = '#94a3b8';
Chart.defaults.font.family = "'Inter', sans-serif";

const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: {
                color: '#f8fafc',
                font: { size: 12 }
            }
        },
        tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleColor: '#f8fafc',
            bodyColor: '#cbd5e1',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            displayColors: true
        }
    }
};

async function loadDashboardData() {
    try {
        const response = await fetch('dashboard_data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        renderMonthlyRevenueChart(data.monthly_revenue);
        renderTopItemsChart(data.top_10_items);
        renderAssetTypeChart(data.category_revenue);
    } catch (error) {
        console.error("Failed to load dashboard data:", error);
    }
}

function renderMonthlyRevenueChart(data) {
    const ctx = document.getElementById('monthlyRevenueChart').getContext('2d');
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(56, 189, 248, 0.5)'); // top
    gradient.addColorStop(1, 'rgba(56, 189, 248, 0.0)'); // bottom
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Total Revenue ($)',
                data: data.values,
                borderColor: '#38bdf8',
                backgroundColor: gradient,
                borderWidth: 3,
                pointBackgroundColor: '#0f172a',
                pointBorderColor: '#38bdf8',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    border: { display: false }
                },
                x: {
                    grid: { display: false },
                    border: { display: false }
                }
            }
        }
    });
}

function renderTopItemsChart(data) {
    const ctx = document.getElementById('topItemsChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Number of Purchases',
                data: data.values,
                backgroundColor: '#818cf8',
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: {
            ...commonOptions,
            indexAxis: 'y', // Horizontal bar chart
            scales: {
                x: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    border: { display: false }
                },
                y: {
                    grid: { display: false },
                    border: { display: false }
                }
            },
            plugins: {
                ...commonOptions.plugins,
                legend: { display: false } // Hide legend for single dataset horizontally
            }
        }
    });
}

function renderAssetTypeChart(data) {
    const ctx = document.getElementById('assetTypeChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: [
                    '#f472b6',
                    '#c084fc',
                    '#818cf8',
                    '#38bdf8',
                    '#2dd4bf',
                    '#4ade80',
                    '#facc15',
                    '#fb923c',
                    '#f87171'
                ],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            ...commonOptions,
            cutout: '70%',
            plugins: {
                ...commonOptions.plugins,
                legend: {
                    position: 'right',
                    labels: {
                        color: '#f8fafc',
                        padding: 16,
                        font: { size: 11 }
                    }
                }
            }
        }
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', loadDashboardData);
