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

    <!-- ডাইনামিক মেম্বার ডিটেইলস পপআপ মডাল -->
    <div id="memberPopupModal" class="hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        <div id="modalPrintArea" class="p-6 space-y-6 flex-1 text-center">
          <div class="flex flex-col items-center justify-center">
            <div class="w-28 h-28 rounded-full border-2 border-[#00b4d8] p-0.5 bg-slate-950 overflow-hidden mb-3 shadow-lg">
              <img id="modal-photo" src="https://rosociety.vercel.app/ros%20logo.png" alt="Member Photo" class="w-full h-full object-cover rounded-full">
            </div>
            <div class="bg-slate-950/80 border border-slate-800 px-4 py-1.5 rounded-full text-xs font-mono text-[#ffd700] font-bold mb-1" id="modal-memberId-title">ROS-XXXX-XXXX</div>
            <h2 id="modal-englishName" class="text-lg font-bold text-white tracking-wide">English Name</h2>
          </div>

          <div class="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 grid grid-cols-3 gap-2 text-center text-xs">
            <div><span class="text-slate-500 font-semibold block mb-0.5">নিবন্ধনের তারিখ</span><span id="modal-regDateOnly" class="text-slate-200 font-mono">...</span></div>
            <div><span class="text-slate-500 font-semibold block mb-0.5">নিবন্ধনের সময়</span><span id="modal-regTimeOnly" class="text-slate-200 font-mono">...</span></div>
            <div><span class="text-slate-500 font-semibold block mb-0.5">বর্তমান স্ট্যাটাস</span><span id="modal-status-badge" class="font-bold uppercase px-2 py-0.5 rounded text-[10px] inline-block mt-0.5">...</span></div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-6 gap-3 text-left text-xs">
            <div class="bg-slate-950/30 p-3 rounded-lg border border-slate-800/40 md:col-span-6">
              <span class="text-slate-500 font-semibold block mb-0.5">Name (Bangla)</span>
              <span id="modal-banglaName" class="text-slate-200 font-medium">...</span>
            </div>
            <div class="bg-slate-950/30 p-3 rounded-lg border border-slate-800/40 md:col-span-3">
              <span class="text-slate-500 font-semibold block mb-0.5">Father's Name</span>
              <span id="modal-father" class="text-slate-200 font-medium">...</span>
            </div>
            <div class="bg-slate-950/30 p-3 rounded-lg border border-slate-800/40 md:col-span-3">
              <span class="text-slate-500 font-semibold block mb-0.5">Mother's Name</span>
              <span id="modal-mother" class="text-slate-200 font-medium">...</span>
            </div>
            <div class="bg-slate-950/30 p-3 rounded-lg border border-slate-800/40 md:col-span-3">
              <span class="text-slate-500 font-semibold block mb-0.5">Mobile Number</span>
              <span id="modal-mobile" class="text-slate-200 font-mono">...</span>
            </div>
            <div class="bg-slate-950/30 p-3 rounded-lg border border-slate-800/40 md:col-span-3">
              <span class="text-slate-500 font-semibold block mb-0.5">Email Address</span>
              <span id="modal-email" class="text-slate-200 font-mono">...</span>
            </div>
            <div class="bg-slate-950/30 p-3 rounded-lg border border-slate-800/40 md:col-span-2">
              <span class="text-slate-500 font-semibold block mb-0.5">জন্ম তারিখ (DOB)</span>
              <span id="modal-dob" class="text-slate-200 font-mono">...</span>
            </div>
            <div class="bg-slate-950/30 p-3 rounded-lg border border-slate-800/40 md:col-span-2">
              <span class="text-slate-500 font-semibold block mb-0.5">রক্তের গ্রুপ (Blood Group)</span>
              <span id="modal-blood" class="text-[#00b4d8] font-bold">...</span>
            </div>
            <div class="bg-slate-950/30 p-3 rounded-lg border border-slate-800/40 md:col-span-2">
              <span class="text-slate-500 font-semibold block mb-0.5">জেন্ডার (Gender)</span>
              <span id="modal-gender" class="text-slate-200">...</span>
            </div>
            <div class="bg-slate-950/30 p-3 rounded-lg border border-slate-800/40 md:col-span-3">
              <span class="text-slate-500 font-semibold block mb-0.5">Present Address</span>
              <span id="modal-present" class="text-slate-200">...</span>
            </div>
            <div class="bg-slate-950/30 p-3 rounded-lg border border-slate-800/40 md:col-span-3">
              <span class="text-slate-500 font-semibold block mb-0.5">Permanent Address</span>
              <span id="modal-permanent" class="text-slate-200">...</span>
            </div>
            <div class="bg-slate-950/30 p-3 rounded-lg border border-slate-800/40 md:col-span-2">
              <span class="text-slate-500 font-semibold block mb-0.5">Education</span>
              <span id="modal-education" class="text-slate-200">...</span>
            </div>
            <div class="bg-slate-950/30 p-3 rounded-lg border border-slate-800/40 md:col-span-2">
              <span class="text-slate-500 font-semibold block mb-0.5">Academic Year</span>
              <span id="modal-academic" class="text-slate-200 font-mono">...</span>
            </div>
            <div class="bg-slate-950/30 p-3 rounded-lg border border-slate-800/40 md:col-span-2">
              <span class="text-slate-500 font-semibold block mb-0.5">Profession</span>
              <span id="modal-profession" class="text-slate-200">...</span>
            </div>
            <div class="bg-slate-950/30 p-3 rounded-lg border border-slate-800/40 md:col-span-3">
              <span class="text-slate-500 font-semibold block mb-0.5">Institution</span>
              <span id="modal-institute" class="text-slate-200">...</span>
            </div>
            <div class="bg-slate-950/30 p-3 rounded-lg border border-slate-800/40 md:col-span-3">
              <span class="text-slate-500 font-semibold block mb-0.5">Whatsapp Number</span>
              <span id="modal-whatsapp" class="text-slate-200 font-mono">...</span>
            </div>
            <div class="bg-slate-950/30 p-3 rounded-lg border border-slate-800/40 md:col-span-3">
              <span class="text-slate-500 font-semibold block mb-0.5">FB ID Link</span>
              <span id="modal-fb" class="text-[#00b4d8] break-all">...</span>
            </div>
            <div class="bg-slate-950/30 p-3 rounded-lg border border-slate-800/40 md:col-span-3">
              <span class="text-slate-500 font-semibold block mb-0.5">NID/Birth Certificate Number</span>
              <span id="modal-nid" class="text-slate-200 font-mono">...</span>
            </div>
          </div>

          <div class="flex justify-between items-center border-t border-slate-800 pt-4 mt-5">
            <button onclick="downloadSingleTemplatePDF()" class="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer">
              <i class="fa-solid fa-file-pdf"></i> PDF ডাউনলোড
            </button>
            <button onclick="closeMemberModal()" class="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer">
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // ২. টেবিল ফিল্টার ও রেন্ডার ইঞ্জিন ইনিশিয়ালাইজেশন
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
    const res = await response.json();
    if(typeof showLoader === 'function') showLoader(false);
    if(res.success) {
      alert("সদস্যের স্ট্যাটাস লাইভ আপডেট করা হয়েছে!");
      
      // লোকাল ডাটা আপডেট করুন যেন রিরেন্ডার করলে ডাটা ঠিক থাকে
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
    document.getElementById('modal-regTimeOnly').innerText = parts[1];
  } else {
    document.getElementById('modal-regDateOnly').innerText = user.registrationDate || 'N/A';
    document.getElementById('modal-regTimeOnly').innerText = 'N/A';
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

function downloadSingleTemplatePDF() {
  if(!activePopupUser) return;
  window.open(`https://raw.githubusercontent.com/ros-admin/ROS-Website-Maker/refs/heads/main/Registration/Email/ApprovedEmailPDF.html`, '_blank');
}

function exportToExcel() {
  if(currentFilteredList.length === 0) { alert("এক্সপোর্ট করার মতো কোনো ডাটা নেই!"); return; }
  
  const formatData = currentFilteredList.map((u, i) => ({
    "क्रमिक नंबर": i + 1,
    "Registration Date": u.registrationDate || '',
    "Registration No": u.memberId || '',
    "Name (Bangla)": u.banglaName || '',
    "Name (English)": u.englishName || '',
    "Mobile Number": u.mobile || '',
    "Email Address": u.email || '',
    "Blood Group": u.bloodGroup || '',
    "Gender": u.gender || '',
    "Father's Name": u.fatherName || '',
    "Mother's Name": u.motherName || '',
    "DOB": u.dob || '',
    "Present Address": u.presentAddress || '',
    "Permanent Address": u.permanentAddress || '',
    "Education": u.education || '',
    "Academic Year": u.academicYear || '',
    "Profession": u.profession || '',
    "Institute": u.institution || '',
    "Whatsapp Number": u.whatsappNumber || '',
    "FB ID Link": u.facebookLink || '',
    "NID/Birth Certificate Number": u.nidOrBrn || '',
    "Status": u.status || ''
  }));

  const ws = XLSX.utils.json_to_sheet(formatData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Filtered_Members");
  XLSX.writeFile(wb, `ROS_Members_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
}

function exportToPDF() {
  if(currentFilteredList.length === 0) { alert("রিপোর্ট জেনারেট করার মতো কোনো ডাটা নেই!"); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('l', 'mm', 'a4');
  
  doc.setFont("Helvetica", "bold"); doc.setFontSize(16); doc.text("RAJSHAHI OLYMPIAD SOCIETY", 148, 15, { align: "center" });
  doc.setFontSize(11); doc.text("নিবন্ধনকারী সদস্যদের তালিকা", 148, 22, { align: "center" });

  const bodyRows = currentFilteredList.map((u, i) => [
    "", 
    i + 1,
    u.englishName || '',
    u.mobile || '',
    u.email || '',
    u.bloodGroup || '',
    u.dob || '',
    u.gender || '',
    (u.status || '').toUpperCase(),
    "" 
  ]);
  
  doc.autoTable({
    startY: 28,
    head: [['[ ]', 'ক্রমিক', 'ইংরেজি নাম', 'মোবাইল নাম্বার', 'ইমেইল এড্রেস', 'রক্তের গ্রুপ', 'জন্ম তারিখ', 'জেন্ডার', 'স্ট্যাটাস', 'কমেন্ট বক্স']],
    body: bodyRows,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], fontSize: 8, halign: 'center' },
    bodyStyles: { fontSize: 8 },
    columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 12 }, 9: { cellWidth: 30 } }
  });

  const now = new Date();
  const timeStr = `ডাউনলোড সময়: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(8);
  doc.text(timeStr, 14, finalY);
  doc.text("Developed By, UTSAB SARKER", 240, finalY);

  doc.save(`ROS_Members_List_${new Date().toISOString().split('T')[0]}.pdf`);
}
