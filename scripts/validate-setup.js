#!/usr/bin/env node

/**
 * Development setup validation script
 * This script checks if all dependencies and configurations are properly set up
 */

const fs = require('fs')
const path = require('path')

const checkFile = (filePath, description) => {
  const exists = fs.existsSync(filePath)
  console.log(`${exists ? '✅' : '❌'} ${description}: ${filePath}`)
  return exists
}

const checkPackageJson = () => {
  const packagePath = path.join(process.cwd(), 'package.json')
  if (!fs.existsSync(packagePath)) {
    console.log('❌ package.json not found')
    return false
  }
  
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
  const requiredDeps = [
    'next',
    'react',
    'next-auth',
    '@prisma/client',
    'prisma',
    '@larksuiteoapi/node-sdk',
    'tailwindcss'
  ]
  
  const missing = requiredDeps.filter(dep => !pkg.dependencies[dep] && !pkg.devDependencies[dep])
  if (missing.length > 0) {
    console.log(`❌ Missing dependencies: ${missing.join(', ')}`)
    return false
  }
  
  console.log('✅ All required dependencies are installed')
  return true
}

const checkEnvFile = () => {
  const envPath = path.join(process.cwd(), '.env')
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found')
    return false
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8')
  const requiredVars = [
    'DATABASE_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'LARK_APP_ID',
    'LARK_APP_SECRET'
  ]
  
  const missing = requiredVars.filter(varName => !envContent.includes(varName))
  if (missing.length > 0) {
    console.log(`❌ Missing environment variables: ${missing.join(', ')}`)
    return false
  }
  
  console.log('✅ All required environment variables are present')
  return true
}

console.log('🔍 Validating Feather Leap development setup...\n')

const checks = [
  () => checkPackageJson(),
  () => checkEnvFile(),
  () => checkFile('src/app/page.tsx', 'Main page component'),
  () => checkFile('src/components/auth.tsx', 'Auth components'),
  () => checkFile('src/components/activity.tsx', 'Activity components'),
  () => checkFile('src/lib/auth.ts', 'NextAuth configuration'),
  () => checkFile('src/lib/db.ts', 'Database connection'),
  () => checkFile('prisma/schema.prisma', 'Prisma schema'),
  () => checkFile('tailwind.config.ts', 'Tailwind configuration'),
  () => checkFile('src/app/api/auth/[...nextauth]/route.ts', 'NextAuth API route'),
  () => checkFile('src/app/api/activities/route.ts', 'Activities API route'),
]

const results = checks.map(check => check())
const allPassed = results.every(result => result)

console.log('\n' + '='.repeat(50))

if (allPassed) {
  console.log('🎉 All checks passed! Your development environment is ready.')
  console.log('\nNext steps:')
  console.log('1. Configure your .env file with actual values')
  console.log('2. Set up your Supabase database')
  console.log('3. Run "npx prisma db push" to create database tables')
  console.log('4. Run "npm run dev" to start the development server')
} else {
  console.log('❌ Some checks failed. Please fix the issues above.')
  process.exit(1)
}
