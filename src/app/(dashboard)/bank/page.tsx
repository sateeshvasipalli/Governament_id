
"use client";

import { BankSchema } from '@/lib/schema';
import { preValidateBank, validateBank } from './actions';
import { ValidationForm, type FieldConfig } from '@/components/veridash/validation-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function BankPage() {
  const bankFields: FieldConfig[] = [
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
      name: 'accountNumber',
      label: 'Account Number',
      placeholder: '1234567890',
      type: 'text',
      gridClass: 'md:col-span-1',
    },
    {
      name: 'ifscCode',
      label: 'IFSC Code',
      placeholder: 'ABCD0123456',
      type: 'text',
      className: 'uppercase',
      gridClass: 'md:col-span-1',
    },
    {
      name: 'branchName',
      label: 'Branch Name',
      placeholder: 'Main Branch',
      type: 'text',
      gridClass: 'md:col-span-2',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bank Account Validation</CardTitle>
        <CardDescription>
          Enter account details and upload a passbook/statement for
          AI-powered validation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ValidationForm
          schema={BankSchema}
          fields={bankFields}
          documentLabel="Bank Passbook/Statement Image"
          preValidateAction={preValidateBank}
          validateAction={validateBank}
          validationCategory="Bank"
        />
      </CardContent>
    </Card>
  );
}
