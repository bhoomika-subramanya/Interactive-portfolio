// ----------------- Data -----------------
const data = {
  name: 'Enter your Name',
  hero: 'Description about you.',
  projects: [
    {id:'p1',title:'Project 1 name',tags:['Project 1 domain'],desc:'Description about project 1.',img:'assets/project-portfolio.jpg',links:[{label:'Live',url:'#'},{label:'Code',url:'#'}]},
    {id:'p2',title:'Project 2 name',tags:['Project 2 domain'],desc:'Description about project 2.',img:'assets/project-phish.jpg',links:[{label:'Paper',url:'#'},{label:'Repo',url:'#'}]}
  ],
  contactEndpoint: 'FORM_ENDPOINT' // replace with Formspree or server endpoint
};

// ----------------- DOM refs -----------------
const yearEl = document.getElementById('year');
const heroName = document.getElementById('hero-name');
const leadEl = document.querySelector('.lead');
const projectsGrid = document.getElementById('projects-grid');
const filters = document.querySelectorAll('.filter');
const skillBars = document.querySelectorAll('.skill-bar');
const themeToggle = document.getElementById('theme-toggle');
const navToggle = document.getElementById('nav-toggle');
const navList = document.getElementById('nav-list');
const modal = document.getElementById('project-modal');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const modalLinks = document.getElementById('modal-links');
const modalClose = document.querySelector('.modal-close');

// ----------------- Small helpers -----------------
function $(sel){ return document.querySelector(sel) }
function $all(sel){ return Array.from(document.querySelectorAll(sel)) }

// ----------------- Typing effect -----------------
function typeText(el, text, delay = 30) {
  let i = 0;
  el.textContent = '';
  const t = setInterval(() => {
    el.textContent += text[i++] ?? '';
    if (i >= text.length) clearInterval(t);
  }, delay);
}

// ----------------- Init on DOM load -----------------
document.addEventListener('DOMContentLoaded', () => {
  // Year + hero name + lead
  yearEl.textContent = new Date().getFullYear();
  heroName.textContent = data.name;
  if (leadEl) typeText(leadEl, data.hero, 28);

  // Add reveal class to hero pieces to be observed
  $all('.hero-text, .hero-image').forEach(el => el.classList.add('reveal'));

  // Kick off profile image zoom after small delay (2s animation CSS)
  const profileImg = document.querySelector('.profile-frame img');
  if (profileImg){
    // ensure image loads then add class
    profileImg.addEventListener('load', ()=> {
      // small timeout so reveal observer can do its thing
      setTimeout(()=> profileImg.classList.add('zoomed'), 350);
    });
    // if already cached
    if (profileImg.complete) setTimeout(()=> profileImg.classList.add('zoomed'), 350);
  }

  // Render projects
  renderProjects();

  // Observe reveals
  setupRevealObserver();

  // Animate skill bars when in view
  setupSkillBars();

  // Theme: restore theme
  const saved = localStorage.getItem('theme') || 'dark';
  applyTheme(saved);

  // Bind handlers
  bindHandlers();
});

// ----------------- Projects render -----------------
function renderProjects(filter='all'){
  projectsGrid.innerHTML = '';
  const list = data.projects.filter(p => filter === 'all' || p.tags.includes(filter));
  list.forEach(p => {
    const art = document.createElement('article');
    art.className = 'project-card reveal';
    art.innerHTML = `
      <div class="thumb" style="background-image:url('${p.img}')"></div>
      <h3>${p.title}</h3>
      <p class="muted">${p.tags.join(' • ')}</p>
      <p style="flex:1">${p.desc}</p>
      <div style="display:flex;gap:8px;margin-top:8px">
        <button class="btn open-project" data-id="${p.id}">Details</button>
        <a class="btn btn-ghost" href="${p.links[0]?.url||'#'}" target="_blank" rel="noopener">Live</a>
      </div>
    `;
    projectsGrid.appendChild(art);
  });
}

// ----------------- Filters -----------------
filters.forEach(btn => btn.addEventListener('click', () => {
  document.querySelector('.filter.active')?.classList.remove('active');
  btn.classList.add('active');
  renderProjects(btn.dataset.filter);
  // re-run reveal observer for newly added nodes
  setupRevealObserver();
}));

// ----------------- Modal -----------------
projectsGrid.addEventListener('click', e => {
  const btn = e.target.closest('.open-project');
  if(!btn) return;
  const id = btn.dataset.id;
  const p = data.projects.find(x => x.id === id);
  if(!p) return;
  modalTitle.textContent = p.title;
  modalDesc.textContent = p.desc;
  modalLinks.innerHTML = p.links.map(l => `<a class="btn" href="${l.url}" target="_blank" rel="noopener">${l.label}</a>`).join(' ');
  modal.setAttribute('aria-hidden', 'false');
});
modalClose.addEventListener('click', ()=> modal.setAttribute('aria-hidden','true'));
modal.addEventListener('click', e => { if (e.target === modal) modal.setAttribute('aria-hidden','true') });
window.addEventListener('keydown', e => { if (e.key === 'Escape') modal.setAttribute('aria-hidden','true') });

// ----------------- Skill bars -----------------
function setupSkillBars(){
  $all('.skill-bar').forEach(el => {
    // create inner fill element
    const fill = document.createElement('div');
    fill.style.width = '0%';
    el.appendChild(fill);
    const val = el.dataset.value || '0';
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          fill.style.width = val + '%';
          io.disconnect();
        }
      });
    }, { threshold: 0.25 });
    io.observe(el);
  });
}

// ----------------- Reveal observer -----------------
let revealObserverInstance;
function setupRevealObserver(){
  // disconnect previous
  if (revealObserverInstance) revealObserverInstance.disconnect();
  revealObserverInstance = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('in-view');
        revealObserverInstance.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  $all('.reveal').forEach(el => revealObserverInstance.observe(el));
}

// ----------------- Theme -----------------
function applyTheme(t){
  if (t === 'light') document.documentElement.setAttribute('data-theme','light');
  else document.documentElement.removeAttribute('data-theme');
  localStorage.setItem('theme', t);
}
function bindHandlers(){
  // theme toggle
  themeToggle.addEventListener('click', () => {
    const current = localStorage.getItem('theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  });

  // nav toggle (mobile)
  navToggle.addEventListener('click', () => {
    const open = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!open));
    navList.style.display = open ? 'none' : 'flex';
  });

  // smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Contact form submit (Formspree)
  const contactForm = document.getElementById('contact-form');
  if (contactForm){
    contactForm.addEventListener('submit', async function(e){
      e.preventDefault();
      const status = document.getElementById('form-status');
      status.textContent = 'Sending...';
      const formData = new FormData(this);
      try {
        const res = await fetch(data.contactEndpoint, {
          method: 'POST', body: formData, headers: { 'Accept': 'application/json' }
        });
        if (res.ok) { status.textContent = 'Message sent — thank you!'; this.reset(); }
        else { status.textContent = 'Failed to send. Please try again.'; }
      } catch (err) {
        status.textContent = 'Error sending message.';
      }
    });
  }
}
