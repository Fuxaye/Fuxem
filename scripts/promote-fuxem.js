import prisma from './src/lib/prisma.js'

async function findAndPromoteFuxem() {
  try {
    // Search for user with username containing fuxem
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: 'fuxem',
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        username: true,
        role: true,
      },
    })

    if (users.length === 0) {
      console.log('❌ No user found with username containing "fuxem"')
      return
    }

    console.log(`Found ${users.length} user(s):`)
    users.forEach((u) => {
      console.log(`  - ${u.username} (ID: ${u.id}, Role: ${u.role})`)
    })

    // Promote each to ADMIN if not already
    for (const user of users) {
      if (user.role === 'ADMIN' || user.role === 'SUPREME_ADMIN') {
        console.log(`✅ ${user.username} is already admin (role: ${user.role})`)
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: 'ADMIN' },
        })
        console.log(`✅ Promoted ${user.username} to ADMIN`)
      }
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

findAndPromoteFuxem()
