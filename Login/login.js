// আপনার গুগল ওয়েব অ্যাপ ইউআরএল
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxW3ab4dyolenvfpcM8o3vGmevQEjFLgRgZxYFajX0L5yjPSeDfk-WtSQmAtGhQrNtzdQ/exec";

// পাসওয়ার্ড দেখা/লুকানোর লজিক
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

if (togglePassword && passwordInput) {
  togglePassword.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePassword.classList.toggle('fa-eye');
    togglePassword.classList.toggle('fa-eye-slash');
  });
}

// লগইন ফর্ম সাবমিশন হ্যান্ডলার
const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = passwordInput.value;

  // বাটন ডিজেবল ও লোডিং টেক্সট শো করা
  loginBtn.disabled = true;
  loginBtn.innerText = "যাচাই করা হচ্ছে...";

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: "login",
        email: email,
        password: password
      })
    });

    const resData = await response.json();

    if (resData.success) {
      // সেশন বা লোকাল স্টোরেজে ইউজার ডেটা সেভ করা (ভবিষ্যতে ড্যাশবোর্ডে অ্যাক্সেস করার জন্য)
      const storage = document.getElementById('rememberMe').checked ? localStorage : sessionStorage;
      storage.setItem('ros_user', JSON.stringify(resData.userData));

      alert(`সফলভাবে লগইন হয়েছে! স্বাগতম, ${resData.userData.englishName}`);
      
      // ড্যাশবোর্ড বা হোম পেজে রিডাইরেক্ট করুন (আপনার রুট অনুযায়ী পাথ চেঞ্জ করতে পারেন)
      window.location.href = "../Dashboard/"; 
    } else {
      // এডমিন পেন্ডিং, সাসপেন্ডেড বা ভুল পাসওয়ার্ডের এরর মেসেজ সরাসরি দেখাবে
      alert(resData.error);
    }
  } catch (err) {
    alert("নেটওয়ার্ক ত্রুটি! অনুগ্রহ করে ইন্টারনেট কানেকশন চেক করে আবার চেষ্টা করুন।");
  } finally {
    // বাটন আগের অবস্থায় ফিরিয়ে নেওয়া
    loginBtn.disabled = false;
    loginBtn.innerText = "লগইন করুন";
  }
});
