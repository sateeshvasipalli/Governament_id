import { z } from 'zod';

export const NlpAnalysisOutputSchema = z.object({
    entities: z.array(z.string()).describe("Key entities (people, places, organizations) found in the text."),
    keyPhrases: z.array(z.string()).describe("Main key phrases or topics from the text."),
    sentiment: z.enum(["Positive", "Negative", "Neutral"]).describe("The overall sentiment of the text."),
});
export type NlpAnalysisOutput = z.infer<typeof NlpAnalysisOutputSchema>;


export const DocumentInputSchema = z.object({
  documentType: z.enum(['aadhar', 'pan', 'bank', 'voter-id', 'driving-licence']).describe('Type of document being validated.'),
  documentImageUri: z.string().describe(
    "The document image, as a a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
  ),
  firstName: z.string().describe('First name as entered by the user.'),
  lastName: z.string().describe('Last name as entered by the user.'),
  fathersName: z.string().optional().describe("Father's name as entered by the user (if applicable)."),
  dob: z.string().optional().describe('Date of birth as entered by the user (DD/MM/YYYY).'),
  documentNumber: z.string().optional().describe('Document number (Aadhar, PAN, Voter ID, Driving Licence) as entered by the user.'),
  accountNumber: z.string().optional().describe('Bank account number as entered by the user.'),
  ifscCode: z.string().optional().describe('Bank IFSC code as entered by the user.'),
  branchName: z.string().optional().describe('Bank branch name as entered by the user.'),
  gender: z.string().optional().describe('Gender as entered by the user.'),
  state: z.string().optional().describe('State as entered by the user.'),
  district: z.string().optional().describe('District as entered by the user.'),
  address: z.string().optional().describe('Address as entered by the user.'),
  mobileNumber: z.string().optional().describe('Mobile number as entered by the user.'),
  dateOfIssue: z.string().optional().describe("Date of Issue for Driving Licence (DD/MM/YYYY)."),
  validTill: z.string().optional().describe("Expiry Date for Driving Licence (DD/MM/YYYY)."),
  bloodGroup: z.string().optional().describe("Blood Group for Driving Licence."),
  stateOfIssue: z.string().optional().describe("State of Issue for Driving Licence."),
});
export type ValidateDocumentInput = z.infer<typeof DocumentInputSchema>;


export const PreValidateDocumentOutputSchema = z.object({
  isDocumentTypeValid: z.boolean().describe("Whether the uploaded document appears to be of the correct type."),
  documentTypeValidationDetails: z.string().describe("Explanation of why the document type is considered valid or invalid."),
  
  extractedName: z.string().describe("The full name extracted from the document."),
  extractedFathersName: z.string().describe("The father's name extracted from the document.").optional(),
  extractedDob: z.string().describe("The date of birth extracted from the document in DD/MM/YYYY format.").optional(),
  extractedDocumentNumber: z.string().describe("The document number (Aadhar/PAN/Voter ID/Driving Licence) extracted from the document.").optional(),
  extractedAccountNumber: z.string().describe("The bank account number extracted from the document.").optional(),
  extractedIfscCode: z.string().describe("The bank IFSC code extracted from the document.").optional(),
  extractedBranchName: z.string().describe("The bank branch name extracted from the document.").optional(),
  extractedGender: z.string().describe("The gender extracted from the document.").optional(),
  extractedState: z.string().describe("The state extracted from the document.").optional(),
  extractedDistrict: z.string().describe("The district extracted from the document.").optional(),
  extractedAddress: z.string().describe("The address extracted from the document.").optional(),
  extractedMobileNumber: z.string().describe("The mobile number extracted from the document.").optional(),
  extractedDateOfIssue: z.string().describe("The date of issue from Driving Licence.").optional(),
  extractedValidTill: z.string().describe("The expiry date from Driving Licence.").optional(),
  extractedBloodGroup: z.string().describe("The blood group from Driving Licence.").optional(),
  extractedStateOfIssue: z.string().describe("The state of issue from Driving Licence.").optional(),
});
export type PreValidateDocumentOutput = z.infer<typeof PreValidateDocumentOutputSchema>;


export const ValidateDocumentOutputSchema = PreValidateDocumentOutputSchema.extend({
  overallValidation: z.boolean().describe('Overall validation status, true if all checked fields are valid.'),
  validationDetails: z.string().describe('Detailed summary of the validation results.'),
  error: z.string().optional(),
  isAadhaar: z.boolean().optional(),
  isPan: z.boolean().optional(),
  isBank: z.boolean().optional(),
  isVoterId: z.boolean().optional(),
  isDrivingLicence: z.boolean().optional(),
  
  // Add the final validation booleans for the result display
  isNameValid: z.boolean().describe("Final validation status for name.").optional(),
  isFathersNameValid: z.boolean().describe("Final validation status for father's name.").optional(),
  isDobValid: z.boolean().describe("Final validation status for date of birth.").optional(),
  isDocumentNumberValid: z.boolean().describe("Final validation status for document number.").optional(),
  isAccountNumberValid: z.boolean().describe("Final validation status for account number.").optional(),
  isIfscCodeValid: z.boolean().describe("Final validation status for IFSC code.").optional(),
  isBranchNameValid: z.boolean().describe("Final validation status for branch name.").optional(),
  isGenderValid: z.boolean().describe("Final validation status for gender.").optional(),
  isStateValid: z.boolean().describe("Final validation status for state.").optional(),
  isDistrictValid: z.boolean().describe("Final validation status for district.").optional(),
  isAddressValid: z.boolean().describe("Final validation status for address.").optional(),
  isMobileNumberValid: z.boolean().describe("Final validation status for mobile number.").optional(),
  isDateOfIssueValid: z.boolean().describe("Final validation status for date of issue.").optional(),
  isValidTillValid: z.boolean().describe("Final validation status for expiry date.").optional(),
  isBloodGroupValid: z.boolean().describe("Final validation status for blood group.").optional(),
  isStateOfIssueValid: z.boolean().describe("Final validation status for state of issue.").optional(),


  // For document processing results
  extractedText: z.string().describe("The full text extracted from the document.").optional(),
  nlpAnalysis: NlpAnalysisOutputSchema.optional(),
});
export type ValidateDocumentOutput = z.infer<typeof ValidateDocumentOutputSchema>;


export type ValidationResult = ValidateDocumentOutput;

export type PreValidationResult = {
  success: boolean;
  message: string;
  fieldValidation?: {
    isNameValid?: boolean;
    isFathersNameValid?: boolean;
    isDobValid?: boolean;
    isDocumentNumberValid?: boolean;
    isAccountNumberValid?: boolean;
    isIfscCodeValid?: boolean;
    isBranchNameValid?: boolean;
    isGenderValid?: boolean;
    isStateValid?: boolean;
    isDistrictValid?: boolean;
    isAddressValid?: boolean;
    isMobileNumberValid?: boolean;
    isDateOfIssueValid?: boolean;
    isValidTillValid?: boolean;
    isBloodGroupValid?: boolean;
    isStateOfIssueValid?: boolean;
  },
  extractedData?: {
    name?: string;
    fathersName?: string;
    dob?: string;
    documentNumber?: string;
    accountNumber?: string;
    ifscCode?: string;
    branchName?: string;
    gender?: string;
    state?: string;
    district?: string;
    address?: string;
    mobileNumber?: string;
    dateOfIssue?: string;
    validTill?: string;
    bloodGroup?: string;
    stateOfIssue?: string;
  },
  fieldErrors?: {
    [key: string]: string[] | undefined;
  }
}
