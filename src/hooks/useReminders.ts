import { useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { differenceInHours, parseISO, isAfter } from 'date-fns';

/**
 * Hook to simulate automated appointment reminders.
 * In a real-world app, this would be a CRON job on a backend.
 */
export function useReminderManager(userId?: string) {
  useEffect(() => {
    if (!userId) return;

    const checkReminders = async () => {
      console.log("[Reminder System] Scanning for upcoming appointments...");
      const aptPath = 'appointments';
      const q = query(
        collection(db, aptPath),
        where('status', '==', 'confirmed'),
        where('reminderSent', '!=', true)
      );

      try {
        const snapshot = await getDocs(q);
        snapshot.docs.forEach(async (d) => {
          const apt = d.data();
          // Assuming apt.date is YYYY-MM-DD
          const aptDateTime = new Date(`${apt.date}T${apt.timeSlot.split(' ')[0]}:00`);
          const hoursDiff = differenceInHours(aptDateTime, new Date());

          // Send reminder if appointment is between 12 and 24 hours away
          if (hoursDiff > 0 && hoursDiff <= 24) {
            console.log(`[Reminder System] SENDING AUTO-REMINDER for appointment ${d.id}`);
            console.log(`To Patient: ${apt.patientName} (${apt.patientPhone})`);
            console.log(`To Doctor: ${apt.doctorName}`);
            console.log(`Message: Your appointment is scheduled for ${apt.date} at ${apt.timeSlot}. See you soon!`);

            // Mark as sent so we don't spam
            await updateDoc(doc(db, aptPath, d.id), {
              reminderSent: true,
              reminderSentAt: new Date().toISOString()
            });
          }
        });
      } catch (err) {
        console.error("Reminder check failed:", err);
      }
    };

    // Check every 30 minutes (simulated)
    // For demo purposes, we do a check immediately on mount
    checkReminders();
    const interval = setInterval(checkReminders, 1800000); 

    return () => clearInterval(interval);
  }, [userId]);
}
