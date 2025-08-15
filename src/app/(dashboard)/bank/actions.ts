
"use server";

import { z } from "zod";
import { BankSchema } from "@/lib/schema";
import { preValidateDocument, validateDocument } from "@/ai/flows/validate-document-flow";
import type { ValidationResult, PreValidationResult } from "@/lib/types";

const ServerBankSchema = BankSchema.extend({
  document: z.instanceof(File),
});

async function fileToDataURI(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return `data:${file.type};base64,${buffer.toString("base64")}`;
}

export async function preValidateBank(formData: FormData): Promise<PreValidationResult> {
  const rawFormData = Object.fromEntries(formData.entries());
  
  if(typeof rawFormData.ifscCode === 'string') {
    rawFormData.ifscCode = rawFormData.ifscCode.toUpperCase();
  }

  const validatedFields = ServerBankSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    const errorDetails = validatedFields.error.errors.map(e => e.message).join(', ');
    return {
      success: false,
      message: `Invalid form data: ${errorDetails}`,
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { firstName, lastName, accountNumber, ifscCode, branchName, document } = validatedFields.data;

  try {
    const documentImageUri = await fileToDataURI(document);
    
    const result = await preValidateDocument({
      documentType: "bank",
      firstName,
      lastName,
      accountNumber,
      ifscCode,
      branchName,
      documentImageUri,
    });

    if (!result.isDocumentTypeValid) {
      return {
        success: false,
        message: result.documentTypeValidationDetails || "The uploaded document does not appear to be a bank document.",
        fieldErrors: { document: ["Incorrect document type uploaded."] }
      }
    }
    
    const userFullName = `${firstName} ${lastName}`.trim().toLowerCase();
    
    const fieldValidation: PreValidationResult['fieldValidation'] = {};
    const validationChecks: boolean[] = [];

    // Always check these fields as they are required by the schema
    const isNameValid = result.extractedName?.toLowerCase() === userFullName;
    fieldValidation.isNameValid = isNameValid;
    validationChecks.push(isNameValid);

    const isAccountNumberValid = result.extractedAccountNumber === accountNumber;
    fieldValidation.isAccountNumberValid = isAccountNumberValid;
    validationChecks.push(isAccountNumberValid);

    const isIfscCodeValid = result.extractedIfscCode?.toUpperCase() === ifscCode.toUpperCase();
    fieldValidation.isIfscCodeValid = isIfscCodeValid;
    validationChecks.push(isIfscCodeValid);

    const isBranchNameValid = result.extractedBranchName?.toLowerCase() === branchName.toLowerCase();
    fieldValidation.isBranchNameValid = isBranchNameValid;
    validationChecks.push(isBranchNameValid);

    const allFieldsValid = validationChecks.every(Boolean);

    return {
      success: allFieldsValid,
      message: allFieldsValid ? "All details verified successfully." : "One or more details do not match the document.",
      fieldValidation,
      extractedData: {
        name: result.extractedName,
        accountNumber: result.extractedAccountNumber,
        ifscCode: result.extractedIfscCode,
        branchName: result.extractedBranchName,
      }
    };
  } catch (error) {
    console.error("Error in Bank pre-validation flow:", error);
    return {
      success: false,
      message: "An error occurred during the AI pre-validation process.",
    };
  }
}


export async function validateBank(formData: FormData): Promise<ValidationResult> {
  const rawFormData = Object.fromEntries(formData.entries());
  
  if(typeof rawFormData.ifscCode === 'string') {
    rawFormData.ifscCode = rawFormData.ifscCode.toUpperCase();
  }

  const validatedFields = ServerBankSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    const errorDetails = validatedFields.error.errors.map(e => e.message).join(', ');
    return {
      error: "Invalid form data.",
      overallValidation: false,
      validationDetails: `Could not parse form data on the server: ${errorDetails}`,
      isBank: true,
      isDocumentTypeValid: false,
      documentTypeValidationDetails: "Form data is invalid.",
      extractedName: "",
    };
  }
  
  const { firstName, lastName, accountNumber, ifscCode, branchName, document } = validatedFields.data;


  try {
    const documentImageUri = await fileToDataURI(document);
    
    const result = await validateDocument({
      documentType: "bank",
      firstName,
      lastName,
      accountNumber,
      ifscCode,
      branchName,
      documentImageUri,
    });

    if (!result.isDocumentTypeValid) {
        return {
            error: "Incorrect Document Type",
            overallValidation: false,
            validationDetails: result.documentTypeValidationDetails || "The uploaded document does not appear to be a bank document. Please upload the correct document.",
            isBank: true,
            isDocumentTypeValid: false,
            documentTypeValidationDetails: result.documentTypeValidationDetails || "The uploaded document does not appear to be a bank document.",
            extractedName: "",
        };
    }

    return {...result, isBank: true};
  } catch (error) {
    console.error("Error in bank validation flow:", error);
    return {
      error: "An error occurred during the AI validation process.",
      overallValidation: false,
      validationDetails: "The AI model failed to process the document. This could be due to a server issue or an unreadable document.",
      isBank: true,
      isDocumentTypeValid: false,
      documentTypeValidationDetails: "AI model failure.",
      extractedName: "",
    };
  }
}
