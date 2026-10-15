import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const hasSupabaseConfig = Boolean(
  supabaseUrl && supabaseAnonKey && !supabaseAnonKey.startsWith('your-'),
);
const supabase = hasSupabaseConfig ? createClient(supabaseUrl, supabaseAnonKey) : null;

const form = document.querySelector('#auth-form');
const nameField = document.querySelector('#name-field');
const nameInput = document.querySelector('#name-input');
const emailInput = document.querySelector('#email-input');
const passwordInput = document.querySelector('#password-input');
const message = document.querySelector('#form-message');
const submitButton = document.querySelector('#submit-button');
const formTitle = document.querySelector('#form-title');
const formIntro = document.querySelector('#form-intro');
const formView = document.querySelector('#auth-form-view');
const sessionView = document.querySelector('#session-view');
const sessionName = document.querySelector('#session-name');
const sessionEmail = document.querySelector('#session-email');
let mode = 'sign-in';
let activeUserId = null;

function setMessage(text, tone = 'error') {
  message.textContent = text;
  message.dataset.tone = tone;
}

function setMode(nextMode) {
  mode = nextMode;
  const isSignUp = mode === 'sign-up';
  nameField.hidden = !isSignUp;
  nameInput.required = isSignUp;
  passwordInput.autocomplete = isSignUp ? 'new-password' : 'current-password';
  formTitle.textContent = isSignUp ? 'Make it yours.' : 'Welcome back.';
  formIntro.textContent = isSignUp
    ? 'Create an account for your own little corner.'
    : 'Sign in to pick up where you left off.';
  submitButton.firstChild.textContent = isSignUp ? 'Create account ' : 'Sign in ';
  message.textContent = '';
  delete message.dataset.tone;

  document.querySelectorAll('.mode-button').forEach((button) => {
    const active = button.dataset.mode === mode;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

async function showUser(user) {
  activeUserId = user?.id ?? null;
  formView.hidden = Boolean(user);
  sessionView.hidden = !user;

  if (!user) return;

  const fallbackName = user.user_metadata?.name || user.email?.split('@')[0] || 'there';
  sessionName.textContent = `Welcome, ${fallbackName}.`;
  sessionEmail.textContent = user.email || '';

  const { data, error } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .maybeSingle();

  if (activeUserId === user.id && !error && data?.name) {
    sessionName.textContent = `Welcome, ${data.name}.`;
  }
}

document.querySelectorAll('.mode-button').forEach((button) => {
  button.addEventListener('click', () => setMode(button.dataset.mode));
});

document.querySelector('#password-toggle').addEventListener('click', (event) => {
  const button = event.currentTarget;
  const showPassword = passwordInput.type === 'password';
  passwordInput.type = showPassword ? 'text' : 'password';
  button.textContent = showPassword ? 'Hide' : 'Show';
  button.setAttribute('aria-label', `${showPassword ? 'Hide' : 'Show'} password`);
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!supabase) return;

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const isSignUp = mode === 'sign-up';
  submitButton.disabled = true;
  submitButton.firstChild.textContent = 'Please wait ';
  setMessage('');

  try {
    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: nameInput.value.trim() } },
      });
      if (error) throw error;

      if (data.session) {
        setMessage('Your account is ready.', 'success');
      } else {
        setMode('sign-in');
        setMessage('Check your email to confirm your account, then sign in.', 'success');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    }
  } catch (error) {
    setMessage(error.message || 'Something went wrong. Please try again.');
  } finally {
    submitButton.disabled = false;
    submitButton.firstChild.textContent = mode === 'sign-up' ? 'Create account ' : 'Sign in ';
  }
});

document.querySelector('#signout-button').addEventListener('click', async () => {
  const button = document.querySelector('#signout-button');
  button.disabled = true;
  const { error } = await supabase.auth.signOut();
  if (error) {
    sessionEmail.textContent = error.message;
    button.disabled = false;
  }
});

if (!hasSupabaseConfig) {
  document.querySelector('#config-notice').hidden = false;
  submitButton.disabled = true;
} else {
  supabase.auth.onAuthStateChange((_event, session) => {
    void showUser(session?.user ?? null);
  });

  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      setMessage(error.message);
      return;
    }
    void showUser(data.session?.user ?? null);
  });
}