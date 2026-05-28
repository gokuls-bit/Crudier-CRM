export const validateEmail = (email) => {
  if (!email) return 'Email is required.';
  const regex = /^\S+@\S+\.\S+$/;
  if (!regex.test(email)) return 'Please enter a valid email address.';
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required.';
  if (password.length < 6) return 'Password must be at least 6 characters.';
  return null;
};

export const validateRequired = (value, fieldName = 'Field') => {
  if (!value || (typeof value === 'string' && value.trim().length === 0)) {
    return `${fieldName} is required.`;
  }
  return null;
};
