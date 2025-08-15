
"use server";

import { z } from "zod";
import { PanSchema } from "@/lib/schema";
import { preValidateDocument, validateDocument } from "@/ai/flows/validate-document-flow";
import type { ValidationResult, PreValidationResult } from "@/lib/types";

const ServerPanSchema = PanSchema.extend({
  document: z.instanceof(File),
});

async function fileToDataURI(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return `data:${file.type};base64,${buffer.toString("base64")}`;
}

export async function preValidatePan(formData: FormData): Promise<PreValidationResult> {
  const rawFormData = Object.fromEntries(formData.entries());
   if(typeof rawFormData.panNumber === 'string') {
    rawFormData.panNumber = rawFormData.panNumber.toUpperCase();
  }

  const validatedFields = ServerPanSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    const errorDetails = validatedFields.error.errors.map(e => e.message).join(', ');
    return {
      success: false,
      message: `Invalid form data: ${errorDetails}`,
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { firstName, lastName, fathersName, dob, panNumber, document } = validatedFields.data;

  try {
    const documentImageUri = await fileToDataURI(document);
    
    const result = await preValidateDocument({
      documentType: "pan",
      firstName,
      lastName,
      fathersName,
      dob,
      documentNumber: panNumber,
      documentImageUri,
    });
    
    if(!result.isDocumentTypeValid) {
        return {
            success: false,
            message: result.documentTypeValidationDetails || "The uploaded document does not appear to be a PAN card.",
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

    const isDobValid = result.extractedDob === dob;
    fieldValidation.isDobValid = isDobValid;
    validationChecks.push(isDobValid);
    
    const isDocumentNumberValid = result.extractedDocumentNumber?.toUpperCase() === panNumber.toUpperCase();
    fieldValidation.isDocumentNumberValid = isDocumentNumberValid;
    validationChecks.push(isDocumentNumberValid);

    // Only check father's name if it was provided in the form
    if (fathersName) {
        const isFathersNameValid = !!(result.extractedFathersName && result.extractedFathersName.toLowerCase() === fathersName.toLowerCase());
        fieldValidation.isFathersNameValid = isFathersNameValid;
        validationChecks.push(isFathersNameValid);
    }
    
    const allFieldsValid = validationChecks.every(Boolean);

    return {
      success: allFieldsValid,
      message: allFieldsValid ? "All details verified successfully." : "One or more details do not match the document.",
      fieldValidation,
      extractedData: {
        name: result.extractedName,
        fathersName: result.extractedFathersName,
        dob: result.extractedDob,
        documentNumber: result.extractedDocumentNumber,
      }
    };

  } catch (error) {
    console.error("Error in PAN pre-validation flow:", error);
    return {
      success: false,
      message: "An error occurred during the AI pre-validation process.",
    };
  }
}

export async function validatePan(formData: FormData): Promise<ValidationResult> {
  const rawFormData = Object.fromEntries(formData.entries());
   // Uppercase PAN number before validation
  if(typeof rawFormData.panNumber === 'string') {
    rawFormData.panNumber = rawFormData.panNumber.toUpperCase();
  }

  const validatedFields = ServerPanSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
     const errorDetails = validatedFields.error.errors.map(e => e.message).join(', ');
    return {
      error: "Invalid form data.",
      overallValidation: false,
      validationDetails: `Could not parse form data on the server: ${errorDetails}`,
      isPan: true,
      isDocumentTypeValid: false,
      documentTypeValidationDetails: "Form data is invalid.",
      extractedName: "",
    };
  }

  const { firstName, lastName, fathersName, dob, panNumber, document } = validatedFields.data;

  try {
    const documentImageUri = await fileToDataURI(document);
    
    const result = await validateDocument({
      documentType: "pan",
      firstName,
      lastName,
      fathersName,
      dob,
      documentNumber: panNumber,
      documentImageUri,
    });

    if (!result.isDocumentTypeValid) {
        return {
            error: "Incorrect Document Type",
            overallValidation: false,
            validationDetails: result.documentTypeValidationDetails || "The uploaded document does not appear to be a PAN card. Please upload the correct document.",
            isPan: true,
            isDocumentTypeValid: false,
            documentTypeValidationDetails: result.documentTypeValidationDetails || "The uploaded document does not appear to be a PAN card.",
            extractedName: "",
        };
    }

    return {...result, isPan: true};
  } catch (error) {
    console.error("Error in PAN validation flow:", error);
    return {
      error: "An error occurred during the AI validation process.",
      overallValidation: false,
      validationDetails: "The AI model failed to process the document. This could be due to a server issue or an unreadable document.",
      isPan: true,
      isDocumentTypeValid: false,
      documentTypeValidationDetails: "AI model failure.",
      extractedName: "",
    };
  }
}
