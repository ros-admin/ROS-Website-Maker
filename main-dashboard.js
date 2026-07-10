// main-dashboard.js
let lineChartObj = null; let pieChartObj = null; let barChartObj = null;

function initMainDashboard(users) {
  renderDashboardLayout();
  calculateStatsAndRenderCharts(users);
}

function renderDashboardLayout() {
  document.getElementById('stats-container-placeholder').innerHTML = `
    <div class="bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-500/20 rounded-2xl p-4 flex flex-col justify-between">
      <div><span class="text-slate-400 text-xs font-semibold">মোট রেজিস্ট্রেশন</span><h3 id="stat-total" class="text-2xl sm:text-3xl font-extrabold text-white mt-1">0</h3></div>
      <button onclick="viewMembersWithFilter('all')" class="mt-4 text-xs font-bold text-[#00b4d8] hover:text-white flex items-center gap-1.5 cursor-pointer">দেখুন <i class="fa-solid fa-arrow-right text-[10px]"></i></button>
    </div>
    <div class="bg-gradient-to-br from-slate-900 to-amber-950/40 border border-amber-500/20 rounded-2xl p-4 flex flex-col justify-between">
      <div><span class="text-slate-400 text-xs font-semibold">পেন্ডিং</span><h3 id="stat-pending" class="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-1">0</h3></div>
      <button onclick="viewMembersWithFilter('pending')" class="mt-4 text-xs font-bold text-amber-400 hover:text-white flex items-center gap-1.5 cursor-pointer">দেখুন <i class="fa-solid fa-arrow-right text-[10px]"></i></button>
    </div>
    <div class="bg-gradient-to-br from-slate-900 to-emerald-950/40 border border-emerald-500/20 rounded-2xl p-4 flex flex-col justify-between">
      <div><span class="text-slate-400 text-xs font-semibold">Approved (Active)</span><h3 id="stat-approved" class="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1">0</h3></div>
      <button onclick="viewMembersWithFilter('active')" class="mt-4 text-xs font-bold text-emerald-400 hover:text-white flex items-center gap-1.5 cursor-pointer">দেখুন <i class="fa-solid fa-arrow-right text-[10px]"></i></button>
    </div>
    <div class="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700/30 rounded-2xl p-4 flex flex-col justify-between">
      <div><span class="text-slate-400 text-xs font-semibold">Inactive</span><h3 id="stat-inactive" class="text-2xl sm:text-3xl font-extrabold text-slate-400 mt-1">0</h3></div>
      <button onclick="viewMembersWithFilter('inactive')" class="mt-4 text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer">দেখুন <i class="fa-solid fa-arrow-right text-[10px]"></i></button>
    </div>
    <div class="bg-gradient-to-br from-slate-900 to-rose-950/40 border border-rose-500/20 rounded-2xl p-4 flex flex-col justify-between">
      <div><span class="text-slate-400 text-xs font-semibold">Suspend</span><h3 id="stat-suspend" class="text-2xl sm:text-3xl font-extrabold text-rose-500 mt-1">0</h3></div>
      <button onclick="viewMembersWithFilter('suspend')" class="mt-4 text-xs font-bold text-rose-500 hover:text-white flex items-center gap-1.5 cursor-pointer">দেখুন <i class="fa-solid fa-arrow-right text-[10px]"></i></button>
    </div>
  `;

  document.getElementById('charts-container-placeholder').innerHTML = `
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
      <h4 class="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4">Last 7 Days Registration</h4>
      <div class="h-64 w-full"><canvas id="chart-last-7-days"></canvas></div>
    </div>
  `;
}

function calculateStatsAndRenderCharts(users) {
  let total = users.length;
  let pending = 0, approved = 0, inactive = 0, suspend = 0;
  const dateCounts = {};

  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dateCounts[dateStr] = 0; last7Days.push(dateStr);
  }

  users.forEach(user => {
    const status = (user.status || '').toLowerCase().trim();
    if (status === 'pending') pending++;
    else if (status === 'active' || status === 'approved') approved++;
    else if (status === 'inactive') inactive++;
    else if (status === 'suspend') suspend++;

    if (user.registrationDate) {
      const regDate = user.registrationDate.split(' ')[0]; 
      if (dateCounts[regDate] !== undefined) dateCounts[regDate]++;
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
      datasets: [{ label: 'রেজিস্ট্রেশন', data: last7Days.map(d => dateCounts[d]), borderColor: '#ec4899', backgroundColor: 'rgba(236, 72, 153, 0.15)', fill: true, tension: 0.4 }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

function viewMembersWithFilter(status) {
  switchTab('member_management');
  const selectFilter = document.getElementById('filterStatus');
  if (selectFilter) { selectFilter.value = status; filterAndRenderMembersTable(); }
}
