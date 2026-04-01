import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t border-border/60 px-6 py-3 bg-card/50">
      <div className="flex flex-col md:flex-row justify-between items-center gap-2">
        <p className="text-xs text-muted-foreground">
          © 2024 Travel Pro — Sistem Pengelolaan Perjalanan Dinas
        </p>
        <div className="flex items-center gap-4">
          <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Bantuan</a>
          <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Privasi</a>
          <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Ketentuan</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
