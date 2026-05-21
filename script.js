        // DOM elements
        const metricDiv = document.getElementById('metric-fields');
        const imperialDiv = document.getElementById('imperial-fields');
        const unitBtns = document.querySelectorAll('.unit-btn');
        const calculateBtn = document.getElementById('calculateBtn');

        // Inputs Metric
        const heightCm = document.getElementById('height-cm');
        const weightKg = document.getElementById('weight-kg');

        // Imperial inputs
        const heightFt = document.getElementById('height-ft');
        const heightIn = document.getElementById('height-in');
        const weightLbs = document.getElementById('weight-lbs');

        // Result elements
        const bmiNumberSpan = document.getElementById('bmiNumber');
        const categoryTextSpan = document.getElementById('categoryText');
        const categoryMessageSpan = document.getElementById('categoryMessage');
        const errorMsgDiv = document.getElementById('errorMsg');
        const bmiPointer = document.getElementById('bmiPointer');

        let currentUnit = 'metric';  // 'metric' or 'imperial'

        // Helper: clear error
        function clearError() {
            errorMsgDiv.innerHTML = '';
        }

        function showError(text) {
            errorMsgDiv.innerHTML = `<div class="error-message"><i class="fas fa-circle-exclamation"></i> ${text}</div>`;
        }

        // get category details based on BMI value
        function getBMICategoryDetails(bmi) {
            if (isNaN(bmi) || bmi <= 0) return null;
            if (bmi < 18.5) {
                return { name: 'Underweight', icon: 'fas fa-feather-alt', message: 'May indicate nutritional deficit. Consider balanced nutrition.', color: '#3b8bb9' };
            } else if (bmi >= 18.5 && bmi <= 24.9) {
                return { name: 'Normal weight', icon: 'fas fa-smile', message: 'Excellent! Maintain healthy lifestyle and regular activity.', color: '#61b15a' };
            } else if (bmi >= 25 && bmi <= 29.9) {
                return { name: 'Overweight', icon: 'fas fa-chart-simple', message: 'Moderate risk. Focus on physical activity & balanced diet.', color: '#f4c542' };
            } else {
                return { name: 'Obese', icon: 'fas fa-exclamation-triangle', message: 'Higher health risks. Consult a healthcare provider for guidance.', color: '#c0392b' };
            }
        }

        // update BMI pointer position on scale (min 10, max 40)
        function updateBMIPointer(bmi) {
            if (!bmi || isNaN(bmi) || bmi <= 0) {
                bmiPointer.style.left = '0%';
                return;
            }
            let minBMI = 10;
            let maxBMI = 40;
            let clampedBMI = Math.min(maxBMI, Math.max(minBMI, bmi));
            let percent = ((clampedBMI - minBMI) / (maxBMI - minBMI)) * 100;
            bmiPointer.style.left = `${percent}%`;
        }

        // update result UI
        function displayBMIResult(bmi) {
            if (bmi === null || isNaN(bmi) || bmi <= 0) {
                bmiNumberSpan.innerText = '—';
                categoryTextSpan.innerHTML = '<i class="fas fa-chart-line"></i> <span>Invalid</span>';
                categoryMessageSpan.innerText = 'Please verify your height & weight values.';
                updateBMIPointer(null);
                return;
            }
            const rounded = bmi.toFixed(1);
            bmiNumberSpan.innerText = rounded;
            const category = getBMICategoryDetails(bmi);
            if (category) {
                categoryTextSpan.innerHTML = `<i class="${category.icon}"></i> <span>${category.name}</span>`;
                categoryMessageSpan.innerText = category.message;
            } else {
                categoryTextSpan.innerHTML = `<i class="fas fa-chart-line"></i> <span>—</span>`;
                categoryMessageSpan.innerText = 'Unexpected value';
            }
            updateBMIPointer(bmi);
        }

        // compute metric BMI (cm, kg)
        function computeMetricBMI() {
            let heightCmVal = parseFloat(heightCm.value);
            let weightKgVal = parseFloat(weightKg.value);
            if (isNaN(heightCmVal) || isNaN(weightKgVal)) {
                showError("Please enter valid numeric values for height and weight.");
                return null;
            }
            if (heightCmVal <= 0) {
                showError("Height must be greater than 0 cm.");
                return null;
            }
            if (weightKgVal <= 0) {
                showError("Weight must be greater than 0 kg.");
                return null;
            }
            let heightMeters = heightCmVal / 100;
            let bmi = weightKgVal / (heightMeters * heightMeters);
            if (bmi > 80 || bmi < 8) {
                showError("BMI value extreme — double-check your inputs (cm / kg).");
                return null;
            }
            clearError();
            return bmi;
        }

        // compute imperial BMI (ft, in, lbs)
        function computeImperialBMI() {
            let feet = parseFloat(heightFt.value);
            let inches = parseFloat(heightIn.value);
            let weightLbsVal = parseFloat(weightLbs.value);

            if (isNaN(feet) || isNaN(inches) || isNaN(weightLbsVal)) {
                showError("All fields (feet, inches, weight) must contain valid numbers.");
                return null;
            }
            if (feet < 0 || inches < 0) {
                showError("Height values cannot be negative.");
                return null;
            }
            if (inches > 11.5) {
                showError("Inches should be between 0 and 11.5 (max 11.9).");
                return null;
            }
            if (feet === 0 && inches === 0) {
                showError("Total height must be greater than zero.");
                return null;
            }
            if (weightLbsVal <= 0) {
                showError("Weight must be greater than 0 lbs.");
                return null;
            }

            let totalInches = (feet * 12) + inches;
            if (totalInches <= 0) {
                showError("Height must be > 0 inches.");
                return null;
            }
            let bmi = (weightLbsVal / (totalInches * totalInches)) * 703;
            if (bmi > 80 || bmi < 8) {
                showError("BMI unusual — verify feet/inches and weight (lbs) values.");
                return null;
            }
            clearError();
            return bmi;
        }

        // main calculate based on current unit
        function calculateBMI() {
            let bmi = null;
            if (currentUnit === 'metric') {
                bmi = computeMetricBMI();
            } else {
                bmi = computeImperialBMI();
            }
            if (bmi !== null && !isNaN(bmi) && bmi > 0) {
                displayBMIResult(bmi);
            } else if (bmi === null) {
                displayBMIResult(null);
            } else {
                displayBMIResult(null);
            }
        }

        // reset fields and result when toggling units (avoid confusion)
        function resetInputsByUnit(unit) {
            if (unit === 'metric') {
                // optional default placeholders but keep existing values if not empty? better keep user-friendly defaults
                if (heightCm.value === '' || parseFloat(heightCm.value) <= 0) heightCm.value = '170';
                if (weightKg.value === '' || parseFloat(weightKg.value) <= 0) weightKg.value = '70';
            } else {
                // imperial defaults sensible
                if (heightFt.value === '' || parseFloat(heightFt.value) < 0) heightFt.value = '5';
                if (heightIn.value === '' || parseFloat(heightIn.value) < 0) heightIn.value = '7';
                if (weightLbs.value === '' || parseFloat(weightLbs.value) <= 0) weightLbs.value = '155';
            }
        }

        // Switch UI between metric and imperial
        function setUnit(unit) {
            currentUnit = unit;
            if (unit === 'metric') {
                metricDiv.style.display = 'block';
                imperialDiv.style.display = 'none';
                resetInputsByUnit('metric');
            } else {
                metricDiv.style.display = 'none';
                imperialDiv.style.display = 'block';
                resetInputsByUnit('imperial');
            }
            // reset result panel & clear errors
            bmiNumberSpan.innerText = '—';
            categoryTextSpan.innerHTML = '<i class="fas fa-chart-line"></i> <span>Ready</span>';
            categoryMessageSpan.innerText = 'Select unit & enter values above';
            updateBMIPointer(null);
            clearError();
            // also clear error msg area but keep
            errorMsgDiv.innerHTML = '';
        }

        // toggle active style
        function toggleUnitActive(selectedUnit) {
            unitBtns.forEach(btn => {
                const unitVal = btn.getAttribute('data-unit');
                if (unitVal === selectedUnit) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }

        // event for unit toggle buttons
        unitBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const unit = btn.getAttribute('data-unit');
                if (unit === currentUnit) return;
                setUnit(unit);
                toggleUnitActive(unit);
            });
        });

        // Calculate click event
        calculateBtn.addEventListener('click', () => {
            calculateBMI();
        });

        // allow hitting Enter on any input field for convenience
        const allInputs = [...document.querySelectorAll('.input-field')];
        allInputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    calculateBMI();
                }
            });
        });

        // init defaults: metric active, prefill values, check defaults recalc optional? but show static
        setUnit('metric');
        toggleUnitActive('metric');
        // optional first demo - not auto calculate, but we can show nothing
        // however we can optionally provide a sample but not needed
        // ensuring pointer styles & initial bar look
        updateBMIPointer(null);
        // also if any invalid fields on load? we keep clean
        heightCm.value = '170';
        weightKg.value = '70';
        // to avoid errors, we keep default, but result panel shows "—" until calculate.
        // update: if needed to show default on load? but user-friendly to have placeholder. No auto compute.
        // extra: we also reset pointer style
