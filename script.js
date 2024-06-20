document.getElementById('processButton').addEventListener('click', () => {
    const fileInput = document.getElementById('fileInput');
    if (fileInput.files.length === 0) {
        alert('Please select a file first!');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        try {
            const busy = JSON.parse(event.target.result);
            const freeSlots = getFreeSlots('09:00', '21:00', busy);
            document.getElementById('output').textContent = JSON.stringify(freeSlots, null, 2);
        } catch (e) {
            alert('Error reading file: ' + e.message);
        }
    };

    reader.readAsText(file);
});

function getFreeSlots(start, end, busy) {
    const timeToMinutes = time => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const minutesToTime = minutes => {
        const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
        const mins = (minutes % 60).toString().padStart(2, '0');
        return `${hours}:${mins}`;
    };

    const workStart = timeToMinutes(start);
    const workEnd = timeToMinutes(end);
    const busyIntervals = busy.map(interval => ({
        start: timeToMinutes(interval.start),
        stop: timeToMinutes(interval.stop)
    }));

    busyIntervals.push({ start: workEnd, stop: 1440 });
    busyIntervals.unshift({ start: 0, stop: workStart });

    busyIntervals.sort((a, b) => a.start - b.start);

    const freeSlots = [];
    for (let i = 1; i < busyIntervals.length; i++) {
        const previousStop = busyIntervals[i - 1].stop;
        const currentStart = busyIntervals[i].start;
        
        if (currentStart - previousStop >= 30) {
            let slotStart = previousStop;
            while (slotStart + 30 <= currentStart) {
                freeSlots.push({
                    start: minutesToTime(slotStart),
                    stop: minutesToTime(slotStart + 30)
                });
                slotStart += 30;
            }
        }
    }

    return freeSlots;
}
