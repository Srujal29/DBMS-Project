const Appointment = require('../models/Appointemnet');
const Billing = require('../models/Biling');
const MedicalRecord = require('../models/medicalReport');
const Patient = require('../models/Patient');
const User = require('../models/User');


exports.getPreventativeCareSuggestion = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        const patient = await Patient.findById(user.refId);

        if (!patient || !patient.dob) {
            return res.json({ recommendation: "Please complete your profile with a date of birth to receive personalized recommendations." });
        }

        // --- Step 1: Gather Patient Data ---
        const today = new Date();
        const birthDate = new Date(patient.dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        const medicalRecords = await MedicalRecord.find({ patient_id: user.refId });
        const pastDiagnoses = medicalRecords.map(record => record.diagnosis).join(', ') || 'No significant past diagnoses recorded.';

        // --- Step 2: Engineer Prompt for Gemini AI ---
        const prompt = `
            Act as a preventative care specialist providing a personalized health recommendation for a patient. Be encouraging, clear, and concise.

            **Patient Profile:**
            * **Age:** ${age}
            * **Gender:** ${patient.gender}
            * **Past Medical History Summary:** ${pastDiagnoses}

            **Your Task:**
            Based on the patient's profile, provide a short (2-3 sentences) and actionable preventative care recommendation. Focus on the single most important screening or lifestyle change for someone with this profile. Do not use markdown. Start the recommendation with a phrase like "Based on your profile, we recommend...".
        `;

        // --- Step 3: Call Gemini API ---
        const apiKey = process.env.GOOGLE_GEMINI_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not defined in the .env file.");
        }
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        
        const payload = { contents: [{ parts: [{ text: prompt }] }] };

        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!apiResponse.ok) {
            const errorBody = await apiResponse.json();
            throw new Error(`Gemini API request failed: ${errorBody.error.message}`);
        }

        const data = await apiResponse.json();
        const recommendation = data.candidates[0]?.content?.parts[0]?.text || `At age ${age}, a general annual check-up is always a good practice.`;

        res.json({ recommendation, age });

    } catch (err) {
        console.error("Preventative Care Error:", err.message);
        res.status(500).json({ message: 'Failed to generate preventative care suggestions' });
    }
};

exports.getDiagnosisSuggestion = async (req, res) => {
    const { symptoms } = req.body;

    if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length === 0) {
        return res.status(400).json({ message: 'A description of symptoms is required.' });
    }

    const prompt = `
        Act as a clinical AI assistant. Analyze the following patient symptoms and provide a summarized diagnostic suggestion in clean markdown.

        **Symptoms:** "${symptoms}"

        **Your Task:**
        1.  **Top Diagnoses:** List the top 2 likely diagnoses with a single sentence of reasoning for each.
        2.  **Key Recommendations:** List the 2 most critical next steps (tests or treatments) as a short bulleted list.
        3.  **Initial Treatment:** Suggest a basic treatment plan, including a common medication example.
        4.  **Probability:** Assign a single probability category (High, Moderate, Critical).

        **Output Format Example:**
        ### Top Diagnoses
        1.  **Condition A:** Brief reasoning for this diagnosis.
        2.  **Condition B:** Brief reasoning for this diagnosis.

        ### Key Recommendations
        * Order Test X immediately.
        * Consider starting Medication Y.
        
        ### Initial Treatment
        * **Medication:** Example: Amoxicillin 500mg, 3 times daily.
        * **Care:** Advise rest and hydration.

        ### Probability
        High
    `;

    try {
        const apiKey = process.env.GOOGLE_GEMINI_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not defined in the .env file.");
        }
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        const payload = { contents: [{ parts: [{ text: prompt }] }] };

        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!apiResponse.ok) {
            const errorBody = await apiResponse.json();
            throw new Error(`Gemini API request failed: ${errorBody.error.message}`);
        }

        const data = await apiResponse.json();
        const suggestion = data.candidates[0]?.content?.parts[0]?.text || "No suggestion was generated.";
        
        let probability = "AI-Generated";
        const probabilityMatch = suggestion.match(/### Probability\s*\n\s*(\w+)/i);
        if (probabilityMatch && probabilityMatch[1]) {
            probability = probabilityMatch[1];
        }

        res.json({ suggestion, probability });

    } catch (err) {
        console.error("AI Diagnosis Suggestion Error:", err.message);
        res.status(500).json({ 
            suggestion: "The AI Diagnosis service is currently unavailable.",
            probability: "Error"
        });
    }
};

/**
 * @desc    Calculates a risk score for a given patient based on their history
 * @route   GET /api/ai/patient-risk-score/:patientId
 * @access  Private/Doctor
 */
exports.getPatientRiskScore = async (req, res) => {
    try {
        const { patientId } = req.params;
        let riskScore = 0;
        let riskLevel = 'Low';
        let factors = [];

        // Factor 1: Number of appointments in the last year
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        const appointmentCount = await Appointment.countDocuments({
            patient_id: patientId,
            date: { $gte: oneYearAgo.toISOString().split('T')[0] }
        });

        if (appointmentCount > 5) {
            riskScore += 25;
            factors.push(`Frequent Visits (${appointmentCount} appointments in the last year).`);
        }

        // Factor 2: Presence of chronic-sounding diagnoses
        const chronicKeywords = ['chronic', 'diabetes', 'hypertension', 'arthritis', 'asthma'];
        const medicalRecords = await MedicalRecord.find({ patient_id: patientId });
        
        const hasChronicCondition = medicalRecords.some(record => 
            chronicKeywords.some(keyword => record.diagnosis.toLowerCase().includes(keyword))
        );

        if (hasChronicCondition) {
            riskScore += 40;
            factors.push("History includes indicators of a potential chronic condition.");
        }

        // Determine Risk Level
        if (riskScore > 60) {
            riskLevel = 'High';
        } else if (riskScore > 30) {
            riskLevel = 'Moderate';
        }

        let recommendation = "Patient presents a low risk profile based on available data. Standard follow-up is recommended.";
        if(riskLevel === 'High'){
            recommendation = "This patient has a high risk score. Proactive monitoring and a comprehensive care plan are highly recommended.";
        } else if (riskLevel === 'Moderate') {
            recommendation = "This patient has a moderate risk score. Recommend regular check-ins and adherence to treatment plans.";
        }

        res.json({
            riskScore,
            riskLevel,
            factors,
            recommendation
        });

    } catch (err) {
        console.error("Patient Risk Score Error:", err.message);
        res.status(500).json({ message: 'Failed to calculate patient risk score' });
    }
};



// --- Other AI Controller Functions ---
exports.getStaffingRecommendations = async (req, res) => {
  try {
    const busiestDayResult = await Appointment.aggregate([
      { $group: { _id: { $dayOfWeek: { $toDate: "$date" } }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    const busiestSpecializationResult = await Appointment.aggregate([
        { $lookup: { from: 'doctors', localField: 'doctor_id', foreignField: '_id', as: 'doctorInfo' } },
        { $unwind: '$doctorInfo' },
        { $group: { _id: '$doctorInfo.specialization', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 }
    ]);

    let recommendation = "No significant staffing trends detected.";

    if (busiestSpecializationResult.length > 0 && busiestSpecializationResult[0].count > 10) {
        const busyDept = busiestSpecializationResult[0]._id;
        recommendation = `The ${busyDept} department is experiencing high appointment volume. Consider allocating an additional administrative resource.`;
    } else if (busiestDayResult.length > 0 && busiestDayResult[0].count > 5) {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const busyDay = days[busiestDayResult[0]._id -1];
        recommendation = `${busyDay}s are consistently the busiest. Recommend reviewing staffing levels on this day.`;
    }

    res.json({ recommendation });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate staffing recommendations' });
  }
};

exports.getFinancialAnomalies = async (req, res) => {
    try {
        let anomalies = [];
        const avgBillResult = await Billing.aggregate([
            { $group: { _id: null, avgAmount: { $avg: "$amount" } } }
        ]);

        if (avgBillResult.length > 0) {
            const avgAmount = avgBillResult[0].avgAmount;
            const highThreshold = avgAmount * 2.5;

            const highBills = await Billing.find({ amount: { $gt: highThreshold } }).populate('patient_id', 'name').limit(5);
            
            if (highBills.length > 0 && highBills[0]?.patient_id) {
                anomalies.push({
                    type: 'High Invoice Alert',
                    severity: 'warning',
                    message: `Detected invoice(s) significantly higher than the average. Recommend reviewing for accuracy.`,
                    details: highBills.map(b => `Patient: ${b.patient_id.name}, Amount: $${b.amount.toFixed(2)}`)
                });
            }
        }
        
        if (anomalies.length === 0) {
            anomalies.push({
                type: 'System Normal',
                severity: 'success',
                message: 'No significant financial anomalies detected.',
                details: []
            });
        }
        res.json({ anomalies });
    } catch (err) {
        res.status(500).json({ message: 'Failed to detect financial anomalies' });
    }
};

