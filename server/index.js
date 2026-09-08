import { createApp } from './app.js';

const PORT = 4200;
const app = await createApp();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});