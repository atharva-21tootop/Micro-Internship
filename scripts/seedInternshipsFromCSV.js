/**
 * FIXED: Firebase Admin SDK script to import internship data from CSV to Firestore
 * Previously broken: Used client SDK instead of Admin SDK
 * 
 * Setup Instructions:
 * 1. Download serviceAccountKey.json from Firebase Console → Project Settings → Service Accounts
 * 2. Place it in project root: ./serviceAccountKey.json
 * 3. Run: npm install firebase-admin csv-parser
 * 4. Run: node scripts/seedInternshipsFromCSV.js
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..');

// Initialize Firebase Admin SDK
const serviceAccountPath = path.join(PROJECT_ROOT, 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ ERROR: serviceAccountKey.json not found!');
  console.error(`Expected path: ${serviceAccountPath}`);
  console.error('\nSetup Instructions:');
  console.error('1. Go to Firebase Console → micro-internship-portal');
  console.error('2. Project Settings → Service Accounts → Generate New Private Key');
  console.error('3. Save as ./serviceAccountKey.json in project root');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Initialize Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// =============================================================================
// DATA TRANSFORMERS
// =============================================================================

function parseStipend(stipendStr) {
  if (!stipendStr || stipendStr === 'Not Available') return 'Not Available';
  return stipendStr.trim();
}

function parseDuration(durationStr) {
  if (!durationStr || durationStr === 'Not Available') return '3 months';
  return durationStr.trim().toLowerCase();
}

function parseSkills(skillsStr) {
  if (!skillsStr || skillsStr === 'Not Available' || skillsStr === 'Not Specified') {
    return [];
  }
  return skillsStr
    .split(',')
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 0)
    .slice(0, 10);
}

function parsePerks(perksStr) {
  if (!perksStr || perksStr === 'Not Available') return [];
  return perksStr
    .split(',')
    .map((perk) => perk.trim())
    .filter((perk) => perk.length > 0);
}

async function seedInternships() {
  try {
    console.log("📚 Starting internship data import from CSV...\n");

    // Read CSV file
    const csvFilePath = path.join(__dirname, "seed/data/internship-in-pune.csv");

    if (!fs.existsSync(csvFilePath)) {
      throw new Error(`CSV file not found at: ${csvFilePath}`);
    }

    const csvData = fs.readFileSync(csvFilePath, "utf8");

    // Parse CSV
    const parseResult = new Promise((resolve, reject) => {
      Papa.parse(csvData, {
        header: true,
        complete: resolve,
        error: reject,
        skipEmptyLines: true,
      });
    });

    const { data: rows } = await parseResult;

    // Initialize variables
    const startTime = Date.now();
    const BATCH_SIZE = 500;
    let currentBatch = db.batch();
    let batchDocCount = 0;
    const batches = [];
    const duplicateSet = new Set();

    let statsTotal = 0;
    let statsSuccess = 0;
    let statsError = 0;
    let statsInvalid = 0;
    let statsDuplicate = 0;

    for (let i = 0; i < Math.min(rows.length, 50); i++) {
      const row = rows[i];
      statsTotal++;

      // Skip rows with empty profile or company
      if (!row.profile || row.profile === "Nothing" || !row.company || row.company === "Nothing") {
        statsInvalid++;
        continue;
      }

      try {
        const title = row.profile.trim();
        const company = row.company.trim();
        const duplicateKey = `${title}|${company}`;

        // Check for duplicates
        if (duplicateSet.has(duplicateKey)) {
          statsDuplicate++;
          continue;
        }

        const internshipData = {
          // Basic Info
          title: title,
          company: company,
          location: row.Location || "Pune",
          type: "Internship",

          // Details
          stipend: parseStipend(row.Stipend),
          duration: parseDuration(row.Duration),
          startDate: (row["Start Date"] || "Immediately").trim(),
          applyByDate: (row["Apply by Date"] || "Not Available").trim(),

          // Content
          description: `${title} position at ${company}`,
          requirements: (row.Offer || row.Education || "Not specified").trim(),
          skills: parseSkills(row.Skills),
          perks: parsePerks(row.Perks),

          // Metadata
          orgId: 'default-org',
          approved: false, // Important: Set to false so admin can review
          status: 'active',
          views: 0,
          applicationsCount: 0,
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now(),
        };

        // Add to batch
        const docRef = db.collection('internships').doc();
        currentBatch.set(docRef, internshipData);
        batchDocCount++;
        duplicateSet.add(duplicateKey);

        // Commit batch if it reaches BATCH_SIZE
        if (batchDocCount === BATCH_SIZE) {
          batches.push(currentBatch);
          currentBatch = db.batch();
          batchDocCount = 0;
          console.log(
            `📦 Batch ready (${batches.length * BATCH_SIZE} docs prepared)`,
          );
        }

        statsSuccess++;
        if (statsSuccess % 10 === 0) {
          console.log(`✓ [${i + 1}] Prepared: ${title} - ${company}`);
        }
      } catch (error) {
        statsError++;
        console.error(`✗ [${i + 1}] ERROR: ${error.message}`);
      }
    }

    // Add remaining batch if not empty
    if (batchDocCount > 0) {
      batches.push(currentBatch);
    }

    // Commit all batches
    console.log(`\n📤 Uploading ${batches.length} batch(es) to Firestore...`);
    for (let i = 0; i < batches.length; i++) {
      await batches[i].commit();
      console.log(`   ✓ Batch ${i + 1}/${batches.length} committed`);
    }

    // Calculate stats
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n' + '═'.repeat(60));
    console.log('✅ IMPORT COMPLETE!');
    console.log('═'.repeat(60));
    console.log(`📊 Statistics:`);
    console.log(`   Total rows processed:    ${statsTotal}`);
    console.log(`   ✓ Successfully uploaded: ${statsSuccess}`);
    console.log(`   ⊘ Skipped (invalid):     ${statsInvalid}`);
    console.log(`   🔄 Duplicate (skipped):  ${statsDuplicate}`);
    console.log(`   ✗ Errors:                ${statsError}`);
    console.log(`\n⏱️  Time taken: ${duration}s`);
    console.log(`📅 Completed: ${new Date().toLocaleString()}`);

    console.log('\n' + '═'.repeat(60));
    console.log('📝 NEXT STEPS:');
    console.log('═'.repeat(60));
    console.log('1. Go to Firebase Console → Firestore Database');
    console.log('2. Check "internships" collection → verify documents');
    console.log('3. Note: All internships have approved=false');
    console.log('4. Create Admin Dashboard to approve internships');
    console.log('5. Students can then see approved internships in the app');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error.message);
    console.error('📋 Stack:', error.stack);
    process.exit(1);
  } finally {
    // Close Firebase connection
    await admin.app().delete();
  }
}

// =============================================================================
// RUN SEEDING
// =============================================================================

seedInternships().catch((error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});
