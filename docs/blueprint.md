# **App Name**: VeriDash

## Core Features:

- Module Navigation: Dashboard with distinct modules for Aadhaar, PAN, and Bank validations.
- Aadhaar Module: Collects user details required for Aadhaar validation.
- PAN Module: Collects user details required for PAN validation.
- Bank Module: Collects user details required for Bank validation.
- Secure File Upload: Securely upload Aadhaar card, PAN card, and Bank book to a designated S3 bucket via IAM user.
- Status Display: Display upload progress and validation status for each document.
- Input validation: Employ a generative AI powered tool to scan the images, and ensure that information present on images (Aadhaar, PAN) matches user input.

## Style Guidelines:

- Primary color: Dark blue (#3F51B5) to evoke trust and security.
- Background color: Light gray (#F5F5F5) to ensure content clarity and reduce visual strain.
- Accent color: Teal (#009688) to highlight interactive elements and important status updates.
- Body and headline font: 'Inter', a grotesque-style sans-serif, to ensure a modern, objective feel suitable for dashboard readability.
- Use minimalist icons for document types and validation statuses.
- Maintain a clear separation of modules using card-based layouts.
- Use subtle progress animations during file uploads and validations.