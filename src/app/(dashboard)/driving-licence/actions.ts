
"use server";

import { z } from "zod";
import { DrivingLicenceSchema } from "@/lib/schema";
import { preValidateDocument, validateDocument } from "@/ai/flows/validate-document-flow";
import type { ValidationResult, PreValidationResult } from "@/lib/types";

const ServerDrivingLicenceSchema = DrivingLicenceSchema.extend({
  document: z.instanceof(File),
});

async function fileToDataURI(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return `data:${file.type};base64,${buffer.toString("base64")}`;
}

export async function preValidateDrivingLicence(formData: FormData): Promise<PreValidationResult> {
  const rawFormData = Object.fromEntries(formData.entries());
  if(typeof rawFormData.drivingLicenceNumber === 'string') {
    rawFormData.drivingLicenceNumber = rawFormData.drivingLicenceNumber.toUpperCase();
  }

  const validatedFields = ServerDrivingLicenceSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    const errorDetails = validatedFields.error.errors.map(e => e.message).join(', ');
    return {
      success: false,
      message: `Invalid form data: ${errorDetails}`,
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { document, ...userData } = validatedFields.data;

  try {
    const documentImageUri = await fileToDataURI(document);
    
    const result = await preValidateDocument({
      documentType: "driving-licence",
      firstName: userData.firstName,
      lastName: userData.lastName,
      dob: userData.dob,
      documentNumber: userData.drivingLicenceNumber,
      dateOfIssue: userData.dateOfIssue,
      validTill: userData.validTill,
      bloodGroup: userData.bloodGroup,
      documentImageUri,
    });
    
    if(!result.isDocumentTypeValid) {
        return {
            success: false,
            message: result.documentTypeValidationDetails || "The uploaded document does not appear to be a Driving Licence.",
            fieldErrors: { document: ["Incorrect document type uploaded."] }
        }
    }
    
    const userFullName = `${userData.firstName} ${userData.lastName}`.trim().toLowerCase();

    const fieldValidation: PreValidationResult['fieldValidation'] = {};
    const validationChecks: boolean[] = [];

    // Validation checks
    const isNameValid = result.extractedName?.toLowerCase() === userFullName;
    fieldValidation.isNameValid = isNameValid;
    validationChecks.push(isNameValid);

    const isDobValid = result.extractedDob === userData.dob;
    fieldValidation.isDobValid = isDobValid;
    validationChecks.push(isDobValid);
    
    const isDocumentNumberValid = result.extractedDocumentNumber?.toUpperCase() === userData.drivingLicenceNumber.toUpperCase();
    fieldValidation.isDocumentNumberValid = isDocumentNumberValid;
    validationChecks.push(isDocumentNumberValid);

    const isDateOfIssueValid = result.extractedDateOfIssue === userData.dateOfIssue;
    fieldValidation.isDateOfIssueValid = isDateOfIssueValid;
    validationChecks.push(isDateOfIssueValid);

    const isValidTillValid = result.extractedValidTill === userData.validTill;
    fieldValidation.isValidTillValid = isValidTillValid;
    validationChecks.push(isValidTillValid);
    
    if (userData.bloodGroup) {
      const isBloodGroupValid = result.extractedBloodGroup?.replace(/ /g, '').toLowerCase() === userData.bloodGroup.replace(/ /g, '').toLowerCase();
      fieldValidation.isBloodGroupValid = isBloodGroupValid;
      validationChecks.push(isBloodGroupValid);
    }

    const allFieldsValid = validationChecks.every(Boolean);

    return {
      success: allFieldsValid,
      message: allFieldsValid ? "All details verified successfully." : "One or more details do not match the document.",
      fieldValidation,
      extractedData: {
        name: result.extractedName,
        dob: result.extractedDob,
        documentNumber: result.extractedDocumentNumber,
        dateOfIssue: result.extractedDateOfIssue,
        validTill: result.extractedValidTill,
        bloodGroup: result.extractedBloodGroup,
      }
    };

  } catch (error) {
    console.error("Error in Driving Licence pre-validation flow:", error);
    return {
      success: false,
      message: "An error occurred during the AI pre-validation process.",
    };
  }
}


export async function validateDrivingLicence(formData: FormData): Promise<ValidationResult> {
  const rawFormData = Object.fromEntries(formData.entries());
   if(typeof rawFormData.drivingLicenceNumber === 'string') {
    rawFormData.drivingLicenceNumber = rawFormData.drivingLicenceNumber.toUpperCase();
  }

  const validatedFields = ServerDrivingLicenceSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    const errorDetails = validatedFields.error.errors.map(e => e.message).join(', ');
    return {
      error: "Invalid form data.",
      overallValidation: false,
      validationDetails: `Could not parse form data on the server: ${errorDetails}`,
      isDrivingLicence: true,
      isDocumentTypeValid: false,
      documentTypeValidationDetails: "Form data is invalid.",
      extractedName: "",
    };
  }

  const { document, ...userData } = validatedFields.data;

  try {
    const documentImageUri = await fileToDataURI(document);
    
    const result = await validateDocument({
      documentType: "driving-licence",
      firstName: userData.firstName,
      lastName: userData.lastName,
      dob: userData.dob,
      documentNumber: userData.drivingLicenceNumber,
      dateOfIssue: userData.dateOfIssue,
      validTill: userData.validTill,
      bloodGroup: userData.bloodGroup,
      documentImageUri,
    });

    if (!result.isDocumentTypeValid) {
        return {
            error: "Incorrect Document Type",
            overallValidation: false,
            validationDetails: result.documentTypeValidationDetails || "The uploaded document does not appear to be a Driving Licence. Please upload the correct document.",
            isDrivingLicence: true,
            isDocumentTypeValid: false,
            documentTypeValidationDetails: result.documentTypeValidationDetails || "The uploaded document does not appear to be a Driving Licence.",
            extractedName: "",
        };
    }

    return {...result, isDrivingLicence: true};
  } catch (error) {
    console.error("Error in Driving Licence validation flow:", error);
    return {
      error: "An error occurred during the AI validation process.",
      overallValidation: false,
      validationDetails: "The AI model failed to process the document. This could be due to a server issue or an unreadable document.",
      isDrivingLicence: true,
      isDocumentTypeValid: false,
      documentTypeValidationDetails: "AI model failure.",
      extractedName: "",
    };
  }
}
