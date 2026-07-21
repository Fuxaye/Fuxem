CREATE TABLE "ChatRoomMessage" (
  "id" TEXT NOT NULL,
  "roomId" TEXT NOT NULL,
  "senderId" TEXT NOT NULL,
  "senderName" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ChatRoomMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ChatRoomMessage_roomId_createdAt_idx" ON "ChatRoomMessage"("roomId", "createdAt");
CREATE INDEX "ChatRoomMessage_senderId_idx" ON "ChatRoomMessage"("senderId");

ALTER TABLE "ChatRoomMessage"
  ADD CONSTRAINT "ChatRoomMessage_roomId_fkey"
  FOREIGN KEY ("roomId") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
