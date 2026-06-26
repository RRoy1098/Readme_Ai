import Navbar from './Navbar.jsx';

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Navbar />
      <main className="ml-64 flex-1 min-h-screen">
        <div className="max-w-6xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
