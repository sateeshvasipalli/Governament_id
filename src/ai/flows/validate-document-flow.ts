
'use server';

/**
 * @fileOverview Flow to validate information on uploaded identity documents against user-entered information.
 * This flow supports Aadhar, PAN, Bank, Voter ID, and Driving Licence documents. It also performs document processing.
 *
 * - validateDocument - Validates document information and performs NLP analysis.
 * - preValidateDocument - Performs a preliminary check of details against the document.
 */

import {ai} from '@/ai/genkit';
import type { 
    ValidateDocumentInput, 
    PreValidateDocumentOutput, 
    ValidateDocumentOutput,
    NlpAnalysisOutput,
} from '@/lib/types';
import {
    DocumentInputSchema,
    PreValidateDocumentOutputSchema,
    ValidateDocumentOutputSchema,
    NlpAnalysisOutputSchema
} from '@/lib/types';
import { saveValidationResult } from '@/services/firestore';


// Server Action for Pre-validation
export async function preValidateDocument(
  input: ValidateDocumentInput
): Promise<PreValidateDocumentOutput> {
  return preValidateDocumentFlow(input);
}

// Server Action for Final Validation
export async function validateDocument(
  input: ValidateDocumentInput
): Promise<ValidateDocumentOutput> {
  const result = await validateDocumentFlow(input);
  
  // After getting the result, save it to Firestore
  if (!result.error) {
    const categoryMapping: {[key: string]: "Aadhar Card" | "PAN" | "Bank" | "Voter ID Card" | "Driving Licence"} = {
      'aadhar': 'Aadhar Card',
      'pan': 'PAN',
      'bank': 'Bank',
      'voter-id': 'Voter ID Card',
      'driving-licence': 'Driving Licence',
    };
    const category = categoryMapping[input.documentType];
    const documentName = "document"; // You might want to pass the actual file name here
    await saveValidationResult(category, documentName, result);
  }

  return result;
}


const validationPromptText = `You are an expert at validating identity and bank documents.

You will receive an image of a document, the expected document type (Aadhar, PAN, Bank, Voter ID, or Driving Licence), and various details as entered by the user.

Document Image: {{media url=documentImageUri}}

**Step 1: Document Type Verification & Data Extraction**
First, verify if the uploaded document image actually is a {{{documentType}}} card.
- For 'aadhar', look for keywords like 'UIDAI', 'Unique Identification Authority of India', and a 12-digit number format.
- For 'pan', look for keywords like 'Income Tax Department', 'Permanent Account Number', and the specific PAN format (ABCDE1234F).
- For 'bank', look for details like a bank name/logo, an account number, and an IFSC code.
- For 'voter-id', look for keywords like 'Election Commission of India', 'Voter ID', 'Elector's Photo Identity Card', and a 10-character EPIC number.
- For 'driving-licence', look for keywords like 'Driving Licence', 'Transport Department', and a licence number.
Set 'isDocumentTypeValid' to true if it matches, and false otherwise. Provide a reason in 'documentTypeValidationDetails'.

**If 'isDocumentTypeValid' is false, stop here. Do not extract any data and return immediately.**

If the document type is correct, proceed to extract the following information directly from the document image. Return the extracted text for each field. If a field is not present on the document, return an empty string "".

- 'extractedName': Extract the full name of the person.
- 'extractedFathersName': Extract the father's name.
- 'extractedDob': Extract the date of birth in DD/MM/YYYY format.
- 'extractedDocumentNumber': Extract the document number (Aadhar, PAN, Voter ID, or Driving Licence).
- 'extractedAccountNumber': Extract the bank account number.
- 'extractedIfscCode': Extract the bank IFSC code.
- 'extractedBranchName': Extract the bank branch name.
- 'extractedGender': Extract the gender.
- 'extractedState': Extract the state from the address.
- 'extractedDistrict': Extract the district from the address.
- 'extractedAddress': Extract the full address.
- 'extractedMobileNumber': Extract the mobile number if present.
- 'extractedDateOfIssue': Extract the date of issue from a Driving Licence.
- 'extractedValidTill': Extract the expiry date (valid till) from a Driving Licence.
- 'extractedBloodGroup': Extract the blood group from a Driving Licence.
- 'extractedStateOfIssue': Extract the state of issue from a Driving Licence.
`;

const documentProcessingPromptText = `
**Step 2: Document Processing**
Now, perform a full analysis of the document.

1.  **Full Text Extraction**: Extract all the text content from the document.
2.  **NLP Analysis**: Perform NLP analysis on the extracted text to identify:
    - Key entities (people, places, organizations).
    - The main key phrases.
    - The overall sentiment (Positive, Negative, or Neutral).
Return this under the 'nlpAnalysis' and 'extractedText' fields.
`;


// Genkit Prompt for Pre-validation
const preValidateDocumentPrompt = ai.definePrompt({
  name: 'preValidateDocumentPrompt',
  input: {schema: DocumentInputSchema},
  output: {schema: PreValidateDocumentOutputSchema},
  prompt: validationPromptText,
});


// Genkit Prompt for Final Validation
const validateDocumentPrompt = ai.definePrompt({
  name: 'validateDocumentPrompt',
  input: {schema: DocumentInputSchema},
  output: {schema: ValidateDocumentOutputSchema},
  prompt: `${validationPromptText}
${documentProcessingPromptText}

**Step 3: Summarize Results**
Finally, based on your extraction and validation, provide a concise summary of the process in the 'validationDetails' field.
`,
});


// Genkit Flow for Pre-validation
const preValidateDocumentFlow = ai.defineFlow(
  {
    name: 'preValidateDocumentFlow',
    inputSchema: DocumentInputSchema,
    outputSchema: PreValidateDocumentOutputSchema,
  },
  async input => {
    const {output} = await preValidateDocumentPrompt(input);
    return output!;
  }
);


// Genkit Flow for Final Validation
const validateDocumentFlow = ai.defineFlow(
  {
    name: 'validateDocumentFlow',
    inputSchema: DocumentInputSchema,
    outputSchema: ValidateDocumentOutputSchema,
  },
  async input => {
    const {output} = await validateDocumentPrompt(input);
    
    // If the document type is invalid, the overall validation must be false.
    if (!output!.isDocumentTypeValid) {
      return {
        ...output!,
        overallValidation: false,
        validationDetails: output!.documentTypeValidationDetails || "Document type could not be verified.",
        isDocumentTypeValid: false,
        documentTypeValidationDetails: output!.documentTypeValidationDetails || "Document type could not be verified.",
        extractedName: "",
      };
    }
    
    const userFullName = `${input.firstName} ${input.lastName}`.trim();

    const isNameValid = !!(output!.extractedName && output!.extractedName.toLowerCase() === userFullName.toLowerCase());
    const isFathersNameValid = !!(input.fathersName && output!.extractedFathersName && output!.extractedFathersName.toLowerCase() === input.fathersName.toLowerCase());
    const isDobValid = !!(input.dob && output!.extractedDob && output!.extractedDob === input.dob);
    const isDocumentNumberValid = !!(input.documentNumber && output!.extractedDocumentNumber && output!.extractedDocumentNumber.replace(/\s/g, '').toUpperCase() === input.documentNumber.replace(/\s/g, '').toUpperCase());
    const isAccountNumberValid = !!(input.accountNumber && output!.extractedAccountNumber && output!.extractedAccountNumber === input.accountNumber);
    const isIfscCodeValid = !!(input.ifscCode && output!.extractedIfscCode && output!.extractedIfscCode.toUpperCase() === input.ifscCode.toUpperCase());
    const isBranchNameValid = !!(input.branchName && output!.extractedBranchName && output!.extractedBranchName.toLowerCase() === input.branchName.toLowerCase());
    const isGenderValid = !!(input.gender && output!.extractedGender && output!.extractedGender.toLowerCase() === input.gender.toLowerCase());
    const isStateValid = !!(input.state && output!.extractedState && output!.extractedState.toLowerCase() === input.state.toLowerCase());
    const isDistrictValid = !!(input.district && output!.extractedDistrict && output!.extractedDistrict.toLowerCase() === input.district.toLowerCase());
    const isAddressValid = !!(input.address && output!.extractedAddress && output!.extractedAddress.toLowerCase().includes(input.address.toLowerCase()));
    const isMobileNumberValid = !!(input.mobileNumber && output!.extractedMobileNumber && output!.extractedMobileNumber.replace(/\D/g, '') === input.mobileNumber.replace(/\D/g, ''));
    const isDateOfIssueValid = !!(input.dateOfIssue && output!.extractedDateOfIssue && output!.extractedDateOfIssue === input.dateOfIssue);
    const isValidTillValid = !!(input.validTill && output!.extractedValidTill && output!.extractedValidTill === input.validTill);
    const isBloodGroupValid = !!(input.bloodGroup && output!.extractedBloodGroup && output!.extractedBloodGroup.replace(/ /g, '') === input.bloodGroup.replace(/ /g, ''));
    const isStateOfIssueValid = !!(input.stateOfIssue && output!.extractedStateOfIssue && output!.extractedStateOfIssue.toLowerCase() === input.stateOfIssue.toLowerCase());


    const checks = [];
    if (input.documentType !== 'bank') checks.push(isNameValid); // Bank name is not person name
    if (input.fathersName) checks.push(isFathersNameValid);
    if (input.dob) checks.push(isDobValid);
    if (input.documentNumber) checks.push(isDocumentNumberValid);
    if (input.accountNumber) checks.push(isAccountNumberValid);
    if (input.ifscCode) checks.push(isIfscCodeValid);
    if (input.branchName) checks.push(isBranchNameValid);
    if (input.gender) checks.push(isGenderValid);
    if (input.state) checks.push(isStateValid);
    if (input.district) checks.push(isDistrictValid);
    if (input.address) checks.push(isAddressValid);
    if (input.mobileNumber) checks.push(isMobileNumberValid);
    if (input.dateOfIssue) checks.push(isDateOfIssueValid);
    if (input.validTill) checks.push(isValidTillValid);
    if (input.bloodGroup) checks.push(isBloodGroupValid);
    if (input.stateOfIssue) checks.push(isStateOfIssueValid);

    const overallValidation = checks.every(check => check);

    return {
      ...output!,
      overallValidation: overallValidation,
      validationDetails: output!.validationDetails || (overallValidation ? "All details successfully matched the document." : "Some details did not match the document."),
      isNameValid,
      isFathersNameValid,
      isDobValid,
      isDocumentNumberValid,
      isAccountNumberValid,
      isIfscCodeValid,
      isBranchNameValid,
      isGenderValid,
      isStateValid,
      isDistrictValid,
      isAddressValid,
      isMobileNumberValid,
      isDateOfIssueValid,
      isValidTillValid,
      isBloodGroupValid,
      isStateOfIssueValid
    };
  }
);
