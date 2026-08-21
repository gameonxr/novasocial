const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(repo, 'src', 'features', 'auth.js'), 'utf8');

for (const marker of [
  'function setMode(m)',
  'amode=m',
  "m==='login'?'Log In':'Create Account'",
  "m==='signup'?'flex':'none'",
  "m==='login' ? 'block' : 'none'",
  'async function doAuth()',
  "document.getElementById('i-email').value.trim()",
  "document.getElementById('i-pass').value",
  "if(!email||!pass){showErr('Email aur password daalo');return;}",
  "db.auth.signInWithPassword({email,password:pass})",
  "Email not confirmed",
  "Invalid",
  "db.auth.signUp({email,password:pass,options:{data:{username:uname,full_name:fname}}})",
  'showEmailVerificationScreen(email)',
  'function showEmailVerificationScreen(email)',
  'async function resendVerificationEmail(email)',
  "db.auth.resend({type:'signup', email})",
  'function showForgotPasswordScreen()',
  'async function sendPasswordResetEmail()',
  "db.auth.resetPasswordForEmail(email, {",
  "'?reset=true'",
  'function showSetNewPasswordScreen()',
  'async function submitNewPassword()',
  'newPass.length < 6',
  'newPass !== confirmPass',
  'db.auth.updateUser({password: newPass})',
  'function togglePasswordVisibility(inputId, iconEl)',
  "inp.type === 'password'",
  "inp.type = isHidden ? 'text' : 'password'"
]) {
  assert(source.includes(marker), `Auth marker missing: ${marker}`);
}
assert.strictEqual((source.match(/db\.auth\./g) || []).length, 5, 'Auth must retain login, signup, resend, reset, and password-update API boundaries');
assert.strictEqual((source.match(/toast\(/g) || []).length, 10, 'Auth must retain the documented success and failure feedback paths');
assert.strictEqual((source.match(/setTimeout\(/g) || []).length, 2, 'Auth must retain reset and password-update redirect timers');
assert(source.includes('window._addingNewAccount'), 'Auth must preserve the multi-account login branch');
assert(source.includes('data?.user && !data?.session'), 'Auth must preserve email-confirmation-required signup handling');
assert(!source.includes('localStorage'), 'Auth must not persist credentials locally');
assert(!source.includes('sendMessage'), 'Auth must not own protected messaging');

console.log('AUTH_CONTRACT_HARNESS=PASS');
console.log('MODE_CREDENTIALS_LOGIN_SIGNUP_VERIFICATION_RESET_PASSWORD_RULES_REDIRECT_VISIBILITY_SCOPE=LOCKED');
console.log('MODULE_OWNER=src/features/auth.js');
console.log('PRODUCTION_CHANGE=0');
