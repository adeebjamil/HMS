import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header/Navigation */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <h1 className="text-2xl font-bold text-primary-800">Hospital Management System</h1>
          </div>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link to="/doctor" className="text-secondary-600 hover:text-primary-600 font-medium">
                  Doctors
                </Link>
              </li>
              <li>
                <Link to="/patient" className="text-secondary-600 hover:text-primary-600 font-medium">
                  Patients
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 md:pr-10">
              <h2 className="text-4xl md:text-5xl font-bold text-secondary-800 leading-tight mb-6">
                Quality Healthcare Made <span className="text-primary-600">Simple</span>
              </h2>
              <p className="text-xl text-secondary-600 mb-8">
                Our hospital management system connects patients with qualified doctors for 
                efficient appointments, consultations, and health management.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/patient"
                  className="btn-primary text-center"
                >
                  Book an Appointment
                </Link>
                <Link
                  to="/doctor"
                  className="bg-white text-primary-600 border border-primary-600 px-4 py-2 rounded-md hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors text-center"
                >
                  Doctor Login
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 mt-10 md:mt-0">
              <img 
                src="https://img.freepik.com/free-vector/hospital-building-concept-illustration_114360-8440.jpg?w=900&t=st=1685544589~exp=1685545189~hmac=5956d2575e8dd5a0e0d77158c90d62f0e47f8e7f4b4443f67ccb6c0332e05a35" 
                alt="Hospital illustration" 
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-secondary-800 mb-12">Our Services</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-primary-50 p-6 rounded-lg text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-secondary-800 mb-2">Online Appointments</h3>
              <p className="text-secondary-600">
                Book appointments with specialists online and avoid waiting in lines
              </p>
            </div>
            
            <div className="bg-primary-50 p-6 rounded-lg text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-secondary-800 mb-2">Expert Doctors</h3>
              <p className="text-secondary-600">
                Access to a network of experienced specialists across multiple departments
              </p>
            </div>
            
            <div className="bg-primary-50 p-6 rounded-lg text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-secondary-800 mb-2">Medical Records</h3>
              <p className="text-secondary-600">
                Maintain your complete medical history in one secure place
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="py-16 bg-secondary-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-secondary-800 mb-12">Our Departments</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'Psychiatry', 'Oncology', 'General Medicine'].map((dept) => (
              <div key={dept} className="bg-white p-4 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold text-secondary-800 mb-1">{dept}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-primary-100 text-xl max-w-2xl mx-auto mb-8">
            Join thousands of patients who have already simplified their healthcare experience with our system.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/patient"
              className="bg-white text-primary-600 px-6 py-3 rounded-md font-medium hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600 transition-colors"
            >
              Register as Patient
            </Link>
            <Link
              to="/doctor"
              className="bg-transparent text-white border border-white px-6 py-3 rounded-md font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600 transition-colors"
            >
              Register as Doctor
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-800 text-secondary-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Hospital Management System</h3>
              <p className="mb-4">
                Quality healthcare made accessible through technology.
              </p>
            </div>
            <div>
              <h4 className="text-white text-md font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/patient" className="hover:text-white transition-colors">Patient Portal</Link></li>
                <li><Link to="/doctor" className="hover:text-white transition-colors">Doctor Portal</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-md font-semibold mb-4">Departments</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Cardiology</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Neurology</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Orthopedics</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pediatrics</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-md font-semibold mb-4">Contact</h4>
              <p className="mb-2">123 Hospital Street</p>
              <p className="mb-2">Cityville, State 12345</p>
              <p className="mb-2">Email: info@hospitalsystem.com</p>
              <p>Phone: (123) 456-7890</p>
            </div>
          </div>
          <div className="border-t border-secondary-700 mt-8 pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} Hospital Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}