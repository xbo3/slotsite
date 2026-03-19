-- AlterTable: User에 BiPays 연동 필드 추가
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bipays_member_id" INTEGER;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bipays_deposit_address" TEXT;

-- CreateIndex: DepositRequest tx_hash 인덱스
CREATE INDEX IF NOT EXISTS "DepositRequest_tx_hash_idx" ON "DepositRequest"("tx_hash");
