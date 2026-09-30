CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX "Paper_titleTh_trgm_idx"
  ON "Paper" USING GIN ("titleTh" gin_trgm_ops);

CREATE INDEX "Paper_titleEn_trgm_idx"
  ON "Paper" USING GIN ("titleEn" gin_trgm_ops);

CREATE INDEX "Paper_abstractTh_trgm_idx"
  ON "Paper" USING GIN ("abstractTh" gin_trgm_ops);

CREATE INDEX "Author_lastNameTh_trgm_idx"
  ON "Author" USING GIN ("lastNameTh" gin_trgm_ops);

CREATE INDEX "Advisor_lastNameTh_trgm_idx"
  ON "Advisor" USING GIN ("lastNameTh" gin_trgm_ops);
