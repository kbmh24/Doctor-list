document.addEventListener('DOMContentLoaded', () => {
    if (typeof doctors === 'undefined') return;
    initDoctorStatus();
    const selectors = ['deptSelectDay', 'deptSelectFee', 'deptSelectFull', 'deptSelectSettings'];
    const uniqueDepts = [...new Set(doctors.map(d => d.dept))].sort();
    selectors.forEach(sId => {
        const el = document.getElementById(sId);
        if (el) uniqueDepts.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d; opt.textContent = d;
            el.appendChild(opt);
        });
    });
});

let doctorStatus = JSON.parse(localStorage.getItem('doctorStatus')) || {};
function initDoctorStatus() {
    doctors.forEach(doc => { if (doctorStatus[doc.name] === undefined) doctorStatus[doc.name] = true; });
    localStorage.setItem('doctorStatus', JSON.stringify(doctorStatus));
}

function toggleDoctor(name) {
    doctorStatus[name] = !doctorStatus[name];
    localStorage.setItem('doctorStatus', JSON.stringify(doctorStatus));
    renderSettingsList();
}

function renderSettingsList() {
    const dept = document.getElementById('deptSelectSettings').value;
    const res = document.getElementById('settingsList');
    if (!dept) { res.innerHTML = '<div class="no-data">বিভাগ সিলেক্ট করুন।</div>'; return; }
    const filtered = doctors.filter(d => d.dept === dept);
    res.innerHTML = filtered.map(d => `
        <div class="settings-card">
            <div><strong>${d.name}</strong><br><small>${d.spec}</small></div>
            <button onclick="toggleDoctor('${d.name}')" class="toggle-btn ${doctorStatus[d.name] ? 'btn-on' : 'btn-off'}">
                ${doctorStatus[d.name] ? '<i class="fa-solid fa-check"></i> চালু' : '<i class="fa-solid fa-x"></i> বন্ধ'}
            </button>
        </div>`).join('');
}

function showSection(id, btn) {
    document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active-link'));
    btn.classList.add('active-link');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function createDocCard(doc, currentSchedule = null) {
    let scheduleInfo = currentSchedule 
        ? `<span class="badge badge-time"><i class="fa-solid fa-clock"></i> ${currentSchedule.time}</span><span class="badge badge-room"><i class="fa-solid fa-door-open"></i> রুম: ${currentSchedule.room}</span>`
        : `<div style="margin-top:10px; padding-top:8px; border-top:1px dashed #eee;">
            <div style="font-size:11px; font-weight:700; color:var(--primary); margin-bottom:5px;"><i class="fa-solid fa-calendar-week"></i> চেম্বারের সময়সূচী:</div>
            ${doc.schedules.map(s => `<div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:3px;"><span><b>${s.day}</b></span><span>${s.time} (রুম: ${s.room})</span></div>`).join('')}
          </div>`;
    return `
        <div class="doctor-card">
            <div class="doc-name">${doc.name}</div><div class="doc-spec">${doc.spec}</div>
            <div class="card-meta">
                <span class="badge"><i class="fa-solid fa-stethoscope"></i> ${doc.dept}</span>
                <span class="badge badge-fee"><i class="fa-solid fa-wallet"></i> ফি: ${doc.fee1}/-</span>
                ${currentSchedule ? scheduleInfo : ''}
            </div>
            ${!currentSchedule ? scheduleInfo : ''}
            <div style="font-size:10px; color:#94a3b8; margin-top:8px;">${doc.from}</div>
        </div>`;
}

function searchDoctors() {
    const query = document.getElementById('mainSearch').value.toLowerCase();
    const results = document.getElementById('searchResults');
    if(query.length < 2) { results.innerHTML = ''; return; }
    const filtered = doctors.filter(d => doctorStatus[d.name] && (d.name.toLowerCase().includes(query) || d.dept.toLowerCase().includes(query) || d.spec.toLowerCase().includes(query)));
    results.innerHTML = filtered.length ? filtered.map(d => createDocCard(d)).join('') : '<div class="no-data">তথ্য পাওয়া যায়নি।</div>';
}

function filterDay() {
    const day = document.getElementById('daySelect').value;
    const dept = document.getElementById('deptSelectDay').value;
    const res = document.getElementById('dayResults');
    if(!day) { res.innerHTML = ""; return; }
    const filtered = doctors.filter(d => doctorStatus[d.name] && (!dept || d.dept === dept) && d.schedules.some(s => s.day === day));
    let mH = "", aH = "";
    filtered.forEach(d => {
        const s = d.schedules.find(sc => sc.day === day);
        if(s.time.includes("AM") && !s.time.startsWith("12")) mH += createDocCard(d, s); else aH += createDocCard(d, s);
    });
    res.innerHTML = `<div class="shift-title shift-morning">সকাল</div>${mH || '<p class="no-data">সকালে কোনো ডাক্তার নেই</p>'}<div class="shift-title shift-afternoon">বিকাল/সন্ধ্যা</div>${aH || '<p class="no-data">বিকালে কোনো ডাক্তার নেই</p>'}`;
}

function filterFees() {
    const dept = document.getElementById('deptSelectFee').value;
    const res = document.getElementById('feeResults');
    if(!dept) return;
    let html = `<table><thead><tr><th>ডাক্তারের নাম</th><th>ভিজিট ফি</th></tr></thead><tbody>`;
    doctors.filter(d => d.dept === dept).forEach(d => { html += `<tr><td><strong>${d.name}</strong><br><small>${d.spec}</small></td><td><b>${d.fee1}/-</b></td></tr>`; });
    res.innerHTML = html + `</tbody></table>`;
}

function updateDocList() {
    const dept = document.getElementById('deptSelectFull').value;
    const ds = document.getElementById('doctorSelect');
    ds.innerHTML = '<option value="">ডাক্তার সিলেক্ট করুন</option>';
    doctors.filter(d => d.dept === dept).forEach(d => { ds.innerHTML += `<option value="${d.name}">${d.name}</option>`; });
}

function showFullSchedule() {
    const name = document.getElementById('doctorSelect').value;
    const res = document.getElementById('fullResults');
    if(!name) return;
    const d = doctors.find(doc => doc.name === name);
    res.innerHTML = createDocCard(d);
}
