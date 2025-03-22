import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO, subDays } from 'date-fns';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

// Mock data for development since API endpoints don't exist yet
const generateMockData = (startDate, endDate, isMonthly) => {
  const mockAppointments = [];
  const mockReferrals = [];
  
  // Convert to Date objects
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dayCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  
  // Departments for random assignment
  const departments = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General'];
  const statuses = ['Completed', 'Pending', 'Cancelled', 'No-show'];
  
  // Generate appointment data
  for (let i = 0; i < dayCount; i++) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i);
    
    // Random number of appointments per day (1-5)
    const appointmentCount = Math.floor(Math.random() * 5) + 1;
    
    for (let j = 0; j < appointmentCount; j++) {
      const dept = departments[Math.floor(Math.random() * departments.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const fee = Math.floor(Math.random() * 2000) + 500; // Random fee between 500-2500
      
      mockAppointments.push({
        _id: `app-${i}-${j}`,
        appointmentDate: currentDate.toISOString(),
        status: status,
        patient: {
          _id: `patient-${i}-${j}`,
          name: `Patient ${i}-${j}`,
          email: `patient${i}${j}@example.com`,
          age: Math.floor(Math.random() * 70) + 10
        },
        doctor: {
          _id: 'current-doctor',
          name: 'Dr. Current',
          department: dept,
          fee: fee
        },
        problem: `Medical issue ${i}-${j}`,
        createdAt: subDays(currentDate, 1).toISOString()
      });
      
      // Add some referrals (fewer than appointments)
      if (j === 0 && Math.random() > 0.5) {
        mockReferrals.push({
          _id: `ref-${i}-${j}`,
          referralDate: currentDate.toISOString(),
          status: ['pending', 'accepted', 'declined'][Math.floor(Math.random() * 3)],
          patient: {
            _id: `patient-${i}-${j}`,
            name: `Patient ${i}-${j}`,
            email: `patient${i}${j}@example.com`
          },
          fromDoctor: {
            _id: 'current-doctor',
            name: 'Dr. Current',
            department: dept
          },
          toDoctor: {
            _id: `doctor-${i}`,
            name: `Dr. Referral ${i}`,
            department: departments[Math.floor(Math.random() * departments.length)]
          },
          notes: `Referral notes for patient ${i}-${j}`,
          createdAt: currentDate.toISOString()
        });
      }
    }
  }
  
  return {
    appointments: mockAppointments,
    referrals: mockReferrals
  };
};

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('weekly');
  const [reportData, setReportData] = useState({
    patients: {},
    earnings: {},
    referrals: {},
    patientsByDepartment: {},
    appointmentStatus: {},
    rawData: {
      appointments: [],
      referrals: []
    }
  });
  const [metrics, setMetrics] = useState({
    totalPatients: 0,
    totalEarnings: 0,
    totalReferrals: 0,
    completionRate: 0
  });
  const [dateRange, setDateRange] = useState({
    start: format(startOfWeek(new Date()), 'yyyy-MM-dd'),
    end: format(endOfWeek(new Date()), 'yyyy-MM-dd')
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReportData();
  }, [reportType, dateRange]);

  const getConfig = () => {
    const token = localStorage.getItem('token') || 
                 (localStorage.getItem('userInfo') ? 
                   JSON.parse(localStorage.getItem('userInfo')).token : '');
    
    return {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    };
  };

  const handleReportTypeChange = (type) => {
    setReportType(type);
    
    if (type === 'weekly') {
      setDateRange({
        start: format(startOfWeek(new Date()), 'yyyy-MM-dd'),
        end: format(endOfWeek(new Date()), 'yyyy-MM-dd')
      });
    } else if (type === 'monthly') {
      setDateRange({
        start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
        end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
      });
    }
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Using mock data for development since endpoints don't exist
      const mockData = generateMockData(dateRange.start, dateRange.end, reportType === 'monthly');
      
      // Process the mock data
      const appointments = mockData.appointments;
      const referrals = mockData.referrals;
      
      // Calculate metrics
      const completedAppointments = appointments.filter(app => app.status === 'Completed');
      const totalPatients = completedAppointments.length;
      const totalEarnings = completedAppointments.reduce((sum, app) => sum + (app.doctor?.fee || 0), 0);
      const totalReferrals = referrals.length;
      const completionRate = appointments.length > 0 ? 
        (completedAppointments.length / appointments.length * 100).toFixed(1) : 0;
      
      setMetrics({
        totalPatients,
        totalEarnings,
        totalReferrals,
        completionRate
      });
      
      // Prepare data for charts
      // Group data by date
      const appointmentsByDate = groupDataByDate(appointments);
      const earningsByDate = groupEarningsByDate(appointments);
      const referralsByDate = groupDataByDate(referrals);
      
      setReportData({
        patients: appointmentsByDate,
        earnings: earningsByDate,
        referrals: referralsByDate,
        patientsByDepartment: groupPatientsByDepartment(appointments),
        appointmentStatus: groupAppointmentsByStatus(appointments),
        rawData: {
          appointments,
          referrals
        }
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
      setError('Failed to load report data');
      toast.error('Failed to load report data');
      
      // Set default empty data
      setReportData({
        patients: {},
        earnings: {},
        referrals: {},
        patientsByDepartment: {},
        appointmentStatus: {},
        rawData: {
          appointments: [],
          referrals: []
        }
      });
      
      setMetrics({
        totalPatients: 0,
        totalEarnings: 0,
        totalReferrals: 0,
        completionRate: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const groupDataByDate = (data) => {
    const groupedData = {};
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      return {};
    }
    
    data.forEach(item => {
      try {
        const date = format(new Date(item.appointmentDate || item.referralDate || item.createdAt), 'yyyy-MM-dd');
        if (!groupedData[date]) {
          groupedData[date] = 0;
        }
        groupedData[date] += 1;
      } catch (err) {
        console.error('Error processing date:', err);
      }
    });
    
    return groupedData;
  };

  const groupEarningsByDate = (appointments) => {
    const earnings = {};
    
    if (!appointments || !Array.isArray(appointments) || appointments.length === 0) {
      return {};
    }
    
    appointments.forEach(app => {
      if (app.status === 'Completed') {
        try {
          const date = format(new Date(app.appointmentDate), 'yyyy-MM-dd');
          if (!earnings[date]) {
            earnings[date] = 0;
          }
          earnings[date] += (app.doctor?.fee || 0);
        } catch (err) {
          console.error('Error processing earnings date:', err);
        }
      }
    });
    
    return earnings;
  };

  const groupPatientsByDepartment = (appointments) => {
    const departments = {};
    
    if (!appointments || !Array.isArray(appointments) || appointments.length === 0) {
      return { 'No Data': 1 };
    }
    
    appointments.forEach(app => {
      const dept = app.doctor?.department || 'Unknown';
      if (!departments[dept]) {
        departments[dept] = 0;
      }
      departments[dept] += 1;
    });
    
    return Object.keys(departments).length > 0 ? departments : { 'No Data': 1 };
  };

  const groupAppointmentsByStatus = (appointments) => {
    const statuses = {};
    
    if (!appointments || !Array.isArray(appointments) || appointments.length === 0) {
      return { 'No Data': 1 };
    }
    
    appointments.forEach(app => {
      const status = app.status || 'Unknown';
      if (!statuses[status]) {
        statuses[status] = 0;
      }
      statuses[status] += 1;
    });
    
    return Object.keys(statuses).length > 0 ? statuses : { 'No Data': 1 };
  };

  const getBarChartData = (dataObject, label) => {
    if (!dataObject || Object.keys(dataObject).length === 0) {
      return {
        labels: ['No Data'],
        datasets: [
          {
            label,
            data: [0],
            backgroundColor: 'rgba(200, 200, 200, 0.6)'
          }
        ]
      };
    }
    
    const dates = Object.keys(dataObject).sort();
    
    return {
      labels: dates.map(date => {
        try {
          return format(new Date(date), 'MMM dd');
        } catch (e) {
          return date;
        }
      }),
      datasets: [
        {
          label,
          data: dates.map(date => dataObject[date]),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  const getPieChartData = (dataObject, label) => {
    if (!dataObject || Object.keys(dataObject).length === 0) {
      return {
        labels: ['No Data'],
        datasets: [
          {
            label,
            data: [1],
            backgroundColor: ['rgba(200, 200, 200, 0.6)']
          }
        ]
      };
    }
    
    const labels = Object.keys(dataObject);
    const data = labels.map(key => dataObject[key]);
    const backgroundColors = [
      'rgba(255, 99, 132, 0.6)',
      'rgba(54, 162, 235, 0.6)',
      'rgba(255, 206, 86, 0.6)',
      'rgba(75, 192, 192, 0.6)',
      'rgba(153, 102, 255, 0.6)',
      'rgba(255, 159, 64, 0.6)',
      'rgba(255, 99, 132, 0.6)'
    ];
    
    return {
      labels,
      datasets: [
        {
          label,
          data,
          backgroundColor: backgroundColors.slice(0, labels.length),
          borderWidth: 1
        }
      ]
    };
  };

  const exportToExcel = () => {
    // This would normally use XLSX to generate an Excel file
    // For now, let's just show a message since we're using mock data
    toast.info('Export functionality would save report to Excel file');
    
    // If you want to implement this, add the XLSX package:
    // npm install xlsx
    // Then uncomment the code below:
    
    /*
    try {
      const { appointments, referrals } = reportData.rawData;
      
      // Create workbook with multiple sheets
      const workbook = XLSX.utils.book_new();
      
      // Add sheets
      const summarySheet = XLSX.utils.json_to_sheet([
        { 'Metric': 'Total Patients', 'Value': metrics.totalPatients },
        { 'Metric': 'Total Earnings', 'Value': `₹${metrics.totalEarnings}` },
        { 'Metric': 'Total Referrals', 'Value': metrics.totalReferrals },
        { 'Metric': 'Completion Rate', 'Value': `${metrics.completionRate}%` }
      ]);
      
      const appointmentSheet = XLSX.utils.json_to_sheet(
        appointments.map(app => ({
          'Date': format(new Date(app.appointmentDate), 'yyyy-MM-dd'),
          'Patient': app.patient?.name || 'Unknown',
          'Status': app.status,
          'Fee': app.doctor?.fee || 0
        }))
      );
      
      const referralSheet = XLSX.utils.json_to_sheet(
        referrals.map(ref => ({
          'Date': format(new Date(ref.referralDate || ref.createdAt), 'yyyy-MM-dd'),
          'Patient': ref.patient?.name || 'Unknown',
          'To Doctor': ref.toDoctor?.name || 'Unknown',
          'Status': ref.status
        }))
      );
      
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
      XLSX.utils.book_append_sheet(workbook, appointmentSheet, 'Appointments');
      XLSX.utils.book_append_sheet(workbook, referralSheet, 'Referrals');
      
      // Generate filename
      const filename = `doctor_report_${dateRange.start}_to_${dateRange.end}.xlsx`;
      
      // Save file
      XLSX.writeFile(workbook, filename);
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to download report');
    }
    */
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Report</h2>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchReportData}
          className="mt-4 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <svg className="h-6 w-6 text-yellow-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Demo Mode</h3>
            <p className="text-sm text-yellow-700 mt-1">
              This is using randomly generated mock data for demonstration purposes. 
              In a production environment, this would connect to your backend API.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary-700">Doctor Performance Reports</h1>
        <div className="flex space-x-4">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              onClick={() => handleReportTypeChange('weekly')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                reportType === 'weekly' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => handleReportTypeChange('monthly')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                reportType === 'monthly' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Monthly
            </button>
          </div>
          <button
            onClick={exportToExcel}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Excel
          </button>
        </div>
      </div>
      
      <div className="text-sm text-gray-600 mb-6">
        Showing data from {format(new Date(dateRange.start), 'MMMM d, yyyy')} to {format(new Date(dateRange.end), 'MMMM d, yyyy')}
      </div>
      
      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-gray-800">{metrics.totalPatients}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-800">₹{metrics.totalEarnings}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-purple-100 p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Referrals</p>
              <p className="text-2xl font-bold text-gray-800">{metrics.totalReferrals}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-yellow-100 p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-800">{metrics.completionRate}%</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Patient Visits Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Patient Visits</h2>
          <div className="h-80">
            <Bar 
              data={getBarChartData(reportData.patients, 'Patient Visits')} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0
                    }
                  }
                }
              }} 
            />
          </div>
        </div>
        
        {/* Earnings Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Earnings</h2>
          <div className="h-80">
            <Line 
              data={getBarChartData(reportData.earnings, 'Earnings (₹)')} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }} 
            />
          </div>
        </div>
        
        {/* Patients by Department */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Patients by Department</h2>
          <div className="h-80">
            <Pie 
              data={getPieChartData(reportData.patientsByDepartment, 'Patients')} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right'
                  }
                }
              }} 
            />
          </div>
        </div>
        
        {/* Appointment Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Appointment Status</h2>
          <div className="h-80">
            <Pie 
              data={getPieChartData(reportData.appointmentStatus, 'Status')} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right'
                  }
                }
              }} 
            />
          </div>
        </div>
      </div>
      
      <div className="mt-12 text-center text-sm text-gray-500">
        This report is based on completed appointments and referrals within the selected date range.
        <br />
        Click "Download Excel" for a detailed breakdown of all data.
      </div>
    </div>
  );
}