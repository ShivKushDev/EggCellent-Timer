class EggTimer {
    constructor() {
        this.timerDisplay = {
            minutes: document.querySelector('.minutes'),
            seconds: document.querySelector('.seconds')
        };
        this.progressRing = document.querySelector('.progress-ring-circle');
        this.modal = document.getElementById('alarmModal');
        this.alarmSound = document.getElementById('alarmSound');
        
        if (this.progressRing) {
            const radius = this.progressRing.r.baseVal.value;
            const circumference = radius * 2 * Math.PI;
            this.progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
            this.progressRing.style.strokeDashoffset = circumference;
            this.circumference = circumference;
        }
        this.buttons = {
            eggButtons: document.querySelectorAll('.egg-btn'),
            startButton: document.querySelector('.control-btn.start'),
            resetButton: document.querySelector('.control-btn.reset'),
            themeToggle: document.querySelector('.theme-toggle')
        };
        
        this.timeLeft = 0;
        this.timerId = null;
        this.selectedTime = 0;
        
        this.initializeTheme();
        this.initializeEventListeners();
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    initializeEventListeners() {
        this.buttons.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.buttons.eggButtons.forEach(button => {
            button.addEventListener('click', () => this.selectEggType(button));
        });

        this.buttons.startButton.addEventListener('click', () => this.toggleTimer());
        this.buttons.resetButton.addEventListener('click', () => this.resetTimer());
    }

    selectEggType(button) {
        // Remove active class from all buttons
        this.buttons.eggButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to selected button
        button.classList.add('active');
        
        // Get time from data attribute and convert to number
        this.selectedTime = parseInt(button.dataset.time);
        this.timeLeft = this.selectedTime;
        
        // Update display
        this.updateDisplay();
        
        // Enable start button
        this.buttons.startButton.disabled = false;
        this.buttons.startButton.textContent = 'Start';
    }

    toggleTimer() {
        if (this.timerId) {
            // Pause timer
            clearInterval(this.timerId);
            this.timerId = null;
            this.buttons.startButton.textContent = 'Resume';
        } else {
            // Start timer
            this.startTimer();
            this.buttons.startButton.textContent = 'Pause';
        }
    }

    startTimer() {
        const startTime = Date.now();
        const initialTimeLeft = this.timeLeft;

        this.timerId = setInterval(() => {
            const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
            this.timeLeft = initialTimeLeft - elapsedSeconds;

            if (this.timeLeft <= 0) {
                this.timerComplete();
            } else {
                this.updateDisplay();
            }
        }, 100);

        this.buttons.resetButton.disabled = false;
    }

    resetTimer() {
        clearInterval(this.timerId);
        this.timerId = null;
        this.timeLeft = this.selectedTime;
        this.updateDisplay();
        this.buttons.startButton.textContent = 'Start';
        this.buttons.resetButton.disabled = true;
    }

    timerComplete() {
        clearInterval(this.timerId);
        this.timerId = null;
        this.timeLeft = 0;
        this.updateDisplay();
        this.buttons.startButton.disabled = true;
        this.buttons.resetButton.disabled = true;
        this.playAlarm();
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        
        this.timerDisplay.minutes.textContent = minutes.toString().padStart(2, '0');
        this.timerDisplay.seconds.textContent = seconds.toString().padStart(2, '0');
        
        // Update progress ring
        if (this.progressRing) {
            const progress = this.timeLeft / this.selectedTime;
            const offset = this.circumference - (progress * this.circumference);
            this.progressRing.style.strokeDashoffset = offset;
        }
    }

    playAlarm() {
        // Show modal
        this.modal.classList.add('show');
        
        // Play alarm sound
        this.alarmSound.play();
        
        // Add click handler to stop alarm
        const modalBtn = this.modal.querySelector('.modal-btn');
        const handleModalClose = () => {
            this.modal.classList.remove('show');
            this.alarmSound.pause();
            this.alarmSound.currentTime = 0;
            modalBtn.removeEventListener('click', handleModalClose);
        };
        modalBtn.addEventListener('click', handleModalClose);

        // Vibrate device if supported
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 200, 200, 200, 200]);
        }
    }
}

// Initialize the timer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new EggTimer();
});
