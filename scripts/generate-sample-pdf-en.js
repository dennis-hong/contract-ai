const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const outputDir = path.join(__dirname, "..", "samples");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const doc = new PDFDocument({
  size: "A4",
  margin: 60,
  info: {
    Title: "Medical Data Purchase Agreement",
    Author: "Contract AI System",
  },
});

const outputPath = path.join(outputDir, "sample-contract-en.pdf");
const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

function addTitle(text) {
  doc.font("Helvetica-Bold").fontSize(18).text(text, { align: "center" });
  doc.moveDown(1.5);
}

function addSection(title) {
  doc.moveDown(0.5);
  doc.font("Helvetica-Bold").fontSize(12).text(title, { underline: true });
  doc.moveDown(0.5);
}

function addParagraph(text) {
  doc.font("Helvetica").fontSize(10).text(text, { lineGap: 4 });
  doc.moveDown(0.3);
}

function addLine() {
  doc.moveDown(0.3);
  doc
    .strokeColor("#cccccc")
    .lineWidth(0.5)
    .moveTo(60, doc.y)
    .lineTo(535, doc.y)
    .stroke();
  doc.moveDown(0.3);
}

// Header
doc.font("Helvetica").fontSize(10).fillColor("#888888").text("Contract No: MDA-2026-EN-001", { align: "right" });
doc.moveDown(0.5);

addTitle("MEDICAL DATA PURCHASE AGREEMENT");

doc.font("Helvetica").fontSize(10).fillColor("#000000");
addParagraph(
  "This Medical Data Purchase Agreement (the \"Agreement\") is entered into as of March 1, 2026, by and between the parties identified herein, for the purpose of governing the purchase, delivery, and use of medical data as described below."
);

addLine();

// Article 1
addSection("ARTICLE 1 - PARTIES TO THE AGREEMENT");
addParagraph("Party A (Buyer/Purchaser):");
addParagraph("  Company Name: MedTech Solutions Inc.");
addParagraph("  Representative: Dr. James Richardson, Chief Executive Officer");
addParagraph("  Address: 1200 Healthcare Boulevard, Suite 500, Boston, MA 02115, USA");
addParagraph("  EIN: 04-3829156");
doc.moveDown(0.3);
addParagraph("Party B (Seller/Data Provider):");
addParagraph("  Company Name: National Health Data Institute");
addParagraph("  Representative: Dr. Sarah Mitchell, Director of Data Services");
addParagraph("  Address: 800 Research Parkway, Building C, Bethesda, MD 20892, USA");
addParagraph("  EIN: 52-1847293");

addLine();

// Article 2
addSection("ARTICLE 2 - PURPOSE OF AGREEMENT");
addParagraph(
  "The purpose of this Agreement is to establish the terms and conditions under which Party B shall provide de-identified medical imaging data to Party A, and Party A shall pay the agreed consideration for such data. The data shall be used exclusively for the development of artificial intelligence-based diagnostic tools."
);

addLine();

// Article 3
addSection("ARTICLE 3 - DATA SCOPE AND SPECIFICATIONS");
addParagraph("1. Data Type: De-identified medical imaging data including CT scans and MRI imaging data, with associated diagnostic metadata and clinical annotations.");
addParagraph("2. Coverage Period: January 1, 2018 through December 31, 2025");
addParagraph("3. Medical Specialties: Radiology, Neurology, Oncology, and Orthopedics");
addParagraph("4. Record Count: 500,000 records (five hundred thousand individual imaging studies)");
addParagraph("5. Data Format: DICOM standard format with anonymized FHIR-compliant metadata in JSON");

addLine();

// Article 4
addSection("ARTICLE 4 - CONTRACT AMOUNT AND PAYMENT TERMS");
addParagraph("1. Total Contract Amount: USD 2,500,000 (Two Million Five Hundred Thousand US Dollars)");
addParagraph("2. Payment Schedule:");
addParagraph("   a) Initial Payment: USD 500,000 upon execution of this Agreement (within 10 business days)");
addParagraph("   b) Milestone Payment: USD 1,000,000 upon delivery and acceptance of the first data tranche (50%)");
addParagraph("   c) Final Payment: USD 1,000,000 upon complete delivery and quality verification (within 30 days)");

addLine();

// Article 5
addSection("ARTICLE 5 - CONTRACT TERM");
addParagraph("1. Start Date: March 1, 2026");
addParagraph("2. End Date: February 28, 2027");
addParagraph(
  "3. This Agreement may be renewed by mutual written consent of both parties, provided that written notice of intent to renew is given no less than sixty (60) days prior to the expiration date."
);

addLine();

// Article 6
addSection("ARTICLE 6 - DATA SECURITY AND COMPLIANCE");
addParagraph("1. Security Level: HIPAA Compliant - Level 3 (Enhanced Security Controls)");
addParagraph(
  "2. Party A shall implement and maintain security measures consistent with the HIPAA Security Rule, including but not limited to access controls, audit logging, encryption, and physical safeguards."
);
addParagraph(
  "3. All data at rest shall be encrypted using AES-256 encryption or equivalent, and all data in transit shall utilize TLS 1.3 or higher."
);
addParagraph(
  "4. Access to the data shall be restricted to authorized personnel of Party A who have completed HIPAA compliance training, and all access shall be logged and retained for a minimum of three (3) years."
);
addParagraph(
  "5. Both parties shall comply with all applicable federal and state regulations, including HIPAA, HITECH Act, and any applicable state privacy laws."
);

doc.addPage();

// Article 7
addSection("ARTICLE 7 - DATA DELIVERY");
addParagraph(
  "1. Party B shall deliver the first tranche of data (approximately 250,000 records) within forty-five (45) days of the execution of this Agreement."
);
addParagraph(
  "2. The remaining data shall be delivered within thirty (30) days following Party A's written acceptance of the first tranche."
);
addParagraph(
  "3. All data delivery shall occur through Party B's encrypted secure data transfer platform. No data shall be transmitted via physical media or unencrypted channels."
);

addLine();

// Article 8
addSection("ARTICLE 8 - INTELLECTUAL PROPERTY RIGHTS");
addParagraph(
  "1. Ownership of the underlying source data shall remain with Party B. Party A acquires only a non-exclusive, non-transferable license to use the data for the purposes specified in this Agreement."
);
addParagraph(
  "2. Any models, algorithms, research findings, or derivative works created by Party A using the data shall be the exclusive intellectual property of Party A."
);
addParagraph(
  "3. Party A shall acknowledge Party B's data contribution in any published research or regulatory submissions derived from the data."
);

addLine();

// Article 9
addSection("ARTICLE 9 - LIABILITY AND INDEMNIFICATION");
addParagraph(
  "1. Each party shall be liable for any damages caused to the other party resulting from a breach of this Agreement."
);
addParagraph(
  "2. In the event of a data breach attributable to a party's negligence, the responsible party shall pay liquidated damages equal to 300% of the total contract amount, in addition to any actual damages incurred."
);

addLine();

// Article 10
addSection("ARTICLE 10 - TERMINATION");
addParagraph("Either party may terminate this Agreement by written notice under the following circumstances:");
addParagraph("1. Material breach of any provision of this Agreement that remains uncured for thirty (30) days after written notice;");
addParagraph("2. Bankruptcy, insolvency, or appointment of a receiver for the other party;");
addParagraph("3. Failure by Party B to deliver the data within the agreed timelines.");

addLine();

// Special Terms
addSection("ARTICLE 11 - SPECIAL TERMS AND CONDITIONS");
addParagraph(
  "1. The data licensed hereunder shall be used exclusively for the development of AI-based medical diagnostic and predictive analytics tools."
);
addParagraph(
  "2. Party A shall provide quarterly utilization reports to Party B, detailing data usage, research progress, and compliance status."
);
addParagraph(
  "3. Upon termination or expiration of this Agreement, Party A shall permanently delete all data within thirty (30) days and provide a certified destruction certificate to Party B."
);
addParagraph(
  "4. Any disputes arising from or relating to this Agreement shall be resolved through binding arbitration administered by the American Arbitration Association, with proceedings held in Boston, Massachusetts."
);
addParagraph(
  "5. Party A shall not sublicense, resell, transfer, or lease the data to any third party without the prior written consent of Party B."
);

addLine();

// Signature section
doc.moveDown(1);
addParagraph(
  "IN WITNESS WHEREOF, the parties hereto have executed this Agreement as of the date first written above. This Agreement is executed in duplicate, with each party retaining one original copy."
);

doc.moveDown(1);
doc.font("Helvetica-Bold").fontSize(11).text("Effective Date: March 1, 2026", { align: "center" });

doc.moveDown(2);

// Signature blocks
const leftX = 80;
const rightX = 340;
const sigY = doc.y;

doc.font("Helvetica").fontSize(10);
doc.text("PARTY A (Buyer)", leftX, sigY);
doc.text("MedTech Solutions Inc.", leftX, sigY + 20);
doc.text("Dr. James Richardson, CEO", leftX, sigY + 40);
doc.text("_________________________", leftX, sigY + 55);
doc.text("Signature", leftX, sigY + 70);

doc.text("PARTY B (Seller)", rightX, sigY);
doc.text("National Health Data Institute", rightX, sigY + 20);
doc.text("Dr. Sarah Mitchell, Director", rightX, sigY + 40);
doc.text("_________________________", rightX, sigY + 55);
doc.text("Signature", rightX, sigY + 70);

doc.end();

stream.on("finish", () => {
  console.log(`English sample contract PDF generated: ${outputPath}`);
});
