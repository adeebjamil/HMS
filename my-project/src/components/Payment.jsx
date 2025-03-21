import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { verifyPayment } from '../api/patientApi';

export default function Payment({ bookingData, onPaymentComplete }) {
  const { appointment, razorpayOrder } = bookingData;

  useEffect(() => {
    if (!razorpayOrder) return;
    
    const loadRazorpay = async () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          resolve(true);
        };
        script.onerror = () => {
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    const displayRazorpay = async () => {
      const res = await loadRazorpay();
      
      if (!res) {
        toast.error('Razorpay SDK failed to load. Please try again later.');
        return;
      }
      
      const options = {
        key: 'rzp_test_YOUR_KEY_ID', // Replace with your actual test key
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Hospital Management System',
        description: 'Doctor Appointment Payment',
        order_id: razorpayOrder.id,
        handler: async function (response) {
          try {
            const data = {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              appointmentId: appointment._id
            };
            
            const result = await verifyPayment(data);
            
            if (result.status === 'success') {
              toast.success('Payment successful!');
              onPaymentComplete(result.appointment);
            } else {
              toast.error('Payment verification failed');
            }
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: 'Patient Name',
          email: 'patient@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#0ea5e9'
        }
      };
      
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    };

    displayRazorpay();
  }, [razorpayOrder, appointment._id, onPaymentComplete]);

  return (
    <div className="card text-center">
      <h2 className="section-title">Processing Payment</h2>
      <div className="my-6">
        <p className="mb-2">Doctor: {bookingData.doctor?.name}</p>
        <p className="mb-2">Date: {new Date(appointment.appointmentDate).toLocaleDateString()}</p>
        <p className="mb-2">Time: {appointment.timeSlot}</p>
        <p className="mb-4">Amount: ₹{appointment.payment.amount}</p>
        
        <div className="animate-pulse text-primary-600">
          Loading payment gateway...
        </div>
      </div>
      
      <p className="mt-6 text-sm text-secondary-500">
        If the payment window doesn't open automatically, please refresh the page or contact support.
      </p>
    </div>
  );
}