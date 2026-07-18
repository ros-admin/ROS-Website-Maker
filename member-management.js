/**
 * member-management.js
 * মেম্বার ম্যানেজমেন্ট সেকশনের সম্পূর্ণ ডিজাইন, টেবিল রেন্ডারিং, ফিল্টার এবং এক্সপোর্ট লজিক
 */

function renderMemberManagementSection(container) {
  // ১. এইচটিএমএল লেআউট ও পপআপ মডাল ডিজাইন ইনজেকশন
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

        <!-- টেবিল ডাটা স্ট্রাকচার -->
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

    <!-- ডাইনামিক কাস্টমাইজড মেম্বার ডিটেইলস পপআপ মডাল -->
    <div id="memberPopupModal" class="hidden fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div class="bg-slate-900 border-2 border-[#00b4d8]/40 rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col transition-all duration-300">
        
        <!-- মডাল হেডার -->
        <div class="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
          <div class="text-left">
            <h2 class="text-md font-bold text-[#ffd700] tracking-wide"><i class="fa-solid fa-building-columns mr-1.5"></i>রাজশাহী অলিম্পিয়াড সোসাইটি</h2>
            <p class="text-[11px] text-[#00b4d8] font-bold tracking-wider uppercase">Member Details Info</p>
          </div>
          <button onclick="closeMemberModal()" class="w-8 h-8 rounded-lg bg-slate-900 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-all cursor-pointer"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <div id="modalPrintArea" class="p-6 space-y-6 flex-1 text-center">
          <!-- পাসপোর্ট সাইজ ছবি এবং বেসিক হেডলাইন -->
          <div class="flex flex-col sm:flex-row items-center gap-6 bg-slate-950/40 p-4 border border-slate-800 rounded-xl text-left">
            <!-- পাসপোর্ট সাইজ ছবির ফ্রেম (চারকোনা) -->
            <div class="w-[100px] h-[120px] shrink-0 border-2 border-[#00b4d8] bg-slate-900 shadow-md p-0.5 overflow-hidden rounded-md">
              <img id="modal-photo" src="https://rosociety.vercel.app/ros%20logo.png" alt="Member Photo" class="w-full h-full object-cover">
            </div>
            <div class="space-y-2 w-full">
              <div class="bg-[#00b4d8]/10 border border-[#00b4d8]/30 px-3 py-1 rounded-md text-xs font-mono text-[#ffd700] font-bold inline-block" id="modal-memberId-title">ROS-XXXX-XXXX</div>
              <h2 id="modal-englishName" class="text-lg font-bold text-white tracking-wide uppercase">English Name</h2>
              <div class="grid grid-cols-2 gap-4 text-xs pt-1 border-t border-slate-800/60">
                <div><span class="text-slate-500 font-semibold block mb-0.5"><i class="fa-solid fa-calendar-check text-[#00b4d8] mr-1"></i>নিবন্ধনের তারিখ</span><span id="modal-regDateOnly" class="text-slate-200 font-mono">...</span></div>
                <div><span class="text-slate-500 font-semibold block mb-0.5"><i class="fa-solid fa-circle-info text-[#ffd700] mr-1"></i>স্ট্যাটাস</span><span id="modal-status-badge" class="font-bold uppercase px-2 py-0.5 rounded text-[10px] inline-block mt-0.5">...</span></div>
              </div>
            </div>
          </div>

          <!-- সেকশন ভিত্তিক ক্যাটাগরাইজড ইউজার ডাটা -->
          <div class="space-y-4 text-left text-xs">
            
            <!-- ক্যাটাগরি ১: ব্যক্তিগত তথ্য -->
            <div class="bg-slate-950/30 rounded-xl border border-slate-800/80 overflow-hidden">
              <div class="bg-gradient-to-r from-slate-950 to-slate-900 px-4 py-2 font-bold text-[#00b4d8] border-b border-slate-800 flex items-center gap-2">
                <i class="fa-solid fa-user-tie"></i> ব্যক্তিগত তথ্য (Personal Information)
              </div>
              <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="md:col-span-2 bg-slate-900/40 p-2.5 rounded border border-slate-800/40"><span class="text-slate-500 font-semibold block mb-0.5"><i class="fa-solid fa-language mr-1"></i>Name (Bangla)</span><span id="modal-banglaName" class="text-slate-200 font-medium">...</span></div>
                <div class="bg-slate-900/40 p-2.5 rounded border border-slate-800/40"><span class="text-slate-500 font-semibold block mb-0.5"><i class="fa-solid fa-person mr-1"></i>Father's Name</span><span id="modal-father" class="text-slate-200 font-medium">...</span></div>
                <div class="bg-slate-900/40 p-2.5 rounded border border-slate-800/40"><span class="text-slate-500 font-semibold block mb-0.5"><i class="fa-solid fa-person-dress mr-1"></i>Mother's Name</span><span id="modal-mother" class="text-slate-200 font-medium">...</span></div>
                <div class="bg-slate-900/40 p-2.5 rounded border border-slate-800/40"><span class="text-slate-500 font-semibold block mb-0.5"><i class="fa-solid fa-cake-candles mr-1"></i>জন্ম তারিখ (DOB)</span><span id="modal-dob" class="text-slate-200 font-mono">...</span></div>
                <div class="bg-slate-900/40 p-2.5 rounded border border-slate-800/40"><span class="text-slate-500 font-semibold block mb-0.5"><i class="fa-solid fa-droplet mr-1 text-rose-500"></i>রক্তের গ্রুপ (Blood Group)</span><span id="modal-blood" class="text-[#00b4d8] font-bold">...</span></div>
                <div class="bg-slate-900/40 p-2.5 rounded border border-slate-800/40"><span class="text-slate-500 font-semibold block mb-0.5"><i class="fa-solid fa-venus-mars mr-1"></i>জেন্ডার (Gender)</span><span id="modal-gender" class="text-slate-200">...</span></div>
                <div class="bg-slate-900/40 p-2.5 rounded border border-slate-800/40"><span class="text-slate-500 font-semibold block mb-0.5"><i class="fa-solid fa-id-card mr-1"></i>NID/Birth Certificate Number</span><span id="modal-nid" class="text-slate-200 font-mono">...</span></div>
              </div>
            </div>

            <!-- ক্যাটাগরি ২: যোগাযোগ মাধ্যম -->
            <div class="bg-slate-950/30 rounded-xl border border-slate-800/80 overflow-hidden">
              <div class="bg-gradient-to-r from-slate-950 to-slate-900 px-4 py-2 font-bold text-[#ec4899] border-b border-slate-800 flex items-center gap-2">
                <i class="fa-solid fa-address-book"></i> যোগাযোগ মাধ্যম (Contact Details)
              </div>
              <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="bg-slate-900/40 p-2.5 rounded border border-slate-800/40"><span class="text-slate-500 font-semibold block mb-0.5"><i class="fa-solid fa-phone mr-1"></i>Mobile Number</span><span id="modal-mobile" class="text-slate-200 font-mono">...</span></div>
                <div class="bg-slate-900/40 p-2.5 rounded border border-slate-800/40"><span class="text-slate-500 font-semibold block mb-0.5"><i class="fa-solid fa-envelope mr-1"></i>Email Address</span><span id="modal-email" class="text-slate-200 font-mono">...</span></div>
                <div class="bg-slate-900/40 p-2.5 rounded border border-slate-800/40"><span class="text-slate-500 font-semibold block mb-0.5"><i class="fa-brands fa-whatsapp mr-1 text-emerald-500"></i>Whatsapp Number</span><span id="modal-whatsapp" class="text-slate-200 font-mono">...</span></div>
                <div class="bg-slate-900/40 p-2.5 rounded border border-slate-800/40"><span class="text-slate-500 font-semibold block mb-0.5"><i class="fa-brands fa-facebook mr-1 text-blue-500"></i>FB ID Link</span><span id="modal-fb" class="text-[#00b4d8] break-all font-mono">...</span></div>
                <div class="md:col-span-2 bg-slate-900/40 p-2.5 rounded border border-slate-800/40"><span class="text-slate-500 font-semibold block mb-0.5"><i class="fa-solid fa-map-location-dot mr-1 text-indigo-400"></i>Present Address</span><span id="modal-present" class="text-slate-200">...</span></div>
                <div class="md:col-span-2 bg-slate-900/40 p-2.5 rounded border border-slate-800/40"><span class="text-slate-500 font-semibold block mb-0.5"><i class="fa-solid fa-house-chimney mr-1 text-amber-500"></i>Permanent Address</span><span id="modal-permanent" class="text-slate-200">...</span></div>
              </div>
            </div>

            <!-- ক্যাটাগরি ৩: শিক্ষাগত ও পেশাগত যোগ্যতা -->
            <div class="bg-slate-950/30 rounded-xl border border-slate-800/80 overflow-hidden">
              <div class="bg-gradient-to-r from-slate-950 to-slate-900 px-4 py-2 font-bold text-[#ffd700] border-b border-slate-800 flex items-center gap-2">
                <i class="fa-solid fa-graduation-cap"></i> শিক্ষা ও পেশা (Education & Profession)
              </div>
              <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="bg-slate-900/40 p-2.5 rounded border border-slate-800/40"><span class="text-slate-500 font-semibold block mb-0.5"><i class="fa-solid fa-user-graduate mr-1"></i>Education Level</span><span id="modal-education" class="text-slate-200">...</span></div>
                <div class="bg-slate-900/40 p-2.5 rounded border border-slate-800/40"><span class="text-slate-500 font-semibold block mb-0.5"><i class="fa-solid fa-clock-history mr-1"></i>Academic Year / Session</span><span id="modal-academic" class="text-slate-200 font-mono">...</span></div>
                <div class="bg-slate-900/40 p-2.5 rounded border border-slate-800/40"><span class="text-slate-500 font-semibold block mb-0.5"><i class="fa-solid fa-briefcase mr-1"></i>Profession</span><span id="modal-profession" class="text-slate-200">...</span></div>
                <div class="bg-slate-900/40 p-2.5 rounded border border-slate-800/40"><span class="text-slate-500 font-semibold block mb-0.5"><i class="fa-solid fa-school mr-1"></i>Institution Name</span><span id="modal-institute" class="text-slate-200">...</span></div>
              </div>
            </div>

          </div>

          <!-- ফুটার অ্যাকশন বাটন জোন -->
          <div class="flex justify-between items-center border-t border-slate-800 pt-4 mt-5">
            <button onclick="downloadOfficialTemplatePDF()" class="px-4 py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-950/40">
              <i class="fa-solid fa-file-pdf"></i> অফিশিয়াল পিডিএফ ডাউনলোড
            </button>
            <button onclick="closeMemberModal()" class="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer">
              বন্ধ করুন
            </button>
          </div>

        </div>
      </div>
    </div>

    <!-- অফিশিয়াল এ৪ পিডিএফ ডকুমেন্ট রেন্ডারিং এর জন্য একটি হিডেন ডম টেমপ্লেট কন্টেইনার -->
    <div id="hiddenPdfRenderContainer" class="absolute left-[-9999px] top-[-9999px]"></div>
  `;

  populateDateFilter(allUsersData);
  filterAndRenderMembersTable();
}

function populateDateFilter(users) {
  const dateSelect = document.getElementById('filterDate');
  if (!dateSelect) return;
  dateSelect.innerHTML = '<option value="all">All Dates</option>';
  const uniqueDates = new Set();
  
  users.forEach(u => {
    if(u.registrationDate) {
      const dOnly = u.registrationDate.split(' ')[0];
      uniqueDates.add(dOnly);
    }
  });
  
  Array.from(uniqueDates).sort().forEach(d => {
    const opt = document.createElement('option');
    opt.value = d; opt.innerText = d;
    dateSelect.appendChild(opt);
  });
}

function filterAndRenderMembersTable() {
  const searchVal = document.getElementById('memberSearchInput').value.toLowerCase().trim();
  const statusFilter = document.getElementById('filterStatus').value;
  const dateFilter = document.getElementById('filterDate').value;
  const bloodFilter = document.getElementById('filterBlood').value;
  const genderFilter = document.getElementById('filterGender').value;
  const sortFilter = document.getElementById('filterSort').value;

  currentFilteredList = allUsersData.filter(user => {
    const id = String(user.memberId || '').toLowerCase();
    const name = String(user.englishName || '').toLowerCase();
    const mob = String(user.mobile || '').toLowerCase();
    const em = String(user.email || '').toLowerCase();
    const matchesSearch = id.includes(searchVal) || name.includes(searchVal) || mob.includes(searchVal) || em.includes(searchVal);

    const status = String(user.status || '').toLowerCase().trim();
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') { matchesStatus = (status === 'active' || status === 'approved'); }
      else { matchesStatus = (status === statusFilter); }
    }

    let matchesDate = true;
    if(dateFilter !== 'all' && user.registrationDate) {
      matchesDate = user.registrationDate.split(' ')[0] === dateFilter;
    }

    let matchesBlood = true;
    if(bloodFilter !== 'all') {
      matchesBlood = String(user.bloodGroup || '').trim() === bloodFilter;
    }

    let matchesGender = true;
    if(genderFilter !== 'all') {
      matchesGender = String(user.gender || '').trim() === genderFilter;
    }

    return matchesSearch && matchesStatus && matchesDate && matchesBlood && matchesGender;
  });

  currentFilteredList.sort((a, b) => {
    if(sortFilter === 'name_asc') return String(a.englishName || '').localeCompare(String(b.englishName || ''));
    if(sortFilter === 'name_desc') return String(b.englishName || '').localeCompare(String(a.englishName || ''));
    if(sortFilter === 'reg_asc') return String(a.memberId || '').localeCompare(String(b.memberId || ''));
    if(sortFilter === 'reg_desc') return String(b.memberId || '').localeCompare(String(a.memberId || ''));
    return 0;
  });

  document.getElementById('filtered-count').innerText = currentFilteredList.length;
  renderTableUI(currentFilteredList);
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
      const idx = allUsersData.findIndex(u => u.memberId === memberId);
      if(idx !== -1) allUsersData[idx].status = newStatus;
      filterAndRenderMembersTable();
    } else { alert(res.error || "ত্রুটি ঘটেছে।"); }
  } catch (err) { 
    if(typeof showLoader === 'function') showLoader(false);
    alert("সার্ভার সংযোগ ত্রুটি।"); 
  }
}

function openMemberModal(memberId) {
  const user = allUsersData.find(u => u.memberId === memberId);
  if(!user) return;
  activePopupUser = user;

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
  document.getElementById('modal-photo').src = user.photoUrl || "https://rosociety.vercel.app/ros%20logo.png";

  if (user.registrationDate && user.registrationDate.includes(' ')) {
    const parts = user.registrationDate.split(' ');
    document.getElementById('modal-regDateOnly').innerText = parts[0];
  } else {
    document.getElementById('modal-regDateOnly').innerText = user.registrationDate || 'N/A';
  }

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
  activePopupUser = null; 
}

// থিম অনুযায়ী কাস্টমাইজড অফিশিয়াল মেম্বারশিপ পিডিএফ জেনারেটর ইঞ্জিন
function downloadOfficialTemplatePDF() {
  if(!activePopupUser) return;
  
  const u = activePopupUser;
  
  // ১. মেম্বার আইডি বিভক্তিকরণ লজিক (ROS-XXXX-XXXX)
  const regParts = String(u.memberId || 'ROS-0000-0000').split('-');
  const regPart1 = regParts[0] || 'ROS';
  const regPart2 = regParts[1] || '0000';
  const regPart3 = regParts[2] || '0000';
  
  // ২. রেজিস্ট্রেশন ডেট ফরম্যাট ইঞ্জিন (রিয়েল-টাইম বক্স ডিস্ট্রিবিউশন)
  let rawDate = "00000000";
  if(u.registrationDate) {
    const dOnly = u.registrationDate.split(' ')[0]; // YYYY-MM-DD অথবা DD.MM.YYYY
    const digits = dOnly.replace(/[^0-9]/g, '');
    if(digits.length === 8) {
      if(dOnly.includes('-') && dOnly.indexOf('-') === 4) { 
        // YYYYMMDD -> DDMMYYYY
        rawDate = digits.substring(6,8) + digits.substring(4,6) + digits.substring(0,4);
      } else { rawDate = digits; }
    }
  }
  const r0=rawDate[0], r1=rawDate[1], r2=rawDate[2], r3=rawDate[3], r4=rawDate[4], r5=rawDate[5], r6=rawDate[6], r7=rawDate[7];

  // ৩. জন্ম তারিখ ডিজিট ইঞ্জিন
  let dobDigits = "00000000";
  if(u.dob) {
    const d = u.dob.replace(/[^0-9]/g, '');
    if(d.length === 8) {
      if(u.dob.includes('-') && u.dob.indexOf('-') === 4) {
        dobDigits = d.substring(6,8) + d.substring(4,6) + d.substring(0,4);
      } else { dobDigits = d; }
    }
  }
  const d0=dobDigits[0], d1=dobDigits[1], d2=dobDigits[2], d3=dobDigits[3], d4=dobDigits[4], d5=dobDigits[5], d6=dobDigits[6], d7=dobDigits[7];

  // ৪. মোবাইল ডিজিট স্লাইসিং ইঞ্জিন
  let mStr = String(u.mobile || '01000000000').replace(/[^0-9]/g, '');
  if(mStr.length < 11) mStr = mStr.padStart(11, '0');
  const m0=mStr[0], m1=mStr[1], m2=mStr[2], m3=mStr[3], m4=mStr[4], m5=mStr[5], m6=mStr[6], m7=mStr[7], m8=mStr[8], m9=mStr[9], m10=mStr[10];

  // ৫. জেন্ডার সিলেকশন বক্স
  const g = String(u.gender || 'Male').toLowerCase();
  const isMale = (g === 'male' || g === 'পুরুষ') ? '✓' : '';
  const isFemale = (g === 'female' || g === 'মহিলা') ? '✓' : '';

  const pdfContainer = document.getElementById('hiddenPdfRenderContainer');
  
  // ৬. ডকুমেন্ট স্ট্রাকচার ইনজেকশন (ইউজারের থিম ও সিগনেচার স্পেস রিকোয়ারমেন্ট সহ)
  pdfContainer.innerHTML = `
    <div id="pdfInvoiceTemplate" style="width: 790px; padding: 0; margin: 0; background: #ffffff; color: #1a1a1a; font-family: sans-serif; -webkit-print-color-adjust: exact;">
      <div style="border: 1px solid #0077b6; padding: 2px;">
        <div style="border: 1px solid #0077b6; padding: 15px; position: relative;">
          
          <div style="position: absolute; top: 45%; left: 5%; transform: rotate(-25deg); font-size: 24pt; font-weight: bold; text-align: center; width: 90%; opacity: 0.03; color: #000000; z-index: 1;">RAJSHAHI OLYMPIAD SOCIETY</div>
          
          <div style="text-align: center; border-bottom: 2px solid #0077b6; padding-bottom: 6px; margin-bottom: 8px;">
            <img src="https://rosociety.vercel.app/Assets/Logo/ROS%20Logo%20Title.png" style="width: 250px; height: auto; display: block; margin: 0 auto 4px auto;" alt="Header Logo">
            <div style="display: inline-block; background: #0077b6; color: #fff; padding: 3px 12px; font-size: 8.5pt; font-weight: bold; border-radius: 3px; text-transform: uppercase;">Registration Form</div>
          </div>
          
          <table style="width:100%; margin-bottom: 5px; border-collapse: collapse;">
            <tr>
              <td style="vertical-align: middle;">
                <div style="margin-bottom: 6px; font-size: 9pt; font-weight: bold;">
                  <span style="display: inline-block; width: 120px;">Registration No:</span>
                  <div style="border: 1.5px solid #0077b6; border-radius: 3px; padding: 2px 6px; display: inline-block; background: #eef7fc; color: #0077b6;">${regPart1}</div>
                  <div style="display: inline-block; margin: 0 2px; font-weight: bold; color: #0077b6;">-</div>
                  <div style="border: 1.5px solid #0077b6; border-radius: 3px; padding: 2px 6px; display: inline-block; background: #eef7fc; color: #0077b6; width: 60px; text-align:center;">${regPart2}</div>
                  <div style="display: inline-block; margin: 0 2px; font-weight: bold; color: #0077b6;">-</div>
                  <div style="border: 1.5px solid #0077b6; border-radius: 3px; padding: 2px 6px; display: inline-block; background: #eef7fc; color: #0077b6; width: 60px; text-align:center;">${regPart3}</div>
                </div>
                
                <div style="margin-bottom: 6px; font-size: 9pt; font-weight: bold;">
                  <span style="display: inline-block; width: 120px;">Registration Date:</span>
                  <div style="display: inline-block; vertical-align: middle;">
                    <div style="display: inline-block; width: 15px; height: 18px; border: 1px solid #999999; text-align: center; line-height: 16px; font-size: 8.5pt; background: #f4f5f6; margin-right: -1px;">${r0}</div><div style="display: inline-block; width: 15px; height: 18px; border: 1px solid #999999; text-align: center; line-height: 16px; font-size: 8.5pt; background: #f4f5f6; margin-right: -1px;">${r1}</div>
                    <div style="display: inline-block; margin: 0 1px; font-weight: bold; color: #555;">.</div>
                    <div style="display: inline-block; width: 15px; height: 18px; border: 1px solid #999999; text-align: center; line-height: 16px; font-size: 8.5pt; background: #f4f5f6; margin-right: -1px;">${r2}</div><div style="display: inline-block; width: 15px; height: 18px; border: 1px solid #999999; text-align: center; line-height: 16px; font-size: 8.5pt; background: #f4f5f6; margin-right: -1px;">${r3}</div>
                    <div style="display: inline-block; margin: 0 1px; font-weight: bold; color: #555;">.</div>
                    <div style="display: inline-block; width: 15px; height: 18px; border: 1px solid #999999; text-align: center; line-height: 16px; font-size: 8.5pt; background: #f4f5f6; margin-right: -1px;">${r4}</div><div style="display: inline-block; width: 15px; height: 18px; border: 1px solid #999999; text-align: center; line-height: 16px; font-size: 8.5pt; background: #f4f5f6; margin-right: -1px;">${r5}</div><div style="display: inline-block; width: 15px; height: 18px; border: 1px solid #999999; text-align: center; line-height: 16px; font-size: 8.5pt; background: #f4f5f6; margin-right: -1px;">${r6}</div><div style="display: inline-block; width: 15px; height: 18px; border: 1px solid #999999; text-align: center; line-height: 16px; font-size: 8.5pt; background: #f4f5f6; margin-right: -1px;">${r7}</div>
                  </div>
                </div>

                <div style="margin-bottom: 6px; font-size: 9pt; font-weight: bold;">
                  <span style="display: inline-block; width: 120px;">Membership Status:</span>
                  <span style="background: #2a9d8f; color: #ffffff; padding: 2px 8px; font-size: 8pt; font-weight: bold; border-radius: 4px; text-transform: uppercase; display: inline-block;">${u.status || 'ACTIVE'}</span>
                </div>
              </td>
              <td style="width: 85px; text-align: right; vertical-align: top;">
                <div style="width: 75px; height: 85px; border: 1px dashed #0077b6; background: #fafafa; overflow: hidden; display:inline-block;">
                  <img src="${u.photoUrl || 'https://rosociety.vercel.app/ros%20logo.png'}" style="width:100%; height:100%; object-fit:cover;">
                </div>
              </td>
            </tr>
          </table>
          
          <div style="font-size: 9.5pt; color: #0077b6; border-left: 3px solid #0077b6; padding-left: 6px; margin: 10px 0 6px 0; font-weight: bold; text-transform: uppercase;">1. Member's Personal Information</div>
          <table style="width:100%; border-collapse: collapse; font-size: 8.5pt; margin-bottom: 8px;">
            <tr>
              <td style="padding: 5px 6px; border: 1px solid #cccccc; height: 25px; background: #f8f9fa; font-weight: bold; color: #333; width: 18%;">Name (Bangla):</td>
              <td colspan="3" style="padding: 5px 6px; border: 1px solid #cccccc; font-size:9pt; font-weight: bold;">${u.banglaName || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 5px 6px; border: 1px solid #cccccc; height: 25px; background: #f8f9fa; font-weight: bold; color: #333;">Name (English):</td>
              <td colspan="3" style="padding: 5px 6px; border: 1px solid #cccccc; font-weight: bold; text-transform: uppercase;">${u.englishName || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 5px 6px; border: 1px solid #cccccc; height: 25px; background: #f8f9fa; font-weight: bold; color: #333;">Father's Name:</td>
              <td style="padding: 5px 6px; border: 1px solid #cccccc; width: 32%;">${u.fatherName || 'N/A'}</td>
              <td style="padding: 5px 6px; border: 1px solid #cccccc; height: 25px; background: #f8f9fa; font-weight: bold; color: #333; width: 16%;">Mother's Name:</td>
              <td style="padding: 5px 6px; border: 1px solid #cccccc; width: 34%;">${u.motherName || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 5px 6px; border: 1px solid #cccccc; height: 25px; background: #f8f9fa; font-weight: bold; color: #333;">Mobile Number:</td>
              <td style="padding: 5px 6px; border: 1px solid #cccccc;">
                <div style="display: inline-block; vertical-align: middle;">
                  <div style="display: inline-block; width: 15px; height: 18px; border: 1px solid #999999; text-align: center; line-height: 16px; font-size: 8.5pt; background: #e2e4e6; margin-right: -1px; font-weight:bold;">${m0}</div>
                  <div style="display: inline-block; width: 15px; height: 18px; border: 1px solid #999999; text-align: center; line-height: 16px; font-size: 8.5pt; background: #f4f5f6; margin-right: -1px;">${m1}</div>
                  <div style="display: inline-block; width: 15px; height: 18px; border: 1px solid #999999; text-align: center; line-height: 16px; font-size: 8.5pt; background: #f4f5f6; margin-right: -1px;">${m2}</div>
                  <div style="display: inline-block; width: 15px; height: 18px; border: 1px solid #999999; text-align: center; line-height: 16px; font-size: 8.5pt; background: #f4f5f6; margin-right: -1px;">${m3}</div>
                  <div style="display: inline-block; width: 15px; height: 18px; border: 1px solid #999999; text-align: center; line-height: 16px; font-size: 8.5pt; background: #f4f5f6; margin-right: -1px;">${m4}</div>
                  <div style="display: inline-block; margin: 0 1px; font-weight: bold; color: #555;">-</div>
                  <div style="display: inline-block; width: 15px; height: 18px; border: 1px solid #999999; text-align: center; line-height: 16px; font-size: 8.5pt; background: #f4f5f6; margin-right: -1px;">${m5}</div>
                  <div style="display: inline-block; width: 15px; height: 18px; border: 1px solid #999999; text-align: center; line-height: 16px; font-size: 8.5pt; background: #f4f5f6; margin-right: -1px;">${m6}</div>
                  <div style="display: inline-block; width: 15px; height: 18px; border: 1px solid #999999; text-align: center; line-height: 16px; font-size: 8.5pt; background: #f4f5f6; margin-right: -1px;">${m7}</div>
                  <div style="display: inline-block; width: 15px; height: 18px; border: 1px solid #999999; text-align: center; line-height: 16px; font-size: 8.5pt; background: #f4f5f6; margin-right: -1px;">${m8}</div>
                  <div style="display: inline-block; width: 15px; height: 18px; border: 1px solid #999999; text-align: center; line-height: 16px; font-size: 8.5pt; background: #f4f5f6; margin-right: -1px;">${m9}</div>
                  <div style="display: inline-block; width: 15px; height: 18px; border: 1px solid #999999; text-align: center; line-height: 16px; font-size: 8.5pt; background: #f4f5f6; margin-right: -1px;">${m10}</div>
                </div>
              </td>
              <td style="padding: 5px 6px; border: 1px solid #cccccc; height: 25px; background: #f8f9fa; font-weight: bold; color: #333;">Email Address:</td>
              <td style="padding: 5px 6px; border: 1px solid #cccccc;">${u.email || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 5px 6px; border: 1px solid #cccccc; height: 25px; background: #f8f9fa; font-weight: bold; color: #333;">Date of Birth:</td>
              <td style="padding: 5px 6px; border: 1px solid #cccccc;">
                <div style="display: inline-block; vertical-align: middle;">
                  <div style="display: inline-block; width: 15px; height: 18px; border: 1px solid #999999; text-align: center; line-height: 16px; font-size: 8.5pt; background: #f4f5f6; margin-right: -1px;">${d0}</div><div style="display: inline-block; width: 15px; height: 18px; border: 1px solid #999999; text-align: center; line-height: 16px; font-size: 8.5pt; background: #f4f5f6; margin-right: -1px;">${d1}</div>
                  <div style="display: inline-block; margin: 0 1px; font-weight: bold; color: #555;">.</div>
                  <div style="display: inline-block; width: 15px; height: 18px; border: 1px solid #999999; text-align: center; line-height: 16px; font-size: 8.5pt; background: #f4f5f6; margin-right: -1px;">${d2}</div><div style="display: inline-block; width: 15px; height: 18px; border: 1px solid #999999; text-align: center; line-height: 16px; font-size: 8.5pt; background: #f4f5f6; margin-right: -1px;">${d3}</div>
                  <div style="display: inline-block; margin: 0 1px; font-weight: bold; color: #555;">.</div>
                  <div style="display: inline-block; width: 15px; height: 18px; border: 1px solid #999999; text-align: center; line-height: 16px; font-size: 8.5pt; background: #f4f5f6; margin-right: -1px;">${d4}</div><div style="display: inline-block; width: 15px; height: 18px; border: 1px solid #999999; text-align: center; line-height: 16px; font-size: 8.5pt; background: #f4f5f6; margin-right: -1px;">${d5}</div><div style="display: inline-block; width: 15px; height: 18px; border: 1px solid #999999; text-align: center; line-height: 16px; font-size: 8.5pt; background: #f4f5f6; margin-right: -1px;">${d6}</div><div style="display: inline-block; width: 15px; height: 18px; border: 1px solid #999999; text-align: center; line-height: 16px; font-size: 8.5pt; background: #f4f5f6; margin-right: -1px;">${d7}</div>
                </div>
                <div style="font-size: 7.5pt; margin-top:2px; font-weight:bold; color:#444;">${u.dob || 'N/A'}</div>
              </td>
              <td style="padding: 5px 6px; border: 1px solid #cccccc; height: 25px; background: #f8f9fa; font-weight: bold; color: #333;">Blood Group:</td>
              <td style="padding: 5px 6px; border: 1px solid #cccccc; font-weight: bold; color: #d90429;">${u.bloodGroup || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 5px 6px; border: 1px solid #cccccc; height: 25px; background: #f8f9fa; font-weight: bold; color: #333;">Gender:</td>
              <td style="padding: 5px 6px; border: 1px solid #cccccc;">
                <div style="display: block;">
                  <div style="display: inline-block; margin-right: 15px; font-weight: bold;">
                    <div style="display: inline-block; width: 14px; height: 14px; border: 1.5px solid #555; text-align: center; line-height: 10px; font-size: 9px; background: #fff; margin-right: 4px; vertical-align: middle;">${isMale}</div> <span>Male</span>
                  </div>
                  <div style="display: inline-block; margin-right: 15px; font-weight: bold;">
                    <div style="display: inline-block; width: 14px; height: 14px; border: 1.5px solid #555; text-align: center; line-height: 10px; font-size: 9px; background: #fff; margin-right: 4px; vertical-align: middle;">${isFemale}</div> <span>Female</span>
                  </div>
                </div>
              </td>
              <td style="padding: 5px 6px; border: 1px solid #cccccc; height: 25px; background: #f8f9fa; font-weight: bold; color: #333;">Occupation:</td>
              <td style="padding: 5px 6px; border: 1px solid #cccccc;">${u.profession || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 5px 6px; border: 1px solid #cccccc; height: 25px; background: #f8f9fa; font-weight: bold; color: #333;">Institution:</td>
              <td colspan="3" style="padding: 5px 6px; border: 1px solid #cccccc;">${u.institution || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 5px 6px; border: 1px solid #cccccc; height: 25px; background: #f8f9fa; font-weight: bold; color: #333;">Qualification:</td>
              <td style="padding: 5px 6px; border: 1px solid #cccccc;">${u.education || 'N/A'}</td>
              <td style="padding: 5px 6px; border: 1px solid #cccccc; height: 25px; background: #f8f9fa; font-weight: bold; color: #333;">Session/Year:</td>
              <td style="padding: 5px 6px; border: 1px solid #cccccc;">${u.academicYear || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 5px 6px; border: 1px solid #cccccc; height: 25px; background: #f8f9fa; font-weight: bold; color: #333;">Present Address:</td>
              <td colspan="3" style="padding: 5px 6px; border: 1px solid #cccccc;">${u.presentAddress || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 5px 6px; border: 1px solid #cccccc; height: 25px; background: #f8f9fa; font-weight: bold; color: #333;">Permanent Address:</td>
              <td colspan="3" style="padding: 5px 6px; border: 1px solid #cccccc;">${u.permanentAddress || 'N/A'}</td>
            </tr>
          </table>
          
          <div style="font-size: 9.5pt; color: #0077b6; border-left: 3px solid #0077b6; padding-left: 6px; margin: 10px 0 6px 0; font-weight: bold; text-transform: uppercase;">2. Terms of Membership & Declaration</div>
          <div style="font-size: 7.5pt; line-height: 1.4; color: #222; background: #fdfdfd; padding: 6px 10px; border: 1px solid #e0e0e0; border-radius: 4px; margin-bottom: 8px; text-align: justify;">
            1. <strong>Supreme Authority:</strong> If any member is found involved in activities contrary to the discipline, image, or ideology of the Rajshahi Olympiad Society (ROS), the authority reserves the sole and absolute right to cancel or suspend their membership at any time without prior notice.<br>
            2. I hereby declare that all the information provided above is true and accurate. I have digitally agreed to these terms and conditions through the online dashboard while generating this membership copy.
          </div>
          
          <table style="width: 100%; margin-top: 25px; border-collapse: collapse;">
            <tr>
              <td style="width: 33.33%; vertical-align: bottom; text-align: center;">
                <div style="width: 130px; margin: 0 auto 4px auto; border-top: 1px solid #333;"></div>
                <span style="font-size: 8.5pt;">Applicant's Signature</span>
              </td>
              
              <td style="width: 33.33%; vertical-align: bottom; text-align: center;">
                <div style="position: relative; width: 70px; height: 70px; margin: 0 auto; background: #ffffff;" id="pdf-qrcode-box"></div>
                <div style="font-size: 6.5pt; color: #555; margin-top: 4px; font-weight: bold;">SCAN TO VERIFY</div>
              </td>
              
              <td style="width: 33.33%; vertical-align: bottom; text-align: center;">
                <!-- ভেরিফাইড সিল ও সাইন এরিয়া (নির্দেশনা অনুযায়ী ফাঁকা রাখা হয়েছে) -->
                <div style="height: 25px;"></div>
                <div style="border-top: 1px solid #0077b6; padding-top: 4px; color: #0077b6; font-weight: bold; font-size: 8.5pt; width: 150px; margin: 0 auto;">
                  Authorized Signature & Seal
                </div>
              </td>
            </tr>
          </table>

          <div style="text-align: center; font-size: 8px; color: #e63946; background: #fff5f5; padding: 4px; border: 1px dashed #e63946; border-radius: 4px; margin-top: 12px; font-weight: bold;">
            * NOTE: This is a system-generated, digitally verified document. Since it supports real-time verification via database, no physical signature or seal is required.
          </div>
          
          <table style="width: 100%; margin-top: 8px; padding-top: 5px; border-top: 1px solid #eee; font-size: 7.5pt; color: #566573; border-collapse: collapse;">
            <tr>
              <td style="text-align: left; width: 33%;">🌐 rosociety.vercel.app</td>
              <td style="text-align: center; width: 34%;">📧 helpline.ros@gmail.com</td>
              <td style="text-align: right; width: 33%;">📞 +8801745-668545</td>
            </tr>
          </table>

          <table style="width: 100%; font-size: 8px; color: #666; margin-top: 12px; border-top: 1px solid #eee; padding-top: 4px; border-collapse: collapse;">
            <tr>
              <td style="text-align: left;">Generated On: ${new Date().toLocaleString()}</td>
              <td style="text-align: right;">Developed by: <strong>Utsab Sarker</strong></td>
            </tr>
          </table>
          
        </div>
      </div>
    </div>
  `;

  // কিউআর কোড জেনারেশন ডাটা বাইন্ডিং ইঞ্জিন
  let qrTextString = `--- ROS MEMBER VERIFICATION ---\n`;
  qrTextString += `Reg No: ${u.memberId || 'N/A'}\n`;
  qrTextString += `Status: ${(u.status || 'ACTIVE').toUpperCase()}\n`;
  qrTextString += `Name: ${u.englishName || 'N/A'}\n`;
  qrTextString += `Mobile: ${u.mobile || 'N/A'}\n`;
  qrTextString += `Email: ${u.email || 'N/A'}\n`;
  qrTextString += `Blood: ${u.bloodGroup || 'N/A'}\n`;
  qrTextString += `Institution: ${u.institution || 'N/A'}`;

  // হিডেন ডমে কিউআর কোড জেনারেট করা
  setTimeout(() => {
    new QRCode(document.getElementById("pdf-qrcode-box"), {
      text: qrTextString,
      width: 70,
      height: 70,
      colorDark : "#000000",
      colorLight : "#ffffff",
      correctLevel : QRCode.CorrectLevel.H
    });
  }, 50);
}

// জেএসপিডিএফ এবং এইচটিএমএল ইমেজ কনভার্টার মেকানিজম
async function downloadOfficialTemplatePDF() {
  if(!activePopupUser) return;
  
  if(typeof showLoader === 'function') showLoader(true, "অফিশিয়াল মেম্বারশিপ পিডিএফ জেনারেট হচ্ছে...");
  
  const element = document.getElementById("pdfInvoiceTemplate");
  
  try {
    // অফিশিয়াল html2canvas কনফিগারেশন রেঞ্জ
    const canvas = await html2canvas(element, {
      scale: 2, // হাই-রেজোলিউশন কোয়ালিটি নিশ্চিত করতে
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff"
    });
    
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const { jsPDF } = window.jspdf;
    
    // এ৪ পেজ সাইজ মেজারমেন্ট (Portrait মোড)
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; 
    const pageHeight = 295;  
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
    
    if(typeof showLoader === 'function') showLoader(false);
    pdf.save(`ROS_Form_${activePopupUser.memberId || 'Member'}.pdf`);
  } catch (err) {
    if(typeof showLoader === 'function') showLoader(false);
    console.error("پی ڈی ایف جنریشن فیل ہو گئی۔", err);
    alert("pdf জেনারেশন ব্যর্থ হয়েছে। নিশ্চিত করুন স্ক্রিপ্টে html2canvas লোড করা আছে।");
  }
}

// গ্লোবাল ফাংশনসমূহ লোড রাখার জন্য নিচে এক্সপোর্ট উইন্ডো ব্যবহার করা হলো
window.renderMemberManagementSection = renderMemberManagementSection;
window.populateDateFilter = populateDateFilter;
window.filterAndRenderMembersTable = filterAndRenderMembersTable;
window.renderTableUI = renderTableUI;
window.liveStatusUpdateDirect = liveStatusUpdateDirect;
window.openMemberModal = openMemberModal;
window.closeMemberModal = closeMemberModal;
window.downloadOfficialTemplatePDF = downloadOfficialTemplatePDF;