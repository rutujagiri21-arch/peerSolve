import { api } from './api.js';

let currentQuestion = null;
let currentAnswers = [];

document.addEventListener('DOMContentLoaded', async () => {
  const user = api.getUser();
  const urlParams = new URLSearchParams(window.location.search);
  const questionId = urlParams.get('id');

  if (!questionId) {
    window.location.href = 'dashboard.html';
    return;
  }

  // Load question and answers
  await loadQuestionDetails(questionId, user);

  // Setup answer submission form
  setupAnswerForm(questionId, user);
});

async function loadQuestionDetails(questionId, currentUser) {
  const container = document.getElementById('doubt-detail-container');
  if (!container) return;

  try {
    const data = await api.getQuestion(questionId);
    currentQuestion = data.question;
    currentAnswers = data.answers;

    renderQuestionHeader(currentQuestion, currentUser);
    renderAnswersList(currentAnswers, currentQuestion, currentUser);
  } catch (err) {
    container.innerHTML = `<div class="error-card"><h3>Error</h3><p>${err.message}</p><a href="dashboard.html">Back to Dashboard</a></div>`;
  }
}

function renderQuestionHeader(q, currentUser) {
  const isSolved = q.status === 'solved';
  const tagList = q.tags ? q.tags.split(',').filter(Boolean) : [];

  document.getElementById('q-subject-badge').textContent = q.subject;
  const statusEl = document.getElementById('q-status-badge');
  statusEl.textContent = isSolved ? '✓ Solved' : 'Open Doubt';
  statusEl.className = `status-indicator ${isSolved ? 'solved' : 'open'}`;

  document.getElementById('q-author-name').textContent = q.author_name;
  document.getElementById('q-author-dept').textContent = `${q.author_department || 'Computer Science'} • ${timeAgo(q.created_at)}`;
  document.getElementById('q-author-avatar').textContent = q.author_avatar || '🎓';

  document.getElementById('q-title').textContent = q.title;
  document.getElementById('q-description').textContent = q.description;

  // Code snippet
  const codeBlock = document.getElementById('q-code-snippet');
  if (q.code_snippet) {
    codeBlock.style.display = 'block';
    codeBlock.querySelector('.code-content').textContent = q.code_snippet;
  } else {
    codeBlock.style.display = 'none';
  }

  // Tags
  const tagsContainer = document.getElementById('q-tags-container');
  tagsContainer.innerHTML = tagList.map(t => `<span class="tag-badge">#${escapeHTML(t.trim())}</span>`).join('');

  // Me too button
  const meTooBtn = document.getElementById('q-me-too-btn');
  const meTooCount = document.getElementById('q-me-too-count');
  if (meTooCount) meTooCount.textContent = q.me_too_count || 0;

  if (meTooBtn) {
    meTooBtn.onclick = async () => {
      try {
        const res = await api.toggleMeToo(q.id);
        let count = parseInt(meTooCount.textContent, 10) || 0;
        if (res.has_me_too) {
          meTooCount.textContent = count + 1;
          meTooBtn.classList.add('btn-primary');
        } else {
          meTooCount.textContent = Math.max(0, count - 1);
          meTooBtn.classList.remove('btn-primary');
        }
      } catch (err) {
        alert(err.message);
      }
    };
  }
}

function renderAnswersList(answers, question, currentUser) {
  const container = document.getElementById('answers-container');
  const countBadge = document.getElementById('answers-count-badge');
  if (countBadge) countBadge.textContent = answers.length;

  if (answers.length === 0) {
    container.innerHTML = `
      <div class="empty-feed-card" style="padding: 36px 20px;">
        <div class="empty-icon">🤝</div>
        <h3>No solutions submitted yet</h3>
        <p>Are you a senior or peer who knows this subject? Submit your solution below and earn <strong>+10 Reputation points</strong>!</p>
      </div>
    `;
    return;
  }

  const isQuestionAuthor = currentUser && currentUser.id === question.user_id;

  container.innerHTML = answers.map(ans => {
    const isBest = ans.is_best_answer === 1;

    return `
      <div class="answer-card ${isBest ? 'best-solution' : ''}" id="answer-${ans.id}">
        
        ${isBest ? `
          <div class="best-answer-banner">
            <span>★ ACCEPTED BEST ANSWER</span>
            <span style="font-weight: 500; font-size: 11px;">(Earned +25 Reputation)</span>
          </div>
        ` : ''}

        <div class="answer-senior-row">
          <div class="senior-badge-info">
            <div class="senior-avatar-circle">${ans.senior_avatar || '👨‍💻'}</div>
            <div class="senior-title-box">
              <div class="senior-name-row">
                <span class="senior-name-text">${escapeHTML(ans.senior_name)}</span>
                <span class="role-badge ${ans.senior_role || 'senior'}">${(ans.senior_role || 'Senior').toUpperCase()}</span>
              </div>
              <span class="senior-dept-text">${escapeHTML(ans.senior_department || 'Computer Science')} • ${escapeHTML(ans.senior_year || '4th Year')} • ${timeAgo(ans.created_at)}</span>
            </div>
          </div>

          <div class="senior-reputation-tag">
            <span>⭐</span>
            <span>${ans.senior_reputation || 0} Rep</span>
          </div>
        </div>

        <div class="answer-body-content">${escapeHTML(ans.content)}</div>

        ${ans.code_snippet ? `
          <div class="code-block-wrapper">
            <div class="code-block-header">
              <span>Code Snippet</span>
            </div>
            <pre class="code-content">${escapeHTML(ans.code_snippet)}</pre>
          </div>
        ` : ''}

        <div class="answer-bottom-actions">
          
          <!-- Upvote -->
          <button class="btn-upvote" data-ansid="${ans.id}">
            <span>👍 Helpful</span>
            <span class="upvote-count" style="font-weight: 800;">${ans.upvotes || 0}</span>
          </button>

          <!-- Accept as Best Answer (only visible to the question author if not already best) -->
          ${isQuestionAuthor && !isBest ? `
            <button class="btn-accept-best" data-ansid="${ans.id}">
              <span>✓ Mark as Best Answer</span>
              <span style="font-size: 11px; opacity: 0.85;">(+25 pts to Senior)</span>
            </button>
          ` : ''}

        </div>

      </div>
    `;
  }).join('');

  // Bind Actions
  bindAnswerEvents(question, currentUser);
}

function bindAnswerEvents(question, currentUser) {
  // Upvote
  document.querySelectorAll('.btn-upvote').forEach(btn => {
    btn.addEventListener('click', async () => {
      const aId = btn.dataset.ansid;
      try {
        const res = await api.upvoteAnswer(aId);
        const countEl = btn.querySelector('.upvote-count');
        let count = parseInt(countEl.textContent, 10) || 0;
        countEl.textContent = res.upvoted ? count + 1 : Math.max(0, count - 1);
        btn.style.color = res.upvoted ? 'var(--primary)' : '';
      } catch (err) {
        alert(err.message);
      }
    });
  });

  // Accept Best Answer
  document.querySelectorAll('.btn-accept-best').forEach(btn => {
    btn.addEventListener('click', async () => {
      const aId = btn.dataset.ansid;
      if (confirm('Mark this answer as the Best Answer? This will award +25 Reputation points to the senior mentor.')) {
        try {
          await api.acceptBestAnswer(aId);
          alert('🎉 Answer marked as Best Answer! +25 Reputation awarded.');
          await loadQuestionDetails(question.id, currentUser);
        } catch (err) {
          alert('Error: ' + err.message);
        }
      }
    });
  });
}

function setupAnswerForm(questionId, currentUser) {
  const form = document.getElementById('post-answer-form');
  if (!form) return;

  // Customize placeholder based on role
  const roleHint = document.getElementById('answer-role-hint');
  if (roleHint && currentUser) {
    if (currentUser.role === 'senior') {
      roleHint.textContent = `You are answering as Senior Mentor (${currentUser.name}). Your answer awards you +10 Reputation.`;
    } else {
      roleHint.textContent = `Students and peers can also share insights or alternative approaches!`;
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = document.getElementById('answer-content-input').value.trim();
    const codeSnippet = document.getElementById('answer-code-input').value.trim();
    const submitBtn = form.querySelector('button[type="submit"]');

    if (!content) return;

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Posting Solution...';

      await api.createAnswer(questionId, content, codeSnippet);
      form.reset();
      await loadQuestionDetails(questionId, currentUser);

      // Scroll to newly added answer
      const answersHeader = document.getElementById('solutions-header');
      if (answersHeader) answersHeader.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      alert('Failed to post answer: ' + err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Post Solution (+10 Reputation)';
    }
  });
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
