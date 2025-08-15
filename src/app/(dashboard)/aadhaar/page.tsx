
"use client";

import { AadhaarSchema } from '@/lib/schema';
import { preValidateAadhaar, validateAadhaar } from './actions';
import { ValidationForm, type FieldConfig } from '@/components/veridash/validation-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AadhaarPage() {
    const longFormatFields: FieldConfig[] = [
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
      label: "Father's Name",
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
      name: 'aadhaarNumber',
      label: 'Aadhar Card Number',
      placeholder: '123456789012',
      type: 'text',
      gridClass: 'md:col-span-1',
    },
  ];

  const shortFormatFields: FieldConfig[] = longFormatFields.filter(field => field.name !== 'fathersName');

  return (
     <Card>
        <CardHeader>
            <CardTitle>Aadhar Card Validation</CardTitle>
            <CardDescription>
            Select the format based on your Aadhar card and upload an image for AI-powered validation.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="long">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="long">Long Format</TabsTrigger>
                    <TabsTrigger value="short">Short Format</TabsTrigger>
                </TabsList>
                <TabsContent value="long" className="mt-6">
                     <ValidationForm
                        key="long-form"
                        schema={AadhaarSchema}
                        fields={longFormatFields}
                        documentLabel="Aadhar Card Image"
                        preValidateAction={preValidateAadhaar}
                        validateAction={validateAadhaar}
                        validationCategory="Aadhar Card"
                    />
                </TabsContent>
                 <TabsContent value="short" className="mt-6">
                    <ValidationForm
                        key="short-form"
                        schema={AadhaarSchema}
                        fields={shortFormatFields}
                        documentLabel="Aadhar Card Image"
                        preValidateAction={preValidateAadhaar}
                        validateAction={validateAadhaar}
                        validationCategory="Aadhar Card"
                    />
                </TabsContent>
            </Tabs>
        </CardContent>
    </Card>
  );
}
