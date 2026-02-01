# Srivibhu Ponakala Photography Portfolio

Automotive, travel, and lifestyle photography portfolio built with Next.js, Cloudinary, and Framer Motion.

## 🌟 Features

- **Dynamic Photo Collections**: Automatically loads and displays photos from organized folders
- **Responsive Design**: Fully responsive layout optimized for all devices
- **Dark/Light Theme**: Elegant theme switching with smooth transitions
- **Modern Animations**: Powered by Framer Motion for smooth interactions

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **React**: 18
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide Icons
- **Formspree**: Contact Form (optional)
- **React Photo Album**: [Masonry Layout](https://react-photo-album.com/examples/masonry)

## 🛠️ Setup Instructions

1. **Clone the repository**

   ```bash
   git clone https://github.com/Srivibhu/PhotographyPortfolio.git
   cd PhotographyPortfolio/Main
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

Open http://localhost:3000 with your browser to see the result.

## 📸 Photo Collections (Cloudinary)

Collections are loaded from Cloudinary folders under `CLOUDINARY_FOLDER` (default: `portfolio`).

Folder examples:

- Portraits - Beach
- Portraits - Family
- Portraits - Graduation
- Portraits - NJ Moments
- Portraits - Metuchen
- Landscapes - Dallas
- Landscapes - Nature
- Commercial - Jewelry
- mata24 event
- nats event
- new-year-23
- nyc
- Europe
- random
- svm-events
- trails

Collections and tags are mapped in `Main/lib/collections.ts` and folder names are mapped in `Main/lib/cloudinary.ts`.

## ✉️ Contact Form (Formspree)

The contact form uses Formspree.

1. Create a Formspree form and copy your form ID.
2. Replace the placeholder in `Main/components/contact-form.tsx`:

```
const [state, handleSubmit] = useForm("YOUR_FORMSPREE_ID")
```

Formspree will email submissions to the address you configure in their dashboard.

## 🎨 Theme Customization

### Colors

The theme colors are defined in `globals.css` using CSS variables. Modify the root variables to customize the color scheme:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 0%;
  /* ... other color variables */
}
```

## 🌓 Dark Mode

The theme toggle is implemented using `next-themes` and includes:

- System preference detection
- Smooth transitions
- Persistent theme selection

## 📱 Responsive Design

The portfolio is fully responsive with breakpoints:

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Cloudinary Workflow

This project can load galleries from Cloudinary instead of `public/`.

### Environment Variables

Set these in your shell and in Vercel:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=portfolio
```

### Upload Script (EXIF Stripping)

```
python scripts/cloudinary_upload.py --input "C:\\Users\\Srivibhu\\Pictures\\my work"
```

If your input folder is flat (no subfolders), pass a collection name:

```
python scripts/cloudinary_upload.py --input "C:\\Users\\Srivibhu\\Pictures\\my work" --collection "urban-portraits"
```

The script uploads into `CLOUDINARY_FOLDER/<collection-slug>`.
