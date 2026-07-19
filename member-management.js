/**
 * member-management.js
 * মেম্বার ম্যানেজমেন্ট সেকশনের সম্পূর্ণ ডিজাইন, টেবিল রেন্ডারিং, ফিল্টার এবং এক্সপোর্ট লজিক
 */

function renderMemberManagementSection(container) {
  container.innerHTML = `
    <section id="member_management-section" class="space-y-6 animate-fadeIn">
      <div>
        <h2 class="text-xl font-bold text-white flex items-center gap-2">
          <i class="fa-solid fa-users text-[#00b4d8]"></i> Member Management Panel
        </h2>
      </div>

      <!-- ফিল্টারস জোন -->
      <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div class="col-span-1 sm:col-span-2 relative">
            <label class="block text-[11px] font-bold text-slate-400 mb-1">সার্চ করুন (নাম/রেজি/মোবাইল/ইমেইল)</label>
            <input type="text" id="memberSearchInput" oninput="filterAndRenderMembersTable()" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-[#00b4d8]" placeholder="টাইপ করুন...">
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-400 mb-1">স্ট্যাটাস অনুযায়ী</label>
            <select id="filterStatus" onchange="filterAndRenderMembersTable()" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspend">Suspend</option>
            </select>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-400 mb-1">ক্রমানুসারে সাজান</label>
            <select id="filterSort" onchange="filterAndRenderMembersTable()" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none">
              <option value="name_asc">নামের শুরু থেকে শেষ</option>
              <option value="name_desc">নামের শেষ থেকে শুরু</option>
              <option value="reg_asc">রেজিস্ট্রেশন নম্বর (শুরু থেকে শেষ)</option>
              <option value="reg_desc">রেজিস্ট্রেশন নম্বর (শেষ থেকে শুরু)</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block text-[11px] font-bold text-slate-400 mb-1">নিবন্ধনের তারিখ</label>
            <select id="filterDate" onchange="filterAndRenderMembersTable()" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none">
              <option value="all">All Dates</option>
            </select>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-400 mb-1">রক্তের গ্রুপ</label>
            <select id="filterBlood" onchange="filterAndRenderMembersTable()" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none">
              <option value="all">All Blood Groups</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-400 mb-1">জেন্ডার</label>
            <select id="filterGender" onchange="filterAndRenderMembersTable()" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none">
              <option value="all">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/60">
          <p class="text-xs text-slate-400">ফিল্টারড ডাটা সংখ্যা: <span id="filtered-count" class="font-bold text-[#00b4d8]">0</span> জন</p>
          <div class="flex items-center gap-2">
            <button onclick="exportToExcel()" class="px-3 py-1.5 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/20 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer">
              <i class="fa-solid fa-file-excel"></i> Excel Download
            </button>
            <button onclick="exportToPDF()" class="px-3 py-1.5 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer">
              <i class="fa-solid fa-file-pdf"></i> PDF Download
            </button>
          </div>
        </div>

        <div class="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-950 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-800">
                <th class="py-3 px-3 text-center w-12">SL</th>
                <th class="py-3 px-3">রেজিস্ট্রেশন নাম্বার</th>
                <th class="py-3 px-3">ইংরেজি নাম</th>
                <th class="py-3 px-3">মোবাইল</th>
                <th class="py-3 px-3">ই-মেইল</th>
                <th class="py-3 px-3 text-center">রক্তের গ্রুপ</th>
                <th class="py-3 px-3 text-center">জেন্ডার</th>
                <th class="py-3 px-3">নিবন্ধনের তারিখ</th>
                <th class="py-3 px-3 text-center">স্ট্যাটাস</th>
                <th class="py-3 px-3 text-center">স্ট্যাটাস পরিবর্তন</th>
                <th class="py-3 px-3 text-center">বিস্তারিত</th>
              </tr>
            </thead>
            <tbody id="memberTableBody" class="divide-y divide-slate-900 text-xs text-slate-300"></tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- মডাল পপআপ এবং থিম কাস্টমাইজেশন -->
    <div id="memberPopupModal" class="hidden fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div class="bg-slate-900 border-2 border-[#00b4d8]/40 rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        <div class="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
          <div class="text-left">
            <h2 class="text-md font-bold text-[#ffd700] tracking-wide"><i class="fa-solid fa-building-columns mr-1.5"></i>রাজশাহী অলিম্পিয়াড সোসাইটি</h2>
            <p class="text-[11px] text-[#00b4d8] font-bold tracking-wider uppercase">Member Details Info</p>
          </div>
          <button onclick="closeMemberModal()" class="w-8 h-8 rounded-lg bg-slate-900 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 flex items-center justify-center cursor-pointer"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <div id="modalPrintArea" class="p-6 space-y-6 flex-1 text-center">
          <div class="flex flex-col sm:flex-row items-center gap-6 bg-slate-950/40 p-4 border border-slate-800 rounded-xl text-left">
            <div class="w-[100px] h-[120px] shrink-0 border-2 border-[#00b4d8] bg-slate-900 p-0.5 overflow-hidden rounded-md">
              <img id="modal-photo" src="" alt="Member" class="w-full h-full object-cover">
            </div>
            <div class="space-y-2 w-full">
              <div class="bg-[#00b4d8]/10 border border-[#00b4d8]/30 px-3 py-1 rounded-md text-xs font-mono text-[#ffd700] font-bold inline-block" id="modal-memberId-title"></div>
              <h2 id="modal-englishName" class="text-lg font-bold text-white tracking-wide uppercase"></h2>
              <div class="grid grid-cols-2 gap-4 text-xs pt-1 border-t border-slate-800/60">
                <div><span class="text-slate-500 font-semibold block mb-0.5"><i class="fa-solid fa-calendar-check text-[#00b4d8] mr-1"></i>নিবন্ধনের তারিখ</span><span id="modal-regDateOnly" class="text-slate-200 font-mono"></span></div>
                <div><span class="text-slate-500 font-semibold block mb-0.5"><i class="fa-solid fa-circle-info text-[#ffd700] mr-1"></i>স্ট্যাটাস</span><span id="modal-status-badge"></span></div>
              </div>
            </div>
          </div>

          <div class="space-y-4 text-left text-xs">
            <!-- ব্যক্তিগত তথ্য -->
            <div class="bg-slate-950/30 rounded-xl border border-slate-800/80 overflow-hidden">
              <div class="bg-gradient-to-r from-slate-950 to-slate-900 px-4 py-2 font-bold text-[#00b4d8] border-b border-slate-800 flex items-center gap-2">
                <i class="fa-solid fa-user-tie"></i> ব্যক্তিগত তথ্য (Personal Information)
              </div>
              <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="md:col-span-2 bg-slate-900/40 p-2.5 rounded border border-slate-800/40"><span class="text-slate-500 font-semibold block mb-0.5"><i class="fa-solid fa-language mr-1"></i>Name (Bangla)</span><span id="modal-banglaName" class="text-slate-200 font-medium"></span></div>
                <div class="bg-slate-900/40 p-2.5 rounded border border-slate-800/40"><span class="text-slate-500 font-semibold block mb-0.5"><i class="fa-solid fa-person mr-1"></i>Father's Name</span><span id="modal-father" class="text-slate-200 font-medium"></span></div>
                <div class="bg-slate-900/40 p-2.5 rounded border border-slate-800/40"><span class="text-slate-500 font-semibold block mb-0.5"><i class="fa-solid fa-person-dress mr-1"></i>Mother's Name</span><span id="modal-mother" class="text-slate-200 font-medium"></span></div>
                <div class="bg-slate-900/40 p-2.5 rounded border border-slate-800/40"><span class="text-slate-500 font-semibold block mb-0.5"><i class="fa-solid fa-cake-candles mr-1"></i>জন্ম তারিখ (DOB)</span><span id="modal-dob" class="text-slate-200 font-mono"></span></div>
                <div class="bg-slate-900/40 p-2.5 rounded border border-slate-800/40"><span class="text-slate-500 font-semibold block mb-0.5"><i class="fa-solid fa-droplet mr-1 text-rose-500"></i>রক্তের গ্রুপ</span><span id="modal-blood" class="text-[#00b4d8] font-bold"></span></div>
                <div class="bg-slate-900/40 p-2.5 rounded border border-slate-800/40"><span class="text-slate-500 font-semibold block mb-0.5"><i class="fa-solid fa-venus-mars mr-1"></i>জেন্ডার</span><span id="modal-gender" class="text-slate-200"></span></div>
                <div class="bg-slate-900/40 p-2.5 rounded border border-slate-800/40"><span class="text-slate-500 font-semibold block mb-0.5"><i class="fa-solid fa-id-card mr-1"></i>NID / Birth Certificate</span><span id="modal-nid" class="text-slate-200 font-mono"></span></div>
              </div>
            </div>

            <!-- যোগাযোগ -->
            <div class="bg-slate-950/30 rounded-xl border border-slate-800/80 overflow-hidden">
              <div class="bg-gradient-to-r from-slate-950 to-slate-900 px-4 py-2 font-bold text-[#ec4899] border-b border-slate-800 flex items-center gap-2">
                <i class="fa-solid fa-address-book"></i> যোগাযোগ মাধ্যম (Contact Details)
              </div>
              <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="bg-slate-900/40 p-2.5 rounded border border-slate-800/40"><span class="text-slate-500 font-semibold block mb-0.5"><i class="fa-solid fa-phone mr-1"></i>Mobile Number</span><span id="modal-mobile" class="text-slate-200 font-mono"></span></div>
                <div class="bg-slate-900/40 p-2.5 rounded border border-slate-800/40"><span class="text-slate-500 font-semibold block mb-0.5"><i class="fa-solid fa-envelope mr-1"></i>Email Address</span><span id="modal-email" class="text-slate-200 font-mono"></span></div>
                <div class="bg-slate-900/40 p-2.5 rounded border border-slate-800/40"><span class="text-slate-500 font-semibold block mb-0.5"><i class="fa-brands fa-whatsapp mr-1 text-emerald-500"></i>Whatsapp</span><span id="modal-whatsapp" class="text-slate-200 font-mono"></span></div>
                <div class="bg-slate-900/40 p-2.5 rounded border border-slate-800/40"><span class="text-slate-500 font-semibold block mb-0.5"><i class="fa-brands fa-facebook mr-1 text-blue-500"></i>FB Link</span><span id="modal-fb" class="text-[#00b4d8] break-all font-mono"></span></div>
                <div class="md:col-span-2 bg-slate-900/40 p-2.5 rounded border border-slate-800/40"><span class="text-slate-500 font-semibold block mb-0.5"><i class="fa-solid fa-map-location-dot mr-1 text-indigo-400"></i>Present Address</span><span id="modal-present" class="text-slate-200"></span></div>
                <div class="md:col-span-2 bg-slate-900/40 p-2.5 rounded border border-slate-800/40"><span class="text-slate-500 font-semibold block mb-0.5"><i class="fa-solid fa-house-chimney mr-1 text-amber-500"></i>Permanent Address</span><span id="modal-permanent" class="text-slate-200"></span></div>
              </div>
            </div>

            <!-- শিক্ষা ও পেশা -->
            <div class="bg-slate-950/30 rounded-xl border border-slate-800/80 overflow-hidden">
              <div class="bg-gradient-to-r from-slate-950 to-slate-900 px-4 py-2 font-bold text-[#ffd700] border-b border-slate-800 flex items-center gap-2">
                <i class="fa-solid fa-graduation-cap"></i> শিক্ষা ও পেশা (Education & Profession)
              </div>
              <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="bg-slate-900/40 p-2.5 rounded border border-slate-800/40"><span class="text-slate-500 font-semibold block mb-0.5"><i class="fa-solid fa-user-graduate mr-1"></i>Education Level</span><span id="modal-education" class="text-slate-200"></span></div>
                <div class="bg-slate-900/40 p-2.5 rounded border border-slate-800/40"><span class="text-slate-500 font-semibold block mb-0.5"><i class="fa-solid fa-clock-history mr-1"></i>Session</span><span id="modal-academic" class="text-slate-200 font-mono"></span></div>
                <div class="bg-slate-900/40 p-2.5 rounded border border-slate-800/40"><span class="text-slate-500 font-semibold block mb-0.5"><i class="fa-solid fa-briefcase mr-1"></i>Profession</span><span id="modal-profession" class="text-slate-200"></span></div>
                <div class="bg-slate-900/40 p-2.5 rounded border border-slate-800/40"><span class="text-slate-500 font-semibold block mb-0.5"><i class="fa-solid fa-school mr-1"></i>Institution</span><span id="modal-institute" class="text-slate-200"></span></div>
              </div>
            </div>
          </div>

          <div class="flex justify-between items-center border-t border-slate-800 pt-4 mt-5">
            <button onclick="downloadOfficialTemplatePDF()" class="px-4 py-2 bg-gradient-to-r from-rose-600 to-amber-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer">
              <i class="fa-solid fa-file-pdf"></i> অফিশিয়াল পিডিএফ ডাউনলোড
            </button>
            <button onclick="closeMemberModal()" class="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl cursor-pointer">বন্ধ করুন</button>
          </div>
        </div>
      </div>
    </div>
  `;

  populateDateFilter(window.allUsersData);
  filterAndRenderMembersTable();
}

function populateDateFilter(users) {
  const dateSelect = document.getElementById('filterDate');
  if (!dateSelect) return;
  dateSelect.innerHTML = '<option value="all">All Dates</option>';
  const uniqueDates = new Set();
  users.forEach(u => { if(u.registrationDate) uniqueDates.add(u.registrationDate.split(' ')[0]); });
  Array.from(uniqueDates).sort().forEach(d => {
    const opt = document.createElement('option');
    opt.value = d; opt.innerText = d;
    dateSelect.appendChild(opt);
  });
}

function filterAndRenderMembersTable() {
  const searchVal = document.getElementById('memberSearchInput') ? document.getElementById('memberSearchInput').value.toLowerCase().trim() : '';
  const statusFilter = document.getElementById('filterStatus') ? document.getElementById('filterStatus').value : 'all';
  const dateFilter = document.getElementById('filterDate') ? document.getElementById('filterDate').value : 'all';
  const bloodFilter = document.getElementById('filterBlood') ? document.getElementById('filterBlood').value : 'all';
  const genderFilter = document.getElementById('filterGender') ? document.getElementById('filterGender').value : 'all';
  const sortFilter = document.getElementById('filterSort') ? document.getElementById('filterSort').value : 'name_asc';

  window.currentFilteredList = (window.allUsersData || []).filter(user => {
    const matchesSearch = String(user.memberId||'').toLowerCase().includes(searchVal) || String(user.englishName||'').toLowerCase().includes(searchVal) || String(user.mobile||'').toLowerCase().includes(searchVal) || String(user.email||'').toLowerCase().includes(searchVal);
    let matchesStatus = (statusFilter === 'all') || (statusFilter === 'active' ? (user.status === 'active' || user.status === 'approved') : (user.status === statusFilter));
    let matchesDate = (dateFilter === 'all') || (user.registrationDate && user.registrationDate.split(' ')[0] === dateFilter);
    let matchesBlood = (bloodFilter === 'all') || (String(user.bloodGroup || '').trim() === bloodFilter);
    let matchesGender = (genderFilter === 'all') || (String(user.gender || '').trim() === genderFilter);
    return matchesSearch && matchesStatus && matchesDate && matchesBlood && matchesGender;
  });

  window.currentFilteredList.sort((a, b) => {
    let field = (sortFilter.startsWith('name')) ? 'englishName' : 'memberId';
    return (sortFilter.endsWith('asc')) ? String(a[field]||'').localeCompare(String(b[field]||'')) : String(b[field]||'').localeCompare(String(a[field]||''));
  });

  const filteredCountEl = document.getElementById('filtered-count');
  if (filteredCountEl) filteredCountEl.innerText = window.currentFilteredList.length;
  renderTableUI(window.currentFilteredList);
}

function renderTableUI(list) {
  const tbody = document.getElementById('memberTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if(list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" class="py-8 text-center text-slate-500 font-medium">ফিল্টার অনুযায়ী কোনো সদস্যের তথ্য পাওয়া যায়নি।</td></tr>`;
    return;
  }

  list.forEach((user, index) => {
    const status = String(user.status || '').toLowerCase().trim();
    let badgeClass = "bg-slate-800 text-slate-400 border border-slate-700";
    if (status === 'pending') badgeClass = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    else if (status === 'active' || status === 'approved') badgeClass = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    else if (status === 'suspend') badgeClass = "bg-rose-500/10 text-rose-400 border border-rose-500/20";

    const tr = document.createElement('tr');
    tr.className = "hover:bg-slate-900/30 transition-colors border-b border-slate-900";
    tr.innerHTML = `
      <td class="py-3 px-3 text-center font-mono text-slate-500">${index + 1}</td>
      <td class="py-3 px-3 font-mono font-bold text-[#00b4d8]">${user.memberId || 'N/A'}</td>
      <td class="py-3 px-3 font-semibold text-white">${user.englishName || 'N/A'}</td>
      <td class="py-3 px-3 font-mono text-slate-400">${user.mobile || 'N/A'}</td>
      <td class="py-3 px-3 font-mono text-slate-400">${user.email || 'N/A'}</td>
      <td class="py-3 px-3 text-center font-bold font-mono text-[#00b4d8]">${user.bloodGroup || 'N/A'}</td>
      <td class="py-3 px-3 text-center text-slate-300">${user.gender || 'N/A'}</td>
      <td class="py-3 px-3 font-mono text-slate-400">${user.registrationDate ? user.registrationDate.split(' ')[0] : 'N/A'}</td>
      <td class="py-3 px-3 text-center"><span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${badgeClass}">${status}</span></td>
      <td class="py-3 px-3 text-center">
        <select onchange="liveStatusUpdateDirect('${user.memberId}', this.value)" class="bg-slate-950 border border-slate-800 text-slate-300 text-[11px] rounded px-1.5 py-0.5 focus:outline-none focus:border-[#00b4d8]">
          <option value="">পরিবর্তন</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspend">Suspend</option>
        </select>
      </td>
      <td class="py-3 px-3 text-center">
        <button onclick="openMemberModal('${user.memberId}')" class="px-2.5 py-1 bg-slate-800 hover:bg-[#00b4d8] text-slate-300 hover:text-slate-950 rounded-lg text-[11px] font-bold transition-all cursor-pointer"><i class="fa-solid fa-circle-info"></i> বিস্তারিত</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function liveStatusUpdateDirect(memberId, newStatus) {
  if(!newStatus) return;
  if(typeof showLoader === 'function') showLoader(true, "গুগল শীটে স্ট্যাটাস লাইভ আপডেট হচ্ছে...");
  try {
    const response = await fetch(WEB_APP_URL, {
      method: 'POST', mode: 'cors', headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: "updateStatus", memberId: memberId, status: newStatus })
    });
    const res = await response.json();
    if(typeof showLoader === 'function') showLoader(false);
    if(res.success) {
      alert("সদস্যের স্ট্যাটাস লাইভ আপডেট করা হয়েছে!");
      const idx = window.allUsersData.findIndex(u => u.memberId === memberId);
      if(idx !== -1) window.allUsersData[idx].status = newStatus;
      filterAndRenderMembersTable();
    } else { alert(res.error || "ত্রুটি ঘটেছে।"); }
  } catch (err) { 
    if(typeof showLoader === 'function') showLoader(false);
    alert("সার্ভার সংযোগ ত্রুটি।"); 
  }
}

function openMemberModal(memberId) {
  const user = window.allUsersData.find(u => u.memberId === memberId);
  if(!user) return;
  window.activePopupUser = user;

  document.getElementById('modal-memberId-title').innerText = `${user.memberId}`;
  document.getElementById('modal-englishName').innerText = user.englishName || 'N/A';
  document.getElementById('modal-banglaName').innerText = user.banglaName || 'N/A';
  document.getElementById('modal-father').innerText = user.fatherName || 'N/A';
  document.getElementById('modal-mother').innerText = user.motherName || 'N/A';
  document.getElementById('modal-mobile').innerText = user.mobile || 'N/A';
  document.getElementById('modal-email').innerText = user.email || 'N/A';
  document.getElementById('modal-dob').innerText = user.dob || 'N/A';
  document.getElementById('modal-blood').innerText = user.bloodGroup || 'N/A';
  document.getElementById('modal-gender').innerText = user.gender || 'N/A';
  document.getElementById('modal-present').innerText = user.presentAddress || 'N/A';
  document.getElementById('modal-permanent').innerText = user.permanentAddress || 'N/A';
  document.getElementById('modal-education').innerText = user.education || 'N/A';
  document.getElementById('modal-academic').innerText = user.academicYear || 'N/A';
  document.getElementById('modal-profession').innerText = user.profession || 'N/A';
  document.getElementById('modal-institute').innerText = user.institution || 'N/A';
  document.getElementById('modal-whatsapp').innerText = user.whatsappNumber || 'N/A';
  document.getElementById('modal-fb').innerText = user.facebookLink || 'N/A';
  document.getElementById('modal-nid').innerText = user.nidOrBrn || 'N/A';
  
  document.getElementById('modal-photo').src = user.photoUrl ? user.photoUrl + '?t=' + new Date().getTime() : "https://rosociety.vercel.app/ros%20logo.png";
  document.getElementById('modal-regDateOnly').innerText = user.registrationDate ? user.registrationDate.split(' ')[0] : 'N/A';

  const status = String(user.status || '').toLowerCase().trim();
  const badge = document.getElementById('modal-status-badge');
  badge.innerText = status;
  if (status === 'pending') badge.className = "px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-[10px] font-bold uppercase inline-block";
  else if (status === 'active' || status === 'approved') badge.className = "px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-bold uppercase inline-block";
  else badge.className = "px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 rounded text-[10px] font-bold uppercase inline-block";

  document.getElementById('memberPopupModal').classList.remove('hidden');
}

function closeMemberModal() { 
  document.getElementById('memberPopupModal').classList.add('hidden'); 
  window.activePopupUser = null; 
}

function exportToExcel() {
  if(!window.currentFilteredList || window.currentFilteredList.length === 0) { alert("এক্সপোর্ট করার মতো কোনো ডাটা নেই!"); return; }
  const formatData = window.currentFilteredList.map((u, i) => ({
    "SL": i + 1,
    "Registration No": u.memberId || '',
    "Name (English)": u.englishName || '',
    "Mobile Number": u.mobile || '',
    "Email Address": u.email || '',
    "Blood Group": u.bloodGroup || '',
    "Status": u.status || ''
  }));
  const ws = XLSX.utils.json_to_sheet(formatData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Filtered_Members");
  XLSX.writeFile(wb, `ROS_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
}

function exportToPDF() {
  if(!window.currentFilteredList || window.currentFilteredList.length === 0) { alert("রিপোর্ট জেনারেট করার মতো কোনো ডাটা নেই!"); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('l', 'mm', 'a4');
  doc.setFont("Helvetica", "bold"); doc.setFontSize(14); doc.text("RAJSHAHI OLYMPIAD SOCIETY", 148, 15, { align: "center" });
  
  const bodyRows = window.currentFilteredList.map((u, i) => ["", i + 1, u.memberId || '', u.englishName || '', u.mobile || '', u.email || '', u.bloodGroup || '', (u.status || '').toUpperCase(), ""]);
  doc.autoTable({
    startY: 25,
    head: [['[ ]', 'SL', 'Reg ID', 'Name', 'Mobile', 'Email', 'Blood', 'Status', 'Comment']],
    body: bodyRows,
    theme: 'grid'
  });
  doc.save(`ROS_Table_List.pdf`);
}

// ক্লাউডিনারি ইমেজের ওপার্সিটি ট্রিক ও CORS ব্যাকআপ সহ সম্পূর্ণ ফিক্সড ফাংশন
async function downloadOfficialTemplatePDF() {
  if(!window.activePopupUser) return;
  const u = window.activePopupUser;
  
  if(typeof showLoader === 'function') showLoader(true, "অফিশিয়াল মেম্বারশিপ পিডিএফ জেনারেট হচ্ছে...");

  const regParts = String(u.memberId || 'ROS-0000-0000').split('-');[span_1](start_span)[span_1](end_span)
  const regPart1 = regParts[0] || 'ROS';[span_2](start_span)[span_2](end_span)
  const regPart2 = regParts[1] || '0000';[span_3](start_span)[span_3](end_span)
  const regPart3 = regParts[2] || '0000';[span_4](start_span)[span_4](end_span)
  
  let rawDate = "00000000";[span_5](start_span)[span_5](end_span)
  if(u.registrationDate) {[span_6](start_span)[span_6](end_span)
    const dOnly = u.registrationDate.split(' ')[0].replace(/[^0-9]/g, '');[span_7](start_span)[span_7](end_span)
    if(dOnly.length === 8) rawDate = u.registrationDate.includes('-') && u.registrationDate.indexOf('-') === 4 ? dOnly.substring(6,8) + dOnly.substring(4,6) + dOnly.substring(0,4) : dOnly;[span_8](start_span)[span_8](end_span)
  }
  const r0=rawDate[0]||'0', r1=rawDate[1]||'0', r2=rawDate[2]||'0', r3=rawDate[3]||'0', r4=rawDate[4]||'0', r5=rawDate[5]||'0', r6=rawDate[6]||'0', r7=rawDate[7]||'0';[span_9](start_span)[span_9](end_span)

  let dobDigits = "00000000";[span_10](start_span)[span_10](end_span)
  if(u.dob) {[span_11](start_span)[span_11](end_span)
    const d = u.dob.replace(/[^0-9]/g, '');[span_12](start_span)[span_12](end_span)
    if(d.length === 8) dobDigits = u.dob.includes('-') && u.dob.indexOf('-') === 4 ? d.substring(6,8) + d.substring(4,6) + d.substring(0,4) : d;[span_13](start_span)[span_13](end_span)
  }
  const d0=dobDigits[0]||'0', d1=dobDigits[1]||'0', d2=dobDigits[2]||'0', d3=dobDigits[3]||'0', d4=dobDigits[4]||'0', d5=dobDigits[5]||'0', d6=dobDigits[6]||'0', d7=dobDigits[7]||'0';[span_14](start_span)[span_14](end_span)

  let mStr = String(u.mobile || '01000000000').replace(/[^0-9]/g, '');[span_15](start_span)[span_15](end_span)
  if(mStr.length < 11) mStr = mStr.padStart(11, '0');[span_16](start_span)[span_16](end_span)
  const m0=mStr[0], m1=mStr[1], m2=mStr[2], m3=mStr[3], m4=mStr[4], m5=mStr[5], m6=mStr[6], m7=mStr[7], m8=mStr[8], m9=mStr[9], m10=mStr[10];[span_17](start_span)[span_17](end_span)

  const g = String(u.gender || 'Male').toLowerCase();[span_18](start_span)[span_18](end_span)
  const isMale = (g === 'male' || g === 'পুরুষ') ? '✓' : '';[span_19](start_span)[span_19](end_span)
  const isFemale = (g === 'female' || g === 'মহিলা') ? '✓' : '';[span_20](start_span)[span_20](end_span)

// ডাইনামিক অফ-স্ক্রিন কন্টেইনার তৈরি (html2canvas এর ব্ল্যাঙ্ক পেজ বাগ ফিক্সড)
  const printWrapper = document.createElement('div');[span_21](start_span)[span_21](end_span)
  printWrapper.style.width = "750px";[span_22](start_span)[span_22](end_span)
  printWrapper.style.position = "fixed"; 
  printWrapper.style.left = "0"; 
  printWrapper.style.top = "0";[span_23](start_span)[span_23](end_span)
  printWrapper.style.zIndex = "-9999"; 
  printWrapper.style.opacity = "0.01";  
  printWrapper.style.background = "#ffffff";[span_24](start_span)[span_24](end_span)
  printWrapper.style.padding = "15px";[span_25](start_span)[span_25](end_span)

  const logoUrl = "https://rosociety.vercel.app/Assets/Logo/ROS%20Logo%20Title.png";
  const userPhotoUrl = u.photoUrl || "https://rosociety.vercel.app/ros%20logo.png";

  printWrapper.innerHTML = `
    <div style="border: 1px solid #0077b6; padding: 2px; background:#fff;">
      <div style="border: 1px solid #0077b6; padding: 15px; position: relative; background: #ffffff;">
        <div style="position: absolute; top: 40%; left: 5%; transform: rotate(-25deg); font-size: 26pt; font-weight: bold; text-align: center; width: 90%; opacity: 0.03; color: #000; z-index: 1; pointer-events: none;">RAJSHAHI OLYMPIAD SOCIETY</div>[span_26](start_span)[span_26](end_span)
        <div style="text-align: center; border-bottom: 2px solid #0077b6; padding-bottom: 6px; margin-bottom: 8px;">
          <img src="${logoUrl}" crossOrigin="anonymous" style="width: 250px; height: auto; display: block; margin: 0 auto 4px auto;">
          <div style="display: inline-block; background: #0077b6; color: #fff; padding: 3px 12px; font-size: 8.5pt; font-weight: bold; border-radius: 3px; text-transform: uppercase;">Registration Form</div>[span_27](start_span)[span_27](end_span)
        </div>
        <table style="width:100%; margin-bottom: 5px;">
          <tr>
            <td>
              <div style="margin-bottom: 6px; font-size: 9pt; font-weight: bold;">
                <span style="display: inline-block; width: 120px;">Registration No:</span>[span_28](start_span)[span_28](end_span)
                <div style="border: 1.5px solid #0077b6; border-radius: 3px; padding: 2px 6px; display: inline-block; background: #eef7fc; color: #0077b6;">${regPart1}</div> - 
                <div style="border: 1.5px solid #0077b6; border-radius: 3px; padding: 2px 6px; display: inline-block; background: #eef7fc; color: #0077b6; width: 55px; text-align:center;">${regPart2}</div> - 
                <div style="border: 1.5px solid #0077b6; border-radius: 3px; padding: 2px 6px; display: inline-block; background: #eef7fc; color: #0077b6; width: 55px; text-align:center;">${regPart3}</div>[span_29](start_span)[span_29](end_span)
              </div>
              <div style="margin-bottom: 6px; font-size: 9pt; font-weight: bold;">
                <span style="display: inline-block; width: 120px;">Registration Date:</span>[span_30](start_span)[span_30](end_span)
                <div style="display: inline-block; vertical-align: middle;">
                  ${[r0,r1].map(x=>`<div style="display:inline-block;width:14px;height:18px;border:1px solid #999;text-align:center;font-size:8.5pt;background:#f4f5f6;margin-right:-1px;">${x}</div>`).join('')}.[span_31](start_span)[span_31](end_span)
                  ${[r2,r3].map(x=>`<div style="display:inline-block;width:14px;height:18px;border:1px solid #999;text-align:center;font-size:8.5pt;background:#f4f5f6;margin-right:-1px;">${x}</div>`).join('')}.[span_32](start_span)[span_32](end_span)
                  ${[r4,r5,r6,r7].map(x=>`<div style="display:inline-block;width:14px;height:18px;border:1px solid #999;text-align:center;font-size:8.5pt;background:#f4f5f6;margin-right:-1px;">${x}</div>`).join('')}[span_33](start_span)[span_33](end_span)
                </div>
              </div>
              <div style="font-size: 9pt; font-weight: bold;">
                <span style="display: inline-block; width: 120px;">Status:</span>[span_34](start_span)[span_34](end_span)
                <span style="background: #2a9d8f; color: #fff; padding: 2px 8px; font-size: 8pt; font-weight: bold; border-radius: 4px; text-transform: uppercase;">${u.status || 'ACTIVE'}</span>[span_35](start_span)[span_35](end_span)
              </div>
            </td>
            <td style="width: 80px; text-align: right; vertical-align: top;">
              <div style="width: 75px; height: 85px; border: 1px dashed #0077b6; background: #fafafa; overflow: hidden; display:inline-block;">
                <img src="${userPhotoUrl}" crossOrigin="anonymous" style="width:100%; height:100%; object-fit:cover;">
              </div>
            </td>
          </tr>
        </table>
        <div style="font-size: 9.5pt; color: #0077b6; border-left: 3px solid #0077b6; padding-left: 6px; margin: 10px 0 6px 0; font-weight: bold;">1. MEMBER'S PERSONAL INFORMATION</div>[span_36](start_span)[span_36](end_span)
        <table style="width:100%; border-collapse: collapse; font-size: 8.5pt; margin-bottom: 8px;">
          <tr><td style="padding: 5px; border: 1px solid #ccc; background: #f8f9fa; font-weight: bold; width: 20%;">Name (Bangla):</td><td colspan="3" style="padding: 5px; border: 1px solid #ccc; font-weight: bold;">${u.banglaName || ''}</td></tr>[span_37](start_span)[span_37](end_span)
          <tr><td style="padding: 5px; border: 1px solid #ccc; background: #f8f9fa; font-weight: bold;">Name (English):</td><td colspan="3" style="padding: 5px; border: 1px solid #ccc; font-weight: bold; text-transform: uppercase;">${u.englishName || ''}</td></tr>[span_38](start_span)[span_38](end_span)
          <tr><td style="padding: 5px; border: 1px solid #ccc; background: #f8f9fa; font-weight: bold;">Father's Name:</td><td style="padding: 5px; border: 1px solid #ccc; width: 30%;">${u.fatherName || ''}</td><td style="padding: 5px; border: 1px solid #ccc; background: #f8f9fa; font-weight: bold; width: 15%;">Mother's Name:</td><td style="padding: 5px; border: 1px solid #ccc; width: 35%;">${u.motherName || ''}</td></tr>[span_39](start_span)[span_39](end_span)
          <tr>
            <td style="padding: 5px; border: 1px solid #ccc; background: #f8f9fa; font-weight: bold;">Mobile Number:</td>
            <td style="padding: 5px; border: 1px solid #ccc;">
              <div style="display: inline-block; vertical-align: middle;">
                <div style="display:inline-block;width:14px;height:18px;border:1px solid #999;text-align:center;font-size:8.5pt;background:#e2e4e6;margin-right:-1px;font-weight:bold;">${m0}</div>[span_40](start_span)[span_40](end_span)
                ${[m1,m2,m3,m4].map(x=>`<div style="display:inline-block;width:14px;height:18px;border:1px solid #999;text-align:center;font-size:8.5pt;background:#f4f5f6;margin-right:-1px;">${x}</div>`).join('')} -[span_41](start_span)[span_41](end_span)
                ${[m5,m6,m7,m8,m9,m10].map(x=>`<div style="display:inline-block;width:14px;height:18px;border:1px solid #999;text-align:center;font-size:8.5pt;background:#f4f5f6;margin-right:-1px;">${x}</div>`).join('')}[span_42](start_span)[span_42](end_span)
              </div>
            </td>
            <td style="padding: 5px; border: 1px solid #ccc; background: #f8f9fa; font-weight: bold;">Email Address:</td><td style="padding: 5px; border: 1px solid #ccc;">${u.email || ''}</td>[span_43](start_span)[span_43](end_span)
          </tr>
          <tr>
            <td style="padding: 5px; border: 1px solid #ccc; background: #f8f9fa; font-weight: bold;">Date of Birth:</td>
            <td style="padding: 5px; border: 1px solid #ccc;">
              <div style="display: inline-block; vertical-align: middle;">
                ${[d0,d1].map(x=>`<div style="display:inline-block;width:14px;height:18px;border:1px solid #999;text-align:center;font-size:8.5pt;background:#f4f5f6;margin-right:-1px;">${x}</div>`).join('')}.[span_44](start_span)[span_44](end_span)
                ${[d2,d3].map(x=>`<div style="display:inline-block;width:14px;height:18px;border:1px solid #999;text-align:center;font-size:8.5pt;background:#f4f5f6;margin-right:-1px;">${x}</div>`).join('')}.[span_45](start_span)[span_45](end_span)
                ${[d4,d5,d6,d7].map(x=>`<div style="display:inline-block;width:14px;height:18px;border:1px solid #999;text-align:center;font-size:8.5pt;background:#f4f5f6;margin-right:-1px;">${x}</div>`).join('')}[span_46](start_span)[span_46](end_span)
              </div>
            </td>
            <td style="padding: 5px; border: 1px solid #ccc; background: #f8f9fa; font-weight: bold;">Blood Group:</td><td style="padding: 5px; border: 1px solid #ccc; font-weight: bold; color: #d90429;">${u.bloodGroup || ''}</td>[span_47](start_span)[span_47](end_span)
          </tr>
          <tr>
            <td style="padding: 5px; border: 1px solid #ccc; background: #f8f9fa; font-weight: bold;">Gender:</td>
            <td style="padding: 5px; border: 1px solid #ccc;">
              <div style="display: inline-block; margin-right: 10px;"><div style="display:inline-block;width:13px;height:13px;border:1px solid #555;text-align:center;line-height:10px;font-size:8pt;margin-right:3px;background:#fff;vertical-align:middle;">${isMale}</div>Male</div>[span_48](start_span)[span_48](end_span)
              <div style="display: inline-block;"><div style="display:inline-block;width:13px;height:13px;border:1px solid #555;text-align:center;line-height:10px;font-size:8pt;margin-right:3px;background:#fff;vertical-align:middle;">${isFemale}</div>Female</div>[span_49](start_span)[span_49](end_span)
            </td>
            <td style="padding: 5px; border: 1px solid #ccc; background: #f8f9fa; font-weight: bold;">Occupation:</td><td style="padding: 5px; border: 1px solid #ccc;">${u.profession || ''}</td>[span_50](start_span)[span_50](end_span)
          </tr>
          <tr><td style="padding: 5px; border: 1px solid #ccc; background: #f8f9fa; font-weight: bold;">Institution:</td><td colspan="3" style="padding: 5px; border: 1px solid #ccc;">${u.institution || ''}</td></tr>[span_51](start_span)[span_51](end_span)
          <tr><td style="padding: 5px; border: 1px solid #ccc; background: #f8f9fa; font-weight: bold;">Qualification:</td><td style="padding: 5px; border: 1px solid #ccc;">${u.education || ''}</td><td style="padding: 5px; border: 1px solid #ccc; background: #f8f9fa; font-weight: bold;">Session/Year:</td><td style="padding: 5px; border: 1px solid #ccc;">${u.academicYear || ''}</td></tr>[span_52](start_span)[span_52](end_span)
          <tr><td style="padding: 5px; border: 1px solid #ccc; background: #f8f9fa; font-weight: bold;">Present Address:</td><td colspan="3" style="padding: 5px; border: 1px solid #ccc;">${u.presentAddress || ''}</td></tr>[span_53](start_span)[span_53](end_span)
          <tr><td style="padding: 5px; border: 1px solid #ccc; background: #f8f9fa; font-weight: bold;">Permanent Address:</td><td colspan="3" style="padding: 5px; border: 1px solid #ccc;">${u.permanentAddress || ''}</td></tr>[span_54](start_span)[span_54](end_span)
        </table>
        <div style="font-size: 9.5pt; color: #0077b6; border-left: 3px solid #0077b6; padding-left: 6px; margin: 10px 0 6px 0; font-weight: bold;">2. TERMS & DECLARATION</div>[span_55](start_span)[span_55](end_span)
        <div style="font-size: 7.2pt; line-height: 1.3; color: #222; background: #fdfdfd; padding: 6px; border: 1px solid #e0e0e0; border-radius: 4px; margin-bottom: 8px; text-align: justify;">
          1. Supreme Authority: If any member is found involved in activities contrary to the discipline, image, or ideology of the ROS, the authority reserves the right to cancel membership at any time.<br>[span_56](start_span)[span_56](end_span)
          2. I declare that all information provided is true. I have digitally agreed to these terms.[span_57](start_span)[span_57](end_span)
        </div>
        <table style="width: 100%; margin-top: 20px;">
          <tr>
            <td style="width: 33.33%; text-align: center; vertical-align: bottom;">
              <div style="width: 110px; margin: 0 auto 4px auto; border-top: 1px solid #333;"></div><span style="font-size: 8pt;">Applicant's Signature</span>[span_58](start_span)[span_58](end_span)
            </td>
            <td style="width: 33.33%; text-align: center; vertical-align: bottom;">
              <div style="width: 65px; height: 65px; margin: 0 auto; background: #fff;" id="real-instantly-qr"></div>[span_59](start_span)[span_59](end_span)
              <div style="font-size: 6pt; font-weight: bold; margin-top: 2px;">SCAN TO VERIFY</div>[span_60](start_span)[span_60](end_span)
            </td>
            <td style="width: 33.33%; text-align: center; vertical-align: bottom;">
              <div style="height: 20px;"></div>[span_61](start_span)[span_61](end_span)
              <div style="border-top: 1px solid #0077b6; padding-top: 4px; color: #0077b6; font-weight: bold; font-size: 8pt; width: 140px; margin: 0 auto;">Authorized Signature & Seal</div>[span_62](start_span)[span_62](end_span)
            </td>
          </tr>
        </table>
        <div style="text-align: center; font-size: 7.5pt; color: #e63946; background: #fff5f5; padding: 4px; border: 1px dashed #e63946; border-radius: 4px; margin-top: 10px; font-weight: bold;">
          * NOTE: This is a system-generated, digitally verified document. Real-time online database verification is available, so no physical signature is required.
        </div>
        <table style="width: 100%; margin-top: 6px; border-top: 1px solid #eee; font-size: 7pt; color: #566573; padding-top: 4px;">[span_63](start_span)[span_63](end_span)
          <tr><td>🌐 rosociety.vercel.app</td><td style="text-align:center;">📧 helpline.ros@gmail.com</td><td style="text-align:right;">📞 +8801745-668545</td></tr>[span_64](start_span)[span_64](end_span)
        </table>
      </div>
    </div>
  `;

  document.body.appendChild(printWrapper);[span_65](start_span)[span_65](end_span)

  let qrPayloadString = `--- ROS MEMBER VERIFICATION ---\nReg No: ${u.memberId || 'N/A'}\nStatus: ${(u.status || 'ACTIVE').toUpperCase()}\nName: ${u.englishName || 'N/A'}\nMobile: ${u.mobile || 'N/A'}`;[span_66](start_span)[span_66](end_span)
  
  new QRCode(printWrapper.querySelector("#real-instantly-qr"), {[span_67](start_span)[span_67](end_span)
    text: qrPayloadString, width: 65, height: 65, colorDark : "#000000", colorLight : "#ffffff", correctLevel : QRCode.CorrectLevel.H[span_68](start_span)[span_68](end_span)
  });

  setTimeout(async () => {
    try {
      const { jsPDF } = window.jspdf;[span_69](start_span)[span_69](end_span)
      
      const canvas = await html2canvas(printWrapper, { 
        scale: 2, 
        useCORS: true, 
        allowTaint: false,
        logging: false,
        backgroundColor: "#ffffff[span_70](start_span)"[span_70](end_span)
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);[span_71](start_span)[span_71](end_span)
      const pdf = new jsPDF('p', 'mm', 'a4');[span_72](start_span)[span_72](end_span)
      
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, (canvas.height * 210) / canvas.width);[span_73](start_span)[span_73](end_span)
      
      document.body.removeChild(printWrapper);[span_74](start_span)[span_74](end_span)
      if(typeof showLoader === 'function') showLoader(false);[span_75](start_span)[span_75](end_span)
      pdf.save(`ROS_Form_${u.memberId}.pdf`);[span_76](start_span)[span_76](end_span)
    } catch (err) {
      if(printWrapper.parentNode) document.body.removeChild(printWrapper);[span_77](start_span)[span_77](end_span)
      if(typeof showLoader === 'function') showLoader(false);[span_78](start_span)[span_78](end_span)
      console.error(err);
      alert("PDF ডাউনলোড ব্যর্থ হয়েছে। পেজ রিফ্রেশ করে পুনরায় ট্রাই করুন।");
    }
  }, 600); 
}

// উইন্ডো স্কোপ বাইন্ডিং নিশ্চিতকরণ[span_79](start_span)[span_79](end_span)
window.renderMemberManagementSection = renderMemberManagementSection;
window.populateDateFilter = populateDateFilter;
window.filterAndRenderMembersTable = filterAndRenderMembersTable;
window.renderTableUI = renderTableUI;
window.liveStatusUpdateDirect = liveStatusUpdateDirect;
window.openMemberModal = openMemberModal;
window.closeMemberModal = closeMemberModal;
window.exportToExcel = exportToExcel;
window.exportToPDF = exportToPDF;
window.downloadOfficialTemplatePDF = downloadOfficialTemplatePDF;
