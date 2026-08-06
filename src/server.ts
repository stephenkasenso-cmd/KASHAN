import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Family Tree API Server listening on port ${PORT}`);
  console.log(`   Health check available at http://localhost:${PORT}/health`);
});
