/**
 * ROS Nexus ERP - Dashboard Module
 * গুগল অ্যাপস স্ক্রিপ্ট (Google Sheet Database) চালিত ড্যাশবোর্ড
 */
function loadDashboardModule(contentRoot) {
  // ১. সেশন থেকে বর্তমান লগইন করা অ্যাডমিনের ডেটা নেওয়া (যা dashboard.html এ সেট করা হয়েছে)
  const sessionData = localStorage.getItem('ros_user') || sessionStorage.getItem('ros_user');
  const adminData = sessionData ? JSON.parse(sessionData) : { englishName: 'অ্যাডমিন', fullName: 'অ্যাডমিন' };

  // ২. ড্যাশবোর্ডের মূল সাইবার-গ্লাস ইন্টারফেস রেন্ডার করা
  contentRoot.innerHTML = `
    <div class="cyber-glass" style="padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid var(--neon-blue);">
      <h2 style="font-size: 20px;">স্বাগতম, <span style="color: var(--neon-blue); text-shadow: 0 0 10px rgba(0,180,216,0.3);">${adminData.banglaName || adminData.englishName || adminData.fullName}</span></h2>
      <p style="font-size: 13px; color: var(--text-muted); margin-top: 5px;">ডাটাবেজ স্ট্যাটাস: <span style="color: var(--neon-green);">গুগল শীট (লাইভ)</span> | তারিখ: <span>${new Date().toLocaleDateString('bn-BD')}</span></p>
    </div>

    <p style="font-size: 13px; color: var(--neon-blue); margin-bottom: 10px;"><i class="fas fa-mouse-pointer"></i> যেকোনো সেকশনের বিস্তারিত তথ্য ও অ্যাকশন প্যানেল দেখতে কার্ডে ক্লিক করুন:</p>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; margin-bottom: 25px;">
      
      <div class="cyber-glass dashboard-click-redirect-trigger" data-target-mod="members" style="padding: 20px; border-radius: 6px; cursor: pointer; position: relative; transition: all 0.3s ease;">
        <div style="font-size: 12px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">মোট সদস্য সংখ্যা</div>
        <div style="font-size: 32px; font-weight: bold; margin: 10px 0; color: #fff;" id="cntTotalMembers">⏳</div>
        <div style="font-size: 11px; color: var(--neon-blue);"><i class="fas fa-arrow-right"></i> ডাটাবেজ ভিউ করুন</div>
      </div>

      <div class="cyber-glass dashboard-click-redirect-trigger" data-target-mod="members" style="padding: 20px; border-radius: 6px; cursor: pointer; position: relative; transition: all 0.3s ease;">
        <div style="font-size: 12px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">অ্যাক্টিভ সদস্য সংখ্যা</div>
        <div style="font-size: 32px; font-weight: bold; margin: 10px 0; color: var(--neon-green);" id="cntActiveMembers">⏳</div>
        <div style="font-size: 11px; color: var(--neon-blue);"><i class="fas fa-arrow-right"></i> ডাটাবেজ ভিউ করুন</div>
      </div>

      <div class="cyber-glass dashboard-click-redirect-trigger" data-target-mod="members" style="padding: 20px; border-radius: 6px; cursor: pointer; position: relative; transition: all 0.3s ease;">
        <div style="font-size: 12px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">পেন্ডিং মেম্বার রিকোয়েস্ট</div>
        <div style="font-size: 32px; font-weight: bold; margin: 10px 0; color: var(--neon-yellow);" id="cntPendingMembers">⏳</div>
        <div style="font-size: 11px; color: var(--neon-blue);"><i class="fas fa-arrow-right"></i> মেম্বার ডাটাবেজে যান</div>
      </div>

      <div class="cyber-glass dashboard-click-redirect-trigger" data-target-mod="members" style="padding: 20px; border-radius: 6px; cursor: pointer; position: relative; transition: all 0.3s ease;">
        <div style="font-size: 12px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">সাসপেন্ডেড অ্যাকাউন্ট</div>
        <div style="font-size: 32px; font-weight: bold; margin: 10px 0; color: var(--neon-red);" id="cntSuspendedMembers">⏳</div>
        <div style="font-size: 11px; color: var(--neon-blue);"><i class="fas fa-arrow-right"></i> ডাটাবেজ ভিউ করুন</div>
      </div>

    </div>

    <div class="cyber-glass" style="padding: 20px; border-radius: 8px;">
      <h3 style="font-size: 16px; margin-bottom: 12px; color: #fff;"><i class="fas fa-shield-alt"></i> সিস্টেম সিকিউরিটি লগ ও প্রোটোকল নোটিশ</h3>
      <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px; font-size: 12.5px; color: var(--text-muted); line-height: 1.5;">
        <li><span style="color: var(--neon-green);">● SECURITY:</span> প্রতিটি সেশন গুগল ক্লাউড সিকিউর প্রোটোকলের মাধ্যমে সুরক্ষিত। কর্তৃপক্ষের অনুমতি ব্যতিরেকে কোনো তথ্য ডিরেক্টরি থেকে কপি বা এক্সপোর্ট করা দণ্ডনীয় অপরাধ।</li>
        <li><span style="color: var(--neon-blue);">● DISCONNECT PROTOCOL:</span> প্যানেল ব্যবহার শেষে ব্রাউজার বন্ধ করার পূর্বে অবশ্যই ড্যাশবোর্ড থেকে নিরাপদভাবে লগআউট (Sign Out) সম্পন্ন করুন।</li>
      </ul>
    </div>
  `;

  // ---- 🖱️ কার্ড ক্লিক এবং ডাইনামিক সাইডবার রাউটিং হ্যান্ডলার ----
  document.querySelectorAll('.dashboard-click-redirect-trigger').forEach(card => {
    card.addEventListener('click', (e) => {
      const targetModuleId = e.currentTarget.getAttribute('data-target-mod');
      const sidebarMenuLink = document.querySelector(`.menu-item a[data-mod-id="${targetModuleId}"]`);
      
      if (sidebarMenuLink) {
        sidebarMenuLink.click();
      } else {
        alert("নির্দিষ্ট মডিউলটি সিস্টেমে খুঁজে পাওয়া যায়নি।");
      }
    });
  });

  // ---- 📊 গুগল শীট থেকে লাইভ মেম্বারশিপ কাউন্টার ফেচিং ----
  fetchLiveCounters();
}

/**
 * গুগল অ্যাপস স্ক্রিপ্ট অ্যাপ এপিআই (API) থেকে রিয়েল-টাইম ডাটা কাউন্টার লোড করার ফাংশন
 */
async function fetchLiveCounters() {
  try {
    // SCRIPT_URL গ্লোবালি dashboard.html থেকে এক্সেস পাবে
    if (typeof SCRIPT_URL === 'undefined') return;

    // মেম্বার লিস্ট রিকোয়েস্ট মেথড (আপনার স্ক্রিপ্টের API অ্যাকশন অনুযায়ী)
    const response = await fetch(`${SCRIPT_URL}?action=getMembers`);
    const result = await response.json();

    if (result && result.status === 'success' && Array.isArray(result.data)) {
      const allMembers = result.data;

      // রোল এবং স্ট্যাটাস অনুযায়ী মেম্বারদের ফিল্টার ও গণনা
      const totalMembers = allMembers.filter(m => m.role === 'member').length;
      const activeCount = allMembers.filter(m => m.role === 'member' && m.status === 'active').length;
      const pendingCount = allMembers.filter(m => m.role === 'member' && m.status === 'pending').length;
      const suspendedCount = allMembers.filter(m => m.role === 'member' && m.status === 'suspended').length;

      // UI উপাদান আপডেট
      const elTotal = document.getElementById('cntTotalMembers');
      const elActive = document.getElementById('cntActiveMembers');
      const elPending = document.getElementById('cntPendingMembers');
      const elSuspended = document.getElementById('cntSuspendedMembers');

      if (elTotal) elTotal.innerText = totalMembers;
      if (elActive) elActive.innerText = activeCount;
      if (elPending) elPending.innerText = pendingCount;
      if (elSuspended) elSuspended.innerText = suspendedCount;
    } else {
      console.error("ডাটাবেজ থেকে ভুল রেসপন্স এসেছে।");
      setCountersError();
    }
  } catch (err) {
    console.error("Dashboard Live Sheet Counters Error:", err);
    setCountersError();
  }
}

function setCountersError() {
  const ids = ['cntTotalMembers', 'cntActiveMembers', 'cntPendingMembers', 'cntSuspendedMembers'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerText = "❌";
  });
}

// গ্লোবাল স্কোপে ব্যবহারের জন্য উইন্ডো অবজেক্টে বাইন্ড করা হলো
window.loadDashboardModule = loadDashboardModule;

