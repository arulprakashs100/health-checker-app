// ====== DOM Elements ======
const homeSection = document.getElementById('homeSection');
const formSection = document.getElementById('formSection');
const loadingSection = document.getElementById('loadingSection');
const resultsSection = document.getElementById('resultsSection');

const startBtn = document.getElementById('startBtn');
const backBtn = document.getElementById('backBtn');
const resetBtn = document.getElementById('resetBtn');
const darkModeBtn = document.getElementById('darkModeBtn');
const symptomForm = document.getElementById('symptomForm');

const validationMsg = document.getElementById('validationMsg');
const validationText = document.getElementById('validationText');

// Form inputs
const nameInput = document.getElementById('name');
const ageInput = document.getElementById('age');
const checkboxes = document.querySelectorAll('input[name="symptom"]');

// Result elements
const patientNameDisplay = document.getElementById('patientNameDisplay');
const patientAgeDisplay = document.getElementById('patientAgeDisplay');
const severityLabel = document.getElementById('severityLabel');
const severityFill = document.getElementById('severityFill');
const possibleIllness = document.getElementById('possibleIllness');
const symptomsExplanation = document.getElementById('symptomsExplanation');
const basicSuggestions = document.getElementById('basicSuggestions');
const medicineGrid = document.getElementById('medicineGrid');

// ====== Initialization ======
document.addEventListener('DOMContentLoaded', () => {
    // 1. Dark mode init
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.replace('light-mode', 'dark-mode');
        darkModeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
    
    // 2. Load stored user data
    if (localStorage.getItem('patientName')) nameInput.value = localStorage.getItem('patientName');
    if (localStorage.getItem('patientAge')) ageInput.value = JSON.parse(localStorage.getItem('patientAge'));
});

// ====== Event Listeners ======
darkModeBtn.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark-mode');
    if (isDark) {
        document.body.classList.replace('dark-mode', 'light-mode');
        darkModeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.replace('light-mode', 'dark-mode');
        darkModeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        localStorage.setItem('theme', 'dark');
    }
});

startBtn.addEventListener('click', () => {
    homeSection.classList.add('hidden');
    formSection.classList.remove('hidden');
});

backBtn.addEventListener('click', () => {
    resultsSection.classList.add('hidden');
    formSection.classList.remove('hidden');
    
    // Reset severity bar to trigger animation again next time
    setTimeout(() => { severityFill.style.width = '0%'; }, 500);
});

resetBtn.addEventListener('click', () => {
    symptomForm.reset();
    validationMsg.classList.add('hidden');
});

symptomForm.addEventListener('submit', (e) => {
    e.preventDefault();
    validationMsg.classList.add('hidden');

    const name = nameInput.value.trim();
    const age = parseInt(ageInput.value);
    
    const checked = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);

    // UX Validation
    if (!name || isNaN(age) || age < 1 || age > 120) {
        showValidation("Please enter a valid Name and Age.");
        return;
    }
    if (checked.length === 0) {
        showValidation("Select at least one symptom to continue.");
        return;
    }

    // Save to LocalStorage
    localStorage.setItem('patientName', name);
    localStorage.setItem('patientAge', age);

    // Transition via Loading Screen
    formSection.classList.add('hidden');
    loadingSection.classList.remove('hidden');

    // Simulate analysis delay
    setTimeout(() => {
        analyzeHealth(name, age, checked);
        loadingSection.classList.add('hidden');
        resultsSection.classList.remove('hidden');
    }, 1500);
});

function showValidation(msg) {
    validationText.textContent = msg;
    validationMsg.classList.remove('hidden');
    // scroll slightly up
    formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ====== Core Logic ======
function analyzeHealth(name, age, symptoms) {
    // Bind Patient Info
    patientNameDisplay.textContent = name;
    patientAgeDisplay.textContent = age;

    let score = 0;
    
    // Symptom weighting
    const weights = {
        'fever': 2, 'cold': 1, 'cough': 1, 'headache': 1.5,
        'sorethroat': 1.5, 'bodypain': 2, 'vomiting': 3
    };
    
    symptoms.forEach(sym => { if (weights[sym]) score += weights[sym]; });

    // Symptom lookups
    const hasfever = symptoms.includes('fever');
    const hascold = symptoms.includes('cold');
    const hascough = symptoms.includes('cough');
    const hasheadache = symptoms.includes('headache');
    const hassorethroat = symptoms.includes('sorethroat');
    const hasbodypain = symptoms.includes('bodypain');
    const hasvomiting = symptoms.includes('vomiting');

    let illness = "General Viral Infection";
    let explanation = "Combination of reported symptoms points towards a general malaise or mild infection.";
    let suggestions = ["Rest immediately", "Drink 2L of fluids daily", "Monitor temperature"];

    // Complex Combinations Logic
    if (hasvomiting && hasfever && hasbodypain) {
        illness = "Possible Severe Infection / Food Poisoning";
        explanation = "Vomiting paired with fever and body aches can indicate a significant viral or bacterial illness.";
        suggestions = ["Avoid solid foods temporarily", "Take Oral Rehydration Salts (ORS)", "Seek medical assistance if vomiting persists >24h"];
    } 
    else if (hasfever && hascough && hassorethroat && hasbodypain) {
        illness = "Influenza (Flu) / COVID-19 Suspect";
        explanation = "Classic upper respiratory tract symptoms combined with systemic signs denoting a strong viral infection.";
        suggestions = ["Isolate to protect others", "Perform warm saline gargles", "Drink warm broths and soups"];
    }
    else if (hascold && hascough && hassorethroat && !hasfever) {
        illness = "Common Cold & Pharyngitis";
        explanation = "Without fever, sore throat and rhinorrhea are typical of a common cold running its course.";
        suggestions = ["Rest your voice", "Drink warm lemon-honey water", "Use steam inhalation"];
    }
    else if (hasheadache && hasvomiting && !hasfever) {
        illness = "Migraine with Nausea";
        explanation = "Headaches that trigger nausea or vomiting are often migraines triggered by environmental factors or stress.";
        suggestions = ["Rest in a strictly dark, quiet room", "Apply ice pack to neck/head", "Stay hydrated"];
    }
    else if (hasbodypain && !hasfever && !hascough) {
        illness = "Fatigue / Muscle Tension";
        explanation = "Isolated body pain is usually due to physical exertion, poor posture, or stress.";
        suggestions = ["Gentle stretching", "Warm bath", "Ensure 8 hours of sleep"];
    }

    // Severity Logic
    let sevText = "Mild";
    let sevColor = "var(--sev-mild)";
    let sevPercent = 33;

    if (score >= 5 || hasvomiting) {
        sevText = "High";
        sevColor = "var(--sev-high)";
        sevPercent = 100;
        suggestions.unshift("🚨 IMMEDIATELY CONSULT A DOCTOR"); // Prepended urgency
    } else if (score >= 3) {
        sevText = "Moderate";
        sevColor = "var(--sev-mod)";
        sevPercent = 66;
    }

    // Populate Results
    severityLabel.textContent = sevText;
    severityLabel.style.color = sevColor;
    
    // Trigger animation slightly delayed so CSS transitions
    setTimeout(() => {
        severityFill.style.width = sevPercent + "%";
        severityFill.style.backgroundColor = sevColor;
    }, 100);

    possibleIllness.textContent = illness;
    symptomsExplanation.textContent = explanation;
    
    basicSuggestions.innerHTML = '';
    suggestions.forEach(s => {
        const li = document.createElement('li');
        li.innerHTML = s;
        basicSuggestions.appendChild(li);
    });

    // Medicines Logic w/ Vector gradients instead of broken images
    const medicines = [];

    if (hasfever || hasheadache || hasbodypain) {
        if (age < 18) {
            medicines.push({ name: 'Paracetamol 500mg', desc: 'Mild pain/fever relief', icon: 'fa-capsules' });
        } else {
            medicines.push({ name: 'Paracetamol 650mg & Ibuprofen', desc: 'Strong relief for adults', icon: 'fa-pills' });
        }
    }
    if (hascough || hassorethroat) {
        if (age < 12) {
            medicines.push({ name: 'Herbal Honey Syrup', desc: 'Safe for kids (1 tsp)', icon: 'fa-bottle-droplet' });
        } else {
            medicines.push({ name: 'Dextromethorphan Syrup', desc: 'Cough suppressant (10 ml)', icon: 'fa-prescription-bottle-medical' });
        }
    }
    if (hascold) {
        medicines.push({ name: 'Saline Decongestant', desc: '2 drops per nostril', icon: 'fa-eye-dropper' });
    }
    if (hasvomiting) {
        medicines.push({ name: 'Ondansetron / ORS', desc: 'Anti-nausea & Hydration powder', icon: 'fa-spoon' });
    }
    if (medicines.length === 0) {
        medicines.push({ name: 'Multivitamin Complex', desc: 'Daily immunity boost', icon: 'fa-tablet-button' });
    }

    medicineGrid.innerHTML = '';
    medicines.forEach(med => {
        medicineGrid.insertAdjacentHTML('beforeend', `
            <div class="med-item">
                <div class="icon-container medicine-gradient">
                    <i class="fa-solid ${med.icon}"></i>
                </div>
                <div class="med-details">
                    <h4>${med.name}</h4>
                    <p>${med.desc}</p>
                </div>
            </div>
        `);
    });
}
