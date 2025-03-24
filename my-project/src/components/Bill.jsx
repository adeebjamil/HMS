import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { generateBill } from '../api/patientApi';
import { toast } from 'react-toastify';

export default function Bill() {
  const { appointmentId } = useParams();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBill = async () => {
      try {
        setLoading(true);
        const billData = await generateBill(appointmentId);
        setBill(billData);
      } catch (error) {
        toast.error('Failed to load bill');
        console.error('Bill loading error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBill();
  }, [appointmentId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-700">Bill Not Found</h2>
        <p className="mt-2 text-gray-500">The requested bill could not be found.</p>
        <Link to="/patient/dashboard" className="mt-6 inline-block text-primary-600 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-12 bg-white shadow-lg rounded-lg overflow-hidden print:shadow-none">
      <div className="print:hidden p-6 border-b border-gray-200 flex justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Medical Bill</h1>
        <button 
          onClick={handlePrint}
          className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print
        </button>
      </div>
      
      <div className="p-8">
        <div className="flex justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Hospital Management System</h2>
            <p className="text-gray-600">123 Healthcare Street</p>
            <p className="text-gray-600">Cityville, State 12345</p>
            <p className="text-gray-600">Phone: (123) 456-7890</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600">Bill #: {bill.billNumber}</p>
            <p className="text-gray-600">Date: {new Date(bill.date).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="border-t border-b border-gray-200 py-6 mb-8">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-gray-600 font-medium mb-2">Patient Information</h3>
              <p className="font-semibold">{bill.patientDetails.name}</p>
              <p className="text-gray-600">{bill.patientDetails.email}</p>
              <p className="text-gray-600">{bill.patientDetails.phoneNumber}</p>
            </div>
            <div>
              <h3 className="text-gray-600 font-medium mb-2">Doctor Information</h3>
              <p className="font-semibold">Dr. {bill.doctorDetails.name}</p>
              <p className="text-gray-600">{bill.doctorDetails.department}</p>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-gray-600 font-medium mb-3">Appointment Details</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium">{new Date(bill.appointmentDetails.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="font-medium">{bill.appointmentDetails.timeSlot}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Problem</p>
                <p className="font-medium">{bill.appointmentDetails.problem}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-gray-600 font-medium mb-3">Payment Summary</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-4">
                  <p className="text-gray-900">Consultation Fee</p>
                </td>
                <td className="py-4 text-right">
                  <p className="text-gray-900">₹{bill.paymentDetails.amount}</p>
                </td>
              </tr>
              {/* Additional items could be added here if needed */}
              <tr className="bg-gray-50">
                <td className="py-4 font-medium">
                  <p className="text-gray-900">Total Amount</p>
                </td>
                <td className="py-4 text-right font-bold">
                  <p className="text-gray-900">₹{bill.paymentDetails.amount}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="border-t border-gray-200 pt-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600 font-medium">Payment Status: 
                <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${bill.paymentDetails.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {bill.paymentDetails.status}
                </span>
              </p>
              {bill.paymentDetails.paymentId && (
                <p className="text-gray-600 text-sm mt-1">Payment ID: {bill.paymentDetails.paymentId}</p>
              )}
            </div>
            <div className="text-right">
              <img src="/paid-stamp.png" alt="Paid" className="h-16 print:block hidden" />
            </div>
          </div>
          
          <p className="mt-8 text-center text-gray-500 text-sm">
            Thank you for choosing our hospital services. We wish you a speedy recovery.
          </p>
        </div>
      </div>
    </div>
  );
}