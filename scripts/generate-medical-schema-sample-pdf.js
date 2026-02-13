const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const outputDir = path.join(__dirname, "..", "samples");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, "sample-medical-schema-contract.pdf");
const doc = new PDFDocument({ size: "A4", margin: 56 });
const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

function title(text) {
  doc.font("Helvetica-Bold").fontSize(18).text(text, { align: "center" });
  doc.moveDown(1);
}

function section(text) {
  doc.font("Helvetica-Bold").fontSize(12).text(text);
  doc.moveDown(0.4);
}

function line(text) {
  doc.font("Helvetica").fontSize(10).text(text, { lineGap: 2 });
}

function gap() {
  doc.moveDown(0.6);
}

title("Medical Data License Agreement (Schema Complete Sample)");
line("Contract Reference: MDA-SCHEMA-2026-001");
line("Contract Location: New York, NY, USA");
line("Created By: Legal Operations - HealthSight AI");
line("Version: 3");
gap();

section("1. Parties");
line("Buyer: HealthSight AI, Inc.");
line("Vendor: NorthBridge Medical Imaging Consortium");
gap();

section("2. Core Contract Metadata");
line("Display Name: NorthBridge Radiology Dataset License v3");
line("Name: 2026 NorthBridge Imaging Data License Agreement");
line("Status: in_review");
line("Acquisition Date: 2026-01-15");
line("Contract Expiration Date: 2028-01-14");
line("Auto Renewal Date: 2028-01-15");
line("License Type: perpetual");
line("License Expiration Date: 2031-01-14");
gap();

section("3. Geography and Storage");
line("Data Origin Countries: US, KR, JP");
line("Allowed Storage Countries: US, CA, UK");
line("Allowed Storage Method: cloud");
gap();

section("4. Usage and Modification Rights");
line("Allowed Usages: academic_analysis, internal_research, validation_only");
line("Allowed Data Modifications: copy, modify_dicom_tags, modify_format, modify_pixels");
line("May Auto Renew: true");
line("May Modify Data: true");
line("Must Destroy: false");
gap();

section("5. De-identification and PHI Controls");
line("PHI De-identification Method: hipaa_deidentification");
line("PHI De-identification HIPAA Method: expert_determination");
line("PHI De-identification Other Method: K-anonymity >= 15 for quasi-identifiers");
line("Must Notify On De-identification Failure: true");
line("Must Notify On De-identification Failure Within Days: 3");
gap();

section("6. Additional Information");
line("Additional Information: Data transfer limited to encrypted S3 buckets with customer-managed keys.");
line("Additional Information: Vendor requires quarterly audit logs and annual access-control attestation.");
gap();

section("7. Signature");
line("Effective Date: 2026-01-15");
line("HealthSight AI, Inc. / CEO / Signature on file");
line("NorthBridge Medical Imaging Consortium / Director / Signature on file");

doc.end();

stream.on("finish", () => {
  console.log(`Sample schema PDF generated: ${outputPath}`);
});
