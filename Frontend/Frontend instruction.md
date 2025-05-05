# Frontend Setup Instructions

## Initial Setup
```bash
# Install Next.js
npm install next

# Install required dependencies
npm install react react-dom

# Create necessary directories
mkdir -p pages components styles public
```

## Development
```bash
# Start development server
npm run dev
```

## Building for Production
```bash
# Build the application
npm run build

# Start production server
npm start
```

## Additional Commands
```bash
# Install additional dependencies
npm install [package-name]

# Run tests
npm run test

# Run linting
npm run lint
```

## Project Structure
- `pages/` - Contains all the pages of your application
- `components/` - Reusable React components
- `styles/` - CSS and styling files
- `public/` - Static assets like images and fonts

## Development Tips
1. The development server runs on http://localhost:3000 by default
2. Use `pages/_app.js` for global styles and layouts
3. Use `pages/_document.js` for custom document structure
4. Hot reloading is enabled by default