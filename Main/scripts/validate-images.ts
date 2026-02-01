const fs = require('fs');
const path = require('path');

// Collection image counts and formats
const collectionImages: Record<string, { count: number; formats: string[] }> = {
  'portraits-beach': { 
    count: 20,
    formats: ['jpg', 'jpeg']
  },
  'landscapes-dallas': { 
    count: 15,
    formats: ['jpg', 'jpeg']
  },
  'portraits-family': { 
    count: 25,
    formats: ['jpg', 'jpeg']
  },
  'portraits-graduation': { 
    count: 30,
    formats: ['jpg', 'jpeg']
  },
  'portraits-nj-moments': { 
    count: 20,
    formats: ['jpg', 'jpeg']
  },
  'commercial-jewelry': { 
    count: 15,
    formats: ['jpg', 'jpeg']
  },
  'landscapes-nature': { 
    count: 25,
    formats: ['jpg', 'jpeg']
  },
  'portraits-metuchen': { 
    count: 20,
    formats: ['jpg', 'jpeg']
  },
  'nyc': { 
    count: 30,
    formats: ['jpg', 'jpeg']
  },
  'europe': {
    count: 40,
    formats: ['jpg', 'jpeg']
  },
  'random': {
    count: 20,
    formats: ['jpg', 'jpeg']
  },
  'trails': {
    count: 25,
    formats: ['jpg', 'jpeg']
  },
  'events': {
    count: 50, // Combined count for all event folders
    formats: ['jpg', 'jpeg']
  }
}

// Collection format mapping for cover images
const collectionFormats: Record<string, string> = {
  'portraits-beach': 'jpg',
  'landscapes-dallas': 'jpg',
  'portraits-family': 'jpg',
  'portraits-graduation': 'jpg',
  'portraits-nj-moments': 'jpg',
  'commercial-jewelry': 'jpg',
  'landscapes-nature': 'jpg',
  'portraits-metuchen': 'jpg',
  'nyc': 'jpg',
  'europe': 'jpg',
  'random': 'jpg',
  'trails': 'jpg',
  'events': 'jpg'
}

// Collection folder name mapping (for case sensitivity)
const collectionFolders: Record<string, string> = {
  'portraits-beach': 'Portraits - Beach',
  'landscapes-dallas': 'Landscapes - Dallas',
  'portraits-family': 'Portraits - Family',
  'portraits-graduation': 'Portraits - Graduation',
  'portraits-nj-moments': 'Portraits - NJ Moments',
  'commercial-jewelry': 'Commercial - Jewelry',
  'landscapes-nature': 'Landscapes - Nature',
  'portraits-metuchen': 'Portraits - Metuchen',
  'nyc': 'nyc',
  'europe': 'Europe',
  'random': 'random',
  'trails': 'trails',
  'events': 'Events' // This will be a merged folder
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
