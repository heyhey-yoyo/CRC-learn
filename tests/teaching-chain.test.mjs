import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const app = readFileSync(resolve(root,"app.js"),"utf8");
const resources = JSON.parse(app.split(/\r?\n/).find(line=>line.startsWith("const resources = ")).slice(18).replace(/;$/, ""));
const html = readFileSync(resolve(root,"index.html"),"utf8");

test("全部 34 项资源、完整包和证据章入口同源一致", () => {
  assert.equal(Object.keys(resources).length,34);
  const bundle = Object.entries(resources).find(([key])=>key.startsWith("bundle/"))[1].text;
  const files = [...bundle.matchAll(/^## FILE: (.+)\n````[^\n]+\n([\s\S]*?)\n````$/gm)];
  assert.equal(files.length,33);
  for(const [,key,text] of files) assert.equal(text,resources[key].text,key);
  const ledger=resources["evidence/evidence_ledger.csv"].text;
  const anchors=[...ledger.matchAll(/#chapter-(\d+)/g)];
  assert.equal(anchors.length,7);
  for(const [,chapter] of anchors) assert.ok(html.includes(`id="chapter-${chapter}"`));
});

test("完整 R 链、全部冻结行、网页 PFS 与关键异常分支", {timeout:120000}, () => {
  const temp=mkdtempSync(resolve(tmpdir(),"crc-learn-semantic-"));
  try {
    for(const [key,value] of Object.entries(resources)) {
      if(key.startsWith("bundle/")) continue;
      const path=resolve(temp,key);assert.ok(path.startsWith(temp));
      mkdirSync(dirname(path),{recursive:true});writeFileSync(path,value.text,"utf8");
    }
    const pfs=html.match(/<code data-semantic-example="pfs">([\s\S]*?)<\/code>/);
    assert.ok(pfs,"网页 PFS 示例必须调用共享派生");
    writeFileSync(resolve(temp,"web-pfs.R"),pfs[1].replaceAll("&lt;","<").replaceAll("&gt;",">").replaceAll("&amp;","&"),"utf8");
    for (const key of ["simon-orr","simon-stage"]) {
      const snippet=html.match(new RegExp(`<code data-semantic-example="${key}">([\\s\\S]*?)<\\/code>`));
      assert.ok(snippet,key);
      writeFileSync(resolve(temp,`web-${key}.R`),snippet[1].replaceAll("&lt;","<").replaceAll("&gt;",">").replaceAll("&amp;","&"),"utf8");
    }
    const runner=String.raw`
if (.Platform$OS.type=="windows") Sys.setlocale("LC_ALL","English_United States.utf8")
for(file in sort(list.files("R",pattern="[.]R$",full.names=TRUE))) source(file,encoding="UTF-8")
stopifnot(nrow(read_output("ADSL_case_A.csv"))==180,nrow(read_output("ADSL_case_B.csv"))==51)
coverage <- read_output("QC_all_row_coverage.csv")
stopifnot(nrow(coverage)==10,sum(coverage$rows)==4035,all(coverage$invalid_date_cells==0),sum(coverage$orphan_rows)==1)
stopifnot(nrow(read_output("QC_cached_BOR_disagreement.csv"))==0)
source("web-pfs.R",encoding="UTF-8");write_utf8(a,"QC_web_PFS.csv")
stopifnot(identical(readLines(file.path(out_dir,"QC_web_PFS.csv")),readLines(file.path(out_dir,"ADTTE_case_A.csv"))))
stopifnot(sum(!is.na(a$PFS_days))==178)
stopifnot(identical(derive_tte(a,read_utf8("case_A_response.csv"))$PFS_days,a$PFS_days))
stopifnot(nrow(read_output("run_manifest.csv"))==33)
km_b <- read_output("T_KM12_case_B.csv")
stopifnot(nrow(km_b)==0,identical(names(km_b),c("time","n_risk","estimate","lower","upper")))
f <- read_output("T_ctDNA_analysis_funnel.csv");stopifnot(identical(as.integer(f$N),c(50L,47L,41L,26L,17L,12L)))
stopifnot(sum(read_output("AD_paired_tissue.csv")$PAIRED_SAMPLE_FL=="Y")==28)
stopifnot(!read_output("T_landmark_contrast_status.csv")$contrast_estimable)
dash <- read_output("T_safety_leadin_dashboard.csv")
stopifnot(dash$treated==12,dash$completed_two_cycle_window==11,dash$RLT_patients==3,dash$C3_on_time==7)
stopifnot(abs(dash$C3_rate-7/12)<1e-12,dash$C3_color=="red",all(read_output("T_leadin_RDI_by_component.csv")$RDI_color=="green"))
source("web-simon-orr.R");stopifnot(decision==read_output("T_case_B_ORR_Simon.csv")$decision)
for (fixture in list(c(15,10,"not_ready"),c(16,10,"stop_for_futility"),c(16,11,"continue_accrual"),c(46,33,"continue_accrual"),c(47,33,"does_not_cross_threshold"),c(47,34,"crosses_teaching_threshold"))) {
 n_evaluable <- as.integer(fixture[1]);confirmed_responses <- as.integer(fixture[2])
 source("web-simon-stage.R");stopifnot(decision==fixture[3],decision==simon_decision(n_evaluable,confirmed_responses))
}
stopifnot(identical(c3_on_time("2026-01-01",as.character(as.Date("2026-01-01")+c(-1,0,35,42,43,NA))),c(FALSE,TRUE,TRUE,TRUE,FALSE,FALSE)))
ex <- read_output("AD_EXPOSURE_case_B.csv")
stopifnot(ex$RDI[ex$patient_id=="B003" & ex$component=="irinotecan"]==.95,ex$RDI[ex$patient_id=="B006" & ex$component=="5FU"]==.75)
stopifnot(!read_output("QC_release_readiness.csv")$clean_data)
# Confirmation fixtures explicitly avoid trusting source flags.
person <- data.frame(patient_id="X",first_dose_date="2026-01-01",data_cutoff_date="2026-12-31",last_alive_date="2026-12-31",progression_date="",death_date="",surgery_date="",new_therapy_date="")
visits <- function(day,response,reader="BICR",new="N",adequate="Y") data.frame(patient_id="X",assessment_date=as.character(as.Date("2026-01-01")+day),reader=reader,response=response,new_lesion=new,adequate=adequate,confirmed="Y")
stopifnot(derive_response(person,visits(60,"PR"))$response_flag==0)
stopifnot(derive_response(person,visits(c(60,65),c("PR","PR")))$response_flag==0)
stopifnot(derive_response(person,visits(c(60,88),c("PR","PR")))$confirmed_BOR=="PR")
stopifnot(derive_response(person,visits(c(60,88),c("PR","CR")))$confirmed_BOR=="PR")
stopifnot(derive_response(person,visits(c(60,88,116),c("PR","CR","CR")))$confirmed_BOR=="CR")
stopifnot(derive_response(person,visits(c(60,75,88),c("PR","PD","PR")))$response_flag==0)
stopifnot(derive_response(person,visits(c(60,75,88),c("PR","SD","PR")))$response_flag==0)
stopifnot(derive_response(person,visits(c(60,88),c("PR","PR"),reader="INV"))$response_flag==0)
stopifnot(derive_response(person,visits(c(60,88),c("PR","PR"),new=c("N","Y")))$response_flag==0)
stopifnot(derive_response(person,visits(c(60,88),c("PR","PR"),adequate=c("Y","N")))$response_flag==0)
for(field in c("surgery_date","new_therapy_date","death_date","progression_date","last_alive_date","data_cutoff_date")) {
 p <- person;p[[field]] <- as.character(as.Date("2026-01-01")+80)
 stopifnot(derive_response(p,visits(c(60,88),c("PR","PR")))$response_flag==0)
}
p <- person;p$progression_date <- as.character(as.Date("2026-01-01")+120)
dr <- derive_response(p,visits(c(60,88,120),c("PR","PR","PD")));stopifnot(dr$DoR_days==60,dr$DoR_event==1)
p <- person;p$surgery_date <- as.character(as.Date("2026-01-01")+100)
dr <- derive_response(p,visits(c(60,88,120),c("PR","PR","PR")));stopifnot(dr$DoR_days==28,dr$DoR_event==0)
# Mutations occur only in this temporary package, never in the repository.
original_b <- read_utf8("case_B_patient.csv");original_s <- read_utf8("case_B_samples.csv")
put <- function(x,name) write.csv(x,file.path(data_dir,name),row.names=FALSE,fileEncoding="UTF-8")
original_c <- read_utf8("case_B_cycle.csv")
for (day in c(42,43)) {
 mut <- original_c;at <- mut$patient_id=="B001" & mut$cycle==3
 mut$actual_date[at] <- as.character(as.Date(original_b$first_dose_date[original_b$patient_id=="B001"])+day)
 put(mut,"case_B_cycle.csv");source("R/09_safety_and_exposure.R")
 stopifnot(read_output("L_safety_leadin_review.csv")$C3_on_time[1]==(day==42))
}
put(original_c,"case_B_cycle.csv");source("R/09_safety_and_exposure.R")
mut <- original_s;mut$sample_type[mut$sample_id=="B001-baseline-tissue"] <- "plasma";put(mut,"case_B_samples.csv")
source("R/04_analysis_sets.R");stopifnot(read_output("AD_paired_tissue.csv")$PAIRED_SAMPLE_FL[1]=="N")
mut <- rbind(original_s,transform(subset(original_s,sample_id=="B001-W8"),sample_id="B001-extra-W8"));put(mut,"case_B_samples.csv")
source("R/04_analysis_sets.R");stopifnot(read_output("AD_paired_tissue.csv")$PAIRED_SAMPLE_FL[1]=="N")
put(original_s,"case_B_samples.csv");source("R/04_analysis_sets.R")
mut <- original_b;mut$baseline_measurable[mut$patient_id=="B001"] <- "N";put(mut,"case_B_patient.csv")
source("R/04_analysis_sets.R");source("R/05_response_endpoints.R");source("R/08_case_B_simon_and_orr.R");source("R/11_tfl_generation.R")
stopifnot(read_output("T_03_ORR_case_B.csv")$denominator==46,read_output("T_case_B_ORR_Simon.csv")$denominator==46)
put(original_b,"case_B_patient.csv");source("R/04_analysis_sets.R");source("R/05_response_endpoints.R");source("R/08_case_B_simon_and_orr.R");source("R/11_tfl_generation.R")
mut <- original_b;mut$progression_date[mut$patient_id=="B001"] <- as.character(as.Date(mut$first_dose_date[mut$patient_id=="B001"])+56);put(mut,"case_B_patient.csv")
source("R/06_survival_endpoints.R");source("R/10_biomarker_landmark.R")
stopifnot(!read_output("AD_landmark_day56.csv")$landmark_eligible[1])
put(original_b,"case_B_patient.csv");source("R/06_survival_endpoints.R")
mut <- original_s;mut$qc_status[mut$sample_id=="B001-C2D1"] <- "FAIL";put(mut,"case_B_samples.csv")
source("R/10_biomarker_landmark.R");stopifnot(!read_output("AD_landmark_day56.csv")$dynamic_classified[1])
put(original_s,"case_B_samples.csv");source("R/10_biomarker_landmark.R")
bad <- read_output("AD_ctDNA_clearance.csv");bad$patient_id[1] <- "B016";write_utf8(bad,"AD_ctDNA_clearance.csv")
detected <- tryCatch({source("R/12_qc_checks.R");FALSE},error=function(e) TRUE)
stopifnot(detected)
source("R/10_biomarker_landmark.R");source("R/12_qc_checks.R")
cat("All source rows and semantic regressions passed.\n")
`;
    writeFileSync(resolve(temp,"run-tests.R"),runner,"utf8");
    const result=spawnSync(process.env.RSCRIPT || "Rscript",["--vanilla","run-tests.R"],{cwd:temp,encoding:"utf8",maxBuffer:8*1024*1024,timeout:100000});
    assert.equal(result.status,0,`${result.error || ""}\n${result.stdout}\n${result.stderr}`);
    assert.match(result.stdout,/All source rows and semantic regressions passed/);
  } finally {
    assert.ok(temp.startsWith(resolve(tmpdir(),"crc-learn-semantic-")));
    rmSync(temp,{recursive:true,force:true});
  }
});
