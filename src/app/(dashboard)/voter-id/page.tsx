
"use client";

import { VoterIdSchema } from '@/lib/schema';
import { preValidateVoterId, validateVoterId } from './actions';
import { ValidationForm, type FieldConfig } from '@/components/veridash/validation-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


export default function VoterIdPage() {
    const longPvcFields: FieldConfig[] = [
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
      name: 'gender',
      label: 'Gender',
      type: 'select',
      gridClass: 'md:col-span-1',
      options: [
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
          { value: 'other', label: 'Other' },
      ]
    },
    {
      name: 'voterIdNumber',
      label: 'Voter ID/EPIC Number',
      placeholder: 'ABC1234567',
      type: 'text',
      className: 'uppercase',
      gridClass: 'md:col-span-1',
    },
  ];

  const shortFormatFields: FieldConfig[] = [
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
      gridClass: 'md:col-span-1',
    },
    {
      name: 'voterIdNumber',
      label: 'Voter ID/EPIC Number',
      placeholder: 'ABC1234567',
      type: 'text',
      className: 'uppercase',
      gridClass: 'md:col-span-1',
    },
  ];

  return (
     <Card>
        <CardHeader>
            <CardTitle>Voter ID Card Validation</CardTitle>
            <CardDescription>
             Select the format based on your Voter ID card and upload an image for AI-powered validation.
            </CardDescription>
        </CardHeader>
        <CardContent>
           <Tabs defaultValue="long">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="long">Long PVC Card</TabsTrigger>
                    <TabsTrigger value="short">Short PVC Card</TabsTrigger>
                </TabsList>
                <TabsContent value="long" className="mt-6">
                    <ValidationForm
                        key="long-form"
                        schema={VoterIdSchema}
                        fields={longPvcFields}
                        documentLabel="Voter ID Card Image"
                        preValidateAction={preValidateVoterId}
                        validateAction={validateVoterId}
                        validationCategory="Voter ID Card"
                    />
                </TabsContent>
                 <TabsContent value="short" className="mt-6">
                    <ValidationForm
                        key="short-form"
                        schema={VoterIdSchema}
                        fields={shortFormatFields}
                        documentLabel="Voter ID Card Image"
                        preValidateAction={preValidateVoterId}
                        validateAction={validateVoterId}
                        validationCategory="Voter ID Card"
                    />
                </TabsContent>
            </Tabs>
        </CardContent>
    </Card>
  );
}
