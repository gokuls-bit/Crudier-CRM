import React from 'react';
import AppRouter from './routes/AppRouter';
import ToastContainer from './components/ui/ToastContainer';

function App() {
  return (
    <div className="min-h-screen text-[#1C2945] font-sans antialiased selection:bg-[#00A9CE]/30">
      <AppRouter />
      <ToastContainer />
    </div>
  );
}

export default App;
