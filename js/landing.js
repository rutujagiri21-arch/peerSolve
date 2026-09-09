import { api } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Check auth to toggle Login / Dashboard button in header
  const user = api.getUser();
  const navLoginBtn = document.getElementById('nav-login-btn');
  const navGetStartedBtn = document.getElementById('nav-get-started-btn');

  if (user) {
    if (navLoginBtn) {
      navLoginBtn.textContent = 'Dashboard';
      navLoginBtn.href = '/dashboard.html';
    }
    if (navGetStartedBtn) {
      navGetStartedBtn.textContent = `Hi, ${user.name.split(' ')[0]}`;
      navGetStartedBtn.href = '/dashboard.html';
    }
  }

  // Animate stats counter
  try {
    const stats = await api.getStats();
    animateCounter('stat-questions', stats.questions || 1200);
    animateCounter('stat-answers', stats.answers || 3500);
    animateCounter('stat-students', stats.students || 850);
    animateCounter('stat-subjects', stats.subjects || 10);
  } catch (e) {
    animateCounter('stat-questions', 1200);
    animateCounter('stat-answers', 3500);
    animateCounter('stat-students', 850);
    animateCounter('stat-subjects', 10);
  }
});

function animateCounter(elementId, targetValue) {
  const el = document.getElementById(elementId);
  if (!el) return;

  let current = 0;
  const increment = Math.max(1, Math.floor(targetValue / 40));
  const stepTime = 25;

  const timer = setInterval(() => {
    current += increment;
    if (current >= targetValue) {
      current = targetValue;
      clearInterval(timer);
    }
    el.textContent = current.toLocaleString() + '+';
  }, stepTime);
}
