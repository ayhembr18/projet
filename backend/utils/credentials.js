const generateCredentials = (firstName, lastName) => {
  const clean = (s) => s.toLowerCase().replace(/[^a-z]/g, '');

  const randomDigits = Math.floor(1000 + Math.random() * 9000); // 4-digit suffix
  const username = `${clean(firstName)}.${clean(lastName)}.${randomDigits}`;

  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return { username, plainPassword: password };
};

module.exports = { generateCredentials };