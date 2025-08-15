
"use client";

import { PanSchema } from '@/lib/schema';
import { preValidatePan, validatePan } from './actions';
import { ValidationForm, type FieldConfig } from '@/components/veridash/validation-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function PanPage() {
    const panFields: FieldConfig[] = [
    {
      name: 'firstName',
      label: 'First Name',
      placeholder: 'John',
      type: 'text',
      gridClass: 'md:col-span-1',
    },
    {
      name: 'lastName',
      label: 'Last Name',
      placeholder: 'Doe',
      type: 'text',
      gridClass: 'md:col-span-1',
    },
    {
      name: 'fathersName',
      label: "Father's Name (Optional)",
      placeholder: 'Richard Doe',
      type: 'text',
      gridClass: 'md:col-span-2',
    },
    {
      name: 'dob',
      label: 'Date of Birth',
      placeholder: 'Select Date of Birth',
      type: 'date',
      gridClass: 'md:col-span-1',
    },
    {
      name: 'panNumber',
      label: 'PAN Number',
      placeholder: 'ABCDE1234F',
      type: 'text',
      className: 'uppercase',
      gridClass: 'md:col-span-1',
    },
  ];

  return (
     <Card>
        <CardHeader>
            <CardTitle>PAN Card Validation</CardTitle>
            <CardDescription>
            Enter your details and upload an image of your PAN card for
            AI-powered validation.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <ValidationForm
            schema={PanSchema}
            fields={panFields}
            documentLabel="PAN Card Image"
            preValidateAction={preValidatePan}
            validateAction={validatePan}
            validationCategory="PAN"
            />
        </CardContent>
    </Card>
  );
}
