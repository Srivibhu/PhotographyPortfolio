# Next.js Photography Portfolio | X100

![X100 - Next.js Photography Portfolio](https://github.com/lilxyzz/x100/blob/main/public/X100-cover.webp)

A modern, responsive photography portfolio built with Next.js 15+, featuring dynamic collections, smooth animations, and a beautiful dark/light theme.

I created this theme as I’ve been considering purchasing a camera recently, and it aligned with some ideas I wanted to explore. I may contribute further updates in the future, but can’t make any guarantees at this stage. Enjoy 🤙

## 🌟 Features

- **Dynamic Photo Collections**: Automatically loads and displays photos from organized folders
- **Responsive Design**: Fully responsive layout optimized for all devices
- **Dark/Light Theme**: Elegant theme switching with smooth transitions
- **Modern Animations**: Powered by Framer Motion for smooth interactions

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **React**: 19
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide Icons
- **Formspree**: Contact Form
- **React Photo Album**: [Masonry Layout](https://react-photo-album.com/examples/masonry)

## 🛠️ Setup Instructions

1. **Clone the repository**

   ```bash
   git clone [https://github.com/lilxyzz/x100]
   cd x100
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

Open http://localhost:3000 with your browser to see the result.

## 📸 Photo Collections

The portfolio is organized into collections:

- Urban Portraits
- Tokyo
- New Zealand
- Iceland
- Bali
- Morocco

Each collection should be placed in its corresponding folder in the `public` directory. Update image Validation /scripts/validate-images.ts

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

## Cloudinary Workflow (Headless)

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
