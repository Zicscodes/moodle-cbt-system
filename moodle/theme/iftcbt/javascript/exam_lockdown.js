/**
 * IFTCBT Exam Lockdown
 * Detects tab switching, minimizing, and visibility changes
 * Auto-submits exam and logs out student if violated
 */
(function() {
    'use strict';

    // Only run on quiz attempt pages
    if (document.querySelector('form#responseform') === null &&
        document.querySelector('.path-mod-quiz') === null) {
        return;
    }

    let warningCount = 0;
    const MAX_WARNINGS = 1;
    let lockdownActive = true;
    let overlayShown = false;

    // ============================================
    // CREATE WARNING OVERLAY
    // ============================================
    function createOverlay(message, isSubmitting) {
        if (overlayShown) return;
        overlayShown = true;

        const overlay = document.createElement('div');
        overlay.id = 'iftcbt-lockdown-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(0,0,0,0.85);
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        `;

        const box = document.createElement('div');
        box.style.cssText = `
            background: #fff;
            border-radius: 12px;
            padding: 32px 24px;
            max-width: 360px;
            width: 90%;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        `;

        const icon = isSubmitting ? '🚨' : '⚠️';
        const color = isSubmitting ? '#e8392a' : '#f5a623';

        box.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 16px;">${icon}</div>
            <h2 style="color: ${color}; font-size: 18px; margin-bottom: 12px;">
                ${isSubmitting ? 'Exam Terminated' : 'Warning!'}
            </h2>
            <p style="color: #333; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
                ${message}
            </p>
            ${!isSubmitting ? `
            <button id="iftcbt-return-btn" style="
                background: #1a3c6e;
                color: #fff;
                border: none;
                border-radius: 8px;
                padding: 12px 24px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                width: 100%;
            ">Return to Exam</button>
            ` : `
            <p style="color: #888; font-size: 12px;">You will be logged out shortly...</p>
            `}
        `;

        overlay.appendChild(box);
        document.body.appendChild(overlay);

        if (!isSubmitting) {
            document.getElementById('iftcbt-return-btn').addEventListener('click', function() {
                overlay.remove();
                overlayShown = false;
            });
        }
    }

    // ============================================
    // SUBMIT EXAM AND LOGOUT
    // ============================================
    function submitAndLogout() {
        lockdownActive = false;
        createOverlay(
            'You switched tabs or left the exam window. Your exam has been automatically submitted and you have been logged out.',
            true
        );

        setTimeout(function() {
            // Try to find and click the finish attempt button
            const finishBtn = document.querySelector('input[name="finishattempt"]') ||
                              document.querySelector('button[name="finishattempt"]') ||
                              document.querySelector('.mod_quiz-next-nav');

            if (finishBtn) {
                // Submit the form
                const form = document.querySelector('form#responseform') ||
                             document.querySelector('form.questionflagsaveform') ||
                             finishBtn.closest('form');
                if (form) {
                    // Add a hidden input to indicate forced submission
                    const hidden = document.createElement('input');
                    hidden.type = 'hidden';
                    hidden.name = 'finishattempt';
                    hidden.value = '1';
                    form.appendChild(hidden);
                    form.submit();
                }
            } else {
                // Fallback: navigate to finish URL
                const finishUrl = window.location.href.replace('attempt.php', 'summary.php');
                window.location.href = finishUrl;
            }
        }, 3000);

        // Logout after 8 seconds
        setTimeout(function() {
            fetch('/login/logout.php?sesskey=' + M.cfg.sesskey)
                .then(function() {
                    window.location.href = '/login/index.php';
                })
                .catch(function() {
                    window.location.href = '/login/index.php';
                });
        }, 8000);
    }

    // ============================================
    // WARN STUDENT
    // ============================================
    function warnStudent() {
        if (!lockdownActive) return;

        warningCount++;

        if (warningCount > MAX_WARNINGS) {
            submitAndLogout();
            return;
        }

        createOverlay(
            `⚠️ Warning ${warningCount} of ${MAX_WARNINGS}: You attempted to leave the exam window. ` +
            `If you do this again, your exam will be automatically submitted and you will be logged out.`,
            false
        );
    }

    // ============================================
    // DETECT TAB SWITCH / MINIMIZE
    // ============================================
    document.addEventListener('visibilitychange', function() {
        if (!lockdownActive) return;
        if (document.hidden) {
            warnStudent();
        }
    });

    // Detect window blur (switching apps on mobile)
    window.addEventListener('blur', function() {
        if (!lockdownActive) return;
        // Small delay to avoid false positives on page load
        setTimeout(function() {
            if (!document.hasFocus()) {
                warnStudent();
            }
        }, 200);
    });

    // ============================================
    // DISABLE RIGHT CLICK
    // ============================================
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });

    // ============================================
    // DISABLE KEYBOARD SHORTCUTS
    // ============================================
    document.addEventListener('keydown', function(e) {
        // Block Ctrl+Tab, Alt+Tab, Ctrl+W, F12, Ctrl+Shift+I
        if (
            (e.ctrlKey && e.key === 'Tab') ||
            (e.altKey && e.key === 'Tab') ||
            (e.ctrlKey && e.key === 'w') ||
            (e.ctrlKey && e.key === 'W') ||
            e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && e.key === 'I') ||
            (e.ctrlKey && e.shiftKey && e.key === 'J') ||
            (e.ctrlKey && e.key === 'u') ||
            (e.ctrlKey && e.key === 'U')
        ) {
            e.preventDefault();
            return false;
        }
    });

    // ============================================
    // SHOW ENTRY WARNING ON LOAD
    // ============================================
    window.addEventListener('load', function() {
        // Small banner at top to remind student
        const banner = document.createElement('div');
        banner.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #1a3c6e;
            color: #fff;
            text-align: center;
            padding: 8px;
            font-size: 12px;
            z-index: 9999;
            font-family: -apple-system, sans-serif;
        `;
        banner.textContent = '🔒 Secure Exam Mode — Do not switch tabs or leave this window';
        document.body.appendChild(banner);
    });

    // ============================================
// MOVE TIMER TO HEADER
// ============================================
function moveTimerToHeader() {
    const timerWrapper = document.getElementById('quiz-timer-wrapper');
    const timerRegion = document.getElementById('iftcbt-timer-region');
    
    if (timerWrapper && timerRegion) {
        timerRegion.appendChild(timerWrapper);
        timerWrapper.style.display = 'flex';
    }
}

// Try immediately and also after a delay for slow JS init
moveTimerToHeader();
setTimeout(moveTimerToHeader, 500);
setTimeout(moveTimerToHeader, 1500);
})();