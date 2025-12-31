
/**
 * Generates a study timetable based on user inputs.
 * @param {Object} data - The form data containing preferences, availability, and courses.
 * @returns {Object} - The generated timetable structured by day.
 */
export function generateTimetable(data) {
    const { availability, courses, preferences } = data; // Note: data passed here matches the structure in TimetableGenerator.jsx state
    // But in the component I passed individual sections. Let's assume the main component passes the full `formData`.
    
    // Normalize data (handle if structure is slightly different)
    const availableDays = Object.entries(availability || data.availability || {})
        .filter(([_, dayData]) => dayData.available && dayData.hours > 0);
    
    const courseList = (courses || data.courses || []).filter(c => c.name.trim() !== '');
    
    const sessionLength = data.sessionLength || 60; // minutes
    const maxSessionsPerDay = data.maxSessionsPerDay || 4;
    
    if (availableDays.length === 0 || courseList.length === 0) {
        throw new Error("Insufficient data to generate timetable");
    }

    // 1. Calculate Course Weights
    // Priority: high=3, medium=2, low=1
    // Difficulty: hard=3, medium=2, easy=1
    const weightedCourses = courseList.map(course => {
        let weight = 0;
        if (course.priority === 'high') weight += 3;
        else if (course.priority === 'medium') weight += 2;
        else weight += 1;

        if (course.difficulty === 'hard') weight += 2; // Difficulty adds less weight than priority
        else if (course.difficulty === 'medium') weight += 1;
        
        return { ...course, weight, sessionsAssigned: 0 };
    });

    const totalWeight = weightedCourses.reduce((sum, c) => sum + c.weight, 0);

    // 2. Calculate Total Available Slots
    // Each slot is 1 sessionLength
    const timetable = {};
    let totalSlotsAvailable = 0;

    availableDays.forEach(([day, info]) => {
        const availableMinutes = info.hours * 60;
        const maxSlotsByTime = Math.floor(availableMinutes / sessionLength);
        const slots = Math.min(maxSlotsByTime, maxSessionsPerDay);
        
        timetable[day] = {
            slots: slots,
            sessions: [],
            preferredTime: info.preferredTime
        };
        totalSlotsAvailable += slots;
    });

    // 3. Distribute Sessions
    // Target sessions for each course = (weight / totalWeight) * totalSlotsAvailable
    weightedCourses.forEach(course => {
        course.targetSessions = Math.round((course.weight / totalWeight) * totalSlotsAvailable);
        // Ensure at least 1 session if possible
        if (course.targetSessions === 0 && totalSlotsAvailable >= courseList.length) {
            course.targetSessions = 1;
        }
    });

    // Re-adjust if total exceeds available
    let totalAssigned = weightedCourses.reduce((sum, c) => sum + c.targetSessions, 0);
    while (totalAssigned > totalSlotsAvailable) {
        // Remove from lowest priority course with > 0 sessions
        const reducer = weightedCourses
            .filter(c => c.targetSessions > 0)
            .sort((a, b) => a.weight - b.weight)[0];
        if (reducer) {
            reducer.targetSessions--;
            totalAssigned--;
        } else {
            break; 
        }
    }

    // 4. Fill the Timetable
    // Round-robin distribution based on remaining target sessions to avoid clustering
    const days = availableDays.map(d => d[0]);
    let dayIndex = 0;
    
    // Sort courses by weight desc for initial placement
    const allocationQueue = [];
    weightedCourses.sort((a, b) => b.weight - a.weight).forEach(c => {
        for (let i = 0; i < c.targetSessions; i++) {
            allocationQueue.push(c);
        }
    });

    // Shuffle slightly or distribute intelligently?
    // Let's just fill slots day by day, balancing hard subjects
    
    // Simple greedy allocation: Fill days one by one? No, round robin across days is better.
    let safetyCounter = 0;
    while (allocationQueue.length > 0 && safetyCounter < 1000) {
        safetyCounter++;
        const currentDay = days[dayIndex];
        const daySchedule = timetable[currentDay];
        
        if (daySchedule.sessions.length < daySchedule.slots) {
            const course = allocationQueue.shift();
            
            // Assign time based on preferred time + slot index
            // Simple logic: Start time depends on preference
            let startTime = "09:00";
            if (daySchedule.preferredTime === 'afternoon') startTime = "13:00";
            else if (daySchedule.preferredTime === 'evening') startTime = "17:00";
            else if (daySchedule.preferredTime === 'night') startTime = "20:00";
            
            // Add offset based on existing sessions (assuming contiguous for now)
            const offsetMinutes = daySchedule.sessions.length * (sessionLength + (data.breakDuration || 10));
            
            // Parse time, add minutes, format back
            const [h, m] = startTime.split(':').map(Number);
            const totalMin = h * 60 + m + offsetMinutes;
            const newH = Math.floor(totalMin / 60) % 24;
            const newM = totalMin % 60;
            const timeString = `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;

            daySchedule.sessions.push({
                courseId: course.id,
                courseName: course.name,
                difficulty: course.difficulty,
                startTime: timeString,
                duration: sessionLength
            });
        }
        
        dayIndex = (dayIndex + 1) % days.length;
    }

    return timetable;
}
