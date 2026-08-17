import fs from "fs";

const path = "src/controllers/Admin/serviceReport/reportDetail.controller.js";
let content = fs.readFileSync(path, "utf8");

const insert = `        if (await trySaveReportPdfOnly(req, res, serviceId, (id) => serviceReportModel.findOne({ serviceId: id }))) {
            return;
        }

`;

const fnNames = [
  "saveReportHeaderFixedRadioFluro",
  "saveReportHeaderForCBCT",
  "saveReportHeaderForOPG",
  "saveReportHeaderDentalIntra",
  "saveReportHeaderDentalHandHeld",
  "saveReportHeaderForRadiographyMobileHT",
  "saveReportHeaderForRadiographyPortable",
  "saveReportHeaderForRadiographyMobile",
  "saveReportHeaderCArm",
  "saveReportHeaderForInventionalRadiology",
  "saveReportHeaderForCTScan",
  "saveReportHeaderForMammography",
  "saveReportHeaderForOBI",
];

for (const fn of fnNames) {
  const marker = `export const ${fn} = async (req, res) => {`;
  const idx = content.indexOf(marker);
  if (idx === -1) {
    console.log("MISSING:", fn);
    continue;
  }
  const tryIdx = content.indexOf("    try {", idx);
  const reportLine = "        let report = await serviceReportModel.findOne({ serviceId });";
  const reportIdx = content.indexOf(reportLine, tryIdx);
  if (tryIdx === -1 || reportIdx === -1) {
    console.log("NO TRY/REPORT:", fn);
    continue;
  }
  const slice = content.slice(tryIdx, reportIdx + 200);
  if (slice.includes("trySaveReportPdfOnly")) {
    console.log("SKIP:", fn);
    continue;
  }
  content =
    content.slice(0, reportIdx) +
    insert +
    content.slice(reportIdx);
  console.log("PATCHED:", fn);
}

const genericMarker = "const saveReportHeader = async (req, res) => {";
const gIdx = content.indexOf(genericMarker);
if (gIdx !== -1) {
  const tryIdx = content.indexOf("    try {", gIdx);
  const reportLine = "        let report = await serviceReportModel.findOne({ serviceId });";
  const reportIdx = content.indexOf(reportLine, tryIdx);
  const slice = content.slice(tryIdx, reportIdx + 200);
  if (!slice.includes("trySaveReportPdfOnly")) {
    content =
      content.slice(0, reportIdx) +
      insert +
      content.slice(reportIdx);
    console.log("PATCHED: saveReportHeader");
  }
}

fs.writeFileSync(path, content);
