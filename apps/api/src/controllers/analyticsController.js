import db from '../database/db.js';

export class AnalyticsController {
  static getMetrics(req, res) {
    const leads = db.find('leads');
    const appointments = db.find('appointments');
    const conversations = db.find('conversations');
    const handoffs = db.find('handoffs');

    const totalEnquiries = conversations.length;
    const totalLeads = leads.length;
    const qualifiedLeads = leads.filter(
      (l) => l.status === 'QUALIFIED' || l.status === 'BOOKING' || l.status === 'BOOKED' || l.status === 'COMPLETED'
    ).length;

    const totalBookedAppointments = appointments.length;
    const completedAppointments = appointments.filter((a) => a.status === 'COMPLETED').length;
    const cancelledAppointments = appointments.filter((a) => a.status === 'CANCELLED').length;
    const noShowAppointments = appointments.filter((a) => a.status === 'NO_SHOW').length;
    const confirmedAppointments = appointments.filter((a) => a.status === 'CONFIRMED').length;

    const totalHandoffs = handoffs.length;
    const pendingHandoffs = handoffs.filter((h) => h.status === 'PENDING').length;

    // Rates according to PRD Section 36
    const qualificationRate = totalLeads > 0 ? ((qualifiedLeads / totalLeads) * 100).toFixed(1) : '0.0';
    const bookingRate = totalLeads > 0 ? ((totalBookedAppointments / totalLeads) * 100).toFixed(1) : '0.0';
    const completionRate =
      totalBookedAppointments > 0 ? ((completedAppointments / totalBookedAppointments) * 100).toFixed(1) : '0.0';
    const noShowRate =
      totalBookedAppointments > 0 ? ((noShowAppointments / totalBookedAppointments) * 100).toFixed(1) : '0.0';
    const conversionRate = totalEnquiries > 0 ? ((totalBookedAppointments / totalEnquiries) * 100).toFixed(1) : '0.0';

    // Source-wise distribution
    const sourceMap = {};
    leads.forEach((l) => {
      const src = l.source || 'WhatsApp';
      sourceMap[src] = (sourceMap[src] || 0) + 1;
    });
    const sourceBreakdown = Object.entries(sourceMap).map(([name, count]) => ({ name, count }));

    // Service-wise distribution
    const serviceMap = {};
    leads.forEach((l) => {
      const srv = l.service || 'General Enquiry';
      serviceMap[srv] = (serviceMap[srv] || 0) + 1;
    });
    const serviceBreakdown = Object.entries(serviceMap).map(([name, count]) => ({ name, count }));

    res.json({
      overview: {
        totalEnquiries,
        totalLeads,
        qualifiedLeads,
        totalBookedAppointments,
        confirmedAppointments,
        completedAppointments,
        cancelledAppointments,
        noShowAppointments,
        totalHandoffs,
        pendingHandoffs
      },
      rates: {
        qualificationRate: `${qualificationRate}%`,
        bookingRate: `${bookingRate}%`,
        completionRate: `${completionRate}%`,
        noShowRate: `${noShowRate}%`,
        conversionRate: `${conversionRate}%`
      },
      sourceBreakdown,
      serviceBreakdown
    });
  }
}
