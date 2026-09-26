import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
      style={{ background: '#090A0F', color: '#FFFFFF' }}
    >
      <div className="space-y-4 max-w-md">
        <p className="text-xs font-semibold tracking-widest uppercase text-zinc-400">
          B Perfume Haute Parfumerie
        </p>
        <h1
          className="text-4xl font-serif text-white tracking-wide"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          404 — Page Not Found
        </h1>
        <p className="text-xs text-zinc-400 leading-relaxed">
          The requested luxury CRM destination is unavailable or does not exist.
        </p>
        <div className="pt-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-xs font-semibold tracking-wider uppercase transition shadow-lg"
            style={{ background: '#C9A84C', color: '#090A0F' }}
          >
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
