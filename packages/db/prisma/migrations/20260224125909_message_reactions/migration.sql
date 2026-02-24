-- CreateTable
CREATE TABLE "MessageReactions" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,

    CONSTRAINT "MessageReactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MessageReactions_messageId_userId_key" ON "MessageReactions"("messageId", "userId");

-- AddForeignKey
ALTER TABLE "MessageReactions" ADD CONSTRAINT "MessageReactions_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageReactions" ADD CONSTRAINT "MessageReactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
