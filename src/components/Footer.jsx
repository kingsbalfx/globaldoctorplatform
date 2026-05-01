import { useState } from 'react'

function Footer({ onNavigate }) {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    {
      name: 'X (Twitter)',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      url: 'https://twitter.com/globaldocconnect',
      color: 'hover:text-blue-400'
    },
    {
      name: 'Facebook',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      url: 'https://facebook.com/globaldocconnect',
      color: 'hover:text-blue-600'
    },
    {
      name: 'Instagram',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.017 0C8.396 0 7.966.017 6.69.07 5.415.123 4.616.265 3.967.52c-.706.277-1.307.638-1.907 1.237C1.553 2.357 1.192 2.958.915 3.664.66 4.313.518 5.112.465 6.387c-.053 1.276-.07 1.706-.07 5.327s.017 4.051.07 5.327c.053 1.275.195 2.074.45 2.723.277.706.638 1.307 1.237 1.907.6.6 1.201.96 1.907 1.237.651.255 1.45.397 2.725.45 1.275.053 1.705.07 5.326.07s4.051-.017 5.327-.07c1.275-.053 2.074-.195 2.723-.45.706-.277 1.307-.638 1.907-1.237.6-.6.96-1.201 1.237-1.907.255-.651.397-1.45.45-2.725.053-1.275.07-1.705.07-5.326s-.017-4.051-.07-5.327c-.053-1.275-.195-2.074-.45-2.723-.277-.706-.638-1.307-1.237-1.907C21.643 1.553 21.042.915 20.336.638c-.651-.255-1.45-.397-2.725-.45C16.336.07 15.906 0 12.285 0c-3.621 0-4.051.017-5.268.07zm5.268 2.147c3.59 0 4.021.014 5.446.08 1.374.063 2.242.29 2.766.49.652.25 1.122.56 1.622 1.06.5.5.81.97 1.06 1.622.2.524.427 1.392.49 2.766.066 1.425.08 1.856.08 5.446s-.014 4.021-.08 5.446c-.063 1.374-.29 2.242-.49 2.766-.25.652-.56 1.122-1.06 1.622-.5.5-.97.81-1.622 1.06-.524.2-1.392.427-2.766.49-1.425.066-1.856.08-5.446.08s-4.021-.014-5.446-.08c-1.374-.063-2.242-.29-2.766-.49-.652-.25-1.122-.56-1.622-1.06-.5-.5-.81-.97-1.06-1.622-.2-.524-.427-1.392-.49-2.766C2.147 15.906 2.133 15.475 2.133 12s.014-4.021.08-5.446c.063-1.374.29-2.242.49-2.766.25-.652.56-1.122 1.06-1.622.5-.5.97-.81 1.622-1.06.524-.2 1.392-.427 2.766-.49 1.425-.066 1.856-.08 5.446-.08zM12.017 5.837c-3.957 0-7.18 3.223-7.18 7.18s3.223 7.18 7.18 7.18 7.18-3.223 7.18-7.18-3.223-7.18-7.18-7.18zm0 11.847c-2.554 0-4.667-2.113-4.667-4.667s2.113-4.667 4.667-4.667 4.667 2.113 4.667 4.667-2.113 4.667-4.667 4.667zm8.473-11.847c0 .928-.753 1.68-1.68 1.68s-1.68-.752-1.68-1.68.752-1.68 1.68-1.68 1.68.752 1.68 1.68z"/>
        </svg>
      ),
      url: 'https://instagram.com/globaldocconnect',
      color: 'hover:text-pink-500'
    },
    {
      name: 'Telegram',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      ),
      url: 'https://t.me/globaldocconnect',
      color: 'hover:text-blue-500'
    },
    {
      name: 'Snapchat',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 2.22.184 3.558-.598 3.766-2.558 8.99-4.493 11.595-.384.516-.783.94-1.23 1.23-.469.304-.973.456-1.516.456-.542 0-1.047-.152-1.516-.456-.447-.29-.846-.714-1.23-1.23C6.058 17.16 4.098 11.936 3.5 8.17 3.281 6.832 3.155 5.805 3.684 4.612 5.267 1.067 8.624.793 9.614.793c.06 0 .118.014.178.014.06-.014.118-.014.178-.014zm-.542 1.363c-.06 0-.118.014-.178.014-.06-.014-.118-.014-.178-.014-.792 0-3.614.215-4.956 3.221-.465 1.052-.37 2.007-.184 3.211.552 3.506 2.31 8.342 4.116 10.884.18.254.39.49.628.706.238-.216.448-.452.628-.706 1.806-2.542 3.564-7.378 4.116-10.884.186-1.204.281-2.159-.184-3.211C15.358 2.371 12.536 2.156 11.744 2.156zm-.178 3.628c.99 0 1.794.804 1.794 1.794 0 .99-.804 1.794-1.794 1.794-.99 0-1.794-.804-1.794-1.794 0-.99.804-1.794 1.794-1.794zm0 1.363c-.24 0-.431.191-.431.431s.191.431.431.431.431-.191.431-.431-.191-.431-.431-.431z"/>
        </svg>
      ),
      url: 'https://snapchat.com/add/globaldocconnect',
      color: 'hover:text-yellow-500'
    },
    {
      name: 'TikTok',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
      ),
      url: 'https://tiktok.com/@globaldocconnect',
      color: 'hover:text-pink-600'
    }
  ]

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12 sm:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="GlobalDoc Connect logo" className="h-8 w-8 rounded-full" />
              <span className="text-xl font-bold text-brand-400">GlobalDoc Connect</span>
            </div>
            <p className="text-slate-300 mb-4 max-w-md">
              Connecting patients worldwide with verified healthcare professionals through secure telehealth consultations, emergency support, and comprehensive medical services.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-slate-400 transition-colors duration-200 ${social.color}`}
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#search" className="text-slate-300 hover:text-brand-400 transition-colors duration-200">
                  Find Doctors
                </a>
              </li>
              <li>
                <a href="#for-doctors" className="text-slate-300 hover:text-brand-400 transition-colors duration-200">
                  For Doctors
                </a>
              </li>
              <li>
                <a href="#emergency" className="text-slate-300 hover:text-brand-400 transition-colors duration-200">
                  Emergency Support
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-slate-300 hover:text-brand-400 transition-colors duration-200">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Legal & Support</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('terms')}
                  className="text-slate-300 hover:text-brand-400 transition-colors duration-200 text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('privacy')}
                  className="text-slate-300 hover:text-brand-400 transition-colors duration-200 text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="text-slate-300 hover:text-brand-400 transition-colors duration-200 text-left"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <a href="mailto:shafiuabdullahi.sa3@gmail.com" className="text-slate-300 hover:text-brand-400 transition-colors duration-200">
                  Support Email
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Information */}
        <div className="border-t border-slate-700 pt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold mb-2 text-white">Contact Information</h4>
              <div className="space-y-2 text-slate-300">
                <p>
                  <span className="font-medium">Email:</span>{' '}
                  <a href="mailto:shafiuabdullahi.sa3@gmail.com" className="text-brand-400 hover:text-brand-300">
                    shafiuabdullahi.sa3@gmail.com
                  </a>
                </p>
                <p>
                  <span className="font-medium">Emergency:</span> Available 24/7 for urgent medical consultations
                </p>
                <p>
                  <span className="font-medium">Languages:</span> English, Arabic, Swahili, Hindi, French, Spanish
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2 text-white">Service Areas</h4>
              <div className="text-slate-300">
                <p className="mb-2">Available worldwide with specialized care in:</p>
                <div className="flex flex-wrap gap-2">
                  {['Cardiology', 'Dermatology', 'Psychiatry', 'Pediatrics', 'Oncology', 'Emergency Care'].map((specialty) => (
                    <span key={specialty} className="bg-slate-700 px-2 py-1 rounded-full text-xs">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-slate-400 text-sm">
              © {currentYear} GlobalDoc Connect. All rights reserved.
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <button
                onClick={() => onNavigate('terms')}
                className="text-slate-400 hover:text-brand-400 transition-colors duration-200"
              >
                Terms of Service
              </button>
              <button
                onClick={() => onNavigate('privacy')}
                className="text-slate-400 hover:text-brand-400 transition-colors duration-200"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => onNavigate('contact')}
                className="text-slate-400 hover:text-brand-400 transition-colors duration-200"
              >
                Contact
              </button>
              <a href="mailto:shafiuabdullahi.sa3@gmail.com" className="text-slate-400 hover:text-brand-400 transition-colors duration-200">
                Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer