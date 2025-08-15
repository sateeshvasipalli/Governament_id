
"use server";

import { z } from "zod";
import { VoterIdSchema } from "@/lib/schema";
import { preValidateDocument, validateDocument } from "@/ai/flows/validate-document-flow";
import type { ValidationResult, PreValidationResult } from "@/lib/types";

// Create a version of the schema for server-side validation from FormData
const ServerVoterIdSchema = VoterIdSchema.extend({
  document: z.instanceof(File),
});

async function fileToDataURI(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return `data:${file.type};base64,${buffer.toString("base64")}`;
}

export async function preValidateVoterId(formData: FormData): Promise<PreValidationResult> {
  const rawFormData = Object.fromEntries(formData.entries());
  if(typeof rawFormData.voterIdNumber === 'string') {
    rawFormData.voterIdNumber = rawFormData.voterIdNumber.toUpperCase();
  }

  const validatedFields = ServerVoterIdSchema.safeParse(rawFormData);

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
      documentType: "voter-id",
      firstName: userData.firstName,
      lastName: userData.lastName,
      fathersName: userData.fathersName,
      dob: userData.dob,
      documentNumber: userData.voterIdNumber,
      gender: userData.gender,
      state: userData.state,
      district: userData.district,
      address: userData.address,
      mobileNumber: userData.mobileNumber,
      documentImageUri,
    });
    
    if(!result.isDocumentTypeValid) {
        return {
            success: false,
            message: result.documentTypeValidationDetails || "The uploaded document does not appear to be a Voter ID card.",
            fieldErrors: { document: ["Incorrect document type uploaded."] }
        }
    }
    
    const userFullName = `${userData.firstName} ${userData.lastName}`.trim().toLowerCase();

    const fieldValidation: PreValidationResult['fieldValidation'] = {};
    const validationChecks: boolean[] = [];

    // Always check these as they are required by the schema
    const isNameValid = result.extractedName?.toLowerCase() === userFullName;
    fieldValidation.isNameValid = isNameValid;
    validationChecks.push(isNameValid);

    const isFathersNameValid = !!(result.extractedFathersName && userData.fathersName && result.extractedFathersName.toLowerCase() === userData.fathersName.toLowerCase());
    fieldValidation.isFathersNameValid = isFathersNameValid;
    validationChecks.push(isFathersNameValid);
    
    const isDocumentNumberValid = result.extractedDocumentNumber?.toUpperCase() === userData.voterIdNumber.toUpperCase();
    fieldValidation.isDocumentNumberValid = isDocumentNumberValid;
    validationChecks.push(isDocumentNumberValid);

    // Conditionally check optional fields
    if (userData.dob) {
      const isDobValid = result.extractedDob === userData.dob;
      fieldValidation.isDobValid = isDobValid;
      validationChecks.push(isDobValid);
    }
    if (userData.gender) {
      const isGenderValid = result.extractedGender?.toLowerCase() === userData.gender.toLowerCase();
      fieldValidation.isGenderValid = isGenderValid;
      validationChecks.push(isGenderValid);
    }
    if (userData.state) {
      const isStateValid = result.extractedState?.toLowerCase() === userData.state.toLowerCase();
      fieldValidation.isStateValid = isStateValid;
      validationChecks.push(isStateValid);
    }
    if (userData.district) {
      const isDistrictValid = result.extractedDistrict?.toLowerCase() === userData.district.toLowerCase();
      fieldValidation.isDistrictValid = isDistrictValid;
      validationChecks.push(isDistrictValid);
    }
    if (userData.address) {
      const isAddressValid = !!(result.extractedAddress && result.extractedAddress.toLowerCase().includes(userData.address.toLowerCase()));
      fieldValidation.isAddressValid = isAddressValid;
      validationChecks.push(isAddressValid);
    }
    if (userData.mobileNumber) {
      const isMobileNumberValid = !!(result.extractedMobileNumber && result.extractedMobileNumber.replace(/\D/g, '') === userData.mobileNumber.replace(/\D/g, ''));
      fieldValidation.isMobileNumberValid = isMobileNumberValid;
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
        gender: result.extractedGender,
        state: result.extractedState,
        district: result.extractedDistrict,
        address: result.extractedAddress,
        mobileNumber: result.extractedMobileNumber
      }
    };

  } catch (error) {
    console.error("Error in Voter ID Card pre-validation flow:", error);
    return {
      success: false,
      message: "An error occurred during the AI pre-validation process.",
    };
  }
}


export async function validateVoterId(formData: FormData): Promise<ValidationResult> {
  const rawFormData = Object.fromEntries(formData.entries());
   if(typeof rawFormData.voterIdNumber === 'string') {
    rawFormData.voterIdNumber = rawFormData.voterIdNumber.toUpperCase();
  }

  const validatedFields = ServerVoterIdSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    const errorDetails = validatedFields.error.errors.map(e => e.message).join(', ');
    return {
      error: "Invalid form data.",
      overallValidation: false,
      validationDetails: `Could not parse form data on the server: ${errorDetails}`,
      isVoterId: true,
      isDocumentTypeValid: false,
      documentTypeValidationDetails: "Form data is invalid.",
      extractedName: "",
    };
  }

  const { document, ...userData } = validatedFields.data;

  try {
    const documentImageUri = await fileToDataURI(document);
    
    const result = await validateDocument({
      documentType: "voter-id",
       firstName: userData.firstName,
      lastName: userData.lastName,
      fathersName: userData.fathersName,
      dob: userData.dob,
      documentNumber: userData.voterIdNumber,
      gender: userData.gender,
      state: userData.state,
      district: userData.district,
      address: userData.address,
      mobileNumber: userData.mobileNumber,
      documentImageUri,
    });

    if (!result.isDocumentTypeValid) {
        return {
            error: "Incorrect Document Type",
            overallValidation: false,
            validationDetails: result.documentTypeValidationDetails || "The uploaded document does not appear to be a Voter ID card. Please upload the correct document.",
            isVoterId: true,
            isDocumentTypeValid: false,
            documentTypeValidationDetails: result.documentTypeValidationDetails || "The uploaded document does not appear to be a Voter ID card.",
            extractedName: "",
        };
    }

    return {...result, isVoterId: true};
  } catch (error) {
    console.error("Error in Voter ID validation flow:", error);
    return {
      error: "An error occurred during the AI validation process.",
      overallValidation: false,
      validationDetails: "The AI model failed to process the document. This could be due to a server issue or an unreadable document.",
      isVoterId: true,
      isDocumentTypeValid: false,
      documentTypeValidationDetails: "AI model failure.",
      extractedName: "",
    };
  }
}
