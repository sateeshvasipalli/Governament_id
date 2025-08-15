
"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import type { ValidationResult } from "@/lib/types";

export async function saveValidationResult(
  category: "Aadhar Card" | "PAN" | "Bank" | "Voter ID Card" | "Driving Licence",
  documentName: string,
  result: ValidationResult
) {
  try {
    const docRef = await addDoc(collection(db, "validationResults"), {
      category,
      documentName,
      result,
      createdAt: serverTimestamp(),
    });
    console.log("Document written with ID: ", docRef.id);
    return { success: true, id: docRef.id };
  } catch (e) {
    console.error("Error adding document: ", e);
    return { success: false, error: (e as Error).message };
  }
}
