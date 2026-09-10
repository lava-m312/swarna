// ===== SWARNA SPA — APP.JS =====
// Booking flow state
const booking = { serviceId:null, staffId:null, date:null, time:null, couponDiscount:0, couponCode:null, paymentMethod:'UPI' };
let adminSection = 'dashboard';
let receptSection = 'overview';
let currentTab = 'upcoming';
let favServices = JSON.parse(localStorage.getItem('favServices')||'[]');
let favStylists = JSON.parse(localStorage.getItem('favStylists')||'[]');

// ===== UTILS =====
function $(id){ return document.getElementById(id); }

function show(id){
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = $(id);
  if(el){ el.classList.add('active'); }
}

function showNav(visible){
  const n = $('bottom-nav');
  if(n){ visible ? n.classList.add('visible') : n.classList.remove('visible'); }
}

function formatDate(d){ if(!d)return ''; const dt=new Date(d); return dt.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'}); }
function formatTime(t){ if(!t)return ''; const [h,m]=t.split(':'); const hr=parseInt(h); return `${hr>12?hr-12:hr||12}:${m} ${hr>=12?'PM':'AM'}`; }

function toast(msg, type='info'){
  const c = $('toast-container');
  if(!c) return;
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${type==='success'?'✅':type==='error'?'❌':'ℹ️'}</span><span>${msg}</span>`;
  c.appendChild(el);
  setTimeout(() => {
    el.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => el.remove(), 300);
  }, 3500);
}

function openModal(id){ const m=$(id); if(m)m.classList.add('open'); }
function closeModal(id){ const m=$(id); if(m)m.classList.remove('open'); }
function saveFavs(){ localStorage.setItem('favServices',JSON.stringify(favServices)); localStorage.setItem('favStylists',JSON.stringify(favStylists)); }
function genderColor(g){ return g==='Men'?'badge-men':g==='Women'?'badge-women':'badge-unisex'; }
function catEmoji(cat){ const m={'Hair':'💇','Beard & Grooming':'🧔','Skin & Facial':'🌸','Nails':'💅','Makeup':'💄','Hair Removal':'🪒','Packages':'🎁'}; return m[cat]||'✨'; }
function imgBg(cat){ const m={'Hair':'img-bg-hair','Beard & Grooming':'img-bg-beard','Skin & Facial':'img-bg-skin','Nails':'img-bg-nail','Makeup':'img-bg-makeup','Hair Removal':'img-bg-removal','Packages':'img-bg-package'}; return m[cat]||'img-bg-hair'; }
function starHTML(r){ let s=''; for(let i=1;i<=5;i++) s+=`<span class="star${i>r?' empty':''}">${i<=r?'★':'☆'}</span>`; return `<div class="stars">${s}</div>`; }
function statusBadge(st){ const m={Confirmed:'badge-success',Pending:'badge-warning','In Progress':'badge-info',Completed:'badge-gold',Cancelled:'badge-danger','No Show':'badge-danger'}; return `<span class="badge ${m[st]||'badge-gray'}">${st}</span>`; }

function today(){ return new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'}); }

// ===== ROUTE GUARD & NAVIGATION =====
function navTo(screen){
  // Route guard: protect dashboards
  if(['admin','receptionist'].includes(screen)){
    if(!currentUser){
      toast('Please login to continue','error');
      show('role-select');
      showNav(false);
      return;
    }
    if(screen === 'admin' && currentUser.role !== 'admin'){
      toast('⛔ Access denied. Admin only area.','error');
      // Redirect to appropriate dashboard
      if(currentUser.role === 'receptionist') navTo('receptionist');
      return;
    }
    if(screen === 'receptionist' && currentUser.role !== 'receptionist' && currentUser.role !== 'admin'){
      toast('⛔ Access denied.','error');
      return;
    }
  }

  show(screen);
  const isDashboard = ['admin','receptionist'].includes(screen);
  const isLoginFlow = ['splash','role-select'].includes(screen);
  showNav(!isLoginFlow && !isDashboard);
  if(!isDashboard && !isLoginFlow) updateDesktopNav(screen);
  window.scrollTo(0, 0);
}

// ===== BOTTOM NAV =====
function initNav(){
  const nh=$('nav-home'); const ns=$('nav-services'); const na=$('nav-appts'); const np=$('nav-profile');
  if(nh) nh.onclick=()=>{navTo('home');renderHome();};
  if(ns) ns.onclick=()=>{navTo('services');renderServices();};
  if(na) na.onclick=()=>{navTo('appointments');renderAppointments();};
  if(np) np.onclick=()=>{navTo('profile');renderProfile();};
}
function updateNav(active){ ['home','services','appts','profile'].forEach(n=>{ const el=$('nav-'+n); if(el){ el.classList.toggle('active',n===active); } }); }

// ===== DESKTOP NAV (customer screens) =====
function initDesktopNav(){
  const items=document.querySelectorAll('.desktop-nav-item');
  items.forEach(el=>{
    el.onclick=()=>{
      const t=el.dataset.target;
      if(t==='home')renderHome(); else if(t==='services')renderServices(); else if(t==='appointments')renderAppointments(); else if(t==='profile')renderProfile();
      navTo(t);
    };
  });
}
function updateDesktopNav(screen){ document.querySelectorAll('.desktop-nav-item').forEach(el=>el.classList.toggle('active',el.dataset.target===screen)); }

// ===== ROLE SELECT LOGIN PAGE =====
function initRoleSelect(){
  // Admin login
  const adminBtn = $('admin-login-btn');
  if(adminBtn) adminBtn.onclick = () => doRoleLogin('admin');

  // Receptionist login
  const receptBtn = $('recept-login-btn');
  if(receptBtn) receptBtn.onclick = () => doRoleLogin('receptionist');

  // Eye toggles
  setupEyeToggle('admin-pass','admin-eye');
  setupEyeToggle('recept-pass','recept-eye');

  // Enter key support
  ['admin-email','admin-pass'].forEach(id=>{
    const el=$(id); if(el) el.onkeydown=e=>{ if(e.key==='Enter') doRoleLogin('admin'); };
  });
  ['recept-email','recept-pass'].forEach(id=>{
    const el=$(id); if(el) el.onkeydown=e=>{ if(e.key==='Enter') doRoleLogin('receptionist'); };
  });
}

function setupEyeToggle(inputId, btnId){
  const input = $(inputId), btn = $(btnId);
  if(!input||!btn) return;
  btn.onclick = () => {
    const isPass = input.type === 'password';
    input.type = isPass ? 'text' : 'password';
    btn.textContent = isPass ? '🙈' : '👁️';
  };
}

function doRoleLogin(role){
  const emailId = role === 'admin' ? 'admin-email' : 'recept-email';
  const passId  = role === 'admin' ? 'admin-pass'  : 'recept-pass';
  const btnId   = role === 'admin' ? 'admin-login-btn' : 'recept-login-btn';
  const txtId   = role === 'admin' ? 'admin-btn-text' : 'recept-btn-text';
  const spnId   = role === 'admin' ? 'admin-btn-spinner' : 'recept-btn-spinner';
  const errId   = role === 'admin' ? 'admin-error-box' : 'recept-error-box';

  const emailEl = $(emailId), passEl = $(passId);
  const ep = emailEl ? emailEl.value.trim() : '';
  const pw = passEl  ? passEl.value.trim()  : '';

  // Clear previous errors
  showLoginError(errId, '');

  if(!ep){ showLoginError(errId, '⚠️ Please enter your username or email.'); return; }
  if(!pw){ showLoginError(errId, '⚠️ Please enter your password.'); return; }

  // Loading state
  const btn = $(btnId), txt = $(txtId), spn = $(spnId);
  if(btn) btn.disabled = true;
  if(txt) txt.textContent = 'Signing in...';
  if(spn) spn.style.display = 'inline-block';

  setTimeout(async () => {
    const user = await loginUser(ep, pw, role);
    if(btn) btn.disabled = false;
    if(spn) spn.style.display = 'none';
    if(txt) txt.textContent = role === 'admin' ? 'Admin Login' : 'Receptionist Login';

    if(!user || user.error){
      showLoginError(errId, `❌ ${user?.error || 'Invalid username or password.'}`);
      return;
    }

    // Clear inputs
    if(emailEl) emailEl.value = '';
    if(passEl)  passEl.value = '';

    toast(`Welcome back, ${user.name.split(' ')[0]}! 👋`, 'success');

    if(user.role === 'admin'){
      navTo('admin');
      renderAdminDashboard2();
    } else if(user.role === 'receptionist'){
      navTo('receptionist');
      renderReceptionistDashboard();
    }
  }, 1200);
}

function showLoginError(boxId, msg){
  const box = $(boxId);
  if(!box) return;
  if(!msg){ box.classList.remove('visible'); box.textContent = ''; return; }
  box.classList.add('visible');
  box.textContent = msg;
}

// ===== LOGOUT =====
function doLogout(){
  const name = currentUser ? currentUser.name.split(' ')[0] : '';
  logoutUser();
  // Clear login fields
  ['admin-email','admin-pass','recept-email','recept-pass'].forEach(id=>{ const el=$(id); if(el) el.value=''; });
  ['admin-error-box','recept-error-box'].forEach(id => showLoginError(id,''));
  toast(`Goodbye, ${name}! See you soon. 👋`, 'info');
  showNav(false);
  show('role-select');
}

// ===== LEGACY AUTH (customer — kept for internal use) =====
function initAuth(){
  const tl=$('auth-tab-login'); const tr=$('auth-tab-register');
  if(tl) tl.onclick=()=>switchAuthTab('login');
  if(tr) tr.onclick=()=>switchAuthTab('register');
  const lb=$('login-btn'); if(lb) lb.onclick=doLogin;
  const rb=$('register-btn'); if(rb) rb.onclick=doRegister;
  const tor=$('to-register'); if(tor) tor.onclick=()=>switchAuthTab('register');
  const tol=$('to-login'); if(tol) tol.onclick=()=>switchAuthTab('login');
}
function switchAuthTab(tab){ $('login-form').style.display=tab==='login'?'block':'none'; $('register-form').style.display=tab==='register'?'block':'none'; $('auth-tab-login').classList.toggle('active',tab==='login'); $('auth-tab-register').classList.toggle('active',tab==='register'); }
async function doLogin(){ const ep=$('login-email').value.trim(), pw=$('login-pass').value.trim(); clearErr('login-email'); clearErr('login-pass'); if(!ep){showErr('login-email','Enter email or phone'); return;} if(!pw){showErr('login-pass','Enter password'); return;} const res=await loginUser(ep,pw,'customer'); if(!res || res.error){toast(res?.error || 'Invalid credentials','error'); return;} navTo('home'); renderHome(); }
async function doRegister(){ const n=$('reg-name').value.trim(),ph=$('reg-phone').value.trim(),em=$('reg-email').value.trim(),pw=$('reg-pass').value.trim(),cp=$('reg-cpass').value.trim(); ['reg-name','reg-phone','reg-email','reg-pass','reg-cpass'].forEach(clearErr); if(!n)return showErr('reg-name','Enter full name'); if(!/^\d{10}$/.test(ph))return showErr('reg-phone','Enter valid 10-digit number'); if(!/\S+@\S+\.\S+/.test(em))return showErr('reg-email','Enter valid email'); if(pw.length<6)return showErr('reg-pass','Min 6 characters'); if(pw!==cp)return showErr('reg-cpass','Passwords do not match'); const r=await registerUser({name:n,phone:ph,email:em,password:pw}); if(r.error)return toast(r.error,'error'); toast('Account created!','success'); navTo('home'); renderHome(); }
function showErr(id,msg){ const el=$(id); if(el){el.classList.add('error'); const e=el.parentElement.querySelector('.err-msg'); if(e)e.textContent=msg; } }
function clearErr(id){ const el=$(id); if(el){el.classList.remove('error'); const e=el.parentElement.querySelector('.err-msg'); if(e)e.textContent=''; } }

// ===== HOME =====
function renderHome(){ updateNav('home');
  $('home-greeting').textContent=`Hello, ${currentUser?.name?.split(' ')[0]||'Guest'} 👋`;
  renderBanners(); renderCategories('all'); renderFeaturedServices('all');
  $('home-search').oninput=e=>{ if(e.target.value.length>1){ navTo('services'); renderServices(e.target.value); } };
  const notifBtn=$('home-notif'); if(notifBtn) notifBtn.onclick=()=>{ navTo('notifications'); renderNotifications(); };
  const profileBtn=$('home-profile'); if(profileBtn) profileBtn.onclick=()=>{ navTo('profile'); renderProfile(); };
}
function renderBanners(){ const c=$('banners-container'); if(!c)return; const banners=[ {badge:'🔥 Limited Time',title:'20% OFF Hair & Skin Services',sub:'Use code: HAIR20',btn:'Book Now',color:'#C9A84C'}, {badge:'🎁 First Booking',title:'₹200 OFF Your First Appointment',sub:'Use code: FIRST200',btn:'Get Offer',color:'#E8A0BF'}, {badge:'💍 Going Bridal?',title:'Complete Bridal Package',sub:'Starting at ₹9,999',btn:'Explore',color:'#9B59B6'} ]; c.innerHTML=banners.map(b=>`<div class="banner-card" style="cursor:pointer" onclick="navTo('services');renderServices()"><div class="banner-badge" style="color:${b.color}">${b.badge}</div><div class="banner-title serif">${b.title}</div><div class="banner-sub">${b.sub}</div><button class="btn btn-gold btn-sm" style="margin-top:4px">${b.btn}</button></div>`).join(''); }
function renderCategories(active){ const c=$('cats-container'); if(!c)return; const cats=['all','Hair','Beard & Grooming','Skin & Facial','Nails','Makeup','Hair Removal','Packages']; const icons={all:'🌟',Hair:'💇','Beard & Grooming':'🧔','Skin & Facial':'🌸',Nails:'💅',Makeup:'💄','Hair Removal':'🪒',Packages:'🎁'}; c.innerHTML=cats.map(cat=>`<div class="cat-chip ${cat===active?'active':''}" onclick="selectCategory('${cat}')"><div class="cat-icon">${icons[cat]||'✨'}</div><div class="cat-label">${cat==='all'?'All':cat}</div></div>`).join(''); }
function selectCategory(cat){ renderCategories(cat); renderFeaturedServices(cat); }
function renderFeaturedServices(cat){ const c=$('featured-services'); if(!c)return; let svc=DB.services.filter(s=>s.status); if(cat&&cat!=='all')svc=svc.filter(s=>s.category===cat); c.innerHTML=svc.slice(0,6).map(s=>serviceCardHTML(s)).join(''); }
function serviceCardHTML(s){ const p=getDiscountedPrice(s); return `<div class="service-card" onclick="showServiceDetail(${s.id})"><div class="service-img ${imgBg(s.category)}"><span style="font-size:48px;z-index:1;position:relative">${catEmoji(s.category)}</span><span class="service-tag badge ${genderColor(s.gender)}" style="z-index:2">${s.gender}</span></div><div class="service-info"><div class="service-name">${s.name}</div><div class="service-meta"><span>⏱ ${s.duration}min</span>${starHTML(Math.round(s.rating))}</div><div class="service-price-row"><span class="service-price">₹${p}</span>${s.discount>0?`<span class="service-orig">₹${s.price}</span><span class="badge badge-success" style="font-size:10px">${s.discount}% off</span>`:''}</div></div></div>`; }

// ===== SERVICES PAGE =====
let servFilter={cat:'all',gender:'all',sort:'popular',q:''};
function renderServices(query=''){ updateNav('services'); servFilter.q=query; if(query)$('serv-search').value=query;
  const cats=['All',...[...new Set(DB.services.map(s=>s.category))]];
  $('serv-filters').innerHTML=cats.map(c=>`<div class="filter-chip ${servFilter.cat===(c==='All'?'all':c)?'active':''}" onclick="setServCat('${c==='All'?'all':c}')">${c==='All'?'🌟 All':catEmoji(c)+' '+c}</div>`).join('')+`<div class="filter-chip ${servFilter.gender==='Men'?'active':''}" onclick="setServGender('Men')">👨 Men</div><div class="filter-chip ${servFilter.gender==='Women'?'active':''}" onclick="setServGender('Women')">👩 Women</div><div class="filter-chip ${servFilter.gender==='Unisex'?'active':''}" onclick="setServGender('Unisex')">👥 Unisex</div>`;
  renderServiceList(); $('serv-search').oninput=e=>{servFilter.q=e.target.value;renderServiceList();}; }
function setServCat(c){ servFilter.cat=c; renderServices(); }
function setServGender(g){ servFilter.gender=servFilter.gender===g?'all':g; renderServices(); }
function renderServiceList(){ const c=$('services-list'); if(!c)return; let list=DB.services.filter(s=>s.status); if(servFilter.cat!=='all')list=list.filter(s=>s.category===servFilter.cat); if(servFilter.gender!=='all')list=list.filter(s=>s.gender===servFilter.gender||s.gender==='Unisex'); if(servFilter.q)list=list.filter(s=>s.name.toLowerCase().includes(servFilter.q.toLowerCase())||s.category.toLowerCase().includes(servFilter.q.toLowerCase())); c.innerHTML=list.length?list.map(s=>{ const p=getDiscountedPrice(s); return `<div class="service-list-card" onclick="showServiceDetail(${s.id})"><div class="service-list-img ${imgBg(s.category)}">${catEmoji(s.category)}</div><div class="service-list-info"><div class="service-list-name">${s.name}</div><div class="service-list-cat">${s.category}</div><div class="service-list-row"><span class="badge ${genderColor(s.gender)}">${s.gender}</span><span style="font-size:12px;color:var(--text3)">⏱ ${s.duration} min</span>${starHTML(Math.round(s.rating))}<span style="font-size:12px;color:var(--text3)">(${s.reviews})</span></div><div class="service-list-footer"><div class="service-price-row"><span class="service-price">₹${p}</span>${s.discount>0?`<span class="service-orig">₹${s.price}</span>`:''}</div><button class="btn btn-gold btn-sm">Book Now</button></div></div></div>`; }).join(''):`<div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-title">No services found</div><div class="empty-sub">Try different filters</div></div>`; }

// ===== SERVICE DETAIL =====
function showServiceDetail(sid){ const s=DB.services.find(x=>x.id===sid); if(!s)return; const p=getDiscountedPrice(s); const isFav=favServices.includes(sid);
  $('detail-img').className=`detail-img ${imgBg(s.category)}`; $('detail-emoji').textContent=catEmoji(s.category);
  $('detail-title').textContent=s.name; $('detail-category').textContent=s.category;
  $('detail-price').textContent=`₹${p}`; $('detail-orig').textContent=s.discount?`₹${s.price}`:''; $('detail-orig').style.display=s.discount?'inline':'none';
  $('detail-disc').textContent=s.discount?`${s.discount}% off`:''; $('detail-disc').style.display=s.discount?'inline':'none';
  $('detail-duration').textContent=`⏱ ${s.duration} min`; $('detail-gender').innerHTML=`<span class="badge ${genderColor(s.gender)}">${s.gender}</span>`;
  $('detail-desc').textContent=s.description; $('detail-rating').innerHTML=starHTML(Math.round(s.rating))+` <span style="font-size:13px;color:var(--text3)">${s.rating} (${s.reviews} reviews)</span>`;
  $('detail-benefits').innerHTML=s.benefits.map(b=>`<div class="benefit-item"><span class="benefit-icon">✓</span><span>${b}</span></div>`).join('');
  $('detail-prep').innerHTML=s.prep?.length?s.prep.map(p=>`<div class="benefit-item"><span class="benefit-icon">📌</span><span>${p}</span></div>`).join(''):'<span style="color:var(--text3)">No special preparation needed</span>';
  const revs=DB.reviews.filter(r=>r.serviceId===sid); $('detail-reviews').innerHTML=revs.length?revs.map(r=>`<div class="card card-body" style="margin-bottom:10px">${starHTML(r.rating)}<p style="font-size:14px;margin-top:6px;color:var(--text2)">"${r.comment}"</p><p style="font-size:12px;color:var(--text3);margin-top:4px">— ${r.userName}, ${r.createdAt}</p></div>`).join(''):'<p style="color:var(--text3);font-size:14px">No reviews yet. Be the first to review!</p>';
  $('fav-btn').textContent=isFav?'❤️ Saved':'🤍 Save'; $('fav-btn').onclick=()=>toggleFavService(sid);
  $('book-now-btn').onclick=()=>startBooking(sid);
  navTo('service-detail'); }
function toggleFavService(sid){ if(favServices.includes(sid)){favServices=favServices.filter(x=>x!==sid);toast('Removed from favorites');} else {favServices.push(sid);toast('Added to favorites','success');} saveFavs(); $('fav-btn').textContent=favServices.includes(sid)?'❤️ Saved':'🤍 Save'; }

// ===== BOOKING FLOW =====
function startBooking(sid){ if(!currentUser){toast('Please login to book','error');navTo('role-select');return;} booking.serviceId=sid; booking.staffId=null; booking.date=null; booking.time=null; booking.couponDiscount=0; booking.couponCode=null; navTo('stylist-select'); renderStylistSelect(); }
function renderStylistSelect(){ const s=DB.services.find(x=>x.id===booking.serviceId); const eligible=DB.staff.filter(st=>st.status&&st.services.includes(booking.serviceId)); const c=$('stylist-cards'); if(!c)return;
  c.innerHTML=`<div class="stylist-card ${booking.staffId===0?'selected':''}" onclick="selectStylist(0)"><div class="stylist-avatar" style="background:linear-gradient(135deg,var(--gold),var(--gold-light))">⭐</div><div class="stylist-info"><div class="stylist-name">Any Available Stylist</div><div class="stylist-spec">We'll assign the best available</div><div class="stylist-row"><span class="badge badge-success">Recommended</span></div></div></div>`+eligible.map(st=>`<div class="stylist-card ${booking.staffId===st.id?'selected':''}" onclick="selectStylist(${st.id})"><div class="stylist-avatar">${st.name[0]}</div><div class="stylist-info"><div class="stylist-name">${st.name}</div><div class="stylist-spec">${st.specialization}</div><div class="stylist-row">${starHTML(Math.round(st.rating))}<span style="font-size:12px;color:var(--text3)">${st.experience} yrs</span><span class="avail-dot"></span><span style="font-size:12px;color:var(--success)">Available</span></div></div></div>`).join('');
  $('stylist-continue').onclick=()=>{ if(booking.staffId===null){toast('Please select a stylist','error');return;} navTo('datetime'); renderDatetime(); }; }
function selectStylist(id){ booking.staffId=id; document.querySelectorAll('.stylist-card').forEach((c,i)=>{ c.classList.toggle('selected',i===(id===0?0:DB.staff.findIndex(s=>s.id===id)+1)); }); }

// ===== DATE TIME =====
let calYear=new Date().getFullYear(), calMonth=new Date().getMonth();
function renderDatetime(){ renderCalendar(); $('dt-prev').onclick=()=>{calMonth--;if(calMonth<0){calMonth=11;calYear--;}renderCalendar();}; $('dt-next').onclick=()=>{calMonth++;if(calMonth>11){calMonth=0;calYear++;}renderCalendar();}; $('dt-continue').onclick=()=>{ if(!booking.date||!booking.time){toast('Select date and time','error');return;} navTo('booking-summary'); renderBookingSummary(); }; }
function renderCalendar(){ const mn=['January','February','March','April','May','June','July','August','September','October','November','December']; $('cal-month').textContent=`${mn[calMonth]} ${calYear}`; const first=new Date(calYear,calMonth,1).getDay(); const days=new Date(calYear,calMonth+1,0).getDate(); const todayStr=new Date().toISOString().split('T')[0]; let html=''; ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d=>html+=`<div class="cal-day-name">${d}</div>`); for(let i=0;i<first;i++)html+=`<div class="cal-day other-month disabled"></div>`; for(let d=1;d<=days;d++){ const ds=`${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`; const isPast=ds<todayStr; const isSel=booking.date===ds; html+=`<div class="cal-day ${isPast?'disabled':''} ${ds===todayStr?'today':''} ${isSel?'selected':''}" onclick="${isPast?'':`selectDate('${ds}')`}">${d}</div>`; } $('cal-grid').innerHTML=html; if(booking.date)renderTimeSlots(); }
function selectDate(d){ booking.date=d; booking.time=null; renderCalendar(); renderTimeSlots(); }
function renderTimeSlots(){ const c=$('time-grid'); if(!c)return; const sid=booking.staffId||1; const slots=getTimeSlots(sid,booking.date); if(!slots.length){c.innerHTML='<p style="color:var(--text3);padding:10px;grid-column:1/-1">No slots available on this day</p>';return;} c.innerHTML=slots.map(s=>`<div class="time-slot ${!s.available?'unavailable':''} ${booking.time===s.time?'selected':''}" onclick="${s.available?`selectTime('${s.time}')`:''}">${formatTime(s.time)}</div>`).join(''); }
function selectTime(t){ booking.time=t; renderTimeSlots(); }

// ===== BOOKING SUMMARY =====
function renderBookingSummary(){ const svc=DB.services.find(x=>x.id===booking.serviceId); const staff=booking.staffId?DB.staff.find(x=>x.id===booking.staffId):null; const p=getDiscountedPrice(svc); const tax=Math.round(p*0.05); const total=p-booking.couponDiscount+tax;
  $('sum-customer').textContent=currentUser.name; $('sum-service').textContent=svc.name; $('sum-stylist').textContent=staff?staff.name:'Any Available'; $('sum-date').textContent=formatDate(booking.date); $('sum-time').textContent=formatTime(booking.time); $('sum-duration').textContent=`${svc.duration} min`; $('sum-price').textContent=`₹${p}`; $('sum-discount').textContent=booking.couponDiscount?`-₹${booking.couponDiscount}`:'—'; $('sum-tax').textContent=`₹${tax}`; $('sum-total').textContent=`₹${total}`;
  $('apply-coupon').onclick=()=>{ const code=$('coupon-input').value.trim().toUpperCase(); if(!code)return toast('Enter coupon code','error'); const r=applyCoupon(code,p); if(r.error)return toast(r.error,'error'); booking.couponDiscount=r.discount; booking.couponCode=code; toast(`Coupon applied! ₹${r.discount} off`,'success'); renderBookingSummary(); };
  $('confirm-booking').onclick=()=>{ navTo('payment'); renderPayment(); }; }

// ===== PAYMENT =====
function renderPayment(){ const svc=DB.services.find(x=>x.id===booking.serviceId); const p=getDiscountedPrice(svc); const tax=Math.round(p*0.05); const total=p-booking.couponDiscount+tax;
  $('pay-amount').textContent=`₹${p}`; $('pay-discount').textContent=booking.couponDiscount?`-₹${booking.couponDiscount}`:'—'; $('pay-tax').textContent=`₹${tax}`; $('pay-total').textContent=`₹${total}`;
  document.querySelectorAll('.payment-option').forEach(el=>el.onclick=()=>{ document.querySelectorAll('.payment-option').forEach(x=>x.classList.remove('selected')); el.classList.add('selected'); booking.paymentMethod=el.dataset.method; });
  $('pay-btn').onclick=processPayment; }
function processPayment(){ const svc=DB.services.find(x=>x.id===booking.serviceId); const p=getDiscountedPrice(svc); const tax=Math.round(p*0.05); const total=p-booking.couponDiscount+tax; const staffId=booking.staffId||DB.staff.find(s=>s.services.includes(booking.serviceId))?.id||1;
  const btn=$('pay-btn'); btn.disabled=true; btn.textContent='Processing...';
  setTimeout(()=>{ const appt=createAppointment({userId:currentUser.id,serviceId:booking.serviceId,staffId,date:booking.date,time:booking.time,duration:svc.duration,amount:total,discount:booking.couponDiscount,tax,paymentMethod:booking.paymentMethod,transactionId:'TXN'+Date.now().toString().slice(-6)}); if(appt.error){toast(appt.error,'error');btn.disabled=false;btn.textContent='Pay Now';return;} navTo('confirmation'); renderConfirmation(appt); btn.disabled=false; btn.textContent='Pay Now'; },1500); }

// ===== CONFIRMATION =====
function renderConfirmation(appt){ const svc=DB.services.find(x=>x.id===appt.serviceId); const staff=DB.staff.find(x=>x.id===appt.staffId); $('conf-id').textContent='#'+appt.id; $('conf-service').textContent=svc?.name; $('conf-stylist').textContent=staff?.name||'—'; $('conf-date').textContent=formatDate(appt.date); $('conf-time').textContent=formatTime(appt.time); $('conf-amount').textContent=`₹${appt.amount}`; $('conf-pay-status').textContent=appt.paymentStatus; $('conf-home').onclick=()=>{navTo('home');renderHome();}; $('conf-view-appt').onclick=()=>{navTo('appointments');renderAppointments();}; }

// ===== APPOINTMENTS =====
function renderAppointments(){ updateNav('appts'); const myAppts=DB.appointments.filter(a=>a.userId===currentUser.id); const tabs={upcoming:['Confirmed','Pending','In Progress'],completed:['Completed'],cancelled:['Cancelled','No Show']}; function renderTab(tab){ const list=myAppts.filter(a=>tabs[tab].includes(a.status)); const c=$('appt-list'); if(!list.length){c.innerHTML='<div class="empty-state"><div class="empty-icon">📅</div><div class="empty-title">No appointments</div></div>';return;} c.innerHTML=list.map(a=>{ const svc=DB.services.find(s=>s.id===a.serviceId); const staff=DB.staff.find(s=>s.id===a.staffId); return `<div class="appt-card"><div class="appt-header"><div class="appt-service">${svc?.name||'Service'}</div>${statusBadge(a.status)}</div><div class="appt-body"><div class="appt-row">👤 ${staff?.name||'Any Stylist'}</div><div class="appt-row">📅 ${formatDate(a.date)} at ${formatTime(a.time)}</div><div class="appt-row">⏱ ${a.duration} min &nbsp;|&nbsp; 💰 ₹${a.amount}</div></div><div class="appt-footer">${tab==='upcoming'?`<button class="btn btn-outline btn-sm" onclick="rescheduleAppt(${a.id})">Reschedule</button><button class="btn btn-danger btn-sm" onclick="cancelAppt(${a.id})">Cancel</button>`:''}${tab==='completed'&&!DB.reviews.find(r=>r.userId===currentUser.id&&r.serviceId===a.serviceId)?`<button class="btn btn-gold btn-sm" onclick="openReviewModal(${a.serviceId},${a.staffId})">Rate & Review</button>`:''}<button class="btn btn-ghost btn-sm">Details</button></div></div>`; }).join(''); } renderTab(currentTab); ['upcoming','completed','cancelled'].forEach(t=>{ const el=$('appt-tab-'+t); if(el) el.onclick=()=>{currentTab=t;document.querySelectorAll('.appt-tabs .tab').forEach(x=>x.classList.remove('active'));el.classList.add('active');renderTab(t);}; }); }
function cancelAppt(id){ const a=DB.appointments.find(x=>x.id===id); if(!a)return; a.status='Cancelled'; a.paymentStatus='Refunded'; saveDB(); toast('Appointment cancelled','info'); renderAppointments(); }
function rescheduleAppt(id){ const a=DB.appointments.find(x=>x.id===id); if(!a)return; booking.serviceId=a.serviceId; booking.staffId=a.staffId; booking.date=null; booking.time=null; a.status='Cancelled'; saveDB(); navTo('datetime'); renderDatetime(); toast('Select new date & time'); }

// ===== REVIEW =====
let reviewState={serviceId:null,staffId:null,rating:0};
function openReviewModal(sid,stid){ reviewState={serviceId:sid,staffId:stid,rating:0}; document.querySelectorAll('.star-r').forEach((s,i)=>{ s.onclick=()=>{ reviewState.rating=i+1; document.querySelectorAll('.star-r').forEach((x,j)=>x.classList.toggle('active',j<reviewState.rating)); }; }); openModal('review-modal'); $('submit-review').onclick=submitReview; }
function submitReview(){ if(!reviewState.rating)return toast('Please select a rating','error'); const rev={id:DB.nextId.review++,userId:currentUser.id,serviceId:reviewState.serviceId,staffId:reviewState.staffId,rating:reviewState.rating,comment:$('review-comment').value.trim()||'Great experience!',createdAt:new Date().toISOString().split('T')[0],userName:currentUser.name.split(' ')[0]+' '+currentUser.name.split(' ')[1]?.[0]+'.'}; DB.reviews.push(rev); saveDB(); closeModal('review-modal'); toast('Review submitted! Thank you ✨','success'); }

// ===== PROFILE =====
function renderProfile(){ updateNav('profile'); $('prof-name').textContent=currentUser.name; $('prof-email').textContent=currentUser.email; $('prof-phone').textContent=currentUser.phone; $('prof-avatar').textContent=currentUser.name[0]; const mem=DB.memberships.find(m=>m.name.toLowerCase()===currentUser.membership); $('prof-mem').textContent=mem?`${mem.name} Member`:'No Membership'; $('prof-mem').style.color=mem?.color||'var(--text3)'; $('menu-appts').onclick=()=>{navTo('appointments');renderAppointments();}; $('menu-favs').onclick=()=>{navTo('favorites');renderFavorites();}; $('menu-mem').onclick=()=>navTo('membership'); $('menu-offers').onclick=()=>{navTo('offers');renderOffers();}; $('menu-notifs').onclick=()=>{navTo('notifications');renderNotifications();}; $('menu-location').onclick=()=>navTo('location'); $('menu-logout').onclick=doLogout; }

// ===== FAVORITES =====
function renderFavorites(){ const c=$('fav-services'); c.innerHTML=favServices.length?favServices.map(id=>{const s=DB.services.find(x=>x.id===id);return s?serviceCardHTML(s):'';}).join(''):'<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">🤍</div><div class="empty-title">No favorites yet</div><div class="empty-sub">Save services you love</div></div>'; }

// ===== OFFERS =====
function renderOffers(){ const today2=new Date().toISOString().split('T')[0]; const c=$('offers-list'); c.innerHTML=DB.coupons.filter(c=>c.status&&c.expiryDate>=today2).map(cp=>`<div class="offer-card"><div class="offer-title">${cp.description}</div><div class="offer-code">${cp.code}</div><div class="offer-meta"><span>Valid till ${cp.expiryDate}</span><span>Min ₹${cp.minAmount}</span></div><button class="btn btn-outline btn-sm" style="margin-top:12px" onclick="navigator.clipboard.writeText('${cp.code}').then(()=>toast('Code copied!','success'))">Copy Code</button></div>`).join(''); }

// ===== NOTIFICATIONS =====
function renderNotifications(){ if(!currentUser) return; const myN=DB.notifications.filter(n=>n.userId===currentUser.id); $('notif-list').innerHTML=myN.length?myN.map(n=>`<div class="notif-item ${!n.read?'unread':''}" onclick="this.querySelector('.notif-dot').className='notif-dot read'"><div class="notif-dot ${n.read?'read':''}"></div><div><div class="notif-title">${n.title}</div><div class="notif-msg">${n.message}</div><div class="notif-time">${n.createdAt}</div></div></div>`).join(''):'<div class="empty-state"><div class="empty-icon">🔔</div><div class="empty-title">No notifications</div></div>'; }

// ===== ADMIN DASHBOARD v2 =====
let adminSection2 = 'dashboard';

function renderAdminDashboard2(){
  initAdminSidebar();
  renderAdminSection2();
}

function initAdminSidebar(){
  document.querySelectorAll('#admin .sidebar-item[data-section]').forEach(el => {
    el.onclick = () => {
      adminSection2 = el.dataset.section;
      document.querySelectorAll('#admin .sidebar-item').forEach(x => x.classList.remove('active'));
      el.classList.add('active');
      // Close mobile sidebar
      const sb = document.querySelector('#admin .sidebar');
      if(sb) sb.classList.remove('open');
      const ov = document.querySelector('#admin-overlay');
      if(ov) ov.classList.remove('active');
      renderAdminSection2();
    };
  });

  // Logout
  const logoutBtn = $('admin-logout');
  if(logoutBtn) logoutBtn.onclick = doLogout;
  const mobileLogout = $('admin-mobile-logout');
  if(mobileLogout) mobileLogout.onclick = doLogout;

  // Mobile toggle
  initMobileSidebar('admin');
}

function initMobileSidebar(role){
  const prefix = role === 'admin' ? 'admin' : 'recept';
  const toggleBtn = $(`${prefix}-menu-toggle`);
  const sidebar = document.querySelector(`#${role} .sidebar`);

  // Create overlay if not exists
  let overlay = $(`${prefix}-overlay`);
  if(!overlay){
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.id = `${prefix}-overlay`;
    document.querySelector(`#${role} .dashboard-layout`).appendChild(overlay);
  }

  if(toggleBtn){
    toggleBtn.onclick = () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('active');
    };
  }
  overlay.onclick = () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
  };
}

function renderAdminSection2(){
  const c = $('admin-content');
  if(!c) return;
  switch(adminSection2){
    case 'dashboard':     renderAdminHome(); break;
    case 'receptionists': renderAdminReceptionists(); break;
    case 'customers':     renderAdminCustomers(); break;
    case 'appointments':  renderAdminAppts(); break;
    case 'services':      renderAdminServices(); break;
    case 'staff':         renderAdminStaff(); break;
    case 'payments':      renderAdminPayments(); break;
    case 'expenses':      renderAdminExpenses(); break;
    case 'attendance':    renderAdminAttendance(); break;
    case 'staff-accounts':renderAdminStaffAccounts(); break;
    case 'profile':       renderAdminProfile(); break;
    default: renderAdminHome();
  }
}

function renderAdminHome(){
  const appts = DB.appointments;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppts = appts.filter(a => a.date === todayStr);
  const grossRev  = getTotalRevenue();
  const totalExp  = getTotalExpenses();
  const netRev    = getNetRevenue();
  const todayRev  = todayAppts.filter(a => a.paymentStatus==='Paid').reduce((s,a)=>s+a.amount,0);
  const customers    = DB.users.filter(u => u.role==='customer');
  const receptionists= DB.users.filter(u => u.role==='receptionist');

  $('admin-content').innerHTML = `
    <div class="dash-welcome">
      <div class="dash-welcome-left">
        <h2>Welcome back, ${currentUser.name.split(' ')[0]}! 👑</h2>
        <p>Here's what's happening at Swarna's today.</p>
      </div>
      <div class="dash-welcome-right">
        <div>📅 ${today()}</div>
      </div>
    </div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon">👥</div><div class="stat-val">${customers.length}</div><div class="stat-label">Total Customers</div></div>
      <div class="stat-card"><div class="stat-icon">🛎️</div><div class="stat-val">${receptionists.length}</div><div class="stat-label">Receptionists</div></div>
      <div class="stat-card"><div class="stat-icon">📅</div><div class="stat-val">${todayAppts.length}</div><div class="stat-label">Today's Bookings</div></div>
      <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-val">${appts.filter(a=>a.status==='Completed').length}</div><div class="stat-label">Completed</div></div>
      <div class="stat-card"><div class="stat-icon">💰</div><div class="stat-val">₹${todayRev.toLocaleString()}</div><div class="stat-label">Today's Revenue</div></div>
      <div class="stat-card"><div class="stat-icon">📊</div><div class="stat-val">₹${grossRev.toLocaleString()}</div><div class="stat-label">Gross Revenue</div></div>
      <div class="stat-card"><div class="stat-icon">💸</div><div class="stat-val" style="color:var(--danger)">₹${totalExp.toLocaleString()}</div><div class="stat-label">Total Expenses</div></div>
      <div class="stat-card" style="border-color:var(--gold-dark)"><div class="stat-icon">💹</div><div class="stat-val" style="color:${netRev>=0?'var(--success)':'var(--danger)'}">₹${netRev.toLocaleString()}</div><div class="stat-label">Net Revenue</div><div class="stat-trend ${netRev>=0?'up':'down'}">${netRev>=0?'After expenses':'Loss'}</div></div>
    </div>
    <div class="admin-section">
      <h3 style="margin-bottom:16px;font-size:16px">📋 Recent Bookings</h3>
      ${appts.length ? `<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>ID</th><th>Customer</th><th>Service</th><th>Date</th><th>Status</th><th>Amount</th></tr></thead><tbody>
      ${DB.appointments.slice(-6).reverse().map(a=>{const svc=DB.services.find(s=>s.id===a.serviceId);const user=DB.users.find(u=>u.id===a.userId);return '<tr><td>#'+a.id+'</td><td>'+(user?.name||'—')+'</td><td>'+(svc?.name||'—')+'</td><td>'+a.date+'</td><td>'+statusBadge(a.status)+'</td><td>\u20b9'+a.amount+'</td></tr>';}).join('')}
      </tbody></table></div>` : '<div class="empty-state"><div class="empty-icon">📅</div><div class="empty-title">No bookings yet</div><div class="empty-sub">Bookings will appear here once customers are added</div></div>'}
    </div>`;
}


function renderAdminReceptionists(){
  const receptionists = DB.users.filter(u => u.role === 'receptionist');
  $('admin-content').innerHTML = `
    <div class="admin-section">
      <div class="admin-table-title">
        <h3>🛎️ Receptionist Management</h3>
        <button class="btn btn-gold btn-sm" onclick="toast('Add Receptionist — feature coming soon!','info')">+ Add Receptionist</button>
      </div>
      <div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>${receptionists.map(u=>`<tr>
        <td><div style="display:flex;align-items:center;gap:10px"><div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--rose-dark),var(--rose));display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:#2a0010">${u.name[0]}</div>${u.name}</div></td>
        <td>${u.email}</td><td>${u.phone}</td><td>${u.createdAt}</td>
        <td><span class="badge badge-success">Active</span></td>
        <td><div class="admin-action-row"><button class="btn btn-ghost btn-sm" onclick="toast('Edit feature coming soon!','info')">Edit</button><button class="btn btn-danger btn-sm" onclick="toast('Disable feature coming soon!','info')">Disable</button></div></td>
      </tr>`).join('')}</tbody></table></div>
    </div>`;
}

function renderAdminCustomers(){
  const customers=DB.users.filter(u=>u.role==='customer');
  $('admin-content').innerHTML=`<div class="admin-section"><div class="admin-table-title"><h3>Customer Management</h3><input class="search-admin" placeholder="Search..." oninput="filterTable(this,'cust-table')"></div><div class="admin-table-wrap"><table class="admin-table" id="cust-table"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Appointments</th><th>Spent</th><th>Membership</th></tr></thead><tbody>${customers.map(u=>{const appts=DB.appointments.filter(a=>a.userId===u.id);const spent=appts.filter(a=>a.paymentStatus==='Paid').reduce((s,a)=>s+a.amount,0);return `<tr><td>${u.name}</td><td>${u.email}</td><td>${u.phone}</td><td>${appts.length}</td><td>₹${spent}</td><td>${u.membership?`<span class="badge badge-gold">${u.membership}</span>`:'None'}</td></tr>`;}).join('')}</tbody></table></div></div>`;
}
function filterTable(input,tableId){ document.querySelectorAll(`#${tableId} tbody tr`).forEach(tr=>tr.style.display=tr.textContent.toLowerCase().includes(input.value.toLowerCase())?'':'none'); }
function renderAdminAppts(){ $('admin-content').innerHTML=`<div class="admin-section"><div class="admin-table-title"><h3>All Appointments</h3><input class="search-admin" placeholder="Search..." oninput="filterAdminAppts(this.value)" id="appt-search"></div><div class="admin-table-wrap"><table class="admin-table" id="appt-table"><thead><tr><th>ID</th><th>Customer</th><th>Service</th><th>Stylist</th><th>Date & Time</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead><tbody>${DB.appointments.map(a=>adminApptRow(a)).join('')}</tbody></table></div></div>`; }
function adminApptRow(a){ const svc=DB.services.find(s=>s.id===a.serviceId); const user=DB.users.find(u=>u.id===a.userId); const staff=DB.staff.find(s=>s.id===a.staffId); return `<tr><td>#${a.id}</td><td>${user?.name||'—'}</td><td>${svc?.name||'—'}</td><td>${staff?.name||'—'}</td><td>${a.date} ${formatTime(a.time)}</td><td>₹${a.amount}</td><td>${statusBadge(a.status)}</td><td><div class="admin-action-row">${a.status==='Confirmed'?`<button class="btn btn-success btn-sm" onclick="updateApptStatus(${a.id},'Completed')">✓ Done</button>`:''}${a.status!=='Cancelled'?`<button class="btn btn-danger btn-sm" onclick="updateApptStatus(${a.id},'Cancelled')">✕</button>`:''}</div></td></tr>`; }
function filterAdminAppts(q){ document.querySelectorAll('#appt-table tbody tr').forEach(tr=>{ tr.style.display=tr.textContent.toLowerCase().includes(q.toLowerCase())?'':'none'; }); }
async function updateApptStatus(id,status){ await apiUpdateApptStatus(id,status); renderAdminAppts(); toast(`Appointment ${status}`,'success'); }
function renderAdminServices(){ $('admin-content').innerHTML=`<div class="admin-section"><div class="admin-table-title"><h3>Services Management</h3><button class="btn btn-gold btn-sm" onclick="openAddServiceModal()">+ Add Service</button></div><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Name</th><th>Category</th><th>Gender</th><th>Price</th><th>Discount</th><th>Duration</th><th>Status</th><th>Actions</th></tr></thead><tbody>${DB.services.map(s=>`<tr><td>${s.name}</td><td>${s.category}</td><td><span class="badge ${genderColor(s.gender)}">${s.gender}</span></td><td>₹${s.price}</td><td>${s.discount?s.discount+'%':'—'}</td><td>${s.duration} min</td><td><span class="badge ${s.status?'badge-success':'badge-danger'}">${s.status?'Active':'Disabled'}</span></td><td><div class="admin-action-row"><button class="btn btn-ghost btn-sm" onclick="toggleService(${s.id})">${s.status?'Disable':'Enable'}</button></div></td></tr>`).join('')}</tbody></table></div></div>`; }
async function toggleService(id){ const s = await apiToggleService(id); renderAdminServices(); toast(`Service ${s.status?'enabled':'disabled'}`); }
function openAddServiceModal(){ openModal('add-service-modal'); $('save-service').onclick=saveService; }
async function saveService(){ const name=$('svc-name').value.trim(); if(!name)return toast('Enter service name','error'); const svcData={name,category:$('svc-cat').value,price:parseInt($('svc-price').value)||0,discount:parseInt($('svc-disc').value)||0,duration:parseInt($('svc-dur').value)||30,gender:$('svc-gender').value,description:$('svc-desc').value||name,image:'new',status:true,rating:0,reviews:0,benefits:[],prep:[]}; await apiSaveService(svcData); closeModal('add-service-modal');renderAdminServices();toast('Service added!','success'); }
function renderAdminStaff(){ $('admin-content').innerHTML=`<div class="admin-section"><div class="admin-table-title"><h3>Staff Management</h3><button class="btn btn-gold btn-sm">+ Add Staff</button></div><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Name</th><th>Specialization</th><th>Experience</th><th>Rating</th><th>Status</th><th>Actions</th></tr></thead><tbody>${DB.staff.map(s=>`<tr><td><div style="display:flex;align-items:center;gap:10px"><div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--gold-dark),var(--bg4));display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px">${s.name[0]}</div>${s.name}</div></td><td>${s.specialization}</td><td>${s.experience} yrs</td><td>⭐ ${s.rating}</td><td><span class="badge ${s.status?'badge-success':'badge-danger'}">${s.status?'Active':'Off'}</span></td><td><div class="admin-action-row"><button class="btn btn-ghost btn-sm" onclick="toggleStaff(${s.id})">${s.status?'Disable':'Enable'}</button></div></td></tr>`).join('')}</tbody></table></div></div>`; }
async function toggleStaff(id){ await apiToggleStaff(id); renderAdminStaff(); }
function renderAdminPayments(){ $('admin-content').innerHTML=`<div class="admin-section"><div class="admin-table-title"><h3>Payments & Revenue</h3></div><div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Txn ID</th><th>Customer</th><th>Service</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr></thead><tbody>${DB.appointments.filter(a=>a.transactionId).map(a=>{const svc=DB.services.find(s=>s.id===a.serviceId);const user=DB.users.find(u=>u.id===a.userId);return `<tr><td>${a.transactionId}</td><td>${user?.name||'—'}</td><td>${svc?.name||'—'}</td><td>₹${a.amount}</td><td>${a.paymentMethod}</td><td><span class="badge ${a.paymentStatus==='Paid'?'badge-success':'badge-warning'}">${a.paymentStatus}</span></td><td>${a.createdAt}</td></tr>`;}).join('')}</tbody></table></div></div>`; }

// ===== EXPENSES PANEL =====
function renderAdminExpenses(){
  const cats = ['Salary','Rent','Utilities','Products/Supplies','Equipment','Marketing','Miscellaneous'];
  const total = getTotalExpenses();
  $('admin-content').innerHTML = `
    <h2 class="dash-section-title">💸 Expenses</h2>
    <p class="dash-section-sub">Track all salon expenses to calculate net revenue</p>
    <div class="admin-section">
      <div class="admin-table-title">
        <div style="display:flex;flex-direction:column;gap:2px">
          <h3>Add New Expense</h3>
          <p style="font-size:12px;color:var(--text3)">Total Expenses So Far: <strong style="color:var(--danger)">₹${total.toLocaleString()}</strong></p>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
        <div class="form-group"><label class="form-label">Description</label><input id="exp-desc" class="form-control" placeholder="e.g. Purchased shampoos"></div>
        <div class="form-group"><label class="form-label">Category</label><select id="exp-cat" class="form-control">${cats.map(c=>'<option>'+c+'</option>').join('')}</select></div>
        <div class="form-group"><label class="form-label">Amount (₹)</label><input id="exp-amt" class="form-control" type="number" min="1" placeholder="500"></div>
        <div class="form-group"><label class="form-label">Date</label><input id="exp-date" class="form-control" type="date" value="${new Date().toISOString().split('T')[0]}"></div>
      </div>
      <button class="btn btn-gold" onclick="saveExpense()">+ Add Expense</button>
    </div>
    <div class="admin-section">
      <div class="admin-table-title"><h3>All Expenses</h3><input class="search-admin" placeholder="Search..." oninput="filterTable(this,'exp-table')"></div>
      ${DB.expenses.length ? `<div class="admin-table-wrap"><table class="admin-table" id="exp-table"><thead><tr><th>#</th><th>Description</th><th>Category</th><th>Amount</th><th>Date</th><th>Actions</th></tr></thead><tbody>
        ${DB.expenses.slice().reverse().map(e=>'<tr><td>#'+e.id+'</td><td>'+e.description+'</td><td><span class="badge badge-gray">'+e.category+'</span></td><td style="color:var(--danger);font-weight:600">₹'+e.amount.toLocaleString()+'</td><td>'+e.date+'</td><td><button class="btn btn-danger btn-sm" onclick="deleteExpense('+e.id+')">Delete</button></td></tr>').join('')}
      </tbody></table></div>` : '<div class="empty-state"><div class="empty-icon">💸</div><div class="empty-title">No expenses recorded</div><div class="empty-sub">Add your first expense above</div></div>'}
    </div>`;
}
async function saveExpense(){
  const desc = $('exp-desc').value.trim();
  const amt  = parseFloat($('exp-amt').value);
  const date = $('exp-date').value;
  const cat  = $('exp-cat').value;
  if(!desc) return toast('Enter description','error');
  if(!amt || amt <= 0) return toast('Enter valid amount','error');
  if(!date) return toast('Select date','error');
  await apiAddExpense({ description: desc, category: cat, amount: amt, date, addedBy: currentUser?.name || 'Admin' });
  toast('Expense added!','success');
  renderAdminExpenses();
}
function deleteExpense(id){
  if(!confirm('Delete this expense?')) return;
  DB.expenses = DB.expenses.filter(e => e.id !== id);
  saveDB();
  toast('Expense deleted','info');
  renderAdminExpenses();
}

// ===== ATTENDANCE (Admin View) =====
function renderAdminAttendance(){
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const now = new Date();
  const selMonth = $('att-month-sel') ? parseInt($('att-month-sel').value) : now.getMonth();
  const selYear  = $('att-year-sel')  ? parseInt($('att-year-sel').value)  : now.getFullYear();

  $('admin-content').innerHTML = `
    <h2 class="dash-section-title">🗓️ Staff Attendance</h2>
    <p class="dash-section-sub">Monthly attendance records marked by receptionist</p>
    <div class="admin-section">
      <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:20px">
        <select id="att-month-sel" class="form-control" style="width:160px" onchange="renderAdminAttendance()">
          ${months.map((m,i)=>'<option value="'+i+'"'+(i===selMonth?' selected':'')+'>'+m+'</option>').join('')}
        </select>
        <select id="att-year-sel" class="form-control" style="width:100px" onchange="renderAdminAttendance()">
          ${[now.getFullYear()-1, now.getFullYear(), now.getFullYear()+1].map(y=>'<option value="'+y+'"'+(y===selYear?' selected':'')+'>'+y+'</option>').join('')}
        </select>
      </div>
      ${renderAttendanceTable(selMonth, selYear)}
    </div>`;
}
function renderAttendanceTable(month, year){
  const prefix = year+'-'+String(month+1).padStart(2,'0');
  const filtered = DB.attendance.filter(a => a.date.startsWith(prefix));
  if(!filtered.length) return '<div class="empty-state"><div class="empty-icon">🗓️</div><div class="empty-title">No attendance data</div><div class="empty-sub">No records found for this month</div></div>';

  // Group by staff
  const byStaff = {};
  filtered.forEach(a=>{
    if(!byStaff[a.staffName]) byStaff[a.staffName]={full:0,half:0,records:[]};
    if(a.type==='full') byStaff[a.staffName].full++;
    else byStaff[a.staffName].half++;
    byStaff[a.staffName].records.push(a);
  });

  return Object.entries(byStaff).map(([name, data])=>{
    return '<div style="margin-bottom:20px">'+
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">'+
        '<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--gold-dark),var(--bg4));display:flex;align-items:center;justify-content:center;font-weight:700">'+name[0]+'</div>'+
        '<div><div style="font-weight:600">'+name+'</div>'+
          '<div style="font-size:12px;color:var(--text3)">Full: <b style="color:var(--success)">'+data.full+'</b> | Half: <b style="color:var(--warning)">'+data.half+'</b></div>'+
        '</div>'+
      '</div>'+
      '<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Date</th><th>Type</th><th>In Time</th><th>Out Time</th><th>Note</th><th>Marked By</th></tr></thead><tbody>'+
      data.records.sort((a,b)=>a.date.localeCompare(b.date)).map(r=>{
        const typeClass = r.type==='full'?'badge-success':'badge-warning';
        return '<tr><td>'+r.date+'</td><td><span class="badge '+typeClass+'">'+(r.type==='full'?'Full Day':'Half Day')+'</span></td><td>'+(r.inTime||'—')+'</td><td>'+(r.outTime||'—')+'</td><td style="font-size:12px;color:var(--text3)">'+(r.note||'—')+'</td><td style="font-size:12px">'+r.markedBy+'</td></tr>';
      }).join('')+
      '</tbody></table></div></div>';
  }).join('');
}

// ===== MANAGE LOGINS (Staff Accounts) =====
function renderAdminStaffAccounts(){
  const receptionists = DB.users.filter(u => u.role === 'receptionist');
  $('admin-content').innerHTML = `
    <h2 class="dash-section-title">🔑 Manage Logins</h2>
    <p class="dash-section-sub">Set username and password for receptionists and staff accounts</p>

    <!-- Add New Receptionist -->
    <div class="admin-section">
      <h3 style="margin-bottom:16px">➕ Add New Receptionist Account</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
        <div class="form-group"><label class="form-label">Full Name</label><input id="na-name" class="form-control" placeholder="Staff name"></div>
        <div class="form-group"><label class="form-label">Phone</label><input id="na-phone" class="form-control" type="tel" placeholder="10-digit number"></div>
        <div class="form-group"><label class="form-label">Login Username / Email</label><input id="na-email" class="form-control" placeholder="e.g. recept2@swarna.com"></div>
        <div class="form-group"><label class="form-label">Password</label><input id="na-pass" class="form-control" type="password" placeholder="Set password"></div>
      </div>
      <button class="btn btn-gold" onclick="addReceptionistAccount()">Create Account</button>
    </div>

    <!-- Existing Accounts -->
    <div class="admin-section">
      <h3 style="margin-bottom:16px">👥 Existing Receptionist Accounts</h3>
      ${receptionists.length ? `<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Name</th><th>Login ID</th><th>Phone</th><th>New Password</th><th>Actions</th></tr></thead><tbody>
        ${receptionists.map(u=>`<tr>
          <td><div style="display:flex;align-items:center;gap:8px"><div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--rose-dark),var(--rose));display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:#2a0010">${u.name[0]}</div>${u.name}</div></td>
          <td style="font-size:13px">${u.email}</td>
          <td>${u.phone}</td>
          <td><input class="form-control" type="password" placeholder="New password" id="pass-${u.id}" style="width:160px;padding:6px 10px;font-size:13px"></td>
          <td><div class="admin-action-row"><button class="btn btn-gold btn-sm" onclick="updateAccountPassword(${u.id})">Update</button><button class="btn btn-danger btn-sm" onclick="deleteAccount(${u.id})">Remove</button></div></td>
        </tr>`).join('')}
      </tbody></table></div>` : '<div class="empty-state"><div class="empty-icon">👥</div><div class="empty-title">No receptionist accounts</div></div>'}
    </div>`;
}
async function addReceptionistAccount(){
  const name  = $('na-name').value.trim();
  const phone = $('na-phone').value.trim();
  const email = $('na-email').value.trim();
  const pass  = $('na-pass').value.trim();
  if(!name||!email||!pass) return toast('Fill all required fields','error');
  const res = await apiAddStaffAccount({ name, phone, email, password: pass, role: 'receptionist' });
  if(res.error) return toast(res.error,'error');
  toast('Receptionist account created!','success');
  renderAdminStaffAccounts();
}
function updateAccountPassword(uid){
  const newPass = $('pass-'+uid)?.value.trim();
  if(!newPass) return toast('Enter new password','error');
  fetch(`${API_BASE_URL}/users/${uid}/password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newPassword: newPass })
  }).then(()=>{
    const u = DB.users.find(x=>x.id===uid);
    if(u) u.password = newPass;
    saveDB();
    toast('Password updated!','success');
    renderAdminStaffAccounts();
  });
}
async function deleteAccount(uid){
  if(!confirm('Remove this account?')) return;
  await apiDeleteStaffAccount(uid);
  toast('Account removed','info');
  renderAdminStaffAccounts();
}

function renderAdminProfile(){
  $('admin-content').innerHTML = `
    <div class="admin-section" style="max-width:480px">
      <h3 style="margin-bottom:20px">👤 Admin Profile</h3>
      <div style="text-align:center;margin-bottom:24px">
        <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,var(--gold-dark),var(--gold));display:flex;align-items:center;justify-content:center;font-size:36px;margin:0 auto 12px;border:3px solid var(--gold-dark)">${currentUser.name[0]}</div>
        <h2 style="font-size:20px;color:var(--gold)">${currentUser.name}</h2>
        <p style="color:var(--text3);font-size:13px">${currentUser.email}</p>
        <span class="badge badge-gold" style="margin-top:8px">🛡️ Administrator</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;font-size:14px">
        <div style="display:flex;justify-content:space-between;padding:12px;background:var(--bg3);border-radius:8px"><span style="color:var(--text3)">Phone</span><span>${currentUser.phone}</span></div>
        <div style="display:flex;justify-content:space-between;padding:12px;background:var(--bg3);border-radius:8px"><span style="color:var(--text3)">Role</span><span>System Administrator</span></div>
        <div style="display:flex;justify-content:space-between;padding:12px;background:var(--bg3);border-radius:8px"><span style="color:var(--text3)">Joined</span><span>${currentUser.createdAt}</span></div>
      </div>
      <button class="btn btn-danger btn-full" style="margin-top:24px" onclick="doLogout()">🚪 Logout</button>
    </div>`;
}

// ===== RECEPTIONIST DASHBOARD =====
let receptSection2 = 'overview';

function renderReceptionistDashboard(){
  initReceptionistSidebar();
  renderReceptionistSection();
}

function initReceptionistSidebar(){
  document.querySelectorAll('#receptionist .sidebar-item[data-section]').forEach(el => {
    el.onclick = () => {
      receptSection2 = el.dataset.section;
      document.querySelectorAll('#receptionist .sidebar-item').forEach(x => x.classList.remove('active'));
      el.classList.add('active');
      const sb = document.querySelector('#receptionist .sidebar');
      if(sb) sb.classList.remove('open');
      const ov = $('recept-overlay');
      if(ov) ov.classList.remove('active');
      renderReceptionistSection();
    };
  });

  const logoutBtn = $('recept-logout');
  if(logoutBtn) logoutBtn.onclick = doLogout;
  const mobileLogout = $('recept-mobile-logout');
  if(mobileLogout) mobileLogout.onclick = doLogout;

  initMobileSidebar('receptionist');

  // Pre-populate walk-in modal
  const svcSel = $('walkin-service');
  if(svcSel){
    svcSel.innerHTML = DB.services.filter(s=>s.status).map(s=>`<option value="${s.id}">${s.name} — ₹${getDiscountedPrice(s)}</option>`).join('');
  }
  const staffSel = $('walkin-staff');
  if(staffSel){
    staffSel.innerHTML = DB.staff.filter(s=>s.status).map(s=>`<option value="${s.id}">${s.name}</option>`).join('');
  }
  const walkinDate = $('walkin-date');
  if(walkinDate) walkinDate.value = new Date().toISOString().split('T')[0];

  const walkinConfirm = $('walkin-confirm');
  if(walkinConfirm) walkinConfirm.onclick = confirmWalkIn;
}

function renderReceptionistSection(){
  const c = $('recept-content');
  if(!c) return;
  switch(receptSection2){
    case 'overview':    renderReceptOverview(); break;
    case 'bookings':    renderReceptBookings(); break;
    case 'customers':   renderReceptCustomers(); break;
    case 'attendance':  renderReceptAttendance(); break;
    case 'rec-profile': renderReceptProfile(); break;
    default: renderReceptOverview();
  }
}

function renderReceptOverview(){
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppts = DB.appointments.filter(a => a.date === todayStr);
  const confirmed = todayAppts.filter(a => a.status === 'Confirmed').length;
  const completed = todayAppts.filter(a => a.status === 'Completed').length;
  const customers = DB.users.filter(u => u.role === 'customer');

  $('recept-content').innerHTML = `
    <div class="dash-welcome recept-dash-welcome">
      <div class="dash-welcome-left">
        <h2>Good day, ${currentUser.name.split(' ')[0]}! 🛎️</h2>
        <p>Front desk overview — manage bookings, check-ins, and customers.</p>
      </div>
      <div class="dash-welcome-right">
        <div>📅 ${today()}</div>
      </div>
    </div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon">📅</div><div class="stat-val">${todayAppts.length}</div><div class="stat-label">Today's Total</div></div>
      <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-val">${confirmed}</div><div class="stat-label">Confirmed</div><div class="stat-trend up">Upcoming</div></div>
      <div class="stat-card"><div class="stat-icon">🏁</div><div class="stat-val">${completed}</div><div class="stat-label">Completed</div></div>
      <div class="stat-card"><div class="stat-icon">👥</div><div class="stat-val">${customers.length}</div><div class="stat-label">Total Customers</div></div>
    </div>
    <h3 style="font-size:16px;margin-bottom:14px;color:var(--text2)">⚡ Quick Actions</h3>
    <div class="recept-action-grid">
      <div class="recept-action-card" onclick="switchReceptSection('bookings')">
        <div class="recept-action-icon">📋</div>
        <div class="recept-action-title">View Bookings</div>
        <div class="recept-action-desc">See all today's and upcoming appointments</div>
      </div>
      <div class="recept-action-card" onclick="openModal('walkin-modal')">
        <div class="recept-action-icon">➕</div>
        <div class="recept-action-title">Walk-in Booking</div>
        <div class="recept-action-desc">Create a quick appointment for walk-in clients</div>
      </div>
      <div class="recept-action-card" onclick="switchReceptSection('customers')">
        <div class="recept-action-icon">👥</div>
        <div class="recept-action-title">Customer Directory</div>
        <div class="recept-action-desc">View and search all customer records</div>
      </div>
    </div>
    <div class="admin-section">
      <h3 style="margin-bottom:16px;font-size:16px">📋 Today's Appointments</h3>
      ${todayAppts.length ? `<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>ID</th><th>Customer</th><th>Service</th><th>Stylist</th><th>Time</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>${todayAppts.map(a=>{
        const svc=DB.services.find(s=>s.id===a.serviceId);
        const user=DB.users.find(u=>u.id===a.userId);
        const staff=DB.staff.find(s=>s.id===a.staffId);
        return `<tr><td>#${a.id}</td><td>${user?.name||'Walk-in'}</td><td>${svc?.name||'—'}</td><td>${staff?.name||'—'}</td><td>${formatTime(a.time)}</td><td>${statusBadge(a.status)}</td>
        <td><div class="admin-action-row">${a.status==='Confirmed'?`<button class="btn btn-success btn-sm" onclick="receptionistUpdateStatus(${a.id},'In Progress')">✓ Check In</button>`:''}${a.status==='In Progress'?`<button class="btn btn-gold btn-sm" onclick="receptionistUpdateStatus(${a.id},'Completed')">✓ Done</button>`:''}</div></td></tr>`;
      }).join('')}</tbody></table></div>` : `<div class="empty-state"><div class="empty-icon">📅</div><div class="empty-title">No appointments today</div><div class="empty-sub">Walk-in clients can be added using the button above</div></div>`}
    </div>`;
}

function switchReceptSection(section){
  receptSection2 = section;
  document.querySelectorAll('#receptionist .sidebar-item').forEach(x => {
    x.classList.toggle('active', x.dataset.section === section);
  });
  renderReceptionistSection();
}

function renderReceptBookings(){
  const appts = [...DB.appointments].reverse();
  $('recept-content').innerHTML = `
    <h2 class="dash-section-title">📅 Bookings & Reservations</h2>
    <p class="dash-section-sub">View and manage all customer appointments</p>
    <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap">
      <button class="btn btn-gold btn-sm" onclick="openModal('walkin-modal')">➕ New Walk-in Booking</button>
    </div>
    <div class="admin-section">
      <div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>ID</th><th>Customer</th><th>Service</th><th>Stylist</th><th>Date & Time</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>${appts.map(a=>{
        const svc=DB.services.find(s=>s.id===a.serviceId);
        const user=DB.users.find(u=>u.id===a.userId);
        const staff=DB.staff.find(s=>s.id===a.staffId);
        return `<tr><td>#${a.id}</td><td>${user?.name||'Walk-in'}</td><td>${svc?.name||'—'}</td><td>${staff?.name||'—'}</td><td>${a.date} ${formatTime(a.time)}</td><td>₹${a.amount}</td><td>${statusBadge(a.status)}</td>
        <td><div class="admin-action-row">${a.status==='Confirmed'?`<button class="btn btn-success btn-sm" onclick="receptionistUpdateStatus(${a.id},'In Progress')">Check In</button>`:''}${a.status==='In Progress'?`<button class="btn btn-gold btn-sm" onclick="receptionistUpdateStatus(${a.id},'Completed')">Done</button>`:''}${a.status!=='Cancelled'&&a.status!=='Completed'?`<button class="btn btn-danger btn-sm" onclick="receptionistUpdateStatus(${a.id},'Cancelled')">✕</button>`:''}${a.status==='Completed'||a.status==='In Progress'||a.status==='Confirmed'?`<button class="btn btn-outline btn-sm" onclick="generateBill(${a.id})">🧾 Bill</button>`:''}</div></td></tr>`;
      }).join('')}</tbody></table></div>
    </div>`;
}

function renderReceptCheckInOut(){
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppts = DB.appointments.filter(a => a.date === todayStr && a.status !== 'Cancelled');
  $('recept-content').innerHTML = `
    <h2 class="dash-section-title">⚡ Check-in / Check-out</h2>
    <p class="dash-section-sub">Manage client arrivals and departures in real-time</p>
    <div class="admin-section">
      ${todayAppts.length ? `<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Customer</th><th>Service</th><th>Stylist</th><th>Time</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>${todayAppts.map(a=>{
        const svc=DB.services.find(s=>s.id===a.serviceId);
        const user=DB.users.find(u=>u.id===a.userId);
        const staff=DB.staff.find(s=>s.id===a.staffId);
        const statusClass = a.status==='Confirmed'?'status-waiting':a.status==='In Progress'?'status-checkin':'status-checkout';
        return `<tr><td>${user?.name||'Walk-in'}</td><td>${svc?.name||'—'}</td><td>${staff?.name||'—'}</td><td>${formatTime(a.time)}</td><td>₹${a.amount}</td>
        <td><span class="${statusClass}">${a.status==='Confirmed'?'Waiting':a.status==='In Progress'?'Checked In':'Done'}</span></td>
        <td><div class="admin-action-row">
          ${a.status==='Confirmed'?`<button class="btn btn-success btn-sm" onclick="receptionistUpdateStatus(${a.id},'In Progress')">✓ Check In</button>`:''}
          ${a.status==='In Progress'?`<button class="btn btn-gold btn-sm" onclick="receptionistUpdateStatus(${a.id},'Completed')">✓ Check Out</button>`:''}
          ${a.status==='Completed'?`<span style="color:var(--success);font-size:12px">✅ Done</span>`:''}
          <button class="btn btn-outline btn-sm" onclick="generateBill(${a.id})">🧾 Bill</button>
        </div></td></tr>`;
      }).join('')}</tbody></table></div>`
      : `<div class="empty-state"><div class="empty-icon">⚡</div><div class="empty-title">No appointments today</div><div class="empty-sub">All clear! Add walk-in bookings from the Bookings section.</div></div>`}
    </div>`;
}

function renderReceptCustomers(){
  const customers = DB.users.filter(u => u.role === 'customer');
  $('recept-content').innerHTML = `
    <h2 class="dash-section-title">👥 Customer Directory</h2>
    <p class="dash-section-sub">View and manage customer information and visit history</p>
    <div class="admin-section">
      <div class="admin-table-title">
        <h3>All Customers (${customers.length})</h3>
        <input class="search-admin" placeholder="Search customers..." oninput="filterTable(this,'recept-cust-table')">
      </div>
      <div class="admin-table-wrap"><table class="admin-table" id="recept-cust-table"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Bookings</th><th>Total Spent</th><th>Membership</th></tr></thead>
      <tbody>${customers.map(u=>{
        const appts=DB.appointments.filter(a=>a.userId===u.id);
        const spent=appts.filter(a=>a.paymentStatus==='Paid').reduce((s,a)=>s+a.amount,0);
        return `<tr><td><div style="display:flex;align-items:center;gap:8px"><div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,var(--gold-dark),var(--bg4));display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700">${u.name[0]}</div>${u.name}</div></td>
        <td>${u.email}</td><td>${u.phone}</td><td>${appts.length}</td><td>₹${spent}</td>
        <td>${u.membership?`<span class="badge badge-gold">${u.membership}</span>`:'—'}</td></tr>`;
      }).join('')}</tbody></table></div>
    </div>`;
}

function renderReceptSchedule(){
  const todayStr = new Date().toISOString().split('T')[0];
  $('recept-content').innerHTML = `
    <h2 class="dash-section-title">🕒 Daily Stylist Schedule</h2>
    <p class="dash-section-sub">Today's stylist bookings and availability — ${today()}</p>
    ${DB.staff.filter(s=>s.status).map(s=>{
      const todaySlots = DB.appointments.filter(a=>a.staffId===s.id&&a.date===todayStr&&a.status!=='Cancelled');
      return `<div class="admin-section">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
          <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,var(--gold-dark),var(--bg4));display:flex;align-items:center;justify-content:center;font-weight:700">${s.name[0]}</div>
          <div><div style="font-weight:600">${s.name}</div><div style="font-size:12px;color:var(--text3)">${s.specialization} • ${s.workingHours.start}–${s.workingHours.end}</div></div>
          <span class="badge badge-success" style="margin-left:auto">${todaySlots.length} bookings</span>
        </div>
        ${todaySlots.length ? `<div class="admin-table-wrap"><table class="schedule-table"><thead><tr><th>Time</th><th>Customer</th><th>Service</th><th>Duration</th><th>Status</th></tr></thead><tbody>
        ${todaySlots.map(a=>{
          const svc=DB.services.find(x=>x.id===a.serviceId);
          const user=DB.users.find(u=>u.id===a.userId);
          return `<tr><td>${formatTime(a.time)}</td><td>${user?.name||'Walk-in'}</td><td>${svc?.name||'—'}</td><td>${a.duration} min</td><td>${statusBadge(a.status)}</td></tr>`;
        }).join('')}</tbody></table></div>`:`<div style="color:var(--text3);font-size:13px;padding:12px 0">No bookings today — Available all day</div>`}
      </div>`;
    }).join('')}`;
}

function renderReceptNotifications(){
  $('recept-content').innerHTML = `
    <h2 class="dash-section-title">🔔 Notifications</h2>
    <p class="dash-section-sub">System alerts and booking notifications</p>
    <div class="admin-section">
      ${DB.notifications.slice().reverse().map(n=>`
        <div class="notif-item ${!n.read?'unread':''}">
          <div class="notif-dot ${n.read?'read':''}"></div>
          <div>
            <div class="notif-title">${n.title}</div>
            <div class="notif-msg">${n.message}</div>
            <div class="notif-time">${n.createdAt}</div>
          </div>
        </div>`).join('')}
    </div>`;
}

// ===== RECEPTIONIST: STAFF ATTENDANCE MARKING =====
function renderReceptAttendance(){
  const today = new Date().toISOString().split('T')[0];
  $('recept-content').innerHTML = `
    <h2 class="dash-section-title">🗓️ Staff Attendance</h2>
    <p class="dash-section-sub">Mark daily attendance for each staff member</p>

    <div class="admin-section">
      <h3 style="margin-bottom:16px">📝 Mark Today's Attendance</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
        <div class="form-group">
          <label class="form-label">Staff Member</label>
          <select id="att-staff" class="form-control">
            <option value="">-- Select Staff --</option>
            ${DB.staff.filter(s=>s.status).map(s=>`<option value="${s.id}">${s.name} — ${s.specialization}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Date</label>
          <input id="att-date" class="form-control" type="date" value="${today}">
        </div>
        <div class="form-group">
          <label class="form-label">Attendance Type</label>
          <select id="att-type" class="form-control" onchange="toggleAttHalfFields()">
            <option value="full">Full Day</option>
            <option value="half">Half Day</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">In Time</label>
          <input id="att-in" class="form-control" type="time" value="09:00">
        </div>
        <div class="form-group" id="att-out-grp">
          <label class="form-label">Out Time (if left early)</label>
          <input id="att-out" class="form-control" type="time">
        </div>
        <div class="form-group">
          <label class="form-label">Note (optional)</label>
          <input id="att-note" class="form-control" placeholder="e.g. Left early due to illness">
        </div>
      </div>
      <button class="btn btn-gold" onclick="markAttendance()">✓ Mark Attendance</button>
    </div>

    <!-- Today's Records -->
    <div class="admin-section">
      <div class="admin-table-title"><h3>📋 Attendance Records — Today (${today})</h3></div>
      ${(()=>{
        const todayRecs = DB.attendance.filter(a => a.date === today);
        if(!todayRecs.length) return '<div class="empty-state"><div class="empty-icon">🗓️</div><div class="empty-title">No records today</div><div class="empty-sub">Mark attendance for staff members above</div></div>';
        return '<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Staff</th><th>Type</th><th>In Time</th><th>Out Time</th><th>Note</th><th>Actions</th></tr></thead><tbody>'+
          todayRecs.map(r=>{
            const tc = r.type==='full'?'badge-success':'badge-warning';
            return '<tr><td><b>'+r.staffName+'</b></td><td><span class="badge '+tc+'">'+(r.type==='full'?'Full Day':'Half Day')+'</span></td><td>'+(r.inTime||'—')+'</td><td>'+(r.outTime||'—')+'</td><td style="font-size:12px;color:var(--text3)">'+(r.note||'—')+'</td><td><button class="btn btn-danger btn-sm" onclick="deleteAttendance('+r.id+')">Remove</button></td></tr>';
          }).join('')+
          '</tbody></table></div>';
      })()}
    </div>`;
}
function toggleAttHalfFields(){
  const type = $('att-type')?.value;
  if($('att-out-grp')) $('att-out-grp').style.display = type === 'half' ? '' : 'none';
}
async function markAttendance(){
  const staffId = parseInt($('att-staff')?.value);
  const date    = $('att-date')?.value;
  const type    = $('att-type')?.value;
  const inTime  = $('att-in')?.value;
  const outTime = $('att-out')?.value;
  const note    = $('att-note')?.value.trim();

  if(!staffId) return toast('Select a staff member','error');
  if(!date)    return toast('Select a date','error');

  const staff = DB.staff.find(s => s.id === staffId);
  const res = await apiAddAttendance({
    staffId, staffName: staff.name,
    date, type, inTime: inTime||'', outTime: outTime||'',
    note: note||'',
    markedBy: currentUser.name
  });
  if(res.error) return toast(res.error, 'warning');
  toast('Attendance marked!','success');
  renderReceptAttendance();
}
function deleteAttendance(id){
  if(!confirm('Remove this attendance record?')) return;
  DB.attendance = DB.attendance.filter(a => a.id !== id);
  saveDB();
  toast('Record removed','info');
  renderReceptAttendance();
}

function renderReceptProfile(){
  $('recept-content').innerHTML = `
    <div class="admin-section" style="max-width:480px">
      <h3 style="margin-bottom:20px">👤 My Profile</h3>
      <div style="text-align:center;margin-bottom:24px">
        <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,var(--rose-dark),var(--rose));display:flex;align-items:center;justify-content:center;font-size:36px;margin:0 auto 12px;border:3px solid var(--rose);color:#2a0010">${currentUser.name[0]}</div>
        <h2 style="font-size:20px;color:var(--rose)">${currentUser.name}</h2>
        <p style="color:var(--text3);font-size:13px">${currentUser.email}</p>
        <span class="badge" style="margin-top:8px;background:rgba(232,160,191,0.15);color:var(--rose);border:1px solid rgba(232,160,191,0.3)">🛎️ Receptionist</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;font-size:14px">
        <div style="display:flex;justify-content:space-between;padding:12px;background:var(--bg3);border-radius:8px"><span style="color:var(--text3)">Phone</span><span>${currentUser.phone}</span></div>
        <div style="display:flex;justify-content:space-between;padding:12px;background:var(--bg3);border-radius:8px"><span style="color:var(--text3)">Role</span><span>Front Desk Receptionist</span></div>
        <div style="display:flex;justify-content:space-between;padding:12px;background:var(--bg3);border-radius:8px"><span style="color:var(--text3)">Joined</span><span>${currentUser.createdAt}</span></div>
      </div>
      <button class="btn btn-danger btn-full" style="margin-top:24px" onclick="doLogout()">🚪 Logout</button>
    </div>`;
}

function receptionistUpdateStatus(id, status){
  const a = DB.appointments.find(x => x.id === id);
  if(a){ a.status = status; saveDB(); toast(`Status updated to ${status}`, 'success'); renderReceptionistSection(); }
}

// ===== BILL / RECEIPT GENERATION =====
function generateBill(apptId){
  const a = DB.appointments.find(x => x.id === apptId);
  if(!a){ toast('Appointment not found','error'); return; }

  const svc   = DB.services.find(s => s.id === a.serviceId);
  const user  = DB.users.find(u => u.id === a.userId);
  const staff = DB.staff.find(s => s.id === a.staffId);

  // Compute amounts
  const basePrice  = svc ? getDiscountedPrice(svc) : a.amount;
  const discount   = a.discount || 0;
  const tax        = a.tax || Math.round(basePrice * 0.05);
  const total      = a.amount;

  // Bill No & generated datetime
  const now = new Date();
  const billDT = now.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) +
                 ' ' + now.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});

  // Populate modal fields
  $('bill-id').textContent        = '#BILL-' + String(apptId).padStart(4,'0');
  $('bill-datetime').textContent  = billDT;
  $('bill-cust-name').textContent = user?.name  || a.customerName || 'Walk-in Customer';
  $('bill-cust-phone').textContent= user?.phone || a.customerPhone || 'N/A';
  $('bill-service').textContent   = svc?.name   || '—';
  $('bill-stylist').textContent   = staff?.name || 'Any Available';
  $('bill-date').textContent      = formatDate(a.date);
  $('bill-time').textContent      = formatTime(a.time);
  $('bill-duration').textContent  = `${a.duration || svc?.duration || '—'} min`;
  $('bill-pay-mode').textContent  = a.paymentMethod || '—';
  $('bill-price').textContent     = `₹${basePrice + discount}`;
  $('bill-discount').textContent  = discount > 0 ? `-₹${discount}` : '—';
  $('bill-tax').textContent       = `₹${tax}`;
  $('bill-total').textContent     = `₹${total}`;
  $('bill-pay-status').textContent= a.paymentStatus || 'Paid';

  openModal('bill-modal');
}

function printBill(){
  // Gather current bill data from the modal DOM
  const billNo    = $('bill-id')?.textContent        || '';
  const billDT    = $('bill-datetime')?.textContent  || '';
  const custName  = $('bill-cust-name')?.textContent || '';
  const custPhone = $('bill-cust-phone')?.textContent|| '';
  const service   = $('bill-service')?.textContent   || '';
  const stylist   = $('bill-stylist')?.textContent   || '';
  const date      = $('bill-date')?.textContent      || '';
  const time      = $('bill-time')?.textContent      || '';
  const duration  = $('bill-duration')?.textContent  || '';
  const payMode   = $('bill-pay-mode')?.textContent  || '';
  const price     = $('bill-price')?.textContent     || '';
  const discount  = $('bill-discount')?.textContent  || '';
  const tax       = $('bill-tax')?.textContent       || '';
  const total     = $('bill-total')?.textContent     || '';
  const payStatus = $('bill-pay-status')?.textContent|| 'Paid';

  // 80mm thermal printer — 42 chars per line at typical font size
  const LINE  = '----------------------------------------';
  const DLINE = '========================================';

  // Helper: pad a label + value to fill 42 chars
  function row(label, value) {
    const pad = 42 - label.length - String(value).length;
    return label + ' '.repeat(Math.max(1, pad)) + value;
  }

  const printWin = window.open('', '_blank', 'width=380,height=720');
  printWin.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>Receipt</title>
  <meta charset="UTF-8">
  <style>
    @page {
      size: 80mm auto;       /* 80mm thermal roll */
      margin: 4mm 4mm;
    }
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 12px;
      color: #000;
      background: #fff;
      width: 72mm;           /* usable print width on 80mm paper */
      padding: 0;
    }
    .center  { text-align: center; }
    .bold    { font-weight: bold; }
    .large   { font-size: 15px; }
    .xlarge  { font-size: 18px; font-weight: bold; }
    .line    { border-top: 1px dashed #000; margin: 4px 0; }
    .dline   { border-top: 2px solid #000; margin: 4px 0; }
    .row     { display: flex; justify-content: space-between; padding: 1px 0; }
    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 15px;
      font-weight: bold;
      padding: 4px 0;
      border-top: 2px solid #000;
      border-bottom: 2px solid #000;
      margin: 4px 0;
    }
    .footer  { text-align: center; margin-top: 8px; font-size: 11px; }
    .logo-text { font-size: 16px; font-weight: bold; letter-spacing: 1px; }
    .tagline { font-size: 10px; margin-top: 2px; }
    .section-title { font-weight: bold; margin: 6px 0 3px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
    .badge { border: 1px solid #000; padding: 1px 6px; font-size: 10px; display: inline-block; }
    @media print {
      body { width: 72mm; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <div class="center">
    <div class="logo-text">SWARNA'S</div>
    <div class="tagline">Unisex Saloon &amp; Spa</div>
    <div style="font-size:10px;margin-top:2px">Koramangala, Bangalore</div>
    <div style="font-size:10px">Ph: +91 98765 43210</div>
    <div style="font-size:10px">GSTIN: 29AAACS1234A1Z5</div>
  </div>

  <div class="dline"></div>
  <div class="center bold large">TAX INVOICE / RECEIPT</div>
  <div class="dline"></div>

  <!-- BILL META -->
  <div class="row">
    <span>Bill No: <b>${billNo}</b></span>
    <span>${billDT}</span>
  </div>

  <div class="line"></div>

  <!-- CUSTOMER -->
  <div class="section-title">Customer</div>
  <div class="row"><span>Name</span><span><b>${custName}</b></span></div>
  <div class="row"><span>Phone</span><span>${custPhone}</span></div>

  <div class="line"></div>

  <!-- SERVICE -->
  <div class="section-title">Service Details</div>
  <div class="row"><span>Service</span><span><b>${service}</b></span></div>
  <div class="row"><span>Stylist</span><span>${stylist}</span></div>
  <div class="row"><span>Date</span><span>${date}</span></div>
  <div class="row"><span>Time</span><span>${time}</span></div>
  <div class="row"><span>Duration</span><span>${duration}</span></div>
  <div class="row"><span>Payment</span><span>${payMode}</span></div>

  <div class="line"></div>

  <!-- AMOUNT -->
  <div class="section-title">Amount Breakdown</div>
  <div class="row"><span>Service Price</span><span>${price}</span></div>
  <div class="row"><span>Discount</span><span>${discount}</span></div>
  <div class="row"><span>GST / Tax (5%)</span><span>${tax}</span></div>

  <div class="total-row">
    <span>TOTAL</span>
    <span>${total}</span>
  </div>

  <!-- PAYMENT STATUS -->
  <div class="center" style="margin:6px 0">
    Payment Status: <span class="badge">${payStatus.toUpperCase()}</span>
  </div>

  <div class="dline"></div>

  <!-- FOOTER -->
  <div class="footer">
    <div>** Thank you for visiting! **</div>
    <div>Please come again.</div>
    <div style="margin-top:4px">info@swarnaspa.com</div>
    <div style="margin-top:8px; font-size:10px">--------------------------------</div>
    <div style="font-size:10px">Powered by Swarna POS v1.0</div>
  </div>

  <!-- auto-print -->
  <script>
    window.onload = function() {
      window.print();
      setTimeout(function(){ window.close(); }, 1000);
    };
  <\/script>
</body>
</html>`);
  printWin.document.close();
}

// ===== WALK-IN BOOKING =====
function confirmWalkIn(){
  const name   = $('walkin-name').value.trim();
  const phone  = $('walkin-phone').value.trim();
  const svcId  = parseInt($('walkin-service').value);
  const stfId  = parseInt($('walkin-staff').value);
  const date   = $('walkin-date').value;
  const time   = $('walkin-time').value;
  const method = $('walkin-payment').value;

  if(!name){ toast('Enter customer name','error'); return; }
  if(!date||!time){ toast('Select date and time','error'); return; }

  // Find or create customer by phone
  let user = phone ? DB.users.find(u => u.phone === phone) : null;
  if(!user){
    const newId = DB.nextId.user++;
    user = { id:newId, name, phone:phone||'N/A', email:`walkin${newId}@swarna.local`, password:'', role:'customer', profileImage:'', membership:null, createdAt:new Date().toISOString().split('T')[0] };
    DB.users.push(user);
  }

  const svc = DB.services.find(s => s.id === svcId);
  if(!svc){ toast('Invalid service','error'); return; }
  const price = getDiscountedPrice(svc);
  const tax   = Math.round(price * 0.05);
  const total = price + tax;

  const appt = createAppointment({
    userId: user.id,
    serviceId: svcId,
    staffId: stfId,
    date,
    time,
    duration: svc.duration,
    amount: total,
    discount: 0,
    tax,
    paymentMethod: method,
    transactionId: 'WLK' + Date.now().toString().slice(-6)
  });

  if(appt.error){ toast(appt.error,'error'); return; }

  closeModal('walkin-modal');
  // Reset modal
  ['walkin-name','walkin-phone'].forEach(id=>{ const el=$(id); if(el) el.value=''; });
  toast(`Walk-in booking confirmed for ${name}! Booking #${appt.id}`, 'success');
  renderReceptionistSection();
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initAuth();
  initDesktopNav();
  initRoleSelect();

  // Back buttons (customer screens)
  const back = (id, screen) => { const el=$(id); if(el) el.onclick=()=>navTo(screen); };
  back('serv-back','home');
  $('serv-back').onclick = () => { navTo('home'); renderHome(); };
  back('detail-back','services');
  back('stylist-back','service-detail');
  back('dt-back','stylist-select');
  back('sum-back','datetime');
  back('pay-back','booking-summary');
  $('conf-home').onclick = () => { navTo('home'); renderHome(); };
  back('mem-back','profile');
  back('offers-back','profile');
  back('fav-back','profile');
  back('notif-back','profile');
  back('loc-back','profile');

  // Membership page
  const mc = document.querySelector('.membership-cards');
  if(mc) mc.innerHTML = DB.memberships.map(m=>`<div class="membership-card ${m.name.toLowerCase()}"><div class="mem-name serif" style="color:${m.color}">${m.name}</div><div class="mem-price">₹${m.price}<span>/year</span></div><div style="font-size:14px;color:var(--text3);margin-top:4px">${m.discount}% discount on all services</div><ul class="mem-benefits">${m.benefits.map(b=>`<li class="mem-benefit"><span style="color:${m.color}">✓</span>${b}</li>`).join('')}</ul><button class="btn btn-outline btn-full" style="margin-top:20px;border-color:${m.color};color:${m.color}" onclick="toast('Membership feature coming soon!','info')">Subscribe ₹${m.price}/yr</button></div>`).join('');

  // Location page
  const lc = document.querySelector('.branch-list');
  if(lc) lc.innerHTML = DB.branches.map(b=>`<div class="branch-card"><div class="branch-name">${b.name}</div><div class="branch-addr">📍 ${b.address}</div><div class="branch-meta"><span>📞 ${b.phone}</span><span>🕐 ${b.hours}</span></div><button class="btn btn-outline btn-sm" style="margin-top:10px" onclick="toast('Opening maps...','info')">Get Directions</button></div>`).join('');

  // Desktop nav visibility
  function checkDesktopNav(){
    const nav = $('desktop-nav-bar');
    if(nav){ nav.style.display = window.innerWidth >= 768 ? 'flex' : 'none'; }
  }
  checkDesktopNav();
  window.addEventListener('resize', checkDesktopNav);

  // ===== SPLASH SCREEN + AUTO-NAVIGATION =====
  showNav(false);
  show('splash');

  // Splash: navigate to role-select after 2.8 seconds
  setTimeout(() => {
    // Try to restore session
    const savedUser = restoreSession();
    if(savedUser){
      // Already logged in — go straight to dashboard
      if(savedUser.role === 'admin'){
        navTo('admin');
        renderAdminDashboard2();
      } else if(savedUser.role === 'receptionist'){
        navTo('receptionist');
        renderReceptionistDashboard();
      } else {
        show('role-select');
      }
    } else {
      // Fade out splash and show role select
      const splashEl = $('splash');
      if(splashEl){
        splashEl.style.transition = 'opacity 0.6s ease';
        splashEl.style.opacity = '0';
        setTimeout(() => {
          show('role-select');
          splashEl.style.opacity = '';
          splashEl.style.transition = '';
        }, 600);
      } else {
        show('role-select');
      }
    }
  }, 2800);

  // Prevent back button from returning to dashboards after logout
  window.addEventListener('popstate', () => {
    if(!currentUser){
      show('role-select');
      showNav(false);
    }
  });
  history.pushState(null, '', window.location.pathname);
});
