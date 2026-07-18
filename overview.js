/**
 * overview.js
 * ড্যাশবোর্ডের প্রথম সেকশন (Main Dashboard Overview & Charts) এর সম্পূর্ণ লজিক
 */

// চার্ট প্রসেস এবং স্ট্যাটিস্টিকস ভিউ
function calculateStatsAndRenderCharts(users) {
  let total = users.length;
  let pending = 0, approved = 0, inactive = 0, suspend = 0;
  const genderCounts = { "Male": 0, "Female": 0, "Other": 0 };
  const dateCounts = {};
  const yearCounts = {};

  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dateCounts[dateStr] = 0; last7Days.push(dateStr);
  }

  const currentYear = new Date().getFullYear();
  const last5Years = [];
  for (let i = 4; i >= 0; i--) {
    const y = (currentYear - i).toString();
    yearCounts[y] = 0; last5Years.push(y);
  }

  users.forEach(user => {
    const status = String(user.status || '').toLowerCase().trim();
    if (status === 'pending') pending++;
    else if (status === 'approved' || status === 'active') approved++;
    else if (status === 'inactive') inactive++;
    else if (status === 'suspend') suspend++;

    const gender = user.gender || 'Male';
    if (genderCounts[gender] !== undefined) genderCounts[gender]++;

    if (user.registrationDate) {
      const regDate = String(user.registrationDate).split(' ')[0];
      if (dateCounts[regDate] !== undefined) dateCounts[regDate]++;
      const regYear = regDate.split('-')[0];
      if (yearCounts[regYear] !== undefined) yearCounts[regYear]++;
    }
  });

  document.getElementById('stat-total').innerText = total;
  document.getElementById('stat-pending').innerText = pending;
  document.getElementById('stat-approved').innerText = approved;
  document.getElementById('stat-inactive').innerText = inactive;
  document.getElementById('stat-suspend').innerText = suspend;

  const lineCtx = document.getElementById('chart-last-7-days').getContext('2d');
  if (lineChartObj) lineChartObj.destroy();
  lineChartObj = new Chart(lineCtx, {
    type: 'line',
    data: {
      labels: last7Days.map(d => d.split('-').reverse().join('/')),
      datasets: [{ label: 'রেজিস্ট্রেশন', data: last7Days.map(d => dateCounts[d]), borderColor: '#ec4899', backgroundColor: 'rgba(236, 72, 153, 0.1)', fill: true, tension: 0.4, borderWidth: 3 }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#94a3b8', stepSize: 1 } }, x: { grid: { display: false }, ticks: { color: '#94a3b8' } } } }
  });

  const pieCtx = document.getElementById('chart-gender-wise').getContext('2d');
  if (pieChartObj) pieChartObj.destroy();
  pieChartObj = new Chart(pieCtx, {
    type: 'pie',
    data: { labels: ['Male', 'Female', 'Other'], datasets: [{ data: [genderCounts['Male'], genderCounts['Female'], genderCounts['Other']], backgroundColor: ['#00b4d8', '#ec4899', '#f59e0b'], borderWidth: 0 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } }
  });

  const barCtx = document.getElementById('chart-year-wise').getContext('2d');
  if (barChartObj) barChartObj.destroy();
  barChartObj = new Chart(barCtx, {
    type: 'bar',
    data: { labels: last5Years, datasets: [{ data: last5Years.map(y => yearCounts[y]), backgroundColor: ['#3b82f6', '#10b981', '#00b4d8', '#f59e0b', '#8b5cf6'], borderRadius: 5, barThickness: 20 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#94a3b8', stepSize: 1 } }, x: { grid: { display: false }, ticks: { color: '#94a3b8' } } } }
  });
}

// স্ট্যাটাস কার্ড বাটন থেকে ফিল্টারসহ মেম্বার ম্যানেজমেন্টে জাম্প করার জন্য
function viewMembersWithFilter(status) { 
  switchTab('member_management'); 
  const statusFilterSelect = document.getElementById('filterStatus');
  if (statusFilterSelect) {
    statusFilterSelect.value = status;
  }
  if (typeof filterAndRenderMembersTable === 'function') {
    filterAndRenderMembersTable();
  }
}
