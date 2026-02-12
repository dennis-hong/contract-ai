# Contract AI - 의료 데이터 계약서 자동 분석 시스템

AI 기반 의료 데이터 구매 계약서 자동 파싱 및 데이터 추출 시스템입니다.

PDF 계약서를 업로드하면 AI가 자동으로 주요 계약 정보를 추출하여 구조화된 폼에 채워줍니다.

## 주요 기능

- **PDF 업로드**: 드래그 앤 드롭 / 클릭으로 계약서 PDF 업로드
- **AI 자동 파싱**: OpenAI GPT를 활용한 계약서 주요 정보 자동 추출
- **PDF 미리보기**: 업로드된 PDF를 좌측 패널에서 바로 확인
- **구조화된 폼**: 추출된 데이터를 우측 폼에서 검토 및 수정
- **계약서 관리**: 저장된 계약서 목록 조회 및 관리
- **상태 추적**: 파싱 중 → 검토 대기 → 저장 완료

## 추출 필드

| 필드 | 설명 |
|------|------|
| 계약명 | 계약서 제목 |
| 갑 (구매자) | 회사명, 대표자, 주소, 사업자등록번호 |
| 을 (판매자) | 회사명, 대표자, 주소, 사업자등록번호 |
| 데이터 범위 | 데이터 유형, 기간, 대상 등 |
| 데이터 건수 | 총 데이터 건수 |
| 계약 금액 | 총 계약 금액 |
| 계약 기간 | 시작일 / 종료일 |
| 보안 등급 | 데이터 보안 등급 |
| 특약사항 | 주요 특약 내용 |

## 기술 스택

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Backend**: Next.js API Routes
- **Database**: SQLite (Prisma ORM) — 로컬, PostgreSQL 지원 (Railway 배포 시)
- **AI**: OpenAI GPT API (gpt-4o-mini)
- **PDF 처리**: pdf-parse (텍스트 추출), pdfkit (샘플 PDF 생성)

## 시작하기

### 사전 요구사항

- Node.js 20+
- OpenAI API 키 (선택사항 — 없으면 regex 기반 fallback 추출 사용)

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일에서 OPENAI_API_KEY 설정 (선택사항)

# 데이터베이스 마이그레이션
npx prisma migrate dev

# 개발 서버 실행
npm run dev
```

http://localhost:3000 에서 앱을 확인할 수 있습니다.

### 샘플 PDF 생성

```bash
npm run generate-pdf
```

`samples/sample-contract.pdf`에 한국어 의료 데이터 구매 계약서 샘플이 생성됩니다.

## API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/contracts/upload` | PDF 업로드 및 파싱 시작 |
| GET | `/api/contracts` | 계약서 목록 조회 |
| GET | `/api/contracts/[id]` | 계약서 상세 조회 |
| PUT | `/api/contracts/[id]` | 계약서 수정/저장 |
| POST | `/api/contracts/[id]/parse` | 계약서 재파싱 |
| GET | `/api/contracts/[id]/file` | 업로드된 PDF 파일 서빙 |

## 프로젝트 구조

```
contract-ai/
├── prisma/
│   ├── schema.prisma          # DB 스키마
│   └── migrations/            # 마이그레이션 파일
├── samples/
│   └── sample-contract.pdf    # 샘플 계약서 PDF
├── scripts/
│   └── generate-sample-pdf.js # 샘플 PDF 생성 스크립트
├── src/
│   ├── app/
│   │   ├── page.tsx           # 업로드 + 파싱 페이지
│   │   ├── contracts/
│   │   │   └── page.tsx       # 계약서 목록 페이지
│   │   ├── api/contracts/     # API 라우트
│   │   └── layout.tsx         # 레이아웃
│   ├── components/
│   │   ├── ContractForm.tsx   # 계약 정보 폼
│   │   ├── PDFUploader.tsx    # PDF 업로드 컴포넌트
│   │   ├── PDFViewer.tsx      # PDF 미리보기
│   │   └── StatusBadge.tsx    # 상태 뱃지
│   ├── lib/
│   │   ├── db.ts              # Prisma 클라이언트
│   │   ├── pdf-parser.ts      # PDF 텍스트 추출
│   │   └── ai-extractor.ts   # AI 기반 데이터 추출
│   └── types/
│       └── index.ts           # TypeScript 타입
├── uploads/                   # 업로드된 PDF (gitignored)
├── Dockerfile                 # Docker 빌드
├── railway.json               # Railway 배포 설정
└── .env.example               # 환경 변수 템플릿
```

## 배포 (Railway)

Railway에서 바로 배포할 수 있습니다:

1. Railway에서 새 프로젝트 생성
2. GitHub 저장소 연결
3. 환경 변수 설정:
   - `DATABASE_URL`: PostgreSQL 연결 문자열 (Railway에서 자동 제공)
   - `OPENAI_API_KEY`: OpenAI API 키
4. Prisma 스키마의 provider를 `postgresql`로 변경하거나 Railway에서 SQLite 볼륨 사용

## 라이선스

MIT
