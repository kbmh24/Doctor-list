// ১. ড্রপডাউন পপুলেট করা (সবগুলো সেকশনের জন্য)
window.onload = () => {
    const selectors = ['deptSelectDay', 'deptSelectFee', 'deptSelectFull'];
    const depts = [...new Set(doctors.map(d => d.dept))].sort();
    
    selectors.forEach(sId => {
        const el = document.getElementById(sId);
        if (el) {
            depts.forEach(d => {
                const option = document.createElement('option');
                option.value = d;
                option.textContent = d;
                el.appendChild(option);
            });
        }
    });
};

// ২. সেকশন পরিবর্তন
function showSection(id, btn) {
    document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active-link'));
    btn.classList.add('active-link');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ৩. ডাক্তার কার্ড জেনারেটর (সার্চ এবং ডে-ভিউ এর জন্য)
function createDocCard(doc, schedule = null) {
    // যদি schedule পাস না করা হয়, তবে প্রথম শিডিউলটি নিবে (সার্চের জন্য)
    const s = schedule || doc.schedules[0];
    const scheduleInfo = schedule ? "" : `<div style="font-size:13px; color:#64748b; margin-top:8px;">${doc.schedules.map(sc => `<b>${sc.day}:</b> ${sc.time}`).join('<br>')}</div>`;

    return `
        <div class="doctor-card">
            <div class="doc-name">${doc.name}</div>
            <div class="doc-spec">${doc.spec}</div>
            <div class="card-meta">
                <span class="badge"><i class="fa-solid fa-hospital"></i> ${doc.dept}</span>
                <span class="badge badge-fee"><i class="fa-solid fa-wallet"></i> ফি: ${doc.fee1}/-</span>
                ${schedule ? `<span class="badge badge-time"><i class="fa-solid fa-clock"></i> ${s.time}</span>` : ''}
                ${schedule ? `<span class="badge badge-room"><i class="fa-solid fa-door-open"></i> রুম: ${s.room}</span>` : ''}
            </div>
            ${scheduleInfo}
        </div>`;
}

// ৪. মেইন সার্চ ফাংশন
function searchDoctors() {
    const query = document.getElementById('mainSearch').value.toLowerCase();
    const results = document.getElementById('searchResults');
    if(query.length < 2) { results.innerHTML = ''; return; }

    const filtered = doctors.filter(d => 
        d.name.toLowerCase().includes(query) || 
        d.spec.toLowerCase().includes(query) ||
        d.dept.toLowerCase().includes(query)
    );

    results.innerHTML = filtered.length ? filtered.map(d => createDocCard(d)).join('') : '<div class="no-data">কোন তথ্য পাওয়া যায়নি।</div>';
}

// ৫. দিন অনুযায়ী ফিল্টার (সকাল এবং বিকাল ভাগ করে)
function filterDay() {
    const day = document.getElementById('daySelect').value;
    const dept = document.getElementById('deptSelectDay').value;
    const res = document.getElementById('dayResults');
    if(!day) { res.innerHTML = ""; return; }

    const filtered = doctors.filter(d => (!dept || d.dept === dept) && d.schedules.some(s => s.day === day));
    
    let morningHtml = "";
    let afternoonHtml = "";

    filtered.forEach(d => {
        const s = d.schedules.find(sc => sc.day === day);
        // লজিক: যদি AM থাকে তবে সকাল, নতুবা বিকাল/সন্ধ্যা
        if(s.time.includes("AM") && !s.time.startsWith("12")) {
            morningHtml += createDocCard(d, s);
        } else {
            afternoonHtml += createDocCard(d, s);
        }
    });

    res.innerHTML = `
        <div class="shift-title shift-morning"><i class="fa-solid fa-sun"></i> সকালের তালিকা</div>
        ${morningHtml || '<div class="no-data">সকালে কোন ডাক্তার নেই।</div>'}
        <div class="shift-title shift-afternoon"><i class="fa-solid fa-moon"></i> বিকাল ও সন্ধ্যার তালিকা</div>
        ${afternoonHtml || '<div class="no-data">বিকালে কোন ডাক্তার নেই।</div>'}
    `;
}

// ৬. ভিজিট ফি সেকশন
function filterFees() {
    const dept = document.getElementById('deptSelectFee').value;
    const res = document.getElementById('feeResults');
    if(!dept) { res.innerHTML = ""; return; }

    let html = `<table><thead><tr><th>ডাক্তারের নাম</th><th>নতুন ভিজিট</th><th>পুরাতন ভিজিট</th></tr></thead><tbody>`;
    doctors.filter(d => d.dept === dept).forEach(d => {
        html += `<tr><td><strong>${d.name}</strong><br><small>${d.spec}</small></td><td>${d.fee1}/-</td><td>${d.fee2 ? d.fee2+'/-' : '---'}</td></tr>`;
    });
    res.innerHTML = html + `</tbody></table>`;
}

// ৭. পূর্ণাঙ্গ রুটিন সেকশন (ডিপার্টমেন্ট সিলেক্ট করলে ডাক্তার লোড হবে)
function updateDocList() {
    const dept = document.getElementById('deptSelectFull').value;
    const docSelect = document.getElementById('doctorSelect');
    docSelect.innerHTML = '<option value="">ডাক্তার সিলেক্ট করুন</option>';
    
    doctors.filter(d => d.dept === dept).forEach(d => {
        const option = document.createElement('option');
        option.value = d.name;
        option.textContent = d.name;
        docSelect.appendChild(option);
    });
    document.getElementById('fullResults').innerHTML = "";
}

function showFullSchedule() {
    const name = document.getElementById('doctorSelect').value;
    const res = document.getElementById('fullResults');
    if(!name) return;
    
    const d = doctors.find(doc => doc.name === name);
    res.innerHTML = `
        <div class="doctor-card">
            <div class="doc-name">${d.name}</div>
            <div class="doc-spec">${d.spec}</div>
            <div style="background:#f8fafc; padding:15px; border-radius:10px; margin-top:10px;">
                <h4 style="margin:0 0 10px 0; color:var(--primary);"><i class="fa-solid fa-calendar-check"></i> পূর্ণাঙ্গ সাপ্তাহিক শিডিউল:</h4>
                ${d.schedules.map(s => `
                    <div style="padding:8px 0; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; font-size:14px;">
                        <span><b>${s.day}</b></span>
                        <span>${s.time} (রুম: ${s.room})</span>
                    </div>
                `).join('')}
                <div style="margin-top:15px; color:var(--accent); font-weight:bold;">
                    ভিজিট ফি: ${d.fee1}/- ${d.fee2 ? `(পুরাতন: ${d.fee2}/-)` : ''}
                </div>
            </div>
        </div>`;
}
