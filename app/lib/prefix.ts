// Use empty string for local development, '/xmas-decorate' for production
const prefix = process.env.NEXT_PUBLIC_BASE_PATH || '';

export { prefix };