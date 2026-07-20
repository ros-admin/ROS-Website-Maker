/**
 * member-management.js
 * মেম্বার MANAGEMENT সেকশনের সম্পূর্ণ ডিজাইন, টেবিল রেন্ডারিং, ফিল্টার এবং এক্সপোর্ট লজিক
 * (ফিক্সড সংস্করণ: পিডিএফ লেআউট, ইমেজ CORS এবং এলাইনমেন্ট ফিক্সড)
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

    <!-- মডাল পপআপ -->
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
      <td class="py-3 px-3 font-mono text-slate-400">${user.email ||  'N/A'}</td>
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
  document.getElementById('modal-[#modal-nid').innerText = user.nidOrBrn || 'N/A';
  
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

// ছবিকে Base64 এ কনভার্ট করার ফাংশন (CORS ফিক্সড)
function urlToBase64(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch (e) {
        resolve("https://rosociety.vercel.app/ros%20logo.png");
      }
    };
    img.onerror = () => {
      resolve("https://rosociety.vercel.app/ros%20logo.png");
    };
    img.src = url;
  });
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

// ফাইনাল সম্পূর্ণ ফিক্সড পিডিএফ জেনারেটর ফাংশন
async function downloadOfficialTemplatePDF() {
  if(!window.activePopupUser) return;
  const u = window.activePopupUser;
  
  if(typeof showLoader === 'function') showLoader(true, "এইচডি কোয়ালিটিতে মেম্বারশিপ পিডিএফ জেনারেট হচ্ছে...");

  try {
    const logoUrl = "https://rosociety.vercel.app/Assets/Logo/ROS%20Logo%20Title.png";
    const userPhotoUrl = u.photoUrl || "https://rosociety.vercel.app/ros%20logo.png";
    const qrCenterLogoUrl = "https://rosociety.vercel.app/ros%20logo.png";

    // ইমেজগুলোকে Base64-এ রিকভার করা (CORS সমস্যা সমাধানের জন্য)
    const [logoBase64, userPhotoBase64, qrLogoBase64] = await Promise.all([
      urlToBase64(logoUrl),
      urlToBase64(userPhotoUrl),
      urlToBase64(qrCenterLogoUrl)
    ]);

    const regParts = String(u.memberId || 'ROS-0000-0000').split('-');
    const regPart1 = regParts[0] || 'ROS';
    const regPart2 = regParts[1] || '0000';
    const regPart3 = regParts[2] || '0000';
    
    let rawDate = "00000000";
    if(u.registrationDate) {
      const dOnly = u.registrationDate.split(' ')[0].replace(/[^0-9]/g, '');
      if(dOnly.length === 8) rawDate = u.registrationDate.includes('-') && u.registrationDate.indexOf('-') === 4 ? dOnly.substring(6,8) + dOnly.substring(4,6) + dOnly.substring(0,4) : dOnly;
    }
    const r0=rawDate[0]||'0', r1=rawDate[1]||'0', r2=rawDate[2]||'0', r3=rawDate[3]||'0', r4=rawDate[4]||'0', r5=rawDate[5]||'0', r6=rawDate[6]||'0', r7=rawDate[7]||'0';

    let dobDigits = "00000000";
    if(u.dob) {
      const d = u.dob.replace(/[^0-9]/g, '');
      if(d.length === 8) dobDigits = u.dob.includes('-') && u.dob.indexOf('-') === 4 ? d.substring(6,8) + d.substring(4,6) + d.substring(0,4) : d;
    }
    const d0=dobDigits[0]||'0', d1=dobDigits[1]||'0', d2=dobDigits[2]||'0', d3=dobDigits[3]||'0', d4=dobDigits[4]||'0', d5=dobDigits[5]||'0', d6=dobDigits[6]||'0', d7=dobDigits[7]||'0';

    let mStr = String(u.mobile || '').replace(/[^0-9]/g, '');
    if (mStr.length === 10) {
      mStr = '0' + mStr;
    } else if (mStr.length < 11) {
      mStr = mStr.padStart(11, '0');
    }
    const m0=mStr[0]||'0', m1=mStr[1]||'0', m2=mStr[2]||'0', m3=mStr[3]||'0', m4=mStr[4]||'0', m5=mStr[5]||'0', m6=mStr[6]||'0', m7=mStr[7]||'0', m8=mStr[8]||'0', m9=mStr[9]||'0', m10=mStr[10]||'0';

    const g = String(u.gender || 'Male').toLowerCase();
    const isMale = (g === 'male' || g === 'পুরুষ') ? '✓' : '';
    const isFemale = (g === 'female' || g === 'মহিলা') ? '✓' : '';

    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    let hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    const downloadDateTime = `${pad(now.getDate())}/${pad(now.getMonth()+1)}/${now.getFullYear()} | ${pad(hours)}:${pad(now.getMinutes())}:${pad(now.getSeconds())} ${ampm}`;

    let qrPayloadString = `--- ROS MEMBER VERIFICATION ---\nReg No: ${u.memberId || 'N/A'}\nStatus: ${(u.status || 'ACTIVE').toUpperCase()}\nName: ${u.englishName || 'N/A'}\nMobile: ${mStr}`;

    const printWrapper = document.createElement('div');
    printWrapper.style.width = "794px"; 
    printWrapper.style.position = "fixed"; 
    printWrapper.style.left = "-9999px"; 
    printWrapper.style.top = "0";
    printWrapper.style.zIndex = "-99999"; 
    printWrapper.style.background = "#ffffff";
    printWrapper.style.padding = "20px";
    printWrapper.style.color = "#000000";

   // টেবিল বেসড ফিক্সড লেআউট CSS (টেক্সট নিচে নামা সম্পূর্ণ বন্ধ করতে)
    printWrapper.innerHTML = `
      <style>
        #ros-pdf-content, #ros-pdf-content * {
          box-sizing: border-box !important;
          font-family: Arial, sans-serif !important;
        }
        #ros-pdf-content table {
          border-collapse: collapse !important;
          width: 100% !important;
        }
        #ros-pdf-content td {
          vertical-align: middle !important;
          padding: 4px 6px !important;
          line-height: 1.2 !important;
        }
        .digit-box {
          display: inline-block !important;
          width: 15px !important;
          height: 18px !important;
          line-height: 18px !important;
          text-align: center !important;
          border: 1px solid #888 !important;
          font-size: 8pt !important;
          background: #f4f5f6 !important;
          margin-right: 1px !important;
          font-weight: bold !important;
        }
        .reg-box {
          border: 1.5px solid #0077b6 !important;
          border-radius: 3px !important;
          padding: 2px 6px !important;
          display: inline-block !important;
          background: #eef7fc !important;
          color: #0077b6 !important;
          font-weight: bold !important;
          font-size: 8.5pt !important;
          line-height: 1.2 !important;
        }
      </style>
      <div id="ros-pdf-content" style="border: 1px solid #0077b6; padding: 2px; background:#fff; font-size: 8.5pt;">
        <div style="border: 1px solid #0077b6; padding: 15px; position: relative; background: #ffffff;">
          <div style="position: absolute; top: 40%; left: 5%; transform: rotate(-25deg); font-size: 26pt; font-weight: bold; text-align: center; width: 90%; opacity: 0.03; color: #000; z-index: 1; pointer-events: none;">RAJSHAHI OLYMPIAD SOCIETY</div>
          
          <div style="text-align: center; border-bottom: 2px solid #0077b6; padding-bottom: 8px; margin-bottom: 12px;">
            <img src="${logoBase64}" style="width: 250px; height: auto; display: block; margin: 0 auto 6px auto;">
            <div style="display: inline-block; background: #0077b6; color: #fff; padding: 4px 12px; font-size: 8.5pt; font-weight: bold; border-radius: 3px; text-transform: uppercase;">Registration Form</div>
          </div>
          
          <table style="margin-bottom: 10px;">
            <tr>
              <td style="text-align: left; vertical-align: top !important;">
                <table style="width: 100%;">
                  <tr>
                    <td style="width: 120px; font-weight: bold; padding: 3px 0 !important;">Registration No:</td>
                    <td style="padding: 3px 0 !important;">
                      <span class="reg-box">${regPart1}</span> - 
                      <span class="reg-box" style="width: 45px; text-align:center;">${regPart2}</span> - 
                      <span class="reg-box" style="width: 45px; text-align:center;">${regPart3}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; padding: 3px 0 !important;">Registration Date:</td>
                    <td style="padding: 3px 0 !important;">
                      ${[r0,r1].map(x=>`<span class="digit-box">${x}</span>`).join('')}.
                      ${[r2,r3].map(x=>`<span class="digit-box">${x}</span>`).join('')}.
                      ${[r4,r5,r6,r7].map(x=>`<span class="digit-box">${x}</span>`).join('')}
                    </td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; padding: 3px 0 !important;">Status:</td>
                    <td style="padding: 3px 0 !important;">
                      <span style="background: #2a9d8f; color: #fff; padding: 3px 8px; font-size: 8pt; font-weight: bold; border-radius: 4px; text-transform: uppercase; display: inline-block;">${u.status || 'ACTIVE'}</span>
                    </td>
                  </tr>
                </table>
              </td>
              <td style="width: 85px; text-align: right; vertical-align: top !important;">
                <div style="width: 80px; height: 95px; border: 1.5px solid #0077b6; background: #fafafa; overflow: hidden; display:inline-block;">
                  <img src="${userPhotoBase64}" style="width:100%; height:100%; object-fit:cover; display:block;">
                </div>
              </td>
            </tr>
          </table>
          
          <div style="font-size: 9.5pt; color: #0077b6; border-left: 3px solid #0077b6; padding-left: 6px; margin: 10px 0 6px 0; font-weight: bold;">1. MEMBER'S PERSONAL INFORMATION</div>
          
          <table style="border: 1px solid #ccc; font-size: 8.5pt; margin-bottom: 12px;">
            <tr><td style="background: #f8f9fa; font-weight: bold; width: 20%; border: 1px solid #ccc;">Name (Bangla):</td><td colspan="3" style="font-weight: bold; border: 1px solid #ccc;">${u.banglaName || ''}</td></tr>
            <tr><td style="background: #f8f9fa; font-weight: bold; border: 1px solid #ccc;">Name (English):</td><td colspan="3" style="font-weight: bold; text-transform: uppercase; border: 1px solid #ccc;">${u.englishName || ''}</td></tr>
            <tr><td style="background: #f8f9fa; font-weight: bold; width: 20%; border: 1px solid #ccc;">Father's Name:</td><td style="width: 30%; border: 1px solid #ccc;">${u.fatherName || ''}</td><td style="background: #f8f9fa; font-weight: bold; width: 15%; border: 1px solid #ccc;">Mother's Name:</td><td style="width: 35%; border: 1px solid #ccc;">${u.motherName || ''}</td></tr>
            <tr>
              <td style="background: #f8f9fa; font-weight: bold; border: 1px solid #ccc;">Mobile Number:</td>
              <td style="border: 1px solid #ccc;">
                <span class="digit-box" style="background:#e2e4e6 !important;">${m0}</span>
                ${[m1,m2,m3,m4].map(x=>`<span class="digit-box">${x}</span>`).join('')} - 
                ${[m5,m6,m7,m8,m9,m10].map(x=>`<span class="digit-box">${x}</span>`).join('')}
              </td>
              <td style="background: #f8f9fa; font-weight: bold; border: 1px solid #ccc;">Email Address:</td><td style="font-family: monospace; border: 1px solid #ccc;">${u.email || ''}</td>
            </tr>
            <tr>
              <td style="background: #f8f9fa; font-weight: bold; border: 1px solid #ccc;">Date of Birth:</td>
              <td style="border: 1px solid #ccc;">
                ${[d0,d1].map(x=>`<span class="digit-box">${x}</span>`).join('')}.
                ${[d2,d3].map(x=>`<span class="digit-box">${x}</span>`).join('')}.
                ${[d4,d5,d6,d7].map(x=>`<span class="digit-box">${x}</span>`).join('')}
              </td>
              <td style="background: #f8f9fa; font-weight: bold; border: 1px solid #ccc;">Blood Group:</td><td style="font-weight: bold; color: #d90429; border: 1px solid #ccc;">${u.bloodGroup || ''}</td>
            </tr>
            <tr>
              <td style="background: #f8f9fa; font-weight: bold; border: 1px solid #ccc;">Gender:</td>
              <td style="border: 1px solid #ccc;">
                <span style="display: inline-block; margin-right: 12px;"><span style="display:inline-block;width:12px;height:12px;border:1px solid #555;text-align:center;line-height:10px;font-size:8pt;margin-right:4px;background:#fff;">${isMale}</span>Male</span>
                <span style="display: inline-block;"><span style="display:inline-block;width:12px;height:12px;border:1px solid #555;text-align:center;line-height:10px;font-size:8pt;margin-right:4px;background:#fff;">${isFemale}</span>Female</span>
              </td>
              <td style="background: #f8f9fa; font-weight: bold; border: 1px solid #ccc;">Occupation:</td><td style="border: 1px solid #ccc;">${u.profession || ''}</td>
            </tr>
            <tr><td style="background: #f8f9fa; font-weight: bold; border: 1px solid #ccc;">Institution:</td><td colspan="3" style="border: 1px solid #ccc;">${u.institution || ''}</td></tr>
            <tr><td style="background: #f8f9fa; font-weight: bold; border: 1px solid #ccc;">Qualification:</td><td style="border: 1px solid #ccc;">${u.education || ''}</td><td style="background: #f8f9fa; font-weight: bold; border: 1px solid #ccc;">Session/Year:</td><td style="border: 1px solid #ccc;">${u.academicYear || ''}</td></tr>
            <tr><td style="background: #f8f9fa; font-weight: bold; border: 1px solid #ccc;">Present Address:</td><td colspan="3" style="border: 1px solid #ccc;">${u.presentAddress || ''}</td></tr>
            <tr><td style="background: #f8f9fa; font-weight: bold; border: 1px solid #ccc;">Permanent Address:</td><td colspan="3" style="border: 1px solid #ccc;">${u.permanentAddress || ''}</td></tr>
          </table>
          
          <div style="font-size: 9.5pt; color: #0077b6; border-left: 3px solid #0077b6; padding-left: 6px; margin: 10px 0 6px 0; font-weight: bold;">2. TERMS & DECLARATION</div>
          <div style="font-size: 7.2pt; line-height: 1.4 !important; color: #222; background: #fdfdfd; padding: 8px; border: 1px solid #e0e0e0; border-radius: 4px; margin-bottom: 15px; text-align: justify;">
            1. Supreme Authority: If any member is found involved in activities contrary to the discipline, image, or ideology of the ROS, the authority reserves the right to cancel membership at any time.<br>
            2. I declare that all information provided is true. I have digitally agreed to these terms.
          </div>
          
          <table style="margin-top: 15px;">
            <tr>
              <td style="width: 33.33%; text-align: center; vertical-align: bottom !important;">
                <div style="width: 110px; margin: 0 auto 4px auto; border-top: 1px solid #333;"></div>
                <span style="font-size: 8pt;">Applicant's Signature</span>
              </td>
              <td style="width: 33.33%; text-align: center; vertical-align: bottom !important;">
                <div style="width: 85px; height: 85px; margin: 0 auto; background: #fff;" id="canvas-pure-qr"></div>
                <div style="font-size: 6.5pt; font-weight: bold; margin-top: 4px; letter-spacing: 0.5px;">SCAN TO VERIFY</div>
              </td>
              <td style="width: 33.33%; text-align: center; vertical-align: bottom !important;">
                <div style="border-top: 1px solid #0077b6; padding-top: 4px; color: #0077b6; font-weight: bold; font-size: 8pt; width: 140px; margin: 0 auto;">Authorized Signature & Seal</div>
              </td>
            </tr>
          </table>
          
          <div style="text-align: center; font-size: 7.5pt; color: #e63946; background: #fff5f5; padding: 5px; border: 1px dashed #e63946; border-radius: 4px; margin-top: 12px; font-weight: bold;">
            * NOTE: This is a system-generated, digitally verified document. Real-time online database verification is available, so no physical signature is required.
          </div>
          
          <table style="margin-top: 10px; border-top: 1px solid #eee; font-size: 7.5pt; color: #566573;">
            <tr><td style="text-align: left;">🌐 rosociety.vercel.app</td><td style="text-align:center;">📧 helpline.ros@gmail.com</td><td style="text-align:right;">📞 +8801745-668545</td></tr>
          </table>

          <table style="margin-top: 4px; font-size: 6.5pt; color: #94a3b8; border-top: 1px dashed #e2e8f0;">
            <tr>
              <td style="text-align: left;">📅 Downloaded: ${downloadDateTime}</td>
              <td style="text-align: right; font-weight: bold; color: #64748b;">Developed by: <span style="color: #0077b6;">Utsab Sarker</span></td>
            </tr>
          </table>
        </div>
      </div>
    `;

    document.body.appendChild(printWrapper);

    // QR কোড রেন্ডার
    const qrContainer = printWrapper.querySelector("#canvas-pure-qr");
    let qrGenerated = false;

    if (typeof QRCode !== 'undefined') {
      try {
        const tempQrDiv = document.createElement('div');
        new QRCode(tempQrDiv, {
          text: qrPayloadString, width: 200, height: 200, colorDark : "#000000", colorLight : "#ffffff", correctLevel : QRCode.CorrectLevel.H
        });

        await new Promise(resolve => setTimeout(resolve, 300));
        const qrImg = tempQrDiv.querySelector('img');
        
        if (qrImg && qrImg.src) {
          const mainCanvas = document.createElement('canvas');
          mainCanvas.width = 200; mainCanvas.height = 200;
          const ctx = mainCanvas.getContext('2d');
          
          const baseQr = new Image();
          baseQr.src = qrImg.src;
          await new Promise(res => baseQr.onload = res);
          ctx.drawImage(baseQr, 0, 0, 200, 200);

          const centerLogo = new Image();
          centerLogo.src = qrLogoBase64;
          await new Promise(res => centerLogo.onload = res);

          const logoSize = 46; 
          const logoX = (200 - logoSize) / 2;
          const logoY = (200 - logoSize) / 2;
          
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(logoX - 4, logoY - 4, logoSize + 8, logoSize + 8);
          ctx.drawImage(centerLogo, logoX, logoY, logoSize, logoSize);
          
          const finalQrImg = document.createElement('img');
          finalQrImg.src = mainCanvas.toDataURL('image/png');
          finalQrImg.style.width = "85px";
          finalQrImg.style.height = "85px";
          finalQrImg.style.display = "block";
          qrContainer.appendChild(finalQrImg);
          qrGenerated = true;
        }
      } catch(e) {
        console.error("QR কোড তৈরিতে সমস্যা।", e);
      }
    }

    if (!qrGenerated) {
      let qrBackupUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrPayloadString)}`;
      qrContainer.innerHTML = `<img src="${qrBackupUrl}" style="width:85px;height:85px;display:block;">`;
    }

    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const { jsPDF } = window.jspdf;
      
      const canvas = await html2canvas(printWrapper, { 
        scale: 3, 
        useCORS: true, 
        allowTaint: true, 
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 794 
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, (canvas.height * 210) / canvas.width, undefined, 'FAST');
      
      document.body.removeChild(printWrapper);
      if(typeof showLoader === 'function') showLoader(false);
      pdf.save(`ROS_Form_${u.memberId}.pdf`);
    } catch (e) {
      throw new Error("HTML ক্যানভাস এইচডি জেনারেশন এরর।");
    }

  } catch (err) {
    const badWrapper = document.querySelector('div[style*="z-index: -99999"]');
    if(badWrapper && document.body.contains(badWrapper)) {
      document.body.removeChild(badWrapper);
    }
    if(typeof showLoader === 'function') showLoader(false);
    console.error(err);
    alert("পিডিএফ ডাউনলোড এরর: \n➡️ " + err.message);
  }
}

// উইন্ডো স্কোপ বাইন্ডিং
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
