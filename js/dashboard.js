import { api } from './api.js';

let currentSubject = 'all';
let currentStatus = 'all';
let searchDebounceTimer = null;

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Auth Guard
  const user = api.getUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  // 2. Render User Banner
  renderUserBanner(user);

  // 3. Load Notifications
  loadNotifications();

  // 4. Bind Subject Filters
  setupSubjectFilters();

  // 5. Bind Status Tabs
  setupStatusTabs();

  // 6. Bind Search Input
  setupSearch();

  // 7. Setup Ask Doubt Modal
  setupAskModal();

  // 8. Load Doubts Feed
  loadDoubts();

  // Setup Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => api.logout());
  }
});

function renderUserBanner(user) {
  const nameEl = document.getElementById('user-name');
  const roleEl = document.getElementById('user-role-badge');
  const deptEl = document.getElementById('user-dept');
  const repEl = document.getElementById('user-reputation');
  const avatarEl = document.getElementById('user-avatar');

  if (nameEl) nameEl.textContent = user.name;
  if (avatarEl) avatarEl.textContent = user.avatar || (user.role === 'senior' ? '👨‍💻' : '🎓');
  if (deptEl) deptEl.textContent = `${user.department || 'Computer Science'} • ${user.year || 'Student'}`;
  if (repEl) repEl.textContent = `${user.reputation || 0}`;

  if (roleEl) {
    roleEl.textContent = user.role.toUpperCase();
    roleEl.className = `role-badge ${user.role}`;
  }

  // If senior, show encouragement banner
  const seniorBanner = document.getElementById('senior-welcome-banner');
  if (seniorBanner && user.role === 'senior') {
    seniorBanner.style.display = 'block';
  }
}

async function loadNotifications() {
  try {
    const notifs = await api.getNotifications();
    const bellBtn = document.getElementById('notif-bell-btn');
    const badge = document.getElementById('notif-count-badge');
    const dropdown = document.getElementById('notif-dropdown');

    if (notifs && notifs.length > 0) {
      if (badge) {
        badge.textContent = notifs.length;
        badge.style.display = 'inline-block';
      }
      if (dropdown) {
        dropdown.innerHTML = notifs.map(n => `
          <div class="notif-item">
            <p>${escapeHTML(n.message)}</p>
            <span class="notif-time">${timeAgo(n.created_at)}</span>
          </div>
        `).join('');
      }
    } else {
      if (dropdown) {
        dropdown.innerHTML = '<div class="notif-empty">No new notifications</div>';
      }
    }

    if (bellBtn && dropdown) {
      bellBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
      });
      document.addEventListener('click', () => dropdown.classList.remove('open'));
    }
  } catch (err) {}
}

function setupSubjectFilters() {
  const pills = document.querySelectorAll('.subject-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentSubject = pill.dataset.subject;
      loadDoubts();
    });
  });
}

function setupStatusTabs() {
  const tabs = document.querySelectorAll('.status-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentStatus = tab.dataset.status;
      loadDoubts();
    });
  });
}

function setupSearch() {
  const searchInput = document.getElementById('search-doubts');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        loadDoubts(e.target.value.trim());
      }, 300);
    });
  }
}

async function loadDoubts(searchTerm = '') {
  const feedContainer = document.getElementById('doubts-feed-container');
  if (!feedContainer) return;

  feedContainer.innerHTML = '<div class="loading-state">Loading academic doubts...</div>';

  try {
    const doubts = await api.getQuestions({
      subject: currentSubject,
      status: currentStatus,
      search: searchTerm
    });

    if (doubts.length === 0) {
      feedContainer.innerHTML = `
        <div class="empty-feed-card">
          <div class="empty-icon">💡</div>
          <h3>No doubts found in this category</h3>
          <p>Got a question in this subject? Be the first to ask and get answers from senior mentors!</p>
          <button class="btn btn-primary btn-open-ask-modal" style="margin-top: 16px;">Ask a Doubt Now</button>
        </div>
      `;
      feedContainer.querySelector('.btn-open-ask-modal')?.addEventListener('click', openModal);
      return;
    }

    feedContainer.innerHTML = doubts.map(q => renderDoubtCard(q)).join('');

    // Bind card click and Me-Too button click
    bindCardEvents();
  } catch (err) {
    feedContainer.innerHTML = `<div class="error-state">Error loading doubts: ${err.message}</div>`;
  }
}

function renderDoubtCard(q) {
  const isSolved = q.status === 'solved';
  const tagList = q.tags ? q.tags.split(',').filter(Boolean) : [];

  return `
    <div class="doubt-card" data-id="${q.id}">
      
      <!-- "Me Too" button -->
      <div class="me-too-box ${q.has_me_too ? 'voted' : ''}" data-qid="${q.id}" title="Click if you also have this doubt">
        <span class="me-too-icon">▲</span>
        <span class="me-too-count">${q.me_too_count || 0}</span>
        <span class="me-too-label">Me Too</span>
      </div>

      <!-- Main Body -->
      <div class="doubt-body">
        
        <div class="doubt-meta">
          <span class="subject-badge">${escapeHTML(q.subject)}</span>
          <span class="status-indicator ${isSolved ? 'solved' : 'open'}">
            ${isSolved ? '✓ Solved & Verified' : 'Open Doubt'}
          </span>
          <span class="doubt-author">
            by <strong>${escapeHTML(q.author_name)}</strong>
          </span>
          <span class="card-timestamp">• ${timeAgo(q.created_at)}</span>
        </div>

        <h3 class="doubt-title">${escapeHTML(q.title)}</h3>
        <p class="doubt-snippet">${escapeHTML(q.description)}</p>

        <div class="doubt-footer">
          <div class="doubt-tags">
            ${tagList.map(t => `<span class="tag-badge">#${escapeHTML(t.trim())}</span>`).join('')}
          </div>

          <div class="doubt-stats">
            <span class="answers-pill">
              💬 ${q.answers_count} ${q.answers_count === 1 ? 'Answer' : 'Answers'}
            </span>
            ${q.has_best_answer ? '<span style="color:#10b981; font-weight:700;">★ Best Answer Accepted</span>' : ''}
          </div>
        </div>

      </div>

    </div>
  `;
}

function bindCardEvents() {
  document.querySelectorAll('.doubt-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't open if clicked the Me Too button
      if (e.target.closest('.me-too-box')) return;
      const id = card.dataset.id;
      window.location.href = `doubt-detail.html?id=${id}`;
    });
  });

  document.querySelectorAll('.me-too-box').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const qId = btn.dataset.qid;
      try {
        const res = await api.toggleMeToo(qId);
        const countEl = btn.querySelector('.me-too-count');
        let count = parseInt(countEl.textContent, 10) || 0;
        if (res.has_me_too) {
          btn.classList.add('voted');
          countEl.textContent = count + 1;
        } else {
          btn.classList.remove('voted');
          countEl.textContent = Math.max(0, count - 1);
        }
      } catch (err) {
        console.error('Me-too toggle error:', err);
      }
    });
  });
}

// Modal handling
function setupAskModal() {
  const modal = document.getElementById('ask-doubt-modal');
  const openBtns = document.querySelectorAll('.btn-open-ask-modal');
  const closeBtn = document.getElementById('close-modal-btn');
  const cancelBtn = document.getElementById('cancel-modal-btn');
  const form = document.getElementById('ask-doubt-form');

  openBtns.forEach(btn => btn.addEventListener('click', openModal));
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Subject custom toggle
  const subjectSelect = document.getElementById('doubt-subject-select');
  const customSubjectInput = document.getElementById('doubt-custom-subject');
  if (subjectSelect && customSubjectInput) {
    subjectSelect.addEventListener('change', () => {
      if (subjectSelect.value === 'Other') {
        customSubjectInput.style.display = 'block';
        customSubjectInput.required = true;
      } else {
        customSubjectInput.style.display = 'none';
        customSubjectInput.required = false;
      }
    });
  }

  // Handle Form Submit
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      let subject = subjectSelect.value;
      if (subject === 'Other') {
        subject = customSubjectInput.value.trim();
      }

      const title = document.getElementById('doubt-title-input').value.trim();
      const description = document.getElementById('doubt-desc-input').value.trim();
      const codeSnippet = document.getElementById('doubt-code-input').value.trim();
      const tags = document.getElementById('doubt-tags-input').value.trim();
      const isAnonymous = document.getElementById('doubt-anonymous-toggle').checked;
      const submitBtn = form.querySelector('button[type="submit"]');

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Posting Doubt...';

        const res = await api.createQuestion({
          subject,
          title,
          description,
          code_snippet: codeSnippet || null,
          tags,
          is_anonymous: isAnonymous
        });

        closeModal();
        form.reset();
        window.location.href = `doubt-detail.html?id=${res.id}`;
      } catch (err) {
        alert('Failed to post doubt: ' + err.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Post Academic Doubt';
      }
    });
  }
}

function openModal() {
  const modal = document.getElementById('ask-doubt-modal');
  if (modal) modal.classList.add('open');
}

function closeModal() {
  const modal = document.getElementById('ask-doubt-modal');
  if (modal) modal.classList.remove('open');
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

function timeAgo(dateString) {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
