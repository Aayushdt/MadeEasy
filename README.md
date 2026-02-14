# MadeEasy - DFT Calculator

A web-based educational tool for calculating and visualizing Discrete Fourier Transform (DFT) operations, including circular convolution and spectrum analysis.

## Features

- **DFT/IDFT Calculation**: Compute Discrete Fourier Transform and its inverse
- **Circular Convolution**: Perform circular convolution on input sequences
- **Spectrum Visualization**: Interactive charts showing frequency domain results
- **Twiddle Factor Display**: View and understand twiddle factor calculations

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd MadeEasy

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/       # React components
│   ├── ui/          # Reusable UI components
│   └── *.jsx       # Feature components
├── config/          # Configuration files
├── utils/          # Utility functions (DFT algorithms)
├── App.jsx         # Main application component
└── main.jsx        # Application entry point
```

## Contributing

We welcome contributions! Please follow these steps:

### How to Contribute

1. **Fork the Repository**
   Click the "Fork" button on the repository page to create your own copy.

2. **Clone Your Fork**
   ```bash
   git clone <your-fork-url>
   cd MadeEasy
   ```

3. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

4. **Make Changes**
   - Follow the existing code style and conventions
   - Use meaningful variable and function names
   - Add comments for complex logic
   - Test your changes thoroughly

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "Description of your changes"
   ```

6. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Describe your changes and submit

### Commit Message Guidelines

- Use clear, descriptive commit messages
- Start with a verb (Add, Fix, Update, Remove)
- Keep the first line under 72 characters
- Reference issues when applicable

### Code Style

- Use functional components with hooks
- Follow React best practices
- Use Tailwind CSS for styling
- Keep components small and focused

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Recharts** - Charting library

## License

This project is for educational purposes.

## Support

If you find any issues or have questions, please open an issue on GitHub.
