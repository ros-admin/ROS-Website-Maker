// Google Sheet Configuration
const SHEET_NAME = "Users";
const SETTINGS_SHEET = "Settings";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    if (action === "sendOtp") {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName(SHEET_NAME);
      if (sheet) {
        const dataRange = sheet.getDataRange().getValues();
        const inputEmail = data.email.trim().toLowerCase();
        for (let i = 1; i < dataRange.length; i++) {
          if (dataRange[i][6].toString().trim().toLowerCase() === inputEmail) {
            return ContentService.createTextOutput(JSON.stringify({ 
              success: false, 
              error: "This email is already registered. Please login." 
            })).setMimeType(ContentService.MimeType.JSON);
          }
        }
      }
      return sendOtpEmail(data.email, data.englishName || "Registrant");
    } else if (action === "register") {
      return handleRegistration(data);
    } else if (action === "login") {
      return handleLogin(data);
    } else if (action === "sendResetOtp") {
      return handleSendResetOtp(data.email);
    } else if (action === "resetPassword") {
      return handleResetPassword(data);
    } else if (action === "updateStatus") {
      // এডমিন প্যানেল অ্যাকশন হ্যান্ডলার
      return handleStatusUpdate(data);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

// SHA-256 পাসওয়ার্ড হ্যাশিং ইঞ্জিন
function hashPassword(password) {
  const rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password, Utilities.Charset.UTF_8);
  let output = "";
  for (let i = 0; i < rawHash.length; i++) {
    let byteValue = rawHash[i];
    if (byteValue < 0) byteValue += 256;
    let byteString = byteValue.toString(16);
    if (byteString.length == 1) byteString = "0" + byteString;
    output += byteString;
  }
  return output;
}
// ওটিপি ভেরিফাই এবং নিরাপদ মেম্বার নিবন্ধন প্রসেস
function handleRegistration(info) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const settingsSheet = ss.getSheetByName(SETTINGS_SHEET);
  const settingsData = settingsSheet.getDataRange().getValues();
  let otpValid = false;
  let otpRowIndex = -1;
  const now = new Date().getTime();

  for (let i = 1; i < settingsData.length; i++) {
    if (settingsData[i][0] === info.email && settingsData[i][1].toString() === info.otp.toString() && now < settingsData[i][2]) {
      otpValid = true;
      otpRowIndex = i + 1;
      break;
    }
  }

  if (!otpValid) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: "অবৈধ অথবা মেয়াদোত্তীর্ণ OTP!" })).setMimeType(ContentService.MimeType.JSON);
  }

  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["Member ID", "Bangla Name", "English Name", "Father Name", "Mother Name", "Mobile", "Email", "Blood Group", "Gender", "DOB", "Present Address", "Permanent Address", "Education", "Academic Year", "Profession", "Institution", "Photo URL", "WhatsApp", "Facebook", "NID/BRN", "Password Hash", "Status", "Role", "Created At"]);
  }
  
  const currentData = sheet.getDataRange().getValues();
  const targetEmail = info.email.trim().toLowerCase();

  for (let i = 1; i < currentData.length; i++) {
    if (currentData[i][6].toString().trim().toLowerCase() === targetEmail) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        error: "দুঃখিত, এই ইমেইলটি দিয়ে ইতিমধ্যে নিবন্ধন সম্পন্ন হয়ে গেছে! অনুগ্রহ করে লগইন করুন।" 
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  let nextNumber = 1; 
  if (currentData.length > 1) {
    const lastMemberId = currentData[currentData.length - 1][0].toString();
    const parts = lastMemberId.split('-');
    if (parts.length === 3) {
      const lastNum = parseInt(parts[2], 10);
      if (!isNaN(lastNum)) nextNumber = lastNum + 1;
    }
  }
  
  const memberId = "ROS-2026-" + String(nextNumber).padStart(4, '0');
  const hashedPassword = hashPassword(info.password);
  
  sheet.appendRow([
    memberId, info.banglaName, info.englishName, info.fatherName, info.motherName,
    info.mobileNumber, info.email, info.bloodGroup, info.gender, info.dob,
    info.presentAddress, info.permanentAddress, info.education, info.academicYear,
    info.profession, info.institution, info.photoUrl, info.whatsappNumber,
    info.facebookLink, info.nidOrBrn, hashedPassword, "pending", "member", new Date().toISOString()
  ]);

  if (otpRowIndex > -1) settingsSheet.deleteRow(otpRowIndex);

  return ContentService.createTextOutput(JSON.stringify({ success: true, memberId: memberId })).setMimeType(ContentService.MimeType.JSON);
}
// রোল ও স্ট্যাটাস ভিত্তিক লগইন ভেরিফিকেশন
function handleLogin(credentials) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: "কোনো রেজিস্টার্ড ডেটাবেজ খুঁজে পাওয়া যায়নি!" })).setMimeType(ContentService.MimeType.JSON);
  }
  
  const data = sheet.getDataRange().getValues();
  const inputEmail = credentials.email.trim().toLowerCase();
  const inputHash = hashPassword(credentials.password);
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[6].toString().trim().toLowerCase() === inputEmail) {
      if (row[20].toString() === inputHash) {
        
        const accountStatus = row[21].toString().trim().toLowerCase();
        const userRole = row[22].toString().trim().toLowerCase();
        
        const managementRoles = [
          "admin", "president", "vice_president", "general_secretary", 
          "joint_general_secretary", "organizing_secretary", "treasurer", 
          "education_secretary", "event_secretary", "pr_secretary", "it_secretary", "executive_member"
        ];

        // স্ট্যাটাস লকিং মেকানিজম
        if (!managementRoles.includes(userRole)) {
          if (accountStatus === "pending") {
            return ContentService.createTextOutput(JSON.stringify({ 
              success: false, 
              error: "আপনার আবেদনটি বর্তমানে পেন্ডিং রয়েছে। এডমিন ভেরিফিকেশন সম্পন্ন হলে লগইন করতে পারবেন।" 
            })).setMimeType(ContentService.MimeType.JSON);
          } else if (accountStatus === "suspended") {
            return ContentService.createTextOutput(JSON.stringify({ 
              success: false, 
              error: "দুঃখিত, আপনার অ্যাকাউন্টটি সাসপেন্ড করা হয়েছে। অনুগ্রহ করে এডমিনের সাথে যোগাযোগ করুন।" 
            })).setMimeType(ContentService.MimeType.JSON);
          } else if (accountStatus === "inactive") {
            return ContentService.createTextOutput(JSON.stringify({ 
              success: false, 
              error: "আপনার অ্যাকাউন্টটি বর্তমানে ইনঅ্যাক্টিভ রয়েছে।" 
            })).setMimeType(ContentService.MimeType.JSON);
          }
        }
        
        return ContentService.createTextOutput(JSON.stringify({ 
          success: true, 
          userData: { memberId: row[0], banglaName: row[1], englishName: row[2], email: row[6], photoUrl: row[16], role: userRole, status: accountStatus } 
        })).setMimeType(ContentService.MimeType.JSON);
        
      } else {
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: "ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।" })).setMimeType(ContentService.MimeType.JSON);
      }
    }
  }
  return ContentService.createTextOutput(JSON.stringify({ success: false, error: "এই ইমেইল এড্রেস দিয়ে কোনো অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।" })).setMimeType(ContentService.MimeType.JSON);
}
// এডমিন অ্যাকশন এবং ওটিপি/স্ট্যাটাস আপডেট ইঞ্জিন
function handleStatusUpdate(adminData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return ContentService.createTextOutput(JSON.stringify({ success: false, error: "ডাটাবেজ পাওয়া যায়নি।" })).setMimeType(ContentService.MimeType.JSON);
  
  const data = sheet.getDataRange().getValues();
  const targetMemberId = adminData.memberId.toString().trim();
  const newStatus = adminData.status.toString().trim().toLowerCase();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString().trim() === targetMemberId) {
      const currentStatus = data[i][21].toString().trim().toLowerCase();
      
      sheet.getRange(i + 1, 22).setValue(newStatus);
      
      // শুধুমাত্র প্রথমবার অথবা পরবর্তীতে এপ্রুভ (Active) করলে মেইল ও পিডিএফ যাবে
      if (newStatus === "active" && currentStatus !== "active") {
        sendApprovalEmail(data[i]);
      }
      
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে।" })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  return ContentService.createTextOutput(JSON.stringify({ success: false, error: "মেম্বার আইডি খুঁজে পাওয়া যায়নি।" })).setMimeType(ContentService.MimeType.JSON);
}

// এপ্রুভাল অভিনন্দন ইমেইল এবং স্বয়ংক্রিয় পিডিএফ অ্যাটাচমেন্ট জেনারেটর
function sendApprovalEmail(row) {
  const memberData = {
    memberId: row[0], banglaName: row[1], englishName: (row[2] || 'MEMBER').toUpperCase(),
    fatherName: row[3], motherName: row[4], mobile: row[5], email: row[6],
    blood: row[7], gender: row[8] === 'Female' ? 'Female' : (row[8] === 'Male' ? 'Male' : row[8]),
    dob: row[9], curAddr: row[10], perAddr: row[11], edu: row[12], session: row[13],
    prof: row[14], inst: row[15], photoUrl: row[16],
    role: row[22] === 'general_member' ? 'সাধারণ সদস্য' : (row[22] === 'member' ? 'সদস্য' : row[22]),
    createdAt: row[23] ? new Date(row[23]).toLocaleDateString('bn-BD') : new Date().toLocaleDateString('bn-BD')
  };

  const photoHtml = memberData.photoUrl ? 
    `<img src="${memberData.photoUrl}" style="width:100%; height:100%; object-fit:cover;">` : 
    `<div style="font-size:10px; color:#777; text-align:center; padding-top:40px;">ছবি নেই</div>`;

  const now = new Date();
  const formattedTimeStr = `ডাউনলোড সময়: ${now.toLocaleDateString('bn-BD')} | সময়: ${now.toLocaleTimeString('bn-BD')}`;
const pdfHtmlTemplate = `
    <div style="width:535pt; font-family:'Arial', sans-serif; position:relative; box-sizing:border-box; padding:25pt; border:2.5pt double #0077b6; background:#ffffff; color:#000000;">
      <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%) rotate(-30deg); opacity:0.03; font-size:38px; font-weight:bold; color:#000; text-align:center; width:100%; pointer-events:none; white-space:nowrap; z-index:1;">
        RAJSHAHI OLIMPIAD SOCIETY
      </div>
      <div style="text-align:center; border-bottom:2px solid #0077b6; padding-bottom:8px; margin-bottom:12px; position:relative; z-index:2;">
        <img src="https://ros-admin.github.io/Rajshahi-Olimpiad-Society/ros%20logo%20transparent.png" style="width:50px; height:50px; margin-bottom:2px;">
        <h1 style="font-size:17px; font-weight:700; color:#0056b3; margin:0;">রাজশাহী অলিম্পিয়াড সোসাইটি</h1>
        <p style="font-size:8.5px; color:#555; margin:1px 0 0 0; text-transform:uppercase; letter-spacing:0.5px;">Rajshahi Olympiad Society</p>
        <div style="display:inline-block; background:#0077b6; color:#fff; padding:2px 10px; font-size:9.5px; font-weight:bold; border-radius:3px; margin-top:5px;">সদস্য নিবন্ধন ফরম</div>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:12px; position:relative; z-index:2; width:100%;">
        <div style="font-size:10px; line-height:1.6;">
          <p style="margin:2px 0;"><strong>নিবন্ধন নাম্বার:</strong> <span style="color:#0077b6; font-weight:bold;">${memberData.memberId}</span></p>
          <p style="margin:2px 0;"><strong>নিবন্ধনের তারিখ:</strong> <span>${memberData.createdAt}</span></p>
          <p style="margin:2px 0;"><strong>সদস্যের ধরন:</strong> <span style="color:#0056b3; font-weight:bold;">${memberData.role}</span></p>
        </div>
        <div style="width:85px; height:100px; border:1px dashed #0077b6; box-sizing:border-box; background:#fafafa; overflow:hidden;">
          ${photoHtml}
        </div>
      </div>
      <h3 style="font-size:11px; color:#0077b6; border-left:3px solid #0077b6; padding-left:6px; margin-bottom:6px;">১. সদস্যের বিস্তারিত তথ্যাবলী</h3>
      <table style="width:100%; border-collapse:collapse; font-size:9.5px; margin-bottom:12px; position:relative; z-index:2;">
        <tr><td style="padding:5px; border:1px solid #ccc; width:18%; background:#fcfcfc; font-weight:bold;">নাম (বাংলা):</td><td style="padding:5px; border:1px solid #ccc;" colspan="3">${memberData.banglaName}</td></tr>
        <tr><td style="padding:5px; border:1px solid #ccc; background:#fcfcfc; font-weight:bold;">Name (English):</td><td style="padding:5px; border:1px solid #ccc;" colspan="3"><strong>${memberData.englishName}</strong></td></tr>
        <tr><td style="padding:5px; border:1px solid #ccc; background:#fcfcfc; font-weight:bold;">বাবার নাম:</td><td style="padding:5px; border:1px solid #ccc; width:32%;">${memberData.fatherName}</td><td style="padding:5px; border:1px solid #ccc; width:16%; background:#fcfcfc; font-weight:bold;">মায়ের নাম:</td><td style="padding:5px; border:1px solid #ccc; width:34%;">${memberData.motherName}</td></tr>
        <tr><td style="padding:5px; border:1px solid #ccc; background:#fcfcfc; font-weight:bold;">মোবাইল নম্বর:</td><td style="padding:5px; border:1px solid #ccc;">${memberData.mobile}</td><td style="padding:5px; border:1px solid #ccc; background:#fcfcfc; font-weight:bold;">ইমেইল এড্রেস:</td><td style="padding:5px; border:1px solid #ccc; font-size:8.5px;">${memberData.email}</td></tr>
        <tr><td style="padding:5px; border:1px solid #ccc; background:#fcfcfc; font-weight:bold;">জন্মতারিখ:</td><td style="padding:5px; border:1px solid #ccc;">${memberData.dob}</td><td style="padding:5px; border:1px solid #ccc; background:#fcfcfc; font-weight:bold;">রক্তের গ্রুপ:</td><td style="padding:5px; border:1px solid #ccc; font-weight:bold; color:#d90429;">${memberData.blood}</td></tr>
        <tr><td style="padding:5px; border:1px solid #ccc; background:#fcfcfc; font-weight:bold;">লিঙ্গ:</td><td style="padding:5px; border:1px solid #ccc;">${memberData.gender === 'Female' ? 'মহিলা' : (memberData.gender === 'Male' ? 'পুরুষ' : memberData.gender)}</td><td style="padding:5px; border:1px solid #ccc; background:#fcfcfc; font-weight:bold;">পেশা:</td><td style="padding:5px; border:1px solid #ccc;">${memberData.prof}</td></tr>
        <tr><td style="padding:5px; border:1px solid #ccc; background:#fcfcfc; font-weight:bold;">প্রতিষ্ঠান/কর্মস্থল:</td><td style="padding:5px; border:1px solid #ccc;" colspan="3">${memberData.inst}</td></tr>
        <tr><td style="padding:5px; border:1px solid #ccc; background:#fcfcfc; font-weight:bold;">শিক্ষাগত যোগ্যতা:</td><td style="padding:5px; border:1px solid #ccc;">${memberData.edu}</td><td style="padding:5px; border:1px solid #ccc; background:#fcfcfc; font-weight:bold;">শিক্ষাবর্ষ:</td><td style="padding:5px; border:1px solid #ccc;">${memberData.session}</td></tr>
        <tr><td style="padding:5px; border:1px solid #ccc; background:#fcfcfc; font-weight:bold;">বর্তমান ঠিকানা:</td><td style="padding:5px; border:1px solid #ccc;" colspan="3">${memberData.curAddr}</td></tr>
        <tr><td style="padding:5px; border:1px solid #ccc; background:#fcfcfc; font-weight:bold;">স্থায়ী ঠিকানা:</td><td style="padding:5px; border:1px solid #ccc;" colspan="3">${memberData.perAddr}</td></tr>
      </table>
      <h3 style="font-size:11px; color:#0077b6; border-left:3px solid #0077b6; padding-left:6px; margin-bottom:5px;">২. সদস্যপদ বহাল থাকার শর্তাবলী ও ঘোষণা</h3>
      <div style="font-size:8.5px; line-height:1.4; color:#222; text-align:justify; background:#f9f9f9; padding:8px; border:1px solid #e0e0e0; border-radius:4px; margin-bottom:25px;">
        ১. <strong>কর্তൃপক্ষের সর্বোচ্চ ক্ষমতা:</strong> সংগঠনের শৃঙ্খলা, ভাবমূর্তি ও আদর্শ পরিপন্থী কোনো কাজে লিপ্ত হলে, রাজশাহী অলিম্পিয়াড সোসাইটি (ROS) কর্তৃপক্ষ যেকোনো সময় পূর্ব নোটিশ ছাড়াই যেকোনো সদস্যের সদস্যপদ সম্পূর্ণ বাতিল বা স্থগিত করার একক ও চূড়ান্ত ক্ষমতা সংরক্ষণ করে।<br>
        ২. আমি এই মর্মে অঙ্গীকার করছি যে, উপরে প্রদত্ত সকল তথ্য সম্পূর্ণ সত্য ও সঠিক। আমি অনলাইন ড্যাশবোর্ডের মাধ্যমে ডিজিটালভাবে এই সকল শর্তাবলীতে সম্মতি প্রদান করে এই মেম্বারশিপ কপিটি জেনারেট করেছি।
      </div>
      <div style="margin-top:40px; display:flex; justify-content:space-between; font-size:9.5px; padding:0 5px;">
        <div style="text-align:center; width:130px; border-top:1px solid #333; padding-top:4px;">আবেদনকারীর স্বাক্ষর</div>
        <div style="text-align:center; width:150px;">
          <div style="font-size:9px; font-weight:bold; color:#2a9d8f; text-transform:uppercase; border:2px dashed #2a9d8f; padding:2px 6px; display:inline-block; margin-bottom:4px; transform:rotate(-4deg); border-radius:4px;">✓ SIGNED VERIFIED</div>
          <div style="border-top:1px solid #0077b6; padding-top:4px; color:#0077b6; font-weight:bold;">কর্তৃপক্ষের স্বাক্ষর</div>
        </div>
      </div>
      <div style="text-align:center; font-size:8px; color:#e63946; font-weight:bold; background:#fff5f5; padding:4px; border:1px dashed #e63946; border-radius:4px; margin-top:20px;">
        * বিশেষ দ্রষ্টব্য: এটি একটি সিস্টেম জেনারেটেড ডিজিটাল ভেরিফাইড কপি। অনলাইন ডাটাবেজে রিয়েল-টাইম ভেরিফিকেশনের ব্যবস্থা থাকায় এতে কোনো ম্যানুয়াল স্বাক্ষর বা সিলের প্রয়োজন নেই।
      </div>
      <div style="margin-top:20px; display:flex; justify-content:space-between; align-items:center; font-size:8px; color:#666; border-top:1px solid #eee; padding-top:5px;">
        <div>${formattedTimeStr}</div>
        <div style="font-weight:600; color:#333;">Developed by: Utsab Sarker</div>
      </div>
    </div>
  `;
 const blob = Utilities.newBlob(pdfHtmlTemplate, "text/html", "ROS_Form.html");
  const pdfFile = blob.getAs("application/pdf").setName(`ROS_Form_${memberData.englishName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
  // আপনার দেওয়া নতুন টেক্সট ফরম্যাট অনুযায়ী এপ্রুভাল ইমেইল টেমপ্লেট
  const emailHtmlBody = `
  <div style="margin:0;padding:0;background:transparent;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;width:100% !important;">
    <div style="max-width:620px;margin:40px auto;background:#040d1a;border:5px solid #00b4d8;border-radius:20px;overflow:hidden;box-shadow:0 15px 40px rgba(0,0,0,0.4);width:100%;box-sizing:border-box;">
      
      <div style="background:rgba(15, 39, 71, 0.68);padding:35px 20px;text-align:center;border-bottom:2px solid #00b4d8;">
        <div style="margin:0 auto 15px auto;width:55px;height:55px;background:transparent;border-radius:50%;overflow:hidden;display:inline-block;text-align:center;vertical-align:middle;">
          <img src="https://rosociety.vercel.app/ros%20logo.png" alt="ROS Logo" style="width:43px;height:43px;margin-top:6px;border-radius:50%;object-fit:cover;">
        </div>
        <div style="color:#ffffff;font-size:18px;font-weight:700;line-height:1.2;">Rajshahi Olympiad Society</div>
        <div style="color:#94a3b8;font-size:13px;margin-top:6px;font-style:italic;letter-spacing:0.5px;">Nurturing Talent, Building Skills</div>
        <div style="margin-top:20px;font-size:14px;color:#00b4d8;letter-spacing:1.5px;font-weight:600;text-transform:uppercase;border-top:1px solid rgba(0,180,216,0.2);padding-top:15px;">
          Membership Approved 🎉
        </div>
      </div>

      <div style="padding:35px 20px;color:#f1f5f9;line-height:1.7;font-size:15px;">
        <p style="margin:0 0 15px;">Dear <strong>${row[2]}</strong>,</p>
        <p style="margin:0 0 15px;font-size:16px;color:#ffd700;font-weight:bold;">Congratulations!</p>
        <p style="margin:0 0 15px;">We are delighted to inform you that your registration with Rajshahi Olympiad Society has been reviewed and approved successfully.</p>
        <p style="margin:0 0 25px;">Your account is now <strong>Active</strong>, and you can sign in to access your member dashboard, participate in upcoming activities, and enjoy the services available to our members.</p>
        
        <div style="background:rgba(10, 25, 47, 0.65);border:1px solid #00b4d8;border-radius:14px;padding:20px;margin-bottom:25px;font-family: inherit;">
          <h4 style="margin:0 0 15px 0;color:#00b4d8;font-size:16px;border-bottom:1px solid rgba(0,180,216,0.3);padding-bottom:8px;">Member Information</h4>
          <table style="width:100%;border-collapse:collapse;color:#f1f5f9;font-size:14px;line-height:1.6;">
            <tr><td style="padding:4px 0;color:#94a3b8;width:40%;">Registration Number:</td><td style="padding:4px 0;font-weight:bold;color:#ffd700;">${memberData.memberId}</td></tr>
            <tr><td style="padding:4px 0;color:#94a3b8;">Registration Date:</td><td style="padding:4px 0;">${memberData.createdAt}</td></tr>
            <tr><td style="padding:4px 0;color:#94a3b8;padding-top:10px;">Name:</td><td style="padding:4px 0;font-weight:bold;padding-top:10px;">${row[2]}</td></tr>
            <tr><td style="padding:4px 0;color:#94a3b8;">Father's Name:</td><td style="padding:4px 0;">${memberData.fatherName}</td></tr>
            <tr><td style="padding:4px 0;color:#94a3b8;">Mother's Name:</td><td style="padding:4px 0;">${memberData.motherName}</td></tr>
            <tr><td style="padding:4px 0;color:#94a3b8;padding-top:10px;">Email Address:</td><td style="padding:4px 0;padding-top:10px;">${memberData.email}</td></tr>
            <tr><td style="padding:4px 0;color:#94a3b8;">Gender:</td><td style="padding:4px 0;">${memberData.gender}</td></tr>
            <tr><td style="padding:4px 0;color:#94a3b8;">Blood Group:</td><td style="padding:4px 0;font-weight:bold;color:#e63946;">${memberData.blood}</td></tr>
            <tr><td style="padding:4px 0;color:#94a3b8;padding-top:10px;">Membership Type:</td><td style="padding:4px 0;padding-top:10px;color:#00b4d8;font-weight:bold;">General Member</td></tr>
            <tr><td style="padding:4px 0;color:#94a3b8;">Account Status:</td><td style="padding:4px 0;"><span style="background:#2a9d8f;color:#fff;padding:1px 8px;font-size:12px;font-weight:bold;border-radius:4px;text-transform:uppercase;">Active</span></td></tr>
          </table>
        </div>

        <p style="margin:0 0 25px;">Please keep your Registration Number for future reference. It may be required for event registration, membership verification, and other official communications.</p>
        <p style="margin:0 0 15px;">Click the Login button below to access your account.</p>
        
        <div style="text-align:center;margin:30px 0;">
          <a href="https://rosociety.vercel.app/Login/" style="display:inline-block;background:#00b4d8;color:#040d1a;font-size:15px;font-weight:700;text-decoration:none;padding:14px 35px;border-radius:10px;box-shadow:0 4px 15px rgba(0,180,216,0.4);letter-spacing:0.5px;">Login</a>
        </div>
        
        <p style="margin:0 0 20px;">If you experience any problems while signing in or require assistance, please feel free to contact our support team. We are always happy to help.</p>
        <p style="margin:0 0 25px;">Thank you for becoming a member of Rajshahi Olympiad Society. We look forward to your active participation in our academic, scientific, and Olympiad activities.</p>
        
        <p style="margin-top:35px;line-height:1.6;font-size:14px;">
          Kind regards,<br>
          <strong style="color:#00b4d8;">Rajshahi Olympiad Society</strong>
        </p>
      </div>

      <div style="background:#020c1b;border-top:1px solid #00b4d8;padding:18px 20px;text-align:center;font-size:11px;color:#94a3b8;">
        🔒 <strong>Security Notice</strong><br>
        This is an automated email generated by the Rajshahi Olympiad Society Membership System.<br>
        Please do not reply to this email.
      </div>

      <div style="background:rgba(16, 35, 63, 0.70);color:#94a3b8;padding:25px 20px;border-top:1px solid #1e293b;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="width:50px;vertical-align:middle;">
              <img src="https://rosociety.vercel.app/ros%20logo.png" alt="ROS" style="width:30px;height:30px;border-radius:50%;">
            </td>
            <td style="text-align:right;font-size:13px;vertical-align:middle;">
              <a href="https://www.facebook.com/RajshahiOlympiadSociety" style="margin-right:15px;text-decoration:none;display:inline-block;" target="_blank"><img src="https://ci3.googleusercontent.com/meips/ADKq_NaGund6A191ZxodmcLj-Pseoc4vGe7Ck0BOXSIiDohCyBC1X0xwC0lD5WirlEEfF8-oUFFP86BHk9rkbU2p4B7yeMrBuy26f36F-w=s0-d-e1-ft#https://cdn-icons-png.flaticon.com/512/733/733547.png" width="24" height="24" alt="Facebook"></a>
              <a href="https://rosociety.vercel.app" style="text-decoration:none;display:inline-block;" target="_blank"><img src="https://ci3.googleusercontent.com/meips/ADKq_NbkRgSnxLua5l5RGJemilGXIHyR4Q-2TYHBuDqE6UsGNxDNFAfG1s-OzDNHEuh-RWXmQ5bQp9IK6lkVeye2udKdTGL5AnIz2qYnHJbb=s0-d-e1-ft#https://cdn-icons-png.flaticon.com/512/1006/1006771.png" width="24" height="24" alt="Website" style="background:#fff;border-radius:50%;padding:4px;"></a>
            </td>
          </tr>
        </table>
        <div style="border-top:1px solid #1e293b;margin-top:20px;padding-top:15px;text-align:center;font-size:12px;">
          <a href="https://rosociety.vercel.app/Home/" style="color:#94a3b8;text-decoration:none;" target="_blank">Home</a> | 
          <a href="https://rosociety.vercel.app/About-Us/" style="color:#94a3b8;text-decoration:none;" target="_blank">About Us</a> | 
          <a href="https://rosociety.vercel.app/FAQ/" style="color:#94a3b8;text-decoration:none;" target="_blank">FAQ</a> | 
          <a href="https://rosociety.vercel.app/Contact-Us/" style="color:#94a3b8;text-decoration:none;" target="_blank">Contact Us</a>
        </div>
        <div style="text-align:center;margin-top:18px;font-size:11px;color:#64748b;">
          © 2026 Rajshahi Olympiad Society. All Rights Reserved.<br>
          Developed by <a href="https://www.facebook.com/utsabsarker.arup" style="color:#00b4d8;text-decoration:none;" target="_blank">Utsab Sarker</a>
        </div>
      </div>
    </div>
  </div>`;

  MailApp.sendEmail({
    to: memberData.email,
    subject: "[ROS] Membership Approved & Verified Form",
    name: "Rajshahi Olympiad Society",
    htmlBody: emailHtmlBody,
    attachments: [pdfFile]
  });
}
// পাসওয়ার্ড রিসেট ওটিপি ইঞ্জিন (হুবহু আগের ডিজাইন)
function handleSendResetOtp(email) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const userSheet = ss.getSheetByName(SHEET_NAME);
  if (!userSheet) return ContentService.createTextOutput(JSON.stringify({ success: false, error: "ডেটাবেজ টেবিল পাওয়া যায়নি।" })).setMimeType(ContentService.MimeType.JSON);
  
  let userExists = false;
  let fullName = "Member";
  const userData = userSheet.getDataRange().getValues();
  const targetEmail = email.trim().toLowerCase();
  
  for (let i = 1; i < userData.length; i++) {
    if (userData[i][6].toString().trim().toLowerCase() === targetEmail) { 
      userExists = true; 
      fullName = userData[i][2] || "Member"; 
      break; 
    }
  }
  if (!userExists) return ContentService.createTextOutput(JSON.stringify({ success: false, error: "এই ইমেইলটি আমাদের সিস্টেমে নিবন্ধিত নয়!" })).setMimeType(ContentService.MimeType.JSON);
  
  let settingsSheet = ss.getSheetByName(SETTINGS_SHEET);
  if (!settingsSheet) {
    settingsSheet = ss.insertSheet(SETTINGS_SHEET);
    settingsSheet.appendRow(["Email", "OTP", "Expiry"]);
  }
  
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date().getTime() + 5 * 60 * 1000;
  const settingsData = settingsSheet.getDataRange().getValues();
  let found = false;
  
  for (let i = 1; i < settingsData.length; i++) {
    if (settingsData[i][0] === email) { 
      settingsSheet.getRange(i + 1, 2).setValue(otp); 
      settingsSheet.getRange(i + 1, 3).setValue(expiry); 
      found = true; 
      break; 
    }
  }
  if (!found) settingsSheet.appendRow([email, otp, expiry]);
  
const htmlBody = `
  <div style="margin:0;padding:0;background:transparent;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;width:100% !important;">
  <div style="max-width:620px;margin:40px auto;background:#040d1a;border:5px solid #00b4d8;border-radius:20px;overflow:hidden;box-shadow:0 15px 40px rgba(0,0,0,0.4);width:100%;box-sizing:border-box;">
    
    <div style="background:rgba(15, 39, 71, 0.68);padding:35px 20px;text-align:center;border-bottom:2px solid #00b4d8;">
      <div style="margin:0 auto 15px auto;width:55px;height:55px;background:transparent;border-radius:50%;overflow:hidden;display:inline-block;text-align:center;vertical-align:middle;">
        <img src="https://rosociety.vercel.app/ros%20logo.png" alt="ROS Logo" style="width:43px;height:43px;margin-top:6px;display:inline-block;border:none;outline:none;border-radius:50%;object-fit:cover;">
      </div>
      <div style="color:#ffffff;font-size:18px;font-weight:700;line-height:1.2;">Rajshahi Olympiad Society</div>
      <div style="color:#94a3b8;font-size:13px;margin-top:6px;font-style:italic;letter-spacing:0.5px;">Nurturing Talent, Building Skills</div>
      <div style="margin-top:20px;font-size:14px;color:#ffd700;letter-spacing:1.5px;font-weight:600;text-transform:uppercase;border-top:1px solid rgba(0,180,216,0.2);padding-top:15px;">
        Official Password Recovery
      </div>
    </div>

    <div style="padding:35px 20px;color:#f1f5f9;line-height:1.7;">
      <p style="margin:0 0 15px;font-size:15px;">Dear <strong>` + fullName + `</strong>,</p>
      <p style="margin:0 0 15px;font-size:15px;">We received a request to reset the password for your account associated with <strong>Rajshahi Olympiad Society</strong>.</p>
      <p style="margin:0 0 25px;font-size:15px;">To complete your password recovery, please enter the following Password Reset Code (OTP):</p>
      
      <div style="background:rgba(10, 25, 47, 0.65);border:1px solid #00b4d8;border-radius:14px;padding:25px 15px;text-align:center;margin-bottom:30px;box-sizing:border-box;width:100%;">
        <div style="font-size:14px;color:#94a3b8;margin-bottom:15px;">Your Password Reset Code</div>
        <div style="display:inline-block;background:#ffffff;color:#ffd700;font-size:32px;font-weight:700;letter-spacing:5px;padding:15px 25px;border:2px solid #00b4d8;border-radius:12px;font-family:monospace;max-width:90%;box-sizing:border-box;text-align:center;line-height:1;text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">
          ` + otp + `
        </div>
        <div style="margin-top:20px;background:#FFFDF2;border:2px solid #FFD700;border-radius:6px;padding:12px;font-size:13px;color:#cc0000;font-weight:700;line-height:1.4;">
          ⏱ This recovery code is valid for <strong>5 minutes</strong> and can only be used once.
        </div>
      </div>

      <div style="background:#ffebe6;border:2px solid #ff4d4d;border-radius:12px;padding:20px;font-size:12px;line-height:1.7;color:#cc0000;margin-bottom:35px;">
        <strong>Security Notice:</strong><br>
        Never share this recovery code with anyone. Rajshahi Olympiad Society will never ask for your password or code via phone call, message, or email. If you did not request this password reset, please ignore this email and secure your account if necessary.
      </div>

      <p style="margin:0 0 15px;font-size:14px;">If you experience any issues during this process, please contact our support team.</p>
      <p style="margin:0;font-size:14px;">Thank you for staying with Rajshahi Olympiad Society.</p>
      <p style="margin-top:30px;line-height:1.6;font-size:14px;">
        Kind regards,<br>
        <strong style="color:#00b4d8;">Rajshahi Olympiad Society</strong>
      </p>
    </div>

    <div style="background:#020c1b;border-top:1px solid #00b4d8;padding:18px 20px;text-align:center;font-size:11px;color:#94a3b8;line-height:1.5;">
      This is an automated email generated by the Rajshahi Olympiad Society System. Please do not reply to this message.
    </div>

    <div style="background:rgba(16, 35, 63, 0.70);color:#94a3b8;padding:25px 20px;border-top:1px solid #1e293b;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="width:50px;vertical-align:middle;">
            <div style="width:40px;height:40px;background:transparent;border-radius:100%;overflow:hidden;text-align:center;vertical-align:middle;">
              <img src="https://rosociety.vercel.app/ros%20logo.png" alt="ROS Logo" style="width:30px;height:30px;margin-top:5px;display:inline-block;border:none;outline:none;border-radius:50%;object-fit:cover;">
            </div>
          </td>
          <td style="text-align:right;font-size:13px;vertical-align:middle;">
            <a href="https://www.facebook.com/RajshahiOlympiadSociety" style="margin-right:15px;text-decoration:none;display:inline-block;" target="_blank">
              <img src="https://ci3.googleusercontent.com/meips/ADKq_NaGund6A191ZxodmcLj-Pseoc4vGe7Ck0BOXSIiDohCyBC1X0xwC0lD5WirlEEfF8-oUFFP86BHk9rkbU2p4B7yeMrBuy26f36F-w=s0-d-e1-ft#https://cdn-icons-png.flaticon.com/512/733/733547.png" width="24" height="24" alt="Facebook" style="vertical-align:middle;">
            </a>
            <a href="https://rosociety.vercel.app" style="text-decoration:none;display:inline-block;" target="_blank">
              <img src="https://ci3.googleusercontent.com/meips/ADKq_NbkRgSnxLua5l5RGJemilGXIHyR4Q-2TYHBuDqE6UsGNxDNFAfG1s-OzDNHEuh-RWXmQ5bQp9IK6lkVeye2udKdTGL5AnIz2qYnHJbb=s0-d-e1-ft#https://cdn-icons-png.flaticon.com/512/1006/1006771.png" width="24" height="24" alt="Website" style="vertical-align:middle;background:#ffffff;border-radius:50%;padding:4px;">
            </a>
          </td>
        </tr>
      </table>
      <div style="border-top:1px solid #1e293b;margin-top:20px;padding-top:15px;text-align:center;font-size:12px;line-height:1.5;">
        <a href="https://rosociety.vercel.app/Home/" style="color:#94a3b8;text-decoration:none;" target="_blank">Home</a>  |  
        <a href="https://rosociety.vercel.app/About-Us/" style="color:#94a3b8;text-decoration:none;" target="_blank">About Us</a>  |  
        <a href="https://rosociety.vercel.app/FAQ/" style="color:#94a3b8;text-decoration:none;" target="_blank">FAQ</a>  |  
        <a href="https://rosociety.vercel.app/Contact-Us/" style="color:#94a3b8;text-decoration:none;" target="_blank">Contact Us</a>
      </div>
      <div style="text-align:center;margin-top:18px;font-size:11px;color:#64748b;line-height:1.6;">
        © 2026 Rajshahi Olympiad Society. All Rights Reserved.<br>
        Developed by <a href="https://www.facebook.com/utsabsarker.arup" style="color:#00b4d8;text-decoration:none;" target="_blank">Utsab Sarker</a>
      </div>
    </div>
  </div>
</div>`;

MailApp.sendEmail({ to: email, subject: "[ROS] Password Reset Verification Code", name: "Rajshahi Olympiad Society", htmlBody: htmlBody });
  return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
}

// ওটিপি ম্যাচ করে পাসওয়ার্ড পরিবর্তন সম্পন্ন করার হ্যান্ডলার
function handleResetPassword(info) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const settingsSheet = ss.getSheetByName(SETTINGS_SHEET);
  const settingsData = settingsSheet.getDataRange().getValues();
  let otpValid = false; let otpRowIndex = -1; const now = new Date().getTime();
  
  for (let i = 1; i < settingsData.length; i++) {
    if (settingsData[i][0] === info.email && settingsData[i][1].toString() === info.otp.toString() && now < settingsData[i][2]) { 
      otpValid = true; otpRowIndex = i + 1; break; 
    }
  }
  if (!otpValid) return ContentService.createTextOutput(JSON.stringify({ success: false, error: "ভেরিফিকেশন কোডটি ভুল অথবা মেয়াদ শেষ হয়ে গেছে।" })).setMimeType(ContentService.MimeType.JSON);
  
  const userSheet = ss.getSheetByName(SHEET_NAME);
  const userData = userSheet.getDataRange().getValues();
  const targetEmail = info.email.trim().toLowerCase();
  const newHashedPassword = hashPassword(info.newPassword);
  
  for (let i = 1; i < userData.length; i++) {
    if (userData[i][6].toString().trim().toLowerCase() === targetEmail) { 
      userSheet.getRange(i + 1, 21).setValue(newHashedPassword); break; 
    }
  }
  if (otpRowIndex > -1) settingsSheet.deleteRow(otpRowIndex);
  return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
}

// নিবন্ধন ওটিপি ইমেইল প্রেরণের ইঞ্জিন (হুবহু আপনার আগের ডিজাইনটি ফিরিয়ে আনা হয়েছে)
function sendOtpEmail(email, fullName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let settingsSheet = ss.getSheetByName(SETTINGS_SHEET);
  if (!settingsSheet) {
    settingsSheet = ss.insertSheet(SETTINGS_SHEET);
    settingsSheet.appendRow(["Email", "OTP", "Expiry"]);
  }
  
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date().getTime() + 5 * 60 * 1000;
  const data = settingsSheet.getDataRange().getValues();
  let found = false;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === email) {
      settingsSheet.getRange(i + 1, 2).setValue(otp);
      settingsSheet.getRange(i + 1, 3).setValue(expiry);
      found = true; break;
    }
  }
  if (!found) settingsSheet.appendRow([email, otp, expiry]);
const htmlBody = `
  <div style="margin:0;padding:0;background:transparent;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;width:100% !important;">

  <div style="max-width:620px;margin:40px auto;background:#040d1a;border:5px solid #00b4d8;border-radius:20px;overflow:hidden;box-shadow:0 15px 40px rgba(0,0,0,0.4);width:100%;box-sizing:border-box;">

    <div style="background:rgba(15, 39, 71, 0.68);padding:35px 20px;text-align:center;border-bottom:2px solid #00b4d8;">
      <div style="margin:0 auto 15px auto;width:55px;height:55px;background:transparent;border-radius:50%;overflow:hidden;display:inline-block;text-align:center;vertical-align:middle;">
        <img src="https://rosociety.vercel.app/ros%20logo.png" alt="ROS Logo" style="width:43px;height:43px;margin-top:6px;display:inline-block;border:none;outline:none;border-radius:50%;object-fit:cover;">
      </div>
      
      <div style="color:#ffffff;font-size:18px;font-weight:700;line-height:1.2;">Rajshahi Olympiad Society</div>
      <div style="color:#94a3b8;font-size:13px;margin-top:6px;font-style:italic;letter-spacing:0.5px;">Nurturing Talent, Building Skills</div>
      
      <div style="margin-top:20px;font-size:14px;color:#00b4d8;letter-spacing:1.5px;font-weight:600;text-transform:uppercase;border-top:1px solid rgba(0,180,216,0.2);padding-top:15px;">
        Official Email Verification
      </div>
    </div>

    <div style="padding:35px 20px;color:#f1f5f9;line-height:1.7;">

      <p style="margin:0 0 15px;font-size:15px;">Dear <strong>` + fullName + `</strong>,</p>
      <p style="margin:0 0 15px;font-size:15px;">Thank you for registering with <strong>Rajshahi Olympiad Society</strong>.</p>
      <p style="margin:0 0 25px;font-size:15px;">To verify your email address and activate your registration, please enter the following One-Time Password (OTP):</p>

      <div style="background:rgba(10, 25, 47, 0.65);border:1px solid #00b4d8;border-radius:14px;padding:25px 15px;text-align:center;margin-bottom:30px;box-sizing:border-box;width:100%;">
        <div style="font-size:14px;color:#94a3b8;margin-bottom:15px;">Your Verification Code</div>
        
        <div style="display:inline-block;background:#ffffff;color:#00b4d8;font-size:32px;font-weight:700;letter-spacing:5px;padding:15px 25px;border:2px solid #00b4d8;border-radius:12px;font-family:monospace;max-width:90%;box-sizing:border-box;text-align:center;line-height:1;">
          ` + otp + `
        </div>
        
        <div style="margin-top:20px;background:#FFFDF2;border:2px solid #FFD700;border-radius:6px;padding:12px;font-size:13px;color:#cc0000;font-weight:700;line-height:1.4;">
          ⏱ This verification code is valid for <strong>5 minutes</strong> and can only be used once.
        </div>
      </div>

      <div style="background:#ffebe6;border:2px solid #ff4d4d;border-radius:12px;padding:20px;font-size:12px;line-height:1.7;color:#cc0000;margin-bottom:35px;">
        <strong>Security Notice:</strong><br>
        Never share your OTP with anyone. Rajshahi Olympiad Society will never ask for your verification code via phone call, message, or email. If you did not request this verification, you may safely ignore this email.
      </div>

      <p style="margin:0 0 15px;font-size:14px;">If you experience any issues during registration, please contact our support team.</p>
      <p style="margin:0;font-size:14px;">We appreciate your interest in becoming a member of Rajshahi Olympiad Society.</p>

      <p style="margin-top:30px;line-height:1.6;font-size:14px;">
        Kind regards,<br>
        <strong style="color:#00b4d8;">Rajshahi Olympiad Society</strong>
      </p>
    </div>

    <div style="background:#020c1b;border-top:1px solid #00b4d8;padding:18px 20px;text-align:center;font-size:11px;color:#94a3b8;line-height:1.5;">
      This is an automated email generated by the Rajshahi Olympiad Society Registration System. Please do not reply to this message.
    </div>

    <div style="background:rgba(16, 35, 63, 0.70);color:#94a3b8;padding:25px 20px;border-top:1px solid #1e293b;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="width:50px;vertical-align:middle;">
            <div style="width:40px;height:40px;background:transparent;border-radius:100%;overflow:hidden;text-align:center;vertical-align:middle;">
              <img src="https://rosociety.vercel.app/ros%20logo.png" alt="ROS Logo" style="width:30px;height:30px;margin-top:5px;display:inline-block;border:none;outline:none;border-radius:50%;object-fit:cover;">
            </div>
          </td>
          <td style="text-align:right;font-size:13px;vertical-align:middle;">
            <a href="https://www.facebook.com/RajshahiOlympiadSociety" style="margin-right:15px;text-decoration:none;display:inline-block;" target="_blank">
              <img src="https://ci3.googleusercontent.com/meips/ADKq_NaGund6A191ZxodmcLj-Pseoc4vGe7Ck0BOXSIiDohCyBC1X0xwC0lD5WirlEEfF8-oUFFP86BHk9rkbU2p4B7yeMrBuy26f36F-w=s0-d-e1-ft#https://cdn-icons-png.flaticon.com/512/733/733547.png" width="24" height="24" alt="Facebook" style="vertical-align:middle;">
            </a>
            <a href="https://rosociety.vercel.app" style="text-decoration:none;display:inline-block;" target="_blank">
              <img src="https://ci3.googleusercontent.com/meips/ADKq_NbkRgSnxLua5l5RGJemilGXIHyR4Q-2TYHBuDqE6UsGNxDNFAfG1s-OzDNHEuh-RWXmQ5bQp9IK6lkVeye2udKdTGL5AnIz2qYnHJbb=s0-d-e1-ft#https://cdn-icons-png.flaticon.com/512/1006/1006771.png" width="24" height="24" alt="Website" style="vertical-align:middle;background:#ffffff;border-radius:50%;padding:4px;">
            </a>
          </td>
        </tr>
      </table>

      <div style="border-top:1px solid #1e293b;margin-top:20px;padding-top:15px;text-align:center;font-size:12px;line-height:1.5;">
        <a href="https://rosociety.vercel.app/Home/" style="color:#94a3b8;text-decoration:none;" target="_blank">Home</a>  |  
        <a href="https://rosociety.vercel.app/About-Us/" style="color:#94a3b8;text-decoration:none;" target="_blank">About Us</a>  |  
        <a href="https://rosociety.vercel.app/FAQ/" style="color:#94a3b8;text-decoration:none;" target="_blank">FAQ</a>  |  
        <a href="https://rosociety.vercel.app/Contact-Us/" style="color:#94a3b8;text-decoration:none;" target="_blank">Contact Us</a>
      </div>

      <div style="text-align:center;margin-top:18px;font-size:11px;color:#64748b;line-height:1.6;">
        © 2026 Rajshahi Olympiad Society. All Rights Reserved.<br>
        Developed by <a href="https://www.facebook.com/utsabsarker.arup" style="color:#00b4d8;text-decoration:none;" target="_blank">Utsab Sarker</a>
      </div>
    </div>
  </div>
</div>`;
  MailApp.sendEmail({ to: email, subject: "[ROS] Account Verification Code: " + otp, name: "Rajshahi Olympiad Society", htmlBody: htmlBody });
  return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
}
