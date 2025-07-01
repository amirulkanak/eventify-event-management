const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Copyright */}
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-gray-300">
              &copy; {currentYear} Eventify. All rights reserved.
            </p>
          </div>

          {/* Developer Credit */}
          <div className="text-center md:text-right">
            <p className="text-gray-300">
              Designed and Developed by{' '}
              <a
                href="https://github.com/amirulkanak"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium">
                Amirul Kanak
              </a>
            </p>
          </div>
        </div>

        {/* Additional Links (Optional) */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6">
            <a
              href="/events"
              className="text-gray-300 hover:text-white transition-colors duration-200">
              Browse Events
            </a>
            <a
              href="/add-event"
              className="text-gray-300 hover:text-white transition-colors duration-200">
              Create Event
            </a>
            <a
              href="https://github.com/amirulkanak"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors duration-200">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
