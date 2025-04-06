export const checkPasswordStrength = (password: string): {
  score: number;
  feedback: string;
} => {
  let score = 0;
  const feedback = [];

  if (password.length < 8) {
    feedback.push('Mínimo 8 caracteres');
  } else {
    score += 1;
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Incluye mayúsculas');
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Incluye minúsculas');
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Incluye números');
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Incluye caracteres especiales');
  }

  return {
    score,
    feedback: feedback.join(', ')
  };
};