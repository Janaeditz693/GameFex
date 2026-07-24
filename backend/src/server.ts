import app from './app';

const PORT = process.env.PORT || 5000;

// Boot the server
app.listen(PORT, () => {
  console.log(`[GameFlex Backend] Server running on port ${PORT}`);
});
