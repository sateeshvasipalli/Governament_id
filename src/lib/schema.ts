import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_DOC_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];

const documentFileSchema = z
  .instanceof(File, { message: "Document is required." })
  .refine((file) => file.size > 0, "Document is required.")
  .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
  .refine(
    (file) => ACCEPTED_DOC_TYPES.includes(file.type),
    "Only .jpg, .jpeg, .png, .webp and .pdf formats are supported."
  );

const isValidDate = (dateString: string) => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) return false;
    const parts = dateString.split('/');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    if (year < 1900 || year > new Date().getFullYear() + 20 || month === 0 || month > 12) return false;
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

const isValidPastDate = (dateString: string) => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) return false;
    const parts = dateString.split('/');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    if (year < 1900 || year > new Date().getFullYear() || month === 0 || month > 12) return false;
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day && date <= new Date();
}

export const AadhaarSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  fathersName: z.string().min(2, { message: "Father's name must be at least 2 characters." }).optional(),
  dob: z.string().refine(isValidPastDate, { message: 'Invalid date of birth' }),
  aadhaarNumber: z.string().regex(/^\d{12}$/, { message: "Aadhar Card number must be 12 digits." }),
  document: documentFileSchema,
});

export const PanSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  fathersName: z.string().min(2, { message: "Father's name must be at least 2 characters." }).optional(),
  dob: z.string().refine(isValidPastDate, { message: 'Invalid date of birth' }),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, { message: "Invalid PAN number format." }),
  document: documentFileSchema,
});

export const BankSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  accountNumber: z.string().min(9, { message: "Account number must be at least 9 digits." }).max(18, { message: "Account number must be at most 18 digits." }),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, { message: "Invalid IFSC code format." }),
  branchName: z.string().min(2, { message: "Branch name must be at least 2 characters." }),
  document: documentFileSchema,
});

export const VoterIdSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  fathersName: z.string().min(2, { message: "Father's name must be at least 2 characters." }),
  dob: z.string().refine(isValidPastDate, { message: 'Invalid date of birth' }).optional(),
  gender: z.enum(['male', 'female', 'other'], { required_error: 'Please select a gender.' }).optional(),
  voterIdNumber: z.string().regex(/^[A-Z]{3}[0-9]{7}$/, { message: "Invalid Voter ID number format (e.g., ABC1234567)." }),
  state: z.string().min(1, { message: "State is required." }).optional(),
  district: z.string().min(1, { message: "District is required." }).optional(),
  address: z.string().min(10, { message: "Address must be at least 10 characters." }).optional(),
  mobileNumber: z.string().regex(/^\d{10}$/, { message: "Mobile number must be 10 digits." }).optional(),
  document: documentFileSchema,
});


export const DrivingLicenceSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  dob: z.string().refine(isValidPastDate, { message: 'Invalid date of birth' }),
  drivingLicenceNumber: z.string().min(1, { message: "Driving Licence number is required." }),
  dateOfIssue: z.string().refine(isValidPastDate, { message: 'Invalid date of issue' }),
  validTill: z.string().refine(isValidDate, { message: 'Invalid expiry date' }),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'N/A']).optional().or(z.literal('')),
  document: documentFileSchema,
});
