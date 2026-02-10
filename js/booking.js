/* ============================================
   Sleeknail Lounge — Booking System JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ---------- State ----------
    const bookingState = {
        selectedServices: [],
        selectedDate: null,
        selectedTime: null,
        selectedTech: 'any',
        totalPrice: 0,
        totalDuration: 0,
        currentStep: 1
    };

    const techNames = {
        'any': 'Any Available',
        'sarah': 'Sarah C.',
        'maria': 'Maria R.',
        'aisha': 'Aisha J.',
        'emma': 'Emma T.'
    };

    // ---------- Elements ----------
    const steps = document.querySelectorAll('.booking-step');
    const progressSteps = document.querySelectorAll('.progress-step');
    const progressLines = document.querySelectorAll('.progress-line');
    const serviceCards = document.querySelectorAll('.booking-service-card');
    const catTabs = document.querySelectorAll('.cat-tab');
    const selectedSummary = document.getElementById('selectedSummary');
    const selectedList = document.getElementById('selectedList');
    const totalPriceEl = document.getElementById('totalPrice');
    const totalDurationEl = document.getElementById('totalDuration');

    // Navigation buttons
    const toStep2 = document.getElementById('toStep2');
    const toStep3 = document.getElementById('toStep3');
    const backToStep1 = document.getElementById('backToStep1');
    const backToStep2 = document.getElementById('backToStep2');
    const submitBooking = document.getElementById('submitBooking');
    const newBooking = document.getElementById('newBooking');

    // ---------- Step Navigation ----------
    function goToStep(stepNum) {
        bookingState.currentStep = stepNum;

        // Update steps visibility
        steps.forEach(s => s.classList.remove('active'));
        document.getElementById(`step${stepNum}`).classList.add('active');

        // Update progress indicators
        progressSteps.forEach((ps, i) => {
            ps.classList.remove('active', 'completed');
            if (i + 1 === stepNum) ps.classList.add('active');
            if (i + 1 < stepNum) ps.classList.add('completed');
        });

        progressLines.forEach((pl, i) => {
            pl.classList.toggle('active', i + 1 < stepNum);
        });

        // Scroll to top of booking section
        document.querySelector('.booking-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    toStep2?.addEventListener('click', () => {
        if (bookingState.selectedServices.length > 0) goToStep(2);
    });

    toStep3?.addEventListener('click', () => {
        if (bookingState.selectedDate && bookingState.selectedTime) {
            populateSummary();
            goToStep(3);
        }
    });

    backToStep1?.addEventListener('click', () => goToStep(1));
    backToStep2?.addEventListener('click', () => goToStep(2));

    newBooking?.addEventListener('click', () => {
        // Reset state
        bookingState.selectedServices = [];
        bookingState.selectedDate = null;
        bookingState.selectedTime = null;
        bookingState.selectedTech = 'any';
        bookingState.totalPrice = 0;
        bookingState.totalDuration = 0;

        serviceCards.forEach(c => c.classList.remove('selected'));
        document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
        document.querySelectorAll('.tech-option').forEach(t => {
            t.classList.remove('selected');
            if (t.dataset.tech === 'any') t.classList.add('selected');
        });

        selectedSummary.style.display = 'none';
        toStep2.disabled = true;
        toStep3.disabled = true;

        document.getElementById('bookingForm').reset();
        goToStep(1);
    });

    // ---------- Service Selection ----------
    catTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            catTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const cat = tab.dataset.cat;

            serviceCards.forEach(card => {
                if (cat === 'all' || card.dataset.cat === cat) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    serviceCards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('selected');
            updateSelectedServices();
        });
    });

    function updateSelectedServices() {
        const selected = document.querySelectorAll('.booking-service-card.selected');
        bookingState.selectedServices = [];
        bookingState.totalPrice = 0;
        bookingState.totalDuration = 0;

        selected.forEach(card => {
            const service = {
                id: card.dataset.service,
                name: card.querySelector('h4').textContent,
                price: parseInt(card.dataset.price),
                duration: parseInt(card.dataset.duration)
            };
            bookingState.selectedServices.push(service);
            bookingState.totalPrice += service.price;
            bookingState.totalDuration += service.duration;
        });

        // Update summary
        if (bookingState.selectedServices.length > 0) {
            selectedSummary.style.display = 'block';
            selectedList.innerHTML = bookingState.selectedServices.map(s => `
                <div class="selected-item">
                    <span>${s.name}</span>
                    <span>$${s.price} · ${s.duration} min</span>
                </div>
            `).join('');
            totalPriceEl.textContent = `$${bookingState.totalPrice}`;
            totalDurationEl.textContent = `${bookingState.totalDuration} min`;
            toStep2.disabled = false;
        } else {
            selectedSummary.style.display = 'none';
            toStep2.disabled = true;
        }
    }

    // ---------- Calendar ----------
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    const calendarDays = document.getElementById('calendarDays');
    const calendarMonth = document.getElementById('calendarMonth');
    const prevMonth = document.getElementById('prevMonth');
    const nextMonth = document.getElementById('nextMonth');

    const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    function renderCalendar() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        calendarMonth.textContent = `${months[currentMonth]} ${currentYear}`;
        calendarDays.innerHTML = '';

        // Empty cells for days before first day of month
        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement('div');
            empty.className = 'cal-day empty';
            calendarDays.appendChild(empty);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const dayEl = document.createElement('div');
            dayEl.className = 'cal-day';
            dayEl.textContent = day;

            // Check if date is in the past or is Sunday (salon closed)
            if (date < today || date.getDay() === 0) {
                dayEl.classList.add('disabled');
            } else {
                // Check if today
                if (date.getTime() === today.getTime()) {
                    dayEl.classList.add('today');
                }

                // Check if selected
                if (bookingState.selectedDate &&
                    date.getTime() === bookingState.selectedDate.getTime()) {
                    dayEl.classList.add('selected');
                }

                dayEl.addEventListener('click', () => {
                    bookingState.selectedDate = date;
                    document.querySelectorAll('.cal-day').forEach(d => d.classList.remove('selected'));
                    dayEl.classList.add('selected');
                    generateTimeSlots(date);
                    validateStep2();
                });
            }

            calendarDays.appendChild(dayEl);
        }
    }

    prevMonth?.addEventListener('click', () => {
        const today = new Date();
        if (currentMonth === today.getMonth() && currentYear === today.getFullYear()) return;
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });

    nextMonth?.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });

    renderCalendar();

    // ---------- Time Slots ----------
    function generateTimeSlots(date) {
        const timeNote = document.getElementById('timeNote');
        const morningSlots = document.getElementById('morningSlots');
        const afternoonSlots = document.getElementById('afternoonSlots');
        const eveningSlots = document.getElementById('eveningSlots');

        timeNote.style.display = 'none';
        morningSlots.innerHTML = '';
        afternoonSlots.innerHTML = '';
        eveningSlots.innerHTML = '';

        const isSunday = date.getDay() === 0;
        if (isSunday) return;

        // Sunday: closed, Saturday: 9-5, other days: 9-7
        const isSaturday = date.getDay() === 6;
        const openHour = isSaturday ? 10 : 9;
        const closeHour = isSaturday ? 17 : 19;

        // Simulated unavailable slots (random for demo)
        const seed = date.getDate() + date.getMonth();
        const unavailableSlots = new Set();
        for (let i = 0; i < 4; i++) {
            const randomHour = openHour + ((seed * (i + 1) * 7) % (closeHour - openHour));
            const randomMin = ((seed * (i + 1)) % 2) * 30;
            unavailableSlots.add(`${randomHour}:${randomMin === 0 ? '00' : '30'}`);
        }

        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        for (let hour = openHour; hour < closeHour; hour++) {
            for (let min = 0; min < 60; min += 30) {
                const timeStr = `${hour}:${min === 0 ? '00' : '30'}`;
                const displayHour = hour > 12 ? hour - 12 : hour;
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const displayTime = `${displayHour}:${min === 0 ? '00' : '30'} ${ampm}`;

                // Skip past times if today
                if (isToday && (hour < now.getHours() || (hour === now.getHours() && min <= now.getMinutes()))) {
                    continue;
                }

                const slot = document.createElement('button');
                slot.className = 'time-slot';
                slot.textContent = displayTime;
                slot.dataset.time = timeStr;
                slot.dataset.display = displayTime;

                if (unavailableSlots.has(timeStr)) {
                    slot.classList.add('unavailable');
                } else {
                    slot.addEventListener('click', () => {
                        document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                        slot.classList.add('selected');
                        bookingState.selectedTime = displayTime;
                        validateStep2();
                    });
                }

                // Categorize by time of day
                if (hour < 12) {
                    morningSlots.appendChild(slot);
                } else if (hour < 17) {
                    afternoonSlots.appendChild(slot);
                } else {
                    eveningSlots.appendChild(slot);
                }
            }
        }
    }

    function validateStep2() {
        toStep3.disabled = !(bookingState.selectedDate && bookingState.selectedTime);
    }

    // ---------- Technician Selection ----------
    document.querySelectorAll('.tech-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.tech-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            bookingState.selectedTech = option.dataset.tech;
        });
    });

    // ---------- Populate Step 3 Summary ----------
    function populateSummary() {
        document.getElementById('summaryServices').textContent =
            bookingState.selectedServices.map(s => s.name).join(', ');
        document.getElementById('summaryDate').textContent =
            bookingState.selectedDate.toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
        document.getElementById('summaryTime').textContent = bookingState.selectedTime;
        document.getElementById('summaryTech').textContent = techNames[bookingState.selectedTech];
        document.getElementById('summaryDuration').textContent = `${bookingState.totalDuration} minutes`;
        document.getElementById('summaryTotal').textContent = `$${bookingState.totalPrice}`;
    }

    // ---------- Submit Booking ----------
    submitBooking?.addEventListener('click', () => {
        const form = document.getElementById('bookingForm');
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const agreeTerms = document.getElementById('agreeTerms').checked;

        // Simple validation
        if (!firstName || !lastName || !email || !phone) {
            showToast('Please fill in all required fields.', 'error');
            return;
        }

        if (!email.includes('@') || !email.includes('.')) {
            showToast('Please enter a valid email address.', 'error');
            return;
        }

        if (!agreeTerms) {
            showToast('Please agree to the terms and cancellation policy.', 'error');
            return;
        }

        // Generate booking reference
        const bookingRef = 'LN-' + Date.now().toString(36).toUpperCase().slice(-6);

        // Populate confirmation
        const confirmDetails = document.getElementById('confirmationDetails');
        confirmDetails.innerHTML = `
            <div class="conf-row">
                <span class="conf-label">Booking Reference</span>
                <span class="conf-value" style="color:var(--primary);font-family:monospace;font-size:1.1rem;">${bookingRef}</span>
            </div>
            <div class="conf-row">
                <span class="conf-label">Name</span>
                <span class="conf-value">${firstName} ${lastName}</span>
            </div>
            <div class="conf-row">
                <span class="conf-label">Services</span>
                <span class="conf-value">${bookingState.selectedServices.map(s => s.name).join('<br>')}</span>
            </div>
            <div class="conf-row">
                <span class="conf-label">Date</span>
                <span class="conf-value">${bookingState.selectedDate.toLocaleDateString('en-US', {
                    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                })}</span>
            </div>
            <div class="conf-row">
                <span class="conf-label">Time</span>
                <span class="conf-value">${bookingState.selectedTime}</span>
            </div>
            <div class="conf-row">
                <span class="conf-label">Technician</span>
                <span class="conf-value">${techNames[bookingState.selectedTech]}</span>
            </div>
            <div class="conf-row">
                <span class="conf-label">Duration</span>
                <span class="conf-value">${bookingState.totalDuration} minutes</span>
            </div>
            <div class="conf-row">
                <span class="conf-label">Email</span>
                <span class="conf-value">${email}</span>
            </div>
            <div class="conf-row" style="border-bottom:none;">
                <span class="conf-label" style="font-weight:700;font-size:1.05rem;">Total</span>
                <span class="conf-value" style="color:var(--primary);font-family:var(--font-heading);font-size:1.2rem;">$${bookingState.totalPrice}</span>
            </div>
        `;

        // Save to localStorage
        const bookings = JSON.parse(localStorage.getItem('sleeknail_bookings') || '[]');
        bookings.push({
            ref: bookingRef,
            name: `${firstName} ${lastName}`,
            email: email,
            phone: phone,
            services: bookingState.selectedServices.map(s => s.name),
            date: bookingState.selectedDate.toISOString(),
            time: bookingState.selectedTime,
            technician: techNames[bookingState.selectedTech],
            duration: bookingState.totalDuration,
            total: bookingState.totalPrice,
            notes: document.getElementById('notes').value,
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('sleeknail_bookings', JSON.stringify(bookings));

        goToStep(4);
        showToast('Booking confirmed successfully!', 'success');
    });

    // ---------- Toast (imported from main.js, ensure fallback) ----------
    if (typeof window.showToast !== 'function') {
        window.showToast = function(message, type = 'success') {
            const existing = document.querySelector('.toast');
            if (existing) existing.remove();

            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.innerHTML = `
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                <span>${message}</span>
            `;
            document.body.appendChild(toast);

            setTimeout(() => toast.classList.add('show'), 50);
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 400);
            }, 4000);
        };
    }
});
