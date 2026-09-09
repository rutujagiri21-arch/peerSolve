import { api } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('leaderboard-list');
  if (!container) return;

  try {
    const seniors = await api.getLeaderboard();

    if (seniors.length === 0) {
      container.innerHTML = '<div class="empty-state">No seniors ranked yet. Start answering doubts to earn reputation!</div>';
      return;
    }

    container.innerHTML = seniors.map((s, index) => {
      const rank = index + 1;
      let rankBadge = `<span class="rank-num">#${rank}</span>`;
      if (rank === 1) rankBadge = '<span class="rank-medal gold">🥇 1st</span>';
      else if (rank === 2) rankBadge = '<span class="rank-medal silver">🥈 2nd</span>';
      else if (rank === 3) rankBadge = '<span class="rank-medal bronze">🥉 3rd</span>';

      const tierBadge = getTierBadge(s.reputation);

      return `
        <div class="leader-card ${rank <= 3 ? 'top-tier' : ''}">
          <div class="leader-left">
            <div class="rank-badge-box">${rankBadge}</div>
            <div class="leader-avatar">${s.avatar || '👨‍💻'}</div>
            <div class="leader-info">
              <div class="leader-name-row">
                <h3>${escapeHTML(s.name)}</h3>
                <span class="tier-pill ${tierBadge.class}">${tierBadge.name}</span>
              </div>
              <p>${escapeHTML(s.department || 'Computer Science')} • ${escapeHTML(s.year || '4th Year')}</p>
            </div>
          </div>

          <div class="leader-stats">
            <div class="stat-col">
              <span class="stat-val">${s.answers_count || 0}</span>
              <span class="stat-sub">Solutions</span>
            </div>
            <div class="stat-col">
              <span class="stat-val" style="color:#10b981;">${s.best_answers_count || 0}</span>
              <span class="stat-sub">Best Answers</span>
            </div>
            <div class="stat-col reputation-col">
              <span class="stat-val rep-val">⭐ ${s.reputation || 0}</span>
              <span class="stat-sub">Reputation</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Certificate Generator for logged-in senior
    const currentUser = api.getUser();
    const certSection = document.getElementById('my-cert-section');
    if (certSection && currentUser && currentUser.role === 'senior') {
      certSection.style.display = 'block';
      document.getElementById('cert-name').textContent = currentUser.name;
      document.getElementById('cert-dept').textContent = `${currentUser.department} • ${currentUser.year}`;
      document.getElementById('cert-rep').textContent = currentUser.reputation;
      document.getElementById('btn-print-cert')?.addEventListener('click', () => window.print());
    }

  } catch (err) {
    container.innerHTML = `<div class="error-state">Failed to load leaderboard: ${err.message}</div>`;
  }
});

function getTierBadge(reputation) {
  if (reputation >= 800) return { name: '🥇 Master Contributor', class: 'master' };
  if (reputation >= 200) return { name: '🥈 Senior Mentor', class: 'mentor' };
  return { name: '🥉 Junior Mentor', class: 'junior' };
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
