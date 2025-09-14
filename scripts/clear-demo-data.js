#!/usr/bin/env node

/**
 * Clear demo data script
 * This script helps clear any remaining demo/dummy data from localStorage
 */

console.log('🧹 Clearing demo data...\n')

// Instructions for clearing demo data
console.log('To clear demo data from your browser:')
console.log('1. Open your browser\'s Developer Tools (F12)')
console.log('2. Go to the Application/Storage tab')
console.log('3. Find "Local Storage" in the left sidebar')
console.log('4. Click on your domain (localhost:3000 or localhost:3001)')
console.log('5. Delete these keys if they exist:')
console.log('   - processTickets')
console.log('   - currentPlan (if you want to start fresh)')
console.log('   - chatHistory (if you want to start fresh)')
console.log('6. Refresh the page')

console.log('\nAlternatively, you can run this in the browser console:')
console.log('localStorage.removeItem("processTickets")')
console.log('localStorage.removeItem("currentPlan")')
console.log('localStorage.removeItem("chatHistory")')

console.log('\n✅ Demo data cleanup instructions provided!')
console.log('\nAfter clearing the data:')
console.log('1. Go to the Plan section')
console.log('2. Generate new tickets with the AI')
console.log('3. Check the Processes section to see only AI-generated tickets')
