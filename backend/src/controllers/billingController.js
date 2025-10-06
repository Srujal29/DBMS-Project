const Billing = require("../models/Biling");
const Appointment = require("../models/Appointemnet");
const Insurance = require("../models/Insurance"); // 1. Make sure Insurance model is imported
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

/**
 * @desc    Doctor generates an invoice for a completed appointment
 */
exports.generateInvoice = async (req, res) => {
  try {
    const { amount } = req.body;
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    if (appointment.status !== "completed") {
      return res.status(400).json({ message: "Invoice can only be generated for completed appointments" });
    }
    
    const existingBill = await Billing.findOne({ appointment_id: appointmentId });
    if(existingBill) {
        return res.status(400).json({ message: "An invoice for this appointment already exists." });
    }

    const billing = new Billing({
      appointment_id: appointment._id,
      patient_id: appointment.patient_id,
      doctor_id: appointment.doctor_id,
      amount,
      status: "unpaid"
    });

    await billing.save();
    res.json({ message: "Invoice generated successfully", billing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/**
 * @desc    Patient or Admin updates the payment status of a bill (e.g., to 'paid')
 */
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params; 

    const billing = await Billing.findById(id);
    if (!billing) return res.status(404).json({ message: "Billing record not found" });

    billing.status = status;
    await billing.save();

    res.json({ message: "Payment status updated successfully", billing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @desc    Doctor/Admin verifies a patient's insurance against a bill
 * @route   POST /api/billing/verify-insurance
 * @access  Private/Doctor, Private/Admin
 */
// 2. ADDED THE MISSING FUNCTION
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


/**
 * @desc    Allows a user to download a professional PDF of an invoice
 */
exports.downloadInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const billing = await Billing.findById(id)
      .populate("patient_id")
      .populate("doctor_id")
      .populate("appointment_id");

    if (!billing) return res.status(404).json({ message: "Invoice not found" });

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=invoice_${billing._id}.pdf`);
    doc.pipe(res);

    const generateHeader = () => {
      doc
        .fillColor("#003D3D")
        .fontSize(20)
        .font('Helvetica-Bold')
        .text("MediTrack Pro", 50, 57)
        .fontSize(10)
        .font('Helvetica')
        .text("123 Health St, Wellness City, 12345", 200, 65, { align: "right" })
        .text("contact@meditrack.pro", 200, 80, { align: "right" })
        .moveDown();
    };

    const generateCustomerInformation = () => {
        doc.fillColor("#444444").fontSize(20).text("Invoice", 50, 160);
        generateHr(185);
        const customerInformationTop = 200;

        doc.fontSize(10)
            .text("Invoice Number:", 50, customerInformationTop)
            .font("Helvetica-Bold").text(billing._id.toString().substring(0, 12), 150, customerInformationTop)
            .font("Helvetica").text("Invoice Date:", 50, customerInformationTop + 15)
            .text(new Date(billing.createdAt).toLocaleDateString(), 150, customerInformationTop + 15)
            .text("Appointment Date:", 50, customerInformationTop + 30)
            .text(new Date(billing.appointment_id.date).toLocaleDateString(), 150, customerInformationTop + 30)
            
            .font("Helvetica-Bold").text(billing.patient_id.name, 300, customerInformationTop)
            .font("Helvetica").text(billing.patient_id.address || "N/A", 300, customerInformationTop + 15)
            .moveDown();
        generateHr(252);
    };
    
    const generateInvoiceTable = () => {
        const invoiceTableTop = 330;
        doc.font("Helvetica-Bold");
        generateTableRow(invoiceTableTop, "Service", "Description", "Unit Cost", "Quantity", "Total");
        generateHr(invoiceTableTop + 20);
        doc.font("Helvetica");

        const position = invoiceTableTop + 30;
        generateTableRow(
            position,
            "Doctor Consultation",
            `Consultation with Dr. ${billing.doctor_id.name} (${billing.doctor_id.specialization})`,
            `$${billing.amount.toFixed(2)}`,
            "1",
            `$${billing.amount.toFixed(2)}`
        );
        generateHr(position + 20);

        const subtotalPosition = position + 30;
        generateTableRow(subtotalPosition, "", "", "Subtotal", "", `$${billing.amount.toFixed(2)}`);
        
        const paidToDatePosition = subtotalPosition + 20;
        generateTableRow(paidToDatePosition, "", "", "Paid To Date", "", "$0.00");
        
        const duePosition = paidToDatePosition + 25;
        doc.font("Helvetica-Bold");
        generateTableRow(duePosition, "", "", "Balance Due", "", `$${billing.amount.toFixed(2)}`);
        doc.font("Helvetica");
    };

    const generateFooter = () => {
        doc.fontSize(10).text("Payment is due within 30 days. Thank you for your business.", 50, 780, { align: "center", width: 500 });
    };

    const generateTableRow = (y, item, description, unitCost, quantity, lineTotal) => {
        doc.fontSize(10)
            .text(item, 50, y)
            .text(description, 150, y)
            .text(unitCost, 280, y, { width: 90, align: "right" })
            .text(quantity, 370, y, { width: 90, align: "right" })
            .text(lineTotal, 0, y, { align: "right" });
    };
    
    const generateHr = (y) => {
        doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
    };

    generateHeader();
    generateCustomerInformation();
    generateInvoiceTable();
    generateFooter();

    doc.end();

  } catch (err) {
    console.error("DOWNLOAD INVOICE ERROR:", err);
    res.status(500).json({ error: "Failed to download invoice." });
  }
};

