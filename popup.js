// ল্যাঙ্গুয়েজ ডেটাবেজ (হোমপেজ ডিজাইন কন্টেন্ট রেপ্লিকা)
const popupLanguageData = {
    bn: `
        <div class="section-card-modal intro-box-modal">
            <h1>আগডুম বাগডুম (পর্ব-২)</h1>
            <p style="font-size: 1.1rem; font-weight: 600; margin-bottom: 10px;">নানা সময়ে আমাদের হরেক রকমের আয়োজন ছিলো শিশুদেরকে ঘিরে। সেসব আয়োজন থেকে বাছাই করে ছুটির দিনগুলোকে আনন্দে শেখার মাঝে ব্যয় করতে ম্যাসল্যাব এবং বাংলাদেশ বিজ্ঞান জনপ্রিয়করণ সমিতির যৌথ আয়োজন “আগডুম বাগডুম”।</p>
            <p>রবীন্দ্রনাথ ঠাকুরের আগডুম বাগডুম ছড়ার মতো সৈন্য-সামন্ত নিয়ে বিশেষ কোনো আয়োজন না থাকলেও বিচক্ষণ হবার জন্য কৌশলগত চিন্তা করে ধাঁধা সমাধানের পথ খোঁজার সুযোগ রয়েছে।</p>
        </div>

        <div class="section-card-modal">
            <div class="headline-container-modal"><i class="fas fa-user-astronaut"></i> কারা অংশ নিতে পারবে?</div>
            <p>আগ্রহী <strong>৭ থেকে ১০ বছর বয়সী</strong> শিশুরা</p>
        </div>

        <div class="section-card-modal">
            <div class="headline-container-modal"><i class="fas fa-calendar-days"></i> আয়োজনের সময়সূচি ও ফি</div>
            <div class="info-grid-modal">
                <div class="info-node-modal">
                    <span><i class="fas fa-calendar-check"></i> আয়োজনের তারিখ</span>
                    <strong>২৪, ২৫, ২৮ ও ৩১ জুলাই, ১ আগস্ট ২০২৬</strong>
                </div>
                <div class="info-node-modal">
                    <span><i class="fas fa-clock"></i> সময়সূচী</span>
                    <strong>বিকেল ৩:০০টা – ৫:০০টা (২ ঘন্টা)</strong>
                </div>
                <div class="info-node-modal">
                    <span><i class="fas fa-wallet"></i> রেজিস্ট্রেশন ফি</span>
                    <strong>২০৪০/- টাকা মাত্র <span class="bkash-badge-modal">বিকাশ পেমেন্ট</span></strong>
                </div>
                <div class="seat-full-area-modal">
                    <div style="font-size: 0.85rem; color: #64748b; font-weight: 500;">অতিরিক্ত তথ্য ও আসন</div>
                    <strong style="font-size: 1.1rem; display:block; margin: 4px 0;">রেজিস্ট্রেশন শেষ সময়: ২৩ জুলাই, ২০২৬, রাত ১১:৫৯ টা।</strong>
                    <div class="inner-warning-modal">
                        <i class="fas fa-triangle-exclamation" style="color:#ff4500"></i>
                        <span>আসন মাত্র ১২টি। তাই “আগে এলে আগে পাবে” ভিত্তিতে রেজিস্ট্রেশন সম্পন্ন হবে।</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="section-card-modal">
            <div class="headline-container-modal"><i class="fas fa-microscope"></i> আয়োজনের বিষয়বস্তু</div>
            <div class="syllabus-grid-modal">
                <div class="syllabus-item-modal"><div class="syllabus-item-icon-modal"><i class="fas fa-shapes"></i></div><div><strong>ট্যানগ্রাম ছট:</strong> জ্যামিতিক আকৃতির সাথে পরিচিত হতে পারবে হাতে কলমে। নিজের ইচ্ছামতো বিভিন্ন আকৃতি (যেমন: খরগোশ থেকে প্লেন) তৈরি করতে পারবে।</div></div>
                <div class="syllabus-item-modal"><div class="syllabus-item-icon-modal"><i class="fas fa-puzzle-piece"></i></div><div><strong>সুডোকু:</strong> সুডোকু আসলে একটি পাজেল বা ধাঁধা। গণিতের খুব সাধারণ বিষয় ১-৯ পর্যন্ত সংখ্যা নিয়ে খেলার মাধ্যমে এর সমাধান করা হয়।</div></div>
                <div class="syllabus-item-modal"><div class="syllabus-item-icon-modal"><i class="fas fa-cubes"></i></div><div><strong>কিউবের ছট:</strong> কিউব এক ধরণের ত্রিমাত্রিক পাজেল (রুবিকস কিউব)। কর্মশালায় ২*২ কিউব দিয়ে শুরু করে ৩*৩ শেখানো হবে।</div></div>
                <div class="syllabus-item-modal"><div class="syllabus-item-icon-modal"><i class="fas fa-scissors"></i></div><div><strong>অরিগামি:</strong> কোনো ধরণের আঠা বা পিন ব্যবহার না করে জাপানিজ শিল্প পদ্ধতিতে কাগজ দিয়ে সুন্দর সুন্দর জিনিস বানানোর কৌশল।</div></div>
                <div class="syllabus-item-modal"><div class="syllabus-item-icon-modal"><i class="fas fa-font"></i></div><div><strong>শব্দজট:</strong> পাজেল সমাধান করে বাংলা, ইংরেজি, বৈজ্ঞানিক বা জ্যামিতিক মজার মজার নতুন শব্দ তৈরি করতে পারদর্শী হওয়া।</div></div>
            </div>
        </div>

        <div class="section-card-modal">
            <div class="headline-container-modal"><i class="fas fa-award"></i> কর্মশালায় যা যা থাকছে-</div>
            <ul class="custom-ul-modal">
                <li>কোর্স সফলভাবে শেষ করলে অংশগ্রহণকারীকে সার্টিফিকেট প্রদান করা হবে।</li>
                <li>উপকরণ এবং আনুষাঙ্গিক কোর্স ম্যাটেরিয়াল ম্যাসল্যাব থেকে সরবরাহ করা হবে।</li>
                <li>০২ ঘন্টার সেশন এবং ১০ মিনিটের বিরতিতে হাল্কা নাস্তা প্রদান করা হবে।</li>
            </ul>
        </div>

        <div class="section-card-modal">
            <div class="headline-container-modal"><i class="fas fa-file-invoice"></i> যেভাবে রেজিস্ট্রেশন করা যাবে:</div>
            <ol class="custom-ul-modal" style="list-style-type: decimal; padding-left: 5px;">
                <li>কোর্সের সম্পূর্ণ ফি অগ্রিম বিকাশের মাধ্যমে অথবা ম্যাসল্যাবের অফিসে এসে প্রদান করতে হবে। (আসার পূর্বে যোগাযোগ বাঞ্ছনীয়)</li>
                <li>বিকাশের পেমেন্ট অপশন ব্যবহার করে <strong>০১৭৩০-৭১৬৫২২</strong> নম্বরে <strong>২০৪০ টাকা</strong> পাঠাতে হবে।</li>
                <li>বিকাশের ফিরতি মেসেজের ট্রানজেকশন আইডিটি (Txn ID) সংরক্ষণ করতে হবে এবং এই ফর্মটি পূরণ করে সাবমিট করতে হবে।</li>
                <li>ফর্ম পূরণের ২৪ ঘণ্টার মধ্যে এসএমএসের মাধ্যমে নিবন্ধন নিশ্চিত করা হবে।</li>
            </ol>
        </div>

        <div class="section-card-modal">
            <div class="headline-container-modal"><i class="fas fa-address-book"></i> যোগাযোগ:</div>
            <p><strong>ফোন:</strong> +8801730716522 (ম্যাসল্যাব)</p>
            <p><strong>ঠিকানা:</strong> ১২ তলা, গ্রীন সিটি সেন্টার (আবাহনী মাঠের বিপরীত পাশে), ৭৫৮ সাত মসজিদ রোড, ধানমন্ডি, ঢাকা-১২০৫।</p>
        </div>

        <div class="classic-quote-modal">
            "চলো, ছুটির দিনগুলোকে আনন্দময় আর বিজ্ঞানময় করে তুলি— খেলি, জানি আর শিখি!"
        </div>
    `,
    en: `
        <div class="section-card-modal intro-box-modal">
            <h1>Agdum Bagdum (Episode-2)</h1>
            <p style="font-size: 1.1rem; font-weight: 600; margin-bottom: 10px;">At various times, we have organized various events for children. Among these events, we have chosen to spend the day's vacation joyfully learning through a collaboration between MASLab and the Society for the Popularization of Science, Bangladesh, in our new program, 'Agdum Bagdum'.</p>
            <p>Although there won't be any special arrangements like a parade from Rabindranath Tagore’s Agdum Bagdum, there is still an opportunity to explore skillful thinking and find paths to puzzle-solving for enlightenment.</p>
        </div>

        <div class="section-card-modal">
            <div class="headline-container-modal"><i class="fas fa-user-astronaut"></i> Who can participate?</div>
            <p>Enthusiastic children aged <strong>7 to 10 years</strong></p>
        </div>

        <div class="section-card-modal">
            <div class="headline-container-modal"><i class="fas fa-calendar-days"></i> Event Schedule & Fee</div>
            <div class="info-grid-modal">
                <div class="info-node-modal">
                    <span><i class="fas fa-calendar-check"></i> Event Dates</span>
                    <strong>July 24, 25, 28 & 31 and August 1, 2026</strong>
                </div>
                <div class="info-node-modal">
                    <span><i class="fas fa-clock"></i> Time</span>
                    <strong>03:00 PM - 05:00 PM (2 Hours)</strong>
                </div>
                <div class="info-node-modal">
                    <span><i class="fas fa-wallet"></i> Registration Fee</span>
                    <strong>2040/- TK Only <span class="bkash-badge-modal">bKash Payment</span></strong>
                </div>
                <div class="seat-full-area-modal">
                    <div style="font-size: 0.85rem; color: #64748b; font-weight: 500;">Additional Info & Seats</div>
                    <strong style="font-size: 1.1rem; display:block; margin: 4px 0;">Deadline: 23rd July, 2026, at 11:59 PM</strong>
                    <div class="inner-warning-modal">
                        <i class="fas fa-triangle-exclamation" style="color:#ff4500"></i>
                        <span>Only 12 seats available. Registration operates strictly on a first-come, first-served basis.</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="section-card-modal">
            <div class="headline-container-modal"><i class="fas fa-microscope"></i> Sessions & Topics</div>
            <div class="syllabus-grid-modal">
                <div class="syllabus-item-modal"><div class="syllabus-item-icon-modal"><i class="fas fa-shapes"></i></div><div><strong>Tangram:</strong> Become familiar with geometric shapes hands-on. Create beautiful shapes of your choice starting from rabbits to planes.</div></div>
                <div class="syllabus-item-modal"><div class="syllabus-item-icon-modal"><i class="fas fa-puzzle-piece"></i></div><div><strong>Sudoku:</strong> It is essentially a numerical puzzle solved through simple math rules, engaging digits from 1 to 9.</div></div>
                <div class="syllabus-item-modal"><div class="syllabus-item-icon-modal"><i class="fas fa-cubes"></i></div><div><strong>Cube Puzzle:</strong> A 3D brain teaser. The workshop will start with standard 2x2 methods and progress to 3x3 solution structures.</div></div>
                <div class="syllabus-item-modal"><div class="syllabus-item-icon-modal"><i class="fas fa-scissors"></i></div><div><strong>Origami:</strong> The beautiful traditional Japanese paper-folding art performed without using any adhesive, pins, or glue.</div></div>
                <div class="syllabus-item-modal"><div class="syllabus-item-icon-modal"><i class="fas fa-font"></i></div><div><strong>Word Puzzle:</strong> Learn to form words in Bengali, English, and scientific concepts in a fast-paced interactive challenge.</div></div>
            </div>
        </div>

        <div class="section-card-modal">
            <div class="headline-container-modal"><i class="fas fa-award"></i> What's Included:</div>
            <ul class="custom-ul-modal">
                <li>A course completion certificate will be provided to participants upon successful attendance.</li>
                <li>All hands-on equipment and supplementary course materials will be provided by MASLab.</li>
                <li>Light refreshments will be served during a 10-minute mid-session break.</li>
            </ul>
        </div>

        <div class="section-card-modal">
            <div class="headline-container-modal"><i class="fas fa-file-invoice"></i> How to Register:</div>
            <ol class="custom-ul-modal" style="list-style-type: decimal; padding-left: 5px;">
                <li>The full course fee must be paid in advance via bKash or in person at the MASLab office.</li>
                <li>Send <strong>2040 BDT</strong> (including bKash charge) utilizing the 'Payment' option to <strong>01730716522</strong>.</li>
                <li>Save the Transaction ID (Txn ID), fill out this registration form accurately with it, and submit.</li>
                <li>Registration will be officially confirmed via SMS notification within 24 hours.</li>
            </ol>
        </div>

        <div class="section-card-modal">
            <div class="headline-container-modal"><i class="fas fa-address-book"></i> Contact Us:</div>
            <p><strong>Hotline:</strong> +8801730716522 (MASLab)</p>
            <p><strong>Address:</strong> 12th Floor, Green City Center (Opposite Abahani Ground), 758 Sat Masjid Road, Dhanmondi, Dhaka-1205.</p>
        </div>

        <div class="classic-quote-modal">
            "Let's transform vacation into a joyous scientifically strategic playground - Play, Know, and Learn!"
        </div>
    `
};

// গ্লোবাল ভ্যারিয়েবল বর্তমান ভাষা ট্র্যাক রাখার জন্য
let currentSelectedLanguage = 'bn';

// পপআপ ওপেন করার ফাংশন (ফরমের 'বিস্তারিত' বাটনের মাধ্যমে কল হবে)
function openDetailsModal() {
    const modal = document.getElementById('detailsModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // মেইন পেজের স্ক্রলিং অফ করা
        switchLanguage(currentSelectedLanguage); // ডিফল্ট ভাষা লোড করা
    }
}

// পপআপ বন্ধ করার ফাংশন
function closeDetailsModal() {
    const modal = document.getElementById('detailsModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // মেইন পেজের স্ক্রলিং অন করা
    }
}

// ভাষা সুইচার লজিক
function switchLanguage(lang) {
    currentSelectedLanguage = lang;
    
    // বাটন অ্যাক্টিভ ক্লাস রিমুভ ও অ্যাড করা
    document.getElementById('btnBn').classList.remove('active-lang');
    document.getElementById('btnEn').classList.remove('active-lang');
    
    if (lang === 'bn') {
        document.getElementById('btnBn').classList.add('active-lang');
    } else {
        document.getElementById('btnEn').classList.add('active-lang');
    }
    
    // ডাটা কন্টেন্ট বক্সে ইনজেক্ট করা
    const contentArea = document.getElementById('modalDynamicContent');
    if (contentArea) {
        contentArea.innerHTML = popupLanguageData[lang];
    }
    
    // প্রতিবার ভাষা বদলালে স্ক্রলবারটি একদম উপরে নিয়ে যাওয়া
    const scrollBody = document.getElementById('modalScrollBody');
    if (scrollBody) {
        scrollBody.scrollTop = 0;
    }
}

// পপআপের বাইরের ব্যাকগ্রাউন্ডে ক্লিক করলে যাতে পপআপ বন্ধ হয়
window.addEventListener('click', function(event) {
    const modal = document.getElementById('detailsModal');
    if (event.target === modal) {
        closeDetailsModal();
    }
});
