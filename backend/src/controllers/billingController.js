const Billing = require("../models/Biling");
const Appointment = require("../models/Appointemnet");
const Insurance = require("../models/Insurance");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// 🔹 Generate invoice after appointment completion
exports.generateInvoice = async (req, res) => {
  try {
    const { amount } = req.body;
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    if (appointment.status !== "completed") {
      return res.status(400).json({ message: "Invoice can only be generated for completed appointments" });
    }

    const billing = new Billing({
      appointment_id: appointment._id,
      patient_id: appointment.patient_id,
      doctor_id: appointment.doctor_id,
      amount,
      status: "unpaid"
    });

    await billing.save();
    res.json({ message: "Invoice generated", billing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 🔹 Update payment status (paid/unpaid/insurance)
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const billing = await Billing.findById(id);
    if (!billing) return res.status(404).json({ message: "Billing record not found" });

    billing.status = status;
    await billing.save();

    res.json({ message: "Payment status updated", billing });
  } catch (err)
 {
    res.status(500).json({ error: err.message });
  }
};


// 🔹 Insurance verification before billing
exports.verifyInsurance = async (req, res) => {
  try {
    const { billingId, insuranceId } = req.body;

    const billing = await Billing.findById(billingId).populate("patient_id");
    if (!billing) return res.status(404).json({ message: "Billing record not found" });

    const insurance = await Insurance.findById(insuranceId);
    if (!insurance) return res.status(404).json({ message: "Insurance record not found" });

    if (insurance.patient_id.toString() !== billing.patient_id._id.toString()) {
      return res.status(403).json({ message: "Insurance does not belong to this patient" });
    }

    if (new Date(insurance.valid_till) < new Date()) {
      return res.status(400).json({ message: "Insurance expired" });
    }

    if (insurance.used_amount + billing.amount > insurance.coverage_limit) {
      return res.status(400).json({ message: "Coverage limit exceeded" });
    }
    
    insurance.used_amount += billing.amount;
    await insurance.save();

    billing.status = "insurance_pending";
    billing.insurance_id = insurance._id;
    await billing.save();

    res.json({ message: "Insurance verified and applied", billing, insurance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 🔹 Download invoice PDF
exports.downloadInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const billing = await Billing.findById(id)
      .populate("patient_id")
      .populate("doctor_id")
      .populate("appointment_id");

    if (!billing) return res.status(404).json({ message: "Invoice not found" });

    const doc = new PDFDocument();
    
    // Check if the 'invoices' directory exists, if not, create it.
    const invoicesDir = path.join(__dirname, '../invoices');
    if (!fs.existsSync(invoicesDir)){
        fs.mkdirSync(invoicesDir, { recursive: true });
    }
    const filePath = path.join(invoicesDir, `invoice_${billing._id}.pdf`);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=invoice_${billing._id}.pdf`);
    
    doc.pipe(fs.createWriteStream(filePath));
    doc.pipe(res);

    doc.fontSize(20).text("Medical Invoice", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text(`Invoice ID: ${billing._id}`);
    doc.text(`Patient: ${billing.patient_id.name}`);
    doc.text(`Doctor: ${billing.doctor_id.name}`);
    doc.text(`Appointment Date: ${new Date(billing.appointment_id.date).toLocaleDateString()}`);
    doc.text(`Amount: ₹${billing.amount}`);
    doc.text(`Status: ${billing.status}`);

    doc.end();

  } catch (err) {
    console.error("DOWNLOAD INVOICE ERROR:", err);
    res.status(500).json({ error: "Failed to download invoice." });
  }
};