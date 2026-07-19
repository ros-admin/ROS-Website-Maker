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

// ফিল্টারিং ইঞ্জিন (শতভাগ উইন্ডো ডেটা স্কোপ ফিক্সড)
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

// এক্সেল ফাইল ডাউনলোড ইঞ্জিন (উইন্ডো স্কোপ ডিরেক্ট)
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

// টেবিলের সাধারণ পিডিএফ ডাউনলোড ইঞ্জিন (উইন্ডো স্কোপ ডিরেক্ট)
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

    // সম্পূর্ণ ডোমেইন ও ইমেজ সিকিউরিটি (CORS) মুক্ত অফিশিয়াল মেম্বারশিপ পিডিএফ জেনারেটর
async function downloadOfficialTemplatePDF() {
  if(!window.activePopupUser) return;
  const u = window.activePopupUser;
  
  if(typeof showLoader === 'function') showLoader(true, "অফিশিয়াল মেম্বারশিপ পিডিএফ জেনারেট হচ্ছে...");

  try {
    const { jsPDF } = window.jspdf;
    // A4 সাইজ (Width: 210mm, Height: 297mm)
    const doc = new jsPDF('p', 'mm', 'a4');

    // ১. অফিশিয়াল থিম বর্ডার (Double Border Effect)
    doc.setDrawColor(0, 119, 182); // #0077b6
    doc.setLineWidth(0.5);
    doc.rect(5, 5, 200, 287); 
    doc.rect(6.5, 6.5, 197, 284);

    // ২. হেডার টাইটেল ও টেক্সট রেন্ডারিং (ফন্ট বা ইমেজ ব্লকিং ছাড়াই চলবে)
    doc.setFillColor(0, 119, 182);
    doc.rect(6.5, 7, 197, 18, 'F');
    
    doc.setTextColor(255, 215, 0); // Gold Color (#ffd700)
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.text("RAJSHAHI OLYMPIAD SOCIETY", 105, 14, { align: "center" });
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.text("REGISTRATION OFFICAL FORM", 105, 21, { align: "center" });

    // ৩. মেম্বারশিপ বেসিক আইডি জোন (বক্স স্ট্রাকচার)
    doc.setTextColor(26, 26, 26);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Registration No:", 15, 36);
    
    // ROS-XXXX-XXXX স্প্লিট বক্স ডিজাইন
    const regParts = String(u.memberId || 'ROS-0000-0000').split('-');
    doc.setFillColor(238, 247, 252);
    doc.rect(50, 31, 25, 7, 'F'); doc.rect(78, 31, 20, 7, 'F'); doc.rect(101, 31, 20, 7, 'F');
    doc.setDrawColor(0, 119, 182);
    doc.rect(50, 31, 25, 7); doc.rect(78, 31, 20, 7); doc.rect(101, 31, 20, 7);
    
    doc.setFontSize(9); doc.setTextColor(0, 119, 182);
    doc.text(regParts[0]||'ROS', 62.5, 36, { align: "center" });
    doc.text(regParts[1]||'0000', 88, 36, { align: "center" });
    doc.text(regParts[2]||'0000', 111, 36, { align: "center" });
    doc.setTextColor(26, 26, 26); doc.text("-", 76, 36); doc.text("-", 99, 36);

    // নিবন্ধনের তারিখ জোন
    doc.setFontSize(10); doc.setTextColor(26, 26, 26);
    doc.text("Registration Date:", 15, 48);
    let rDate = String(u.registrationDate || '01-01-2026').split(' ')[0];
    doc.setFont("Courier", "bold");
    doc.text(rDate, 50, 48);

    // স্ট্যাটাস ব্যাজ
    doc.setFont("Helvetica", "bold");
    doc.text("Status:", 15, 59);
    doc.setFillColor(42, 157, 143); // Active (#2a9d8f)
    doc.rect(50, 54, 25, 6, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(9);
    doc.text((u.status || 'ACTIVE').toUpperCase(), 62.5, 58.5, { align: "center" });

    // পাসপোট সাইজ ডামি ফটো ফ্রেম (CORS ব্লকিং এড়াতে ফ্রেম জেনারেট করা হয়েছে)
    doc.setDrawColor(0, 119, 182); doc.setLineWidth(0.3);
    doc.rect(165, 30, 28, 33);
    doc.setFont("Helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(150, 150, 150);
    doc.text("PASSPORT", 179, 45, { align: "center" });
    doc.text("SIZE PHOTO", 179, 49, { align: "center" });

    // ৪. সেকশন ১: ব্যক্তিগত তথ্য টেবিল (AutoTable Engine)
    doc.setFont("Helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(0, 119, 182);
    doc.text("1. MEMBER'S PERSONAL INFORMATION", 15, 74);

    const personalInfo = [
      ["Name (English)", String(u.englishName || 'N/A').toUpperCase()],
      ["Father's Name", u.fatherName || 'N/A'],
      ["Mother's Name", u.motherName || 'N/A'],
      ["Mobile Number", u.mobile || 'N/A'],
      ["Email Address", u.email || 'N/A'],
      ["Date of Birth", u.dob || 'N/A'],
      ["Blood Group", u.bloodGroup || 'N/A'],
      ["Gender", u.gender || 'N/A'],
      ["Occupation", u.profession || 'N/A'],
      ["Institution Name", u.institution || 'N/A'],
      ["Qualification / Year", `${u.education || 'N/A'} (${u.academicYear || 'N/A'})`],
      ["Present Address", u.presentAddress || 'N/A'],
      ["Permanent Address", u.permanentAddress || 'N/A']
    ];

    doc.autoTable({
      startY: 78,
      margin: { left: 15, right: 15 },
      body: personalInfo,
      theme: 'grid',
      styles: { font: "Helvetica", fontSize: 9, cellPadding: 2.5 },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [248, 249, 250], width: 45, textColor: [50, 50, 50] },
        1: { textColor: [20, 20, 20] }
      },
      gridLineWidth: 0.2,
      gridLineColor: [200, 200, 200]
    });

    // ৫. সেকশন ২: শর্তাবলী এবং ডিক্লারেশন
    let currentY = doc.lastAutoTable.finalY + 10;
    doc.setFont("Helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(0, 119, 182);
    doc.text("2. TERMS & DECLARATION", 15, currentY);

    currentY += 4;
    doc.setFillColor(253, 253, 253); doc.setDrawColor(224, 224, 224);
    doc.rect(15, currentY, 180, 20, 'FD');
    
    doc.setFont("Helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(50, 50, 50);
    const term1 = "1. Supreme Authority: If any member is found involved in activities contrary to the discipline, image, or ideology of the ROS, the authority reserves the right to cancel membership at any time.";
    const term2 = "2. I declare that all information provided is true. I have digitally agreed to these terms.";
    doc.text(term1, 18, currentY + 6);
    doc.text(term2, 18, currentY + 13);

    // ৬. সিগনেচার এবং ভেরিফিকেশন সিল এরিয়া
    currentY += 45;
    doc.setDrawColor(50, 50, 50); doc.setLineWidth(0.3);
    doc.line(20, currentY, 70, currentY); // Applicant Line
    doc.line(140, currentY, 190, currentY); // Authorized Line
    
    doc.setFontSize(9); doc.setTextColor(50, 50, 50);
    doc.text("Applicant's Signature", 45, currentY + 5, { align: "center" });
    doc.text("Authorized Signature & Seal", 165, currentY + 5, { align: "center" });

    // সিস্টেম নোটিফিকেশন নোট
    currentY += 15;
    doc.setFillColor(255, 245, 245); doc.setDrawColor(230, 57, 70);
    doc.rect(15, currentY, 180, 8, 'FD');
    doc.setTextColor(230, 57, 70); doc.setFont("Helvetica", "bold"); doc.setFontSize(8);
    doc.text("* NOTE: This is a system-generated, digitally verified document. Real-time online database verification is available.", 105, currentY + 5, { align: "center" });

    // ফুটার ইনফো
    doc.setFont("Helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(100, 100, 100);
    doc.text(`Generated On: ${new Date().toLocaleString()}  |  Website: rosociety.vercel.app`, 105, 288, { align: "center" });

    // সাকসেসফুলি ডাউনলোড এবং লোডার ক্লোজ
    if(typeof showLoader === 'function') showLoader(false);
    doc.save(`ROS_Official_Form_${u.memberId}.pdf`);

  } catch (err) {
    if(typeof showLoader === 'function') showLoader(false);
    console.error(err);
    alert("PDF ডাউনলোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
  }
}

// উইন্ডো অবজেক্ট বাইন্ডিং ফিক্স
window.downloadOfficialTemplatePDF = downloadOfficialTemplatePDF;


  // QR কোড ডাটা ইঞ্জিন জেনারেশন
  let qrPayloadString = `--- ROS MEMBER VERIFICATION ---\nReg No: ${u.memberId || 'N/A'}\nStatus: ${(u.status || 'ACTIVE').toUpperCase()}\nName: ${u.englishName || 'N/A'}\nMobile: ${u.mobile || 'N/A'}`;
  
  new QRCode(printWrapper.querySelector("#real-instantly-qr"), {
    text: qrPayloadString, width: 65, height: 65, colorDark : "#000000", colorLight : "#ffffff", correctLevel : QRCode.CorrectLevel.H
  });

  // থ্রি-স্টেপ আল্ট্রা বাফার ফিক্স ফর রেন্ডারিং
  setTimeout(async () => {
    try {
      const { jsPDF } = window.jspdf;
      
      // ক্যানভাসে রূপান্তর
      const canvas = await html2canvas(printWrapper, { 
        scale: 2, 
        useCORS: true, 
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff" 
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, (canvas.height * 210) / canvas.width);
      
      // ডম মেমোরি ক্লিনআপ
      document.body.removeChild(printWrapper);
      
      if(typeof showLoader === 'function') showLoader(false);
      pdf.save(`ROS_Form_${u.memberId}.pdf`);
    } catch (err) {
      if(printWrapper.parentNode) document.body.removeChild(printWrapper);
      if(typeof showLoader === 'function') showLoader(false);
      console.error(err);
      alert("PDF ডাউনলোড ব্যর্থ হয়েছে। পেজ রিফ্রেশ করে আবার ট্রাই করুন।");
    }
  }, 350); 
}

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
