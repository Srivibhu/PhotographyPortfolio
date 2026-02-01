const fs = require('fs');
const path = require('path');

// Collection image counts and formats
const collectionImages: Record<string, { count: number; formats: string[] }> = {
  'bali': { 
    count: 16,
    formats: ['jpeg', 'jpg']  // Bali has images in both formats
  },
  'morocco': { 
    count: 21,  // Updated count based on actual files
    formats: ['webp']
  },
  'tokyo': { 
    count: 20,  // Updated count based on actual files
    formats: ['jpg']
  },
  'new-zealand': { 
    count: 18,
    formats: ['jpg']
  },
  'iceland': { 
    count: 14,
    formats: ['jpg']
  },
  'urban-portraits': { 
    count: 16,
    formats: ['jpg']
  },
  'europe': {
    count: 20,
    formats: ['jpg', 'jpeg']
  },
  'events': {
    count: 15,
    formats: ['jpg', 'jpeg']
  }
}

// Collection format mapping for cover images
const collectionFormats: Record<string, string> = {
  'bali': 'jpeg',
  'morocco': 'webp',
  'tokyo': 'jpg',
  'new-zealand': 'jpg',
  'iceland': 'jpg',
  'urban-portraits': 'jpg',
  'europe': 'jpg',
  'events': 'jpg'
}

// Collection folder name mapping (for case sensitivity)
const collectionFolders: Record<string, string> = {
  'bali': 'Bali',
  'morocco': 'Morocco',
  'tokyo': 'Tokyo',
  'new-zealand': 'new zealand',
  'iceland': 'Iceland',
  'urban-portraits': 'Urban Portraits',
  'europe': 'Europe',
  'events': 'Events'
}

interface ValidationResult {
  hasErrors: boolean
  hasWarnings: boolean
  totalImages: number
  validatedImages: number
  errors: string[]
  warnings: string[]
}

function validateImages(dryRun: boolean = false): ValidationResult {
  const useCloudinary =
    process.env.USE_CLOUDINARY === "1" || Boolean(process.env.CLOUDINARY_CLOUD_NAME)
  if (useCloudinary) {
    console.log("Cloudinary mode enabled. Skipping local image validation.")
    return {
      hasErrors: false,
      hasWarnings: false,
      totalImages: 0,
      validatedImages: 0,
      errors: [],
      warnings: []
    }
  }

  const publicDir = path.join(process.cwd(), 'public')
  const result: ValidationResult = {
    hasErrors: false,
    hasWarnings: false,
    totalImages: 0,
    validatedImages: 0,
    errors: [],
    warnings: []
  }

  console.log('🔍 Starting image validation...')
  if (dryRun) {
    console.log('⚠️  Running in dry-run mode - will not fail the build\n')
  }

  // Check each collection
  Object.entries(collectionImages).forEach(([slug, info]) => {
    const folderName = collectionFolders[slug]
    console.log(`\n📁 Checking collection: ${folderName}`)
    
    const collectionDir = path.join(publicDir, folderName)
    
    // Check if collection directory exists
    if (!fs.existsSync(collectionDir)) {
      const error = `Collection directory missing: ${folderName}`
      result.errors.push(error)
      console.error(`❌ ${error}`)
      result.hasErrors = true
      return
    }

    // Check cover image
    const coverFormat = collectionFormats[slug]
    const coverPath = path.join(collectionDir, `cover.${coverFormat}`)
    if (!fs.existsSync(coverPath)) {
      const error = `Cover image missing: ${folderName}/cover.${coverFormat}`
      result.errors.push(error)
      console.error(`❌ ${error}`)
      result.hasErrors = true
    } else {
      console.log(`✅ Cover image found: ${folderName}/cover.${coverFormat}`)
      result.validatedImages++
    }

    // Check collection images
    for (let i = 1; i <= info.count; i++) {
      result.totalImages++
      let imageExists = false
      let foundFormat = ''
      
      // For Bali, check both formats
      if (slug === 'bali') {
        const format = (i >= 10 && i <= 15) ? 'jpg' : 'jpeg'
        const imagePath = path.join(collectionDir, `${slug}-${i}.${format}`)
        if (fs.existsSync(imagePath)) {
          imageExists = true
          foundFormat = format
        }
      } else {
        // For other collections, check their format
        for (const format of info.formats) {
          const imagePath = path.join(collectionDir, `${slug}-${i}.${format}`)
          if (fs.existsSync(imagePath)) {
            imageExists = true
            foundFormat = format
            break
          }
        }
      }

      if (!imageExists) {
        const error = `Image missing: ${folderName}/${slug}-${i}.${info.formats[0]}`
        result.errors.push(error)
        console.error(`❌ ${error}`)
        result.hasErrors = true
      } else {
        result.validatedImages++
        // Add warning for non-standard format
        if (slug === 'bali' && foundFormat !== 'jpeg' && i < 10) {
          const warning = `Warning: ${folderName}/${slug}-${i}.${foundFormat} uses non-standard format`
          result.warnings.push(warning)
          console.warn(`⚠️  ${warning}`)
          result.hasWarnings = true
        }
      }
    }
  })

  // Print summary
  console.log('\n📊 Validation Summary:')
  console.log(`Total images checked: ${result.totalImages}`)
  console.log(`Images validated: ${result.validatedImages}`)
  console.log(`Missing images: ${result.totalImages - result.validatedImages}`)
  
  if (result.hasWarnings) {
    console.log(`\n⚠️  Warnings: ${result.warnings.length}`)
    result.warnings.forEach(warning => console.log(`  - ${warning}`))
  }

  if (result.hasErrors) {
    console.log(`\n❌ Errors: ${result.errors.length}`)
    result.errors.forEach(error => console.log(`  - ${error}`))
    
    if (!dryRun) {
      console.error('\n❌ Image validation failed. Please fix the missing images before deploying.')
      process.exit(1)
    } else {
      console.log('\n⚠️  Dry run completed with errors. Build will continue.')
    }
  } else {
    console.log('\n✅ All images validated successfully!')
  }

  return result
}

// Parse command line arguments
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')

// Run the validation
validateImages(dryRun) 
