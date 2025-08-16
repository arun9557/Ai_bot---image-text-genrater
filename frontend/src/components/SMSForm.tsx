import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { MessageSquare, Send, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { LoadingButton } from './LoadingButton';

interface SMSFormProps {
  className?: string;
}

export function SMSForm({ className }: SMSFormProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleSendSMS = async () => {
    if (!phoneNumber || !message) {
      setStatus('error');
      setStatusMessage('Please fill in both phone number and message');
      return;
    }

    setIsLoading(true);
    setStatus('idle');

    try {
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: phoneNumber,
          message: message,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setStatusMessage('SMS sent successfully!');
        setPhoneNumber('');
        setMessage('');
      } else {
        setStatus('error');
        setStatusMessage(data.error || 'Failed to send SMS');
      }
    } catch (error) {
      setStatus('error');
      setStatusMessage('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendSMS();
    }
  };

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-2">
          <MessageSquare className="w-6 h-6 mr-2 text-primary" />
          <CardTitle>SMS Messenger</CardTitle>
        </div>
        <CardDescription>
          Send SMS messages directly from your chatbot
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center">
            <Phone className="w-4 h-4 mr-2" />
            Phone Number
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1234567890"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="premium-input"
          />
          <p className="text-xs text-muted-foreground">
            Enter phone number in international format
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={4}
            className="premium-input resize-none"
          />
        </div>

        {status !== 'idle' && (
          <Alert className={status === 'success' ? 'border-green-500' : 'border-red-500'}>
            {status === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <AlertDescription className={status === 'success' ? 'text-green-700' : 'text-red-700'}>
              {statusMessage}
            </AlertDescription>
          </Alert>
        )}

        <LoadingButton
          onClick={handleSendSMS}
          loading={isLoading}
          className="w-full royal-glow elegant-hover"
          disabled={!phoneNumber || !message}
        >
          <Send className="w-4 h-4 mr-2" />
          Send SMS
        </LoadingButton>
      </CardContent>
    </Card>
  );
}
