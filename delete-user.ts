import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteUser() {
  const email = 'myaji35@gmail.com';

  console.log(`🗑️  ${email} 계정 삭제 중...\n`);

  try {
    // 1. Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: true,
        sessions: true,
        bookings: true,
        partnerInfo: true,
        voyagersClub: true,
      },
    });

    if (!user) {
      console.log('❌ 사용자를 찾을 수 없습니다.');
      return;
    }

    console.log('✅ 사용자 발견:');
    console.log(`   - ID: ${user.id}`);
    console.log(`   - 이름: ${user.name}`);
    console.log(`   - 이메일: ${user.email}`);
    console.log(`   - 타입: ${user.userType}`);
    console.log(`   - OAuth 계정: ${user.accounts.length}개`);
    console.log(`   - 세션: ${user.sessions.length}개`);
    console.log(`   - 예약: ${user.bookings.length}개`);
    console.log(`   - 회원사 정보: ${user.partnerInfo ? '있음' : '없음'}`);
    console.log(`   - Voyagers Club: ${user.voyagersClub ? '있음' : '없음'}`);

    console.log('\n🗑️  관련 데이터 삭제 중...\n');

    // 2. Delete related data in transaction
    await prisma.$transaction(async (tx) => {
      // Delete OAuth accounts
      if (user.accounts.length > 0) {
        await tx.account.deleteMany({
          where: { userId: user.id },
        });
        console.log(`   ✅ OAuth 계정 ${user.accounts.length}개 삭제`);
      }

      // Delete sessions
      if (user.sessions.length > 0) {
        await tx.session.deleteMany({
          where: { userId: user.id },
        });
        console.log(`   ✅ 세션 ${user.sessions.length}개 삭제`);
      }

      // Delete passengers from bookings
      for (const booking of user.bookings) {
        const passengers = await tx.passenger.deleteMany({
          where: { bookingId: booking.id },
        });
        console.log(`   ✅ 예약 ${booking.id}의 승객 정보 삭제`);
      }

      // Delete bookings
      if (user.bookings.length > 0) {
        await tx.booking.deleteMany({
          where: { userId: user.id },
        });
        console.log(`   ✅ 예약 ${user.bookings.length}개 삭제`);
      }

      // Delete partner info
      if (user.partnerInfo) {
        await tx.partnerInfo.delete({
          where: { userId: user.id },
        });
        console.log(`   ✅ 회원사 정보 삭제`);
      }

      // Delete Voyagers Club
      if (user.voyagersClub) {
        await tx.voyagersClub.delete({
          where: { userId: user.id },
        });
        console.log(`   ✅ Voyagers Club 멤버십 삭제`);
      }

      // Delete user
      await tx.user.delete({
        where: { id: user.id },
      });
      console.log(`   ✅ 사용자 계정 삭제`);
    });

    console.log('\n🎉 삭제 완료!');
    console.log(`${email} 계정과 모든 관련 데이터가 삭제되었습니다.\n`);

  } catch (error) {
    console.error('❌ 삭제 중 오류 발생:', error);
    throw error;
  }
}

deleteUser()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
