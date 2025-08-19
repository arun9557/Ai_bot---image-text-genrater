import React from 'react';

interface SMSFormProps {
  className?: string;
}

export function SMSForm({ className }: SMSFormProps) {
  console.log('SMSForm component is rendering!');
  
  return (
    <div className={`w-full max-w-4xl mx-auto ${className || ''}`}>
      <div className="bg-white p-8 rounded-lg shadow-lg border">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
          SMS Group Chat
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Send SMS messages to multiple contacts simultaneously
        </p>
        
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Contacts</h3>
            <p className="text-sm text-gray-600">Contact management will be here</p>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Message</h3>
            <textarea 
              className="w-full p-2 border rounded"
              placeholder="Type your message here..."
              rows={4}
            />
          </div>
          
          <button className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
            Send SMS
          </button>
        </div>
      </div>
    </div>
  );
}
