import React from 'react';
import AppRouter from './routes/AppRouter';
import ToastContainer from './components/ui/ToastContainer';

function App() {
  return (
    <div className="min-h-screen text-[#f3f4f6] font-sans antialiased selection:bg-brand-500/30">
      <AppRouter />
      <ToastContainer />
    </div>
  );
}

export default App;
