
"use client";

import { DrivingLicenceSchema } from '@/lib/schema';
import { preValidateDrivingLicence, validateDrivingLicence } from './actions';
import { ValidationForm, type FieldConfig } from '@/components/veridash/validation-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function DrivingLicencePage() {
    const drivingLicenceFields: FieldConfig[] = [
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
      name: 'dob',
      label: 'Date of Birth',
      placeholder: 'Select Date of Birth',
      type: 'date',
      gridClass: 'md:col-span-1',
    },
    {
      name: 'drivingLicenceNumber',
      label: 'Driving Licence Number',
      placeholder: 'e.g., DL1420110012345',
      type: 'text',
      className: 'uppercase',
      gridClass: 'md:col-span-1',
    },
    {
      name: 'dateOfIssue',
      label: 'Date of Issue',
      placeholder: 'Select Date of Issue',
      type: 'date',
      gridClass: 'md:col-span-1',
    },
    {
      name: 'validTill',
      label: 'Valid Till',
      placeholder: 'Select Expiry Date',
      type: 'date',
      gridClass: 'md:col-span-1',
    },
    {
        name: 'bloodGroup',
        label: 'Blood Group (Optional)',
        type: 'select',
        placeholder: 'Select Blood Group',
        gridClass: 'md:col-span-2',
        options: [
            { value: 'A+', label: 'A+' },
            { value: 'A-', label: 'A-' },
            { value: 'B+', label: 'B+' },
            { value: 'B-', label: 'B-' },
            { value: 'AB+', label: 'AB+' },
            { value: 'AB-', label: 'AB-' },
            { value: 'O+', label: 'O+' },
            { value: 'O-', label: 'O-' },
            { value: 'N/A', label: 'N/A' },
        ]
    },
  ];

  return (
     <Card>
        <CardHeader>
            <CardTitle>Driving Licence Validation</CardTitle>
            <CardDescription>
            Enter your details and upload an image of your Driving Licence for
            AI-powered validation.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <ValidationForm
            schema={DrivingLicenceSchema}
            fields={drivingLicenceFields}
            documentLabel="Driving Licence Image"
            preValidateAction={preValidateDrivingLicence}
            validateAction={validateDrivingLicence}
            validationCategory="Driving Licence"
            />
        </CardContent>
    </Card>
  );
}
