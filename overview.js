/**
 * overview.js
 * মেইন ড্যাশবোর্ড ওভারভিউ সেকশনের ডিজাইন, লেআউট এবং চার্ট লজিক
 */

function renderOverviewSection(container) {
  // ১. এইচটিএমএল ডিজাইন ইনজেকশন
  container.innerHTML = `
    <section id="main_dashboard-section" class="space-y-8 animate-fadeIn">
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div class="bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-500/20 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div><span class="text-slate-400 text-xs font-semibold">মোট রেজিস্ট্রেশন</span><h3 id="stat-total" class="text-2xl sm:text-3xl font-extrabold text-white mt-1">0</h3></div>
          <button onclick="viewMembersWithFilter('all')" class="mt-4 text-xs font-bold text-[#00b4d8] hover:text-white flex items-center gap-1.5 cursor-pointer">দেখুন <i class="fa-solid fa-arrow-right text-[10px]"></i></button>
        </div>
        <div class="bg-gradient-to-br from-slate-900 to-amber-950/40 border border-amber-500/20 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div><span class="text-slate-400 text-xs font-semibold">পেন্ডিং</span><h3 id="stat-pending" class="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-1">0</h3></div>
          <button onclick="viewMembersWithFilter('pending')" class="mt-4 text-xs font-bold text-amber-400 hover:text-white flex items-center gap-1.5 cursor-pointer">দেখুন <i class="fa-solid fa-arrow-right text-[10px]"></i></button>
        </div>
        <div class="bg-gradient-to-br from-slate-900 to-emerald-950/40 border border-emerald-500/20 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div><span class="text-slate-400 text-xs font-semibold">Approved</span><h3 id="stat-approved" class="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1">0</h3></div>
          <button onclick="viewMembersWithFilter('active')" class="mt-4 text-xs font-bold text-emerald-400 hover:text-white flex items-center gap-1.5 cursor-pointer">দেখুন <i class="fa-solid fa-arrow-right text-[10px]"></i></button>
        </div>
        <div class="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700/30 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
          <div><span class="text-slate-400 text-xs font-semibold">Inactive</span><h3 id="stat-inactive" class="text-2xl sm:text-3xl font-extrabold text-slate-400 mt-1">0</h3></div>
          <button onclick="viewMembersWithFilter('inactive')" class="mt-4 text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer">দেখুন <i class="fa-solid fa-arrow-right text-[10px]"></i></button>
        </div>
        <div class="bg-gradient-to-br from-slate-900 to-rose-950/40 border border-rose-500/20 rounded-2xl p-4 flex flex-col justify-between col-span-2 md:col-span-1 shadow-lg">
          <div><span class="text-slate-400 text-xs font-semibold">Suspend</span><h3 id="stat-suspend" class="text-2xl sm:text-3xl font-extrabold text-rose-500 mt-1">0</h3></div>
          <button onclick="viewMembersWithFilter('suspend')" class="mt-4 text-xs font-bold text-rose-500 hover:text-white flex items-center gap-1.5 cursor-pointer">দেখুন <i class="fa-solid fa-arrow-right text-[10px]"></i></button>
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <h4 class="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-2"><i class="fa-solid fa-chart-line text-[#ec4899]"></i> Last 7 Days Registration</h4>
          <div class="h-64 w-full"><canvas id="chart-last-7-days"></canvas></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col items-center">
            <h4 class="text-xs font-bold uppercase text-slate-400 tracking-wider self-start mb-4 flex items-center gap-2"><i class="fa-solid fa-pie-chart text-[#00b4d8]"></i> Gender Wise Registration</h4>
            <div class="h-60 w-60 relative"><canvas id="chart-gender-wise"></canvas></div>
          </div>
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <h4 class="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-2"><i class="fa-solid fa-bar-chart text-[#f59e0b]"></i> Year Wise Registration</h4>
            <div class="h-60 w-full"><canvas id="chart-year-wise"></canvas></div>
          </div>
        </div>
      </div>
    </section>
  `;

  // ২. লজিক ও চার্ট জেনারেশন ট্রিগার
  calculateStatsAndRenderCharts(allUsersData);
}

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

function viewMembersWithFilter(status) { 
  switchTab('member_management'); 
  setTimeout(() => {
    const filterStatus = document.getElementById('filterStatus');
    if (filterStatus) {
      filterStatus.value = status;
      filterAndRenderMembersTable();
    }
  }, 50);
}
