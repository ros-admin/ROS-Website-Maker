/**
 * ROS Nexus ERP - Dashboard Module
 * সম্পূর্ণভাবে গুগল শীট ব্যাকএন্ড এপিআই-এর সাথে কানেক্টেড লাইভ ডাটা জোন
 */
function loadDashboardModule(contentRoot, currentAdminData, SCRIPT_URL) {
  contentRoot.innerHTML = `
    <div class="cyber-glass" style="padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid var(--neon-blue);">
      <h2 style="font-size: 20px;">স্বাগতম, <span style="color: var(--neon-blue); text-shadow: 0 0 10px rgba(0,180,216,0.3);">${currentAdminData.fullName || 'অ্যাডমিন'}</span></h2>
      <p style="font-size: 13px; color: var(--text-muted); margin-top: 5px;">সার্ভার স্ট্যাটাস: <span style="color: var(--neon-green);">গুগল শীট (লাইভ)</span> | তারিখ: <span>${new Date().toLocaleDateString('bn-BD')}</span></p>
    </div>

    <p style="font-size: 13px; color: var(--neon-blue); margin-bottom: 10px;"><i class="fas fa-mouse-pointer"></i> লাইভ অ্যাকশন প্যানেল দেখতে নিচের কার্ডগুলোতে ক্লিক করুন:</p>
    
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
        <li><span style="color: var(--neon-green);">● SECURITY:</span> প্রতিটি সেশন গুগল ক্লাউড ডেটাবেজ এন্ড-টু-এন্ড এনক্রিপশনের মাধ্যমে সুরক্ষিত। কর্তৃপক্ষের অনুমতি ব্যতিরেকে কোনো তথ্য ডিরেক্টরি থেকে কপি বা এক্সপোর্ট করা দণ্ডনীয় অপরাধ।</li>
        <li><span style="color: var(--neon-blue);">● DISCONNECT PROTOCOL:</span> প্যানেল ব্যবহার শেষে ব্রাউজার বন্ধ করার পূর্বে অবশ্যই ড্যাশবোর্ড থেকে সুরক্ষিতভাবে লগআউট সম্পন্ন করুন।</li>
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

  // ---- 📊 গুগল শীট ডেটা ফেচিং এবং রিয়েল-টাইম কাউন্টার লজিক ----
  async function getLiveCounters() {
    try {
      // গুগল শীটের Users ট্যাব থেকে সমস্ত ডেটা রিকোয়েস্ট করা হচ্ছে
      const response = await fetch(`${SCRIPT_URL}?action=getMembers`);
      const resData = await response.json();

      if (resData && resData.status === "success" && Array.isArray(resData.data)) {
        const usersList = resData.data;

        // রোল এবং স্ট্যাটাস ফিল্টারিং লজিক (আপনার রিকোয়েস্ট অনুযায়ী)
        const total = usersList.filter(u => u.role === "member").length;
        const active = usersList.filter(u => u.role === "member" && u.status === "active").length;
        const pending = usersList.filter(u => u.role === "member" && u.status === "pending").length;
        const suspended = usersList.filter(u => u.role === "member" && u.status === "suspended").length;

        // ডমে (DOM) ডেটা ইনজেকশন
        if(document.getElementById('cntTotalMembers')) document.getElementById('cntTotalMembers').innerText = total;
        if(document.getElementById('cntActiveMembers')) document.getElementById('cntActiveMembers').innerText = active;
        if(document.getElementById('cntPendingMembers')) document.getElementById('cntPendingMembers').innerText = pending;
        if(document.getElementById('cntSuspendedMembers')) document.getElementById('cntSuspendedMembers').innerText = suspended;

      } else {
        throw new Error("Invalid API response format");
      }
    } catch (err) {
      console.error("Dashboard Sheet Counter Fetching Error:", err);
      // এরর আসলে ক্রস সাইন দেখাবে
      ['cntTotalMembers', 'cntActiveMembers', 'cntPendingMembers', 'cntSuspendedMembers'].forEach(id => {
        if(document.getElementById(id)) document.getElementById(id).innerText = "❌";
      });
    }
  }

  // কাউন্টার মেথড এক্সিকিউশন
  getLiveCounters();
}

window.loadDashboardModule = loadDashboardModule;
