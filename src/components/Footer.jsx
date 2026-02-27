import { Link } from "react-router-dom";

export default function Footer() {
  const getFooterLink = (label) => {
    const map = {
      // Seekers
      "Browse Jobs": "/",
      Companies: "/companies",
      "Career Advice": "/blog",
      "Salary Guide": "/salary",

      // Employers
      "Post a Job": "/jobs/create",
      "Browse Talent": "/talent",
      Pricing: "/pricing",
      Resources: "/resources",

      // Company
      About: "/about",
      Contact: "/contact",
      Privacy: "/privacy",
      Terms: "/terms",
      Cookies: "/cookies",
    };

    return map[label] || "/";
  };

  return (
    <footer className="border-t border-slate-800 bg-[#0a0a0b] mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 bg-emerald-500 rounded-sm flex items-center justify-center">
                <svg
                  className="h-4 w-4 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span className="font-display font-bold text-white text-lg tracking-tight">
                Jobbr
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              Curated engineering and design roles from companies worth working
              for.
            </p>
            <div className="flex items-center gap-1 mt-6">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-500 ml-1.5">
                Live opportunities updated daily
              </span>
            </div>
          </div>

          {/* Links */}
          {[
            {
              heading: "Seekers",
              links: [
                "Browse Jobs",
                "Companies",
                "Career Advice",
                "Salary Guide",
              ],
            },
            {
              heading: "Employers",
              links: ["Post a Job", "Browse Talent", "Pricing", "Resources"],
            },
            {
              heading: "Company",
              links: ["About", "Contact", "Privacy", "Terms"],
            },
          ].map(({ heading, links }) => (
            <div key={heading}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 mb-4">
                {heading}
              </p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      to={getFooterLink(link)}
                      className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            © 2025 Jobbr. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Cookies"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
