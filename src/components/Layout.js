function Layout({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden px-4 pb-12 pt-28 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -top-16 left-[-120px] h-72 w-72 rounded-full bg-brand/15 blur-3xl" />
      <div className="pointer-events-none absolute right-[-100px] top-24 h-80 w-80 rounded-full bg-accent/30 blur-3xl" />
      <div className="mx-auto w-full max-w-7xl animate-lift-up">
        {children}
      </div>
    </div>
  );
}

export default Layout;
