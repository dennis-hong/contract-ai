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
    Title: "의료 데이터 구매 계약서",
    Author: "Contract AI System",
  },
});

const outputPath = path.join(outputDir, "sample-contract.pdf");
const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

const fontCandidates = [
  "/Library/Fonts/Arial Unicode.ttf",
  "/System/Library/Fonts/Supplemental/AppleGothic.ttf",
  "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
];

let koreanFont = "Helvetica";
for (const fontPath of fontCandidates) {
  if (fs.existsSync(fontPath)) {
    doc.registerFont("Korean", fontPath);
    koreanFont = "Korean";
    console.log(`Using font: ${fontPath}`);
    break;
  }
}
if (koreanFont === "Helvetica") {
  console.warn("Warning: Korean font not found, using Helvetica fallback. Korean characters may not render.");
}

function addTitle(text) {
  doc.font(koreanFont).fontSize(18).text(text, { align: "center" });
  doc.moveDown(1.5);
}

function addSection(title) {
  doc.moveDown(0.5);
  doc
    .font(koreanFont)
    .fontSize(12)
    .text(title, { underline: true });
  doc.moveDown(0.5);
}

function addParagraph(text) {
  doc.font(koreanFont).fontSize(10).text(text, { lineGap: 4 });
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
doc.font(koreanFont).fontSize(10).fillColor("#888888").text("계약서 번호: MDA-2025-001", { align: "right" });
doc.moveDown(0.5);

addTitle("의료 데이터 구매 계약서");

addParagraph(
  "본 계약서는 의료 데이터의 구매 및 이용에 관한 사항을 규정하기 위하여 아래 당사자 간에 체결한다."
);

addLine();

// Article 1
addSection("제1조 (계약 당사자)");
addParagraph('"갑" (구매자):');
addParagraph("  회사명: (주)헬스케어데이터솔루션즈");
addParagraph("  대표자: 김민수");
addParagraph("  주소: 서울특별시 강남구 테헤란로 152, 강남파이낸스센터 22층");
addParagraph("  사업자등록번호: 110-86-12345");
doc.moveDown(0.3);
addParagraph('"을" (판매자):');
addParagraph("  회사명: (의)서울대학교병원 의료정보센터");
addParagraph("  대표자: 박지영");
addParagraph("  주소: 서울특별시 종로구 대학로 101, 의학연구관 5층");
addParagraph("  사업자등록번호: 201-82-67890");

addLine();

// Article 2
addSection("제2조 (계약의 목적)");
addParagraph(
  '본 계약은 "을"이 보유한 비식별화 의료 데이터를 "갑"에게 제공하고, "갑"은 이에 대한 대가를 지불하는 것을 목적으로 한다.'
);

addLine();

// Article 3
addSection("제3조 (데이터 범위)");
addParagraph(
  "1. 데이터 유형: 비식별화 진료기록(진단코드, 처방내역, 검사결과)"
);
addParagraph("2. 대상 기간: 2020년 1월 1일 ~ 2024년 12월 31일");
addParagraph("3. 대상 진료과: 내과, 외과, 정형외과, 신경과");
addParagraph("4. 데이터 건수: 총 150,000건");
addParagraph("5. 데이터 형식: CSV 및 JSON 형식 (표준 의료코드 적용)");

addLine();

// Article 4
addSection("제4조 (계약 금액 및 지급 조건)");
addParagraph("1. 총 계약 금액: 금 오억원정 (\\500,000,000)");
addParagraph("2. 지급 방법:");
addParagraph("   - 계약금: 1억원 (계약 체결 후 7일 이내)");
addParagraph("   - 중도금: 2억원 (데이터 1차 인도 시)");
addParagraph("   - 잔금: 2억원 (데이터 전체 인도 및 검수 완료 후 14일 이내)");

addLine();

// Article 5
addSection("제5조 (계약 기간)");
addParagraph("1. 계약 시작일: 2025년 3월 1일");
addParagraph("2. 계약 종료일: 2026년 2월 28일");
addParagraph(
  '3. 계약 기간은 양 당사자 합의 하에 연장할 수 있으며, 종료일 30일 전까지 서면으로 통보하여야 한다.'
);

addLine();

// Article 6
addSection("제6조 (데이터 보안)");
addParagraph("1. 보안 등급: 1등급 (최고 보안)");
addParagraph(
  '2. "갑"은 제공받은 데이터를 본 계약에 명시된 목적 이외의 용도로 사용할 수 없다.'
);
addParagraph(
  '3. "갑"은 데이터 보관 시 AES-256 이상의 암호화를 적용하여야 한다.'
);
addParagraph(
  '4. 데이터 접근 권한은 "갑"의 승인된 연구원에 한하며, 접근 로그를 6개월간 보관하여야 한다.'
);
addParagraph(
  "5. 개인정보 보호법 및 의료법 관련 규정을 준수하여야 한다."
);

doc.addPage();

// Article 7
addSection("제7조 (데이터 제공 및 인도)");
addParagraph(
  '1. "을"은 계약 체결 후 30일 이내에 1차 데이터(전체의 50%)를 인도한다.'
);
addParagraph("2. 나머지 50%는 1차 데이터 검수 완료 후 30일 이내에 인도한다.");
addParagraph(
  "3. 데이터 인도는 암호화된 전용 서버를 통해 이루어지며, 물리적 매체로의 전달은 불가하다."
);

addLine();

// Article 8
addSection("제8조 (지적재산권)");
addParagraph(
  '1. 원본 데이터의 소유권은 "을"에게 있으며, "갑"은 이용권만을 취득한다.'
);
addParagraph(
  '2. "갑"이 데이터를 활용하여 도출한 연구 결과물에 대한 지적재산권은 "갑"에게 귀속된다.'
);
addParagraph(
  '3. 단, 연구 결과물 공개 시 "을"의 데이터 제공 사실을 명시하여야 한다.'
);

addLine();

// Article 9
addSection("제9조 (손해배상)");
addParagraph(
  "1. 일방 당사자가 본 계약을 위반하여 상대방에게 손해를 발생시킨 경우, 그 손해를 배상하여야 한다."
);
addParagraph(
  "2. 데이터 유출 사고 발생 시, 귀책사유가 있는 당사자는 계약 금액의 300%에 해당하는 손해배상금을 지급한다."
);

addLine();

// Article 10
addSection("제10조 (계약 해지)");
addParagraph("다음 각 호에 해당하는 경우, 상대방에 대한 서면 통보로 본 계약을 해지할 수 있다:");
addParagraph("1. 상대방이 본 계약의 중요한 조항을 위반하고, 시정 요구 후 30일 이내에 시정하지 않은 경우");
addParagraph("2. 상대방이 파산, 회생절차 개시 등의 사유가 발생한 경우");
addParagraph('3. "을"이 데이터를 약정된 기한 내에 제공하지 못한 경우');

addLine();

// Special Terms
addSection("제11조 (특약사항)");
addParagraph(
  "1. 본 데이터는 인공지능(AI) 기반 질병 예측 모델 개발 목적으로만 사용 가능하다."
);
addParagraph(
  '2. "갑"은 데이터 활용 결과를 분기별로 "을"에게 보고하여야 한다.'
);
addParagraph(
  "3. 계약 종료 후 모든 데이터는 30일 이내에 완전히 삭제하여야 하며, 삭제 확인서를 제출한다."
);
addParagraph(
  '4. 본 계약과 관련된 분쟁은 서울중앙지방법원을 제1심 관할법원으로 한다.'
);
addParagraph(
  '5. "갑"은 데이터를 제3자에게 재판매, 양도, 대여할 수 없다.'
);

addLine();

// Signature section
doc.moveDown(1);
addParagraph(
  "위 계약 내용을 확인하고, 이에 동의하여 본 계약서 2부를 작성하고, 각각 서명 날인하여 1부씩 보관한다."
);

doc.moveDown(1);
doc.font(koreanFont).fontSize(11).text("2025년 2월 15일", { align: "center" });

doc.moveDown(2);

// Signature blocks
const leftX = 80;
const rightX = 340;
const sigY = doc.y;

doc.font(koreanFont).fontSize(10);
doc.text('"갑" (구매자)', leftX, sigY);
doc.text("(주)헬스케어데이터솔루션즈", leftX, sigY + 20);
doc.text("대표이사  김 민 수  (인)", leftX, sigY + 40);

doc.text('"을" (판매자)', rightX, sigY);
doc.text("(의)서울대학교병원 의료정보센터", rightX, sigY + 20);
doc.text("센터장  박 지 영  (인)", rightX, sigY + 40);

doc.end();

stream.on("finish", () => {
  console.log(`Sample contract PDF generated: ${outputPath}`);
});
