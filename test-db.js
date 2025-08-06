const { PrismaClient } = require('@prisma/client')

async function testConnection() {
  const prisma = new PrismaClient()
  
  try {
    console.log('Testing database connection...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Test query
    const searchConfigs = await prisma.searchConfig.findMany()
    console.log(`✅ Found ${searchConfigs.length} search configurations`)
    
    // Test jobs
    const jobs = await prisma.job.findMany()
    console.log(`✅ Found ${jobs.length} jobs`)
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    console.error('Full error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
