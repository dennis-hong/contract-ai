const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const outputDir = path.join(__dirname, "..", "samples");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, "sample-medical-schema-contract.pdf");
const doc = new PDFDocument({ size: "A4", margin: 60 });
const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

const GRAY = "#555555";
const BLACK = "#000000";

function pageTitle(text) {
  doc.font("Helvetica-Bold").fontSize(16).fillColor(BLACK).text(text, { align: "center" });
  doc.moveDown(0.3);
}

function subtitle(text) {
  doc.font("Helvetica").fontSize(10).fillColor(GRAY).text(text, { align: "center" });
  doc.moveDown(0.8);
}

function section(num, text) {
  doc.moveDown(0.5);
  doc.font("Helvetica-Bold").fontSize(12).fillColor(BLACK).text(`ARTICLE ${num}. ${text.toUpperCase()}`);
  doc.moveTo(60, doc.y).lineTo(535, doc.y).strokeColor("#cccccc").lineWidth(0.5).stroke();
  doc.moveDown(0.4);
}

function subsection(num, text) {
  doc.font("Helvetica-Bold").fontSize(10).fillColor(BLACK).text(`${num} ${text}`);
  doc.moveDown(0.2);
}

function body(text) {
  doc.font("Helvetica").fontSize(9.5).fillColor("#333333").text(text, { lineGap: 3, align: "justify" });
  doc.moveDown(0.3);
}

function definition(term, desc) {
  doc.font("Helvetica-Bold").fontSize(9.5).fillColor(BLACK).text(`"${term}"`, { continued: true });
  doc.font("Helvetica").fillColor("#333333").text(` means ${desc}`, { lineGap: 3 });
  doc.moveDown(0.15);
}

function field(label, value) {
  doc.font("Helvetica-Bold").fontSize(9.5).fillColor("#555555").text(`${label}: `, { continued: true });
  doc.font("Helvetica").fillColor(BLACK).text(value);
  doc.moveDown(0.1);
}

function gap() { doc.moveDown(0.4); }

// ===================== PAGE 1 =====================

pageTitle("MEDICAL DATA LICENSE AND PURCHASE AGREEMENT");
subtitle("Contract Reference No. MDA-2026-NB-001  |  Version 3  |  Confidential");

doc.moveTo(60, doc.y).lineTo(535, doc.y).strokeColor("#999999").lineWidth(1).stroke();
doc.moveDown(0.5);

body(
  "This Medical Data License and Purchase Agreement (the \"Agreement\") is entered into as of January 15, 2026 (the \"Effective Date\"), by and between the following parties:"
);

gap();

subsection("", "PARTIES TO THIS AGREEMENT");
body(
  "Party A (Licensee/Buyer): HealthSight AI, Inc., a Delaware corporation with principal offices at 350 Fifth Avenue, Suite 4200, New York, NY 10118, United States (\"Licensee\")."
);
body(
  "Party B (Licensor/Vendor): NorthBridge Medical Imaging Consortium, a nonprofit medical research consortium organized under the laws of Massachusetts, with principal offices at 75 Francis Street, Boston, MA 02115, United States (\"Vendor\" or \"NorthBridge\")."
);

body(
  "WHEREAS, Vendor possesses certain proprietary medical imaging datasets derived from multi-institutional clinical sources; and WHEREAS, Licensee desires to obtain a license to use such datasets for artificial intelligence research and product development purposes; NOW, THEREFORE, in consideration of the mutual covenants and agreements hereinafter set forth and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the parties agree as follows:"
);

// ===================== ARTICLE 1 =====================
section(1, "Definitions and Interpretation");

definition("Acquisition Date", "the date on which Licensee takes constructive possession of the Licensed Data, being January 15, 2026.");
definition("Licensed Data", "the collection of de-identified medical imaging data, including DICOM files, associated metadata, and clinical annotations as described in Schedule A.");
definition("PHI", "Protected Health Information as defined under the Health Insurance Portability and Accountability Act of 1996 (HIPAA), 45 C.F.R. § 160.103.");
definition("De-identification", "the process of removing or transforming PHI such that the data no longer identifies or provides a reasonable basis to identify an individual, in accordance with 45 C.F.R. § 164.514.");
definition("Territory", "the jurisdictions in which Licensee is authorized to store and process the Licensed Data, specifically: the United States of America, Canada, and the United Kingdom.");
definition("Data Origin Countries", "the jurisdictions from which the underlying patient data was originally collected, being: the United States, the Republic of Korea, and Japan.");

// ===================== ARTICLE 2 =====================
section(2, "Contract Metadata and Administration");

field("Display Name", "NorthBridge Radiology Dataset License v3");
field("Internal Reference Name", "2026 NorthBridge Imaging Data License Agreement");
field("Contract Status", "In Review");
field("Contract Location", "New York, NY, USA");
field("Created By", "Legal Operations — HealthSight AI");

// ===================== ARTICLE 3 =====================
section(3, "License Grant and Usage Rights");

subsection("3.1", "License Type and Duration");
body(
  "Vendor hereby grants to Licensee a perpetual, non-exclusive, non-transferable license to use the Licensed Data subject to the terms and conditions of this Agreement. The license shall not expire; however, certain contractual obligations shall remain in effect until January 14, 2028 (the \"Contract Expiration Date\"), unless this Agreement is renewed in accordance with Section 3.2."
);

field("License Type", "Perpetual");
field("License Expiration Date", "January 14, 2031");
field("Contract Expiration Date", "January 14, 2028");

subsection("3.2", "Automatic Renewal");
body(
  "This Agreement may be automatically renewed for successive one (1) year periods commencing on January 15, 2028 (the \"Auto Renewal Date\"), unless either party provides written notice of non-renewal at least ninety (90) days prior to the expiration of the then-current term."
);
field("May Auto Renew", "Yes");
field("Auto Renewal Date", "January 15, 2028");

subsection("3.3", "Permitted Uses");
body(
  "Licensee shall use the Licensed Data solely for the following purposes (collectively, the \"Permitted Uses\"):"
);
body("  (a) Academic analysis and publication of research findings in peer-reviewed journals;");
body("  (b) Internal research and development of machine learning algorithms for diagnostic imaging;");
body("  (c) Validation of AI/ML model performance against clinical benchmarks.");
body(
  "For the avoidance of doubt, Licensee shall NOT use the Licensed Data for direct commercial product development without obtaining a separate Commercial Use Addendum from Vendor."
);

field("Allowed Usages", "Academic Analysis, Internal Research, Validation Only");

// ===================== ARTICLE 4 =====================
section(4, "Data Handling, Modification, and Destruction");

subsection("4.1", "Modification Rights");
body(
  "Licensee is authorized to modify the Licensed Data in the following ways: (i) creating copies for backup and redundancy purposes; (ii) modifying DICOM header tags to conform with Licensee's internal data management standards; (iii) converting file formats (e.g., DICOM to NIfTI or PNG) for processing pipeline compatibility; (iv) applying pixel-level transformations including resizing, cropping, windowing, and augmentation for model training."
);
field("May Modify Data", "Yes");
field("Allowed Data Modifications", "Copy, Modify DICOM Tags, Modify Format, Modify Pixels");

subsection("4.2", "Data Destruction");
body(
  "Licensee shall NOT be required to destroy the Licensed Data upon expiration of this Agreement, given the perpetual nature of the license grant. However, Licensee shall destroy all copies of the Licensed Data within thirty (30) days if this Agreement is terminated for cause pursuant to Article 9."
);
field("Must Destroy After Use", "No");

// ===================== ARTICLE 5 =====================
section(5, "Storage and Geographic Restrictions");

subsection("5.1", "Storage Method");
body(
  "Licensee shall store the Licensed Data exclusively on encrypted cloud infrastructure (AWS, Azure, or GCP) using AES-256 encryption at rest and TLS 1.3 encryption in transit. On-premise storage is not permitted without prior written consent from Vendor."
);
field("Allowed Storage Method", "Cloud");

subsection("5.2", "Geographic Restrictions");
body(
  "The Licensed Data shall be stored only within data centers physically located in the following jurisdictions: the United States, Canada, and the United Kingdom. Cross-border transfers to any other jurisdiction require prior written authorization from Vendor."
);
field("Allowed Storage Countries", "US, CA, UK");
field("Data Origin Countries", "US, KR, JP");

// ===================== ARTICLE 6 =====================

doc.addPage();

section(6, "PHI De-Identification and Privacy Controls");

subsection("6.1", "De-Identification Standard");
body(
  "All Licensed Data provided under this Agreement has been de-identified by Vendor in accordance with the HIPAA Privacy Rule, specifically using the Expert Determination method as set forth in 45 C.F.R. § 164.514(b)(1). An independent qualified statistical expert has certified that the risk of re-identification is very small, with k-anonymity ≥ 15 applied to all quasi-identifiers."
);
field("PHI De-identification Method", "HIPAA De-identification");
field("HIPAA De-identification Method", "Expert Determination");
field("Other De-identification Notes", "K-anonymity >= 15 for quasi-identifiers");

subsection("6.2", "Re-Identification Prohibition");
body(
  "Licensee shall not, directly or indirectly, attempt to re-identify any individual whose data is included in the Licensed Data. Any suspected breach of de-identification (whether accidental or otherwise) must be reported to Vendor's Privacy Officer within the timeframe specified below."
);

subsection("6.3", "Notification of De-Identification Failure");
body(
  "In the event that Licensee discovers or reasonably suspects that any portion of the Licensed Data contains residual PHI or that de-identification has failed for any reason, Licensee shall:"
);
body("  (a) Immediately cease processing the affected data;");
body("  (b) Notify Vendor's Privacy Officer in writing within three (3) business days of discovery;");
body("  (c) Cooperate with Vendor in conducting a root-cause analysis and remediation.");
field("Must Notify on De-identification Failure", "Yes");
field("Notification Deadline", "3 business days");

// ===================== ARTICLE 7 =====================
section(7, "Compensation and Payment Terms");

body(
  "Licensee shall pay Vendor a one-time license fee of Three Hundred Fifty Thousand United States Dollars (USD $350,000.00), payable within thirty (30) days of the Effective Date. Annual maintenance and support fees of Twenty-Five Thousand United States Dollars (USD $25,000.00) shall be due on each anniversary of the Effective Date."
);

// ===================== ARTICLE 8 =====================
section(8, "Confidentiality");

body(
  "Each party shall maintain in strict confidence all Confidential Information received from the other party. \"Confidential Information\" includes, without limitation, the Licensed Data, pricing terms, technical specifications, and any information marked as confidential. This obligation shall survive termination of this Agreement for a period of five (5) years."
);

// ===================== ARTICLE 9 =====================
section(9, "Termination");

body(
  "Either party may terminate this Agreement for cause upon sixty (60) days' written notice if the other party materially breaches any term hereof and fails to cure such breach within the notice period. Upon termination for cause, all licenses granted hereunder shall immediately terminate, and Licensee shall destroy all copies of the Licensed Data in accordance with Section 4.2."
);

// ===================== ARTICLE 10 =====================
section(10, "Additional Information and Miscellaneous");

body(
  "Data transfer shall be limited to encrypted Amazon S3 buckets configured with customer-managed encryption keys (SSE-KMS). Vendor requires quarterly audit logs documenting all access to the Licensed Data, including user identity, timestamp, and operation type. Licensee shall provide an annual access-control attestation report to Vendor's compliance department."
);
body(
  "This Agreement constitutes the entire agreement between the parties with respect to the subject matter hereof and supersedes all prior negotiations, representations, warranties, commitments, offers, contracts, and agreements, whether written or oral."
);
field("Additional Information", "Encrypted S3 transfer; quarterly audit logs; annual access-control attestation required.");

gap();
gap();

// ===================== SIGNATURES =====================
doc.moveTo(60, doc.y).lineTo(535, doc.y).strokeColor("#999999").lineWidth(1).stroke();
doc.moveDown(0.8);

doc.font("Helvetica-Bold").fontSize(11).fillColor(BLACK).text("IN WITNESS WHEREOF", { align: "center" });
doc.moveDown(0.3);
body("The parties hereto have executed this Agreement as of the Effective Date first written above.");
doc.moveDown(0.8);

// Left signature
const sigY = doc.y;
doc.font("Helvetica-Bold").fontSize(9).text("FOR AND ON BEHALF OF LICENSEE:", 60);
doc.moveDown(1.2);
doc.moveTo(60, doc.y).lineTo(260, doc.y).strokeColor(BLACK).lineWidth(0.5).stroke();
doc.moveDown(0.2);
doc.font("Helvetica").fontSize(8).text("Name: Dr. Sarah Chen", 60);
doc.text("Title: Chief Executive Officer", 60);
doc.text("Entity: HealthSight AI, Inc.", 60);
doc.text("Date: January 15, 2026", 60);

// Right signature
doc.y = sigY;
doc.font("Helvetica-Bold").fontSize(9).text("FOR AND ON BEHALF OF VENDOR:", 310);
doc.moveDown(1.2);
doc.moveTo(310, doc.y).lineTo(535, doc.y).strokeColor(BLACK).lineWidth(0.5).stroke();
doc.moveDown(0.2);
doc.font("Helvetica").fontSize(8).text("Name: Prof. James R. Mitchell, MD, PhD", 310);
doc.text("Title: Executive Director", 310);
doc.text("Entity: NorthBridge Medical Imaging Consortium", 310);
doc.text("Date: January 15, 2026", 310);

doc.end();

stream.on("finish", () => {
  console.log(`Sample schema PDF generated: ${outputPath}`);
});
