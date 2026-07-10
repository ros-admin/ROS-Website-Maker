// member-management.js
let currentFilteredList = [];
let activePopupUser = null;

function initMemberManagementHTML() {
  const container = document.getElementById('member_management-section');
  if (!container) return;

  container.innerHTML = `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
      <div>
        <h2 class="text-xl font-bold text-white flex items-center gap-2"><i class="fa-solid fa-users text-[#00b4d8]"></i> Member Management</h2>
      </div>
    </div>

    <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
      <div class="flex flex-col md:flex-row gap-3 items-center">
        <input type="text" id="memberSearchInput" oninput="filterAndRenderMembersTable()" class="w-full flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none" placeholder="নাম, মোবাইল, আইডি দিয়ে সার্চ করুন...">
        <div class="flex gap-2 w-full md:w-auto">
          <button onclick="exportToExcel()" class="px-4 py-3 bg-emerald-600 text-white font-bold text-xs rounded-xl w-full">Excel রিপোর্ট</button>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div>
          <label class="block text-[10px] font-bold text-slate-500 mb-1">স্ট্যাটাস ফিল্টার</label>
          <select id="filterStatus" onchange="filterAndRenderMembersTable()" class="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-white">
            <option value="all">সব সদস্য</option>
            <option value="pending">Pending</option>
            <option value="active">Approved (Active)</option>
            <option value="inactive">Inactive</option>
            <option value="suspend">Suspend</option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 mb-1">জেন্ডার ফিল্টার</label>
          <select id="filterGender" onchange="filterAndRenderMembersTable()" class="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-white">
            <option value="all">সব জেন্ডার</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-500 mb-1">রক্তের গ্রুপ</label>
          <select id="filterBlood" onchange="filterAndRenderMembersTable()" class="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-white">
            <option value="all">সব গ্রুপ</option>
            <option value="A+">A+</option><option value="O+">O+</option><option value="B+">B+</option><option value="AB+">AB+</option>
          </select>
        </div>
      </div>
      <div class="text-right text-xs">সদস্য সংখ্যা: <span id="filtered-count" class="text-[#00b4d8] font-bold">0</span> জন</div>
    </div>

    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl mt-4">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
              <th class="py-4 px-4 text-center">SL</th>
              <th class="py-4 px-4">Member ID</th>
              <th class="py-4 px-4">Name</th>
              <th class="py-4 px-4">Mobile</th>
              <th class="py-4 px-4">Email</th>
              <th class="py-4 px-4 text-center">Blood</th>
              <th class="py-4 px-4">Status</th>
              <th class="py-4 px-4 text-center">Action</th>
              <th class="py-4 px-4 text-center">View</th>
            </tr>
          </thead>
          <tbody id="memberTableBody" class="divide-y divide-slate-800/60 text-slate-300"></tbody>
        </table>
      </div>
      <div id="noMemberFallback" class="hidden py-12 text-center text-slate-500">ডাটা পাওয়া যায়নি!</div>
    </div>

    <div id="detailsModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 hidden items-center justify-center p-4">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
        <div class="bg-slate-950 px-5 py-4 border-b border-slate-800 flex justify-between items-center">
          <h3 class="font-bold text-sm text-white">সদস্যের বিস্তারিত তথ্য</h3>
          <button onclick="closeDetailsModal()" class="text-slate-400 hover:text-white"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div id="modalContentArea" class="p-5"></div>
      </div>
    </div>
  `;
}

function initMemberManagementLogic(users) {
  filterAndRenderMembersTable();
}

function filterAndRenderMembersTable() {
  const searchQuery = document.getElementById('memberSearchInput')?.value.toLowerCase().trim() || '';
  const statusFilter = document.getElementById('filterStatus')?.value.toLowerCase() || 'all';
  const bloodFilter = document.getElementById('filterBlood')?.value || 'all';
  const genderFilter = document.getElementById('filterGender')?.value || 'all';

  const tbody = document.getElementById('memberTableBody');
  const fallback = document.getElementById('noMemberFallback');
  if (!tbody) return;

  tbody.innerHTML = '';

  currentFilteredList = allUsersData.filter(user => {
    const name = (user.englishName || '').toLowerCase();
    const id = (user.memberId || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    const mobile = (user.mobile || '').toLowerCase();
    
    const searchMatch = !searchQuery || name.includes(searchQuery) || id.includes(searchQuery) || email.includes(searchQuery) || mobile.includes(searchQuery);
    
    // অ্যাপস স্ক্রিপ্টের ডাটা কন্ডিশন ম্যাচিং (active অথবা approved)
    const currentStatus = (user.status || 'pending').toLowerCase().trim();
    let statusMatch = (statusFilter === 'all');
    if (!statusMatch) {
      if (statusFilter === 'active') {
        statusMatch = (currentStatus === 'active' || currentStatus === 'approved');
      } else {
        statusMatch = (currentStatus === statusFilter);
      }
    }

    const bloodMatch = (bloodFilter === 'all') || (user.bloodGroup === bloodFilter);
    const genderMatch = (genderFilter === 'all') || (user.gender === genderFilter);

    return searchMatch && statusMatch && bloodMatch && genderMatch;
  });

  document.getElementById('filtered-count').innerText = currentFilteredList.length;

  if (currentFilteredList.length === 0) {
    fallback.classList.remove('hidden');
    return;
  }
  fallback.classList.add('hidden');

  currentFilteredList.forEach((user, index) => {
    const row = document.createElement('tr');
    row.className = "hover:bg-slate-800/30 transition-colors border-b border-slate-800/60 font-medium";

    let statusBadge = '';
    const currentStatus = (user.status || 'pending').toLowerCase();
    if (currentStatus === 'pending') {
      statusBadge = `<span class="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400">Pending</span>`;
    } else if (currentStatus === 'active' || currentStatus === 'approved') {
      statusBadge = `<span class="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400">Approved</span>`;
    } else if (currentStatus === 'inactive') {
      statusBadge = `<span class="px-2 py-0.5 rounded text-[10px] bg-slate-700/30 text-slate-400">Inactive</span>`;
    } else if (currentStatus === 'suspend') {
      statusBadge = `<span class="px-2 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-400">Suspended</span>`;
    }

    row.innerHTML = `
      <td class="py-3 px-4 text-center font-bold text-slate-400">${index + 1}</td>
      <td class="py-3 px-4 font-mono font-bold text-[#00b4d8]">${user.memberId || 'N/A'}</td>
      <td class="py-3 px-4 font-semibold text-white">${user.englishName || 'Unknown'}</td>
      <td class="py-3 px-4 font-mono">${user.mobile || 'N/A'}</td>
      <td class="py-3 px-4 text-slate-400 font-mono">${user.email || 'N/A'}</td>
      <td class="py-3 px-4 text-center font-bold text-rose-400">${user.bloodGroup || 'N/A'}</td>
      <td class="py-3 px-4">${statusBadge}</td>
      <td class="py-3 px-4 text-center">
        <select onchange="updateMemberStatus('${user.memberId}', this.value)" class="bg-slate-950 border border-slate-800 text-[11px] text-slate-300 rounded-lg px-2 py-1 cursor-pointer">
          <option value="" disabled selected>পরিবর্তন</option>
          <option value="active">Approve</option>
          <option value="inactive">Inactive</option>
          <option value="suspend">Suspend</option>
        </select>
      </td>
      <td class="py-3 px-4 text-center">
        <button onclick="openDetailsModal('${user.memberId}')" class="w-7 h-7 bg-slate-800 hover:bg-[#00b4d8]/20 text-slate-400 rounded-lg flex items-center justify-center mx-auto"><i class="fa-solid fa-eye text-xs"></i></button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

async function updateMemberStatus(memberId, newStatus) {
  if (!confirm(`সদস্য আইডি ${memberId} এর স্ট্যাটাস আপডেট করতে চান?`)) { filterAndRenderMembersTable(); return; }
  document.getElementById('globalLoader').style.display = 'flex';
  try {
    const response = await fetch(WEB_APP_URL, {
      method: 'POST',
      body: JSON.stringify({ action: "updateStatus", memberId: memberId, status: newStatus })
    });
    const result = await response.json();
    document.getElementById('globalLoader').style.display = 'none';

    if (result.success) {
      alert("সফলভাবে আপডেট করা হয়েছে!");
      const idx = allUsersData.findIndex(u => u.memberId === memberId);
      if (idx > -1) allUsersData[idx].status = newStatus;
      fetchDashboardData(); // চার্ট সহ রি-লোডার
    } else { alert(result.error); }
  } catch (error) { document.getElementById('globalLoader').style.display = 'none'; }
}

function openDetailsModal(memberId) {
  activePopupUser = allUsersData.find(u => u.memberId === memberId);
  if (!activePopupUser) return;
  
  document.getElementById('modalContentArea').innerHTML = `
    <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
      <div><span class="text-slate-500">ID:</span> <span class="text-[#00b4d8] font-bold">${activePopupUser.memberId}</span></div>
      <div><span class="text-slate-500">Name:</span> <span class="text-white">${activePopupUser.englishName}</span></div>
      <div><span class="text-slate-500">Mobile:</span> <span>${activePopupUser.mobile || 'N/A'}</span></div>
      <div><span class="text-slate-500">Email:</span> <span>${activePopupUser.email || 'N/A'}</span></div>
      <div><span class="text-slate-500">Class:</span> <span>${activePopupUser.class || 'N/A'}</span></div>
      <div><span class="text-slate-500">Blood:</span> <span class="text-rose-400 font-bold">${activePopupUser.bloodGroup || 'N/A'}</span></div>
    </div>
    <div class="mt-4 text-right"><button onclick="closeDetailsModal()" class="px-4 py-2 bg-slate-800 text-xs rounded-lg text-white">বন্ধ করুন</button></div>
  `;
  document.getElementById('detailsModal').style.display = 'flex';
}

function closeDetailsModal() { document.getElementById('detailsModal').style.display = 'none'; }

function exportToExcel() {
  if (currentFilteredList.length === 0) return;
  const sheet = XLSX.utils.json_to_sheet(currentFilteredList);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Members");
  XLSX.writeFile(book, `ROS_Report.xlsx`);
}
