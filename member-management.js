/**
 * member-management.js
 * মেম্বার ম্যানেজমেন্ট সেকশন, ফিল্টারিং, টেবিল ভিউ, পপআপ এবং এক্সপোর্ট ইঞ্জিনের সমস্ত লজিক
 */

// গুগল শিটের তারিখগুলো অটোমেটিক ডাইনামিক ফিল্টারে রূপান্তরকারী
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

// সমন্বিত মাল্টি-ফিল্টারিং এবং ক্রমানুসারে সাজানোর কোর ইঞ্জিন
function filterAndRenderMembersTable() {
  const searchVal = document.getElementById('memberSearchInput').value.toLowerCase().trim();
  const statusFilter = document.getElementById('filterStatus').value;
  const dateFilter = document.getElementById('filterDate').value;
  const bloodFilter = document.getElementById('filterBlood').value;
  const genderFilter = document.getElementById('filterGender').value;
  const sortFilter = document.getElementById('filterSort').value;

  currentFilteredList = allUsersData.filter(user => {
    // ১. টেক্সট সার্চ ম্যাচিং
    const id = String(user.memberId || '').toLowerCase();
    const name = String(user.englishName || '').toLowerCase();
    const mob = String(user.mobile || '').toLowerCase();
    const em = String(user.email || '').toLowerCase();
    const matchesSearch = id.includes(searchVal) || name.includes(searchVal) || mob.includes(searchVal) || em.includes(searchVal);

    // ২. স্ট্যাটাস ফিল্টার ম্যাচিং
    const status = String(user.status || '').toLowerCase().trim();
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') { matchesStatus = (status === 'active' || status === 'approved'); }
      else { matchesStatus = (status === statusFilter); }
    }

    // ৩. তারিখ ফিল্টার ম্যাচিং
    let matchesDate = true;
    if(dateFilter !== 'all' && user.registrationDate) {
      matchesDate = user.registrationDate.split(' ')[0] === dateFilter;
    }

    // ৪. ব্লাড গ্রুপ ফিল্টার ম্যাচিং
    let matchesBlood = true;
    if(bloodFilter !== 'all') {
      matchesBlood = String(user.bloodGroup || '').trim() === bloodFilter;
    }

    // ৫. জেন্ডার ফিল্টার ম্যাচিং
    let matchesGender = true;
    if(genderFilter !== 'all') {
      matchesGender = String(user.gender || '').trim() === genderFilter;
    }

    return matchesSearch && matchesStatus && matchesDate && matchesBlood && matchesGender;
  });

  // ৬. শর্ত অনুযায়ী ডাটা সর্টিং অপারেশন
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

// ইউজার ইন্টারফেস টেবিল জেনারেটর
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

// লাইভ স্ট্যাটাস আপডেট ইঞ্জিন
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
      if (typeof fetchInitialData === 'function') await fetchInitialData();
    } else { alert(res.error || "ত্রুটি ঘটেছে।"); }
  } catch (err) { 
    if(typeof showLoader === 'function') showLoader(false);
    alert("সার্ভার সংযোগ ত্রুটি।"); 
  }
}

// বিস্তারিত পপআপ মডাল সেটআপ ও ওপেন লজিক
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

// সিঙ্গেল মেম্বার কাস্টম পিডিএফ ডাউনলোড ইঞ্জিন
function downloadSingleTemplatePDF() {
  if(!activePopupUser) return;
  window.open(`https://raw.githubusercontent.com/ros-admin/ROS-Website-Maker/refs/heads/main/Registration/Email/ApprovedEmailPDF.html`, '_blank');
}

// এক্সেল এক্সপোর্ট জেনারেটর
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

// পিডিএফ জেনারেটর (Landscape মোড)
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
