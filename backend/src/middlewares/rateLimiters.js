import rateLimit from 'express-rate-limit';

// Geral - aplicado em toda a API
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'TooManyRequests', message: 'Muitas requisições. Tente novamente em alguns minutos.' },
});

// Login/Cadastro - mais restritivo (anti brute-force)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'TooManyRequests', message: 'Muitas tentativas. Aguarde antes de tentar novamente.' },
});

// IA (Groq) - protege custo/cota da API externa (RF07/11/13/17/21/26)
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: {
    error: 'TooManyRequests',
    message: 'Limite de chamadas à IA atingido. Aguarde alguns segundos.',
  },
});
