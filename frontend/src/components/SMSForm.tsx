import React, { useMemo, useState } from 'react';

interface SMSFormProps {
  className?: string;
}

type Recipient = {
  id: string;
  name: string;
  phone: string;
  selected: boolean;
  status?: 'idle' | 'sending' | 'success' | 'error';
  error?: string;
};

const SAMPLE_CONTACTS: Array<Pick<Recipient, 'name' | 'phone'>> = [
  { name: 'John Doe', phone: '+919876543210' },
  { name: 'Jane Smith', phone: '+918765432109' },
  { name: 'Mike Johnson', phone: '+917654321098' },
];

export function SMSForm({ className }: SMSFormProps) {
  const [contacts, setContacts] = useState<Recipient[]>(() =>
    SAMPLE_CONTACTS.map((c, idx) => ({
      id: String(idx + 1),
      name: c.name,
      phone: c.phone,
      selected: true,
      status: 'idle',
    }))
  );

  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [filter, setFilter] = useState('');

  const filteredContacts = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return contacts;
    return contacts.filter(
      c => c.name.toLowerCase().includes(term) || c.phone.includes(term)
    );
  }, [contacts, filter]);

  const allSelected = useMemo(
    () => contacts.length > 0 && contacts.every(c => c.selected),
    [contacts]
  );

  const toggleAll = (checked: boolean) => {
    setContacts(prev => prev.map(c => ({ ...c, selected: checked })));
  };

  const addContact = () => {
    const cleanedPhone = normalizePhone(newPhone);
    if (!newName.trim() || !cleanedPhone) return;
    setContacts(prev => [
      ...prev,
      {
        id: String(Date.now()),
        name: newName.trim(),
        phone: cleanedPhone,
        selected: true,
        status: 'idle',
      },
    ]);
    setNewName('');
    setNewPhone('');
  };

  const removeContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const normalizePhone = (value: string) => {
    const cleaned = Array.from(value)
      .filter(ch => /[\d+]/.test(ch))
      .join('');
    if (!cleaned.startsWith('+')) return '';
    return cleaned;
  };

  const canSend = useMemo(() => {
    return (
      message.trim().length > 0 &&
      contacts.some(c => c.selected)
    );
  }, [message, contacts]);

  const handleSend = async () => {
    if (!canSend || isSending) return;
    setIsSending(true);
    setContacts(prev => prev.map(c => (
      c.selected ? { ...c, status: 'sending', error: undefined } : c
    )));
    try {
      const to = contacts.filter(c => c.selected).map(c => c.phone);
      const res = await fetch('/api/send-sms-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, message }),
      });
      const data = await res.json();
      if (res.ok) {
        const resultMap: Record<string, { status: string; error?: string }> = {};
        (data.results || []).forEach((r: any) => {
          resultMap[String(r.to)] = { status: r.status, error: r.error };
        });
        setContacts(prev => prev.map(c => {
          if (!c.selected) return c;
          const r = resultMap[c.phone];
          if (!r) return { ...c, status: 'error', error: 'Unknown result' };
          return {
            ...c,
            status: r.status === 'success' ? 'success' : 'error',
            error: r.error,
          };
        }));
      } else {
        setContacts(prev => prev.map(c => (
          c.selected ? { ...c, status: 'error', error: data.error || 'Failed to send' } : c
        )));
      }
    } catch (e: any) {
      setContacts(prev => prev.map(c => (
        c.selected ? { ...c, status: 'error', error: 'Network error' } : c
      )));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${className || ''}`}>
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg border">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          SMS Group Chat
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Send SMS messages to multiple contacts simultaneously
        </p>

        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  className="w-full p-2 border rounded"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Contact name"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone (+...)</label>
                <input
                  className="w-full p-2 border rounded"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  placeholder="+1234567890"
                />
              </div>
              <button
                onClick={addContact}
                className="h-10 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={!newName.trim() || !normalizePhone(newPhone)}
              >
                Add
              </button>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <input
                className="flex-1 p-2 border rounded"
                placeholder="Filter by name or number"
                value={filter}
                onChange={e => setFilter(e.target.value)}
              />
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={e => toggleAll(e.target.checked)}
                />
                Select all
              </label>
            </div>

            <div className="mt-4 max-h-64 overflow-auto divide-y">
              {filteredContacts.length === 0 ? (
                <p className="text-sm text-gray-500">No contacts found.</p>
              ) : (
                filteredContacts.map(c => (
                  <div key={c.id} className="py-2 flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={c.selected}
                      onChange={e => setContacts(prev => prev.map(p => p.id === c.id ? { ...p, selected: e.target.checked } : p))}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{c.name}</p>
                      <p className="text-xs text-gray-600">{c.phone}</p>
                    </div>
                    {c.status === 'sending' && <span className="text-xs text-blue-600">Sending...</span>}
                    {c.status === 'success' && <span className="text-xs text-green-600">Sent</span>}
                    {c.status === 'error' && <span className="text-xs text-red-600" title={c.error}>Failed</span>}
                    <button
                      onClick={() => removeContact(c.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Message</h3>
            <textarea
              className="w-full p-2 border rounded"
              placeholder="Type your message here..."
              rows={4}
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>{message.length} chars</span>
              <span>{contacts.filter(c => c.selected).length} recipients</span>
            </div>
          </div>

          <button
            onClick={handleSend}
            disabled={!canSend || isSending}
            className={`w-full text-white py-2 px-4 rounded ${
              isSending ? 'bg-blue-400' : canSend ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400'
            }`}
          >
            {isSending ? 'Sending...' : 'Send SMS'}
          </button>
        </div>
      </div>
    </div>
  );
}
